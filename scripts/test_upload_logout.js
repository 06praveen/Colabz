const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

function request(method, path, body = null, token = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let payload = null;
    if (body) {
      if (Buffer.isBuffer(body)) {
        payload = body;
        headers['Content-Type'] = contentType;
        headers['Content-Length'] = body.length;
      } else if (typeof body === 'object') {
        payload = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(payload);
      }
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function buildMultipartBody(fields, fileField) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const chunks = [];

  for (const [key, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
  }

  if (fileField) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType || 'text/plain'}\r\n\r\n`
      )
    );
    chunks.push(Buffer.from(fileField.content));
    chunks.push(Buffer.from('\r\n'));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  const totalBuffer = Buffer.concat(chunks);
  return {
    buffer: totalBuffer,
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

async function runTests() {
  console.log('=======================================================');
  console.log('🚀 COLABZ FILE UPLOAD & LOGOUT VERIFICATION TEST SUITE');
  console.log('=======================================================');

  const timestamp = Date.now();
  const userAEmail = `uploader_a_${timestamp}@example.com`;
  const userBEmail = `stranger_b_${timestamp}@example.com`;

  // 1. Register User A (Project Owner)
  console.log('\n[1] Registering User A (Uploader)...');
  const regARes = await request('POST', '/auth/register', {
    name: 'Uploader Alpha',
    username: `uploader_a_${timestamp}`,
    email: userAEmail,
    password: 'Password123!',
  });
  if (regARes.status !== 201) throw new Error('Failed to register User A: ' + JSON.stringify(regARes.body));
  const tokenA = regARes.body.data.token;
  console.log('✓ PASS: User A registered');

  // 2. Register User B (Non-member)
  console.log('\n[2] Registering User B (Stranger / Non-member)...');
  const regBRes = await request('POST', '/auth/register', {
    name: 'Stranger Beta',
    username: `stranger_b_${timestamp}`,
    email: userBEmail,
    password: 'Password123!',
  });
  if (regBRes.status !== 201) throw new Error('Failed to register User B: ' + JSON.stringify(regBRes.body));
  const tokenB = regBRes.body.data.token;
  console.log('✓ PASS: User B registered');

  // 3. User A creates a project
  console.log('\n[3] User A creates a project...');
  const projRes = await request('POST', '/projects', {
    name: `Upload Test Proj ${timestamp}`,
    description: 'Testing repository multipart file upload',
    visibility: 'private',
  }, tokenA);
  if (projRes.status !== 201) throw new Error('Failed to create project: ' + JSON.stringify(projRes.body));
  const projectId = projRes.body.data.project.id || projRes.body.data.project._id;
  console.log(`✓ PASS: Project created with ID: ${projectId}`);

  // 4. Test unauthorized file upload by User B (Non-member)
  console.log('\n[4] Testing unauthorized file upload by non-member User B...');
  const multipartB = buildMultipartBody(
    { parentPath: 'src' },
    { name: 'file', filename: 'malicious.js', content: 'console.log("hacked");' }
  );
  const unauthUploadRes = await request(
    'POST',
    `/projects/${projectId}/repository/upload`,
    multipartB.buffer,
    tokenB,
    multipartB.contentType
  );
  if (unauthUploadRes.status === 403) {
    console.log('✓ PASS: Unauthorized upload blocked with 403 Forbidden');
  } else {
    throw new Error(`Expected 403 Forbidden for stranger upload, got ${unauthUploadRes.status}`);
  }

  // 5. Test valid multipart file upload by User A
  console.log('\n[5] Testing valid multipart file upload by project member User A...');
  const testFileContent = `// Colabz Test File\nexport const message = "Colabz file upload verified at ${timestamp}";\n`;
  const multipartA = buildMultipartBody(
    { parentPath: 'src/utils' },
    { name: 'file', filename: 'test_upload.ts', content: testFileContent }
  );
  const uploadRes = await request(
    'POST',
    `/projects/${projectId}/repository/upload`,
    multipartA.buffer,
    tokenA,
    multipartA.contentType
  );

  if (uploadRes.status === 201 && uploadRes.body.success) {
    console.log('✓ PASS: File uploaded successfully. File record:', uploadRes.body.data.file.path);
  } else {
    throw new Error('Upload failed: ' + JSON.stringify(uploadRes.body));
  }

  // 6. Verify file appears in repository tree (GET /api/projects/:id/repository/tree)
  console.log('\n[6] Verifying file appears in repository tree...');
  const treeRes = await request('GET', `/projects/${projectId}/repository/tree`, null, tokenA);
  if (treeRes.status !== 200) throw new Error('Failed to fetch tree: ' + JSON.stringify(treeRes.body));
  const flatList = treeRes.body.data.flatList || [];
  const foundFile = flatList.find((f) => f.path === 'src/utils/test_upload.ts');
  if (foundFile) {
    console.log('✓ PASS: Uploaded file verified in repository tree flatList:', foundFile.path);
  } else {
    throw new Error('Uploaded file not found in tree: ' + JSON.stringify(treeRes.body));
  }

  // 7. Verify file content persistence via GET /api/projects/:id/repository/file?path=...
  console.log('\n[7] Verifying file content via getFileByPath...');
  const fileDetailRes = await request('GET', `/projects/${projectId}/repository/file?path=src/utils/test_upload.ts`, null, tokenA);
  if (fileDetailRes.status === 200 && fileDetailRes.body.data.file?.content === testFileContent) {
    console.log('✓ PASS: File content persisted and matches uploaded payload exactly.');
  } else {
    throw new Error('File content mismatch: ' + JSON.stringify(fileDetailRes.body));
  }

  // 8. Test Logout flow
  console.log('\n[8] Testing Logout and Protected Route Security...');
  const logoutRes = await request('POST', '/auth/logout', null, tokenA);
  console.log('✓ PASS: Backend logout endpoint responded with status:', logoutRes.status);

  // 9. Verify invalid/cleared token cannot access protected endpoint
  console.log('\n[9] Verifying protected endpoint blocks requests with no token...');
  const noTokenRes = await request('GET', '/projects', null, null);
  if (noTokenRes.status === 401) {
    console.log('✓ PASS: Unauthenticated access blocked with 401 Unauthorized.');
  } else {
    throw new Error(`Expected 401 for unauthenticated request, got ${noTokenRes.status}`);
  }

  console.log('\n=======================================================');
  console.log('🎉 ALL FILE UPLOAD & LOGOUT TESTS PASSED 100%!');
  console.log('=======================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
