const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return { status: res.status, data };
}

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/colabz');
  console.log('--- Starting Phase 6 Verification Tests ---');

  // 1. Create a user / Login
  const testEmail = `phase6_test_${Date.now()}@example.com`;
  const registerRes = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: {
      name: 'Phase 6 Tester',
      email: testEmail,
      password: 'Password123!',
    },
  });
  const token = registerRes.data?.data?.token;
  console.log('✓ User registered and authenticated');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Create project
  const projectRes = await req(`${API_BASE}/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      name: `Colabz Repo Test ${Date.now()}`,
      description: 'Testing repository lifecycle in Phase 6',
      technologies: ['React', 'Node.js', 'MongoDB'],
    },
  });
  const project = projectRes.data?.data?.project || projectRes.data?.data;
  const projectId = project._id || project.id;
  console.log('✓ Project created:', projectId);

  // 3. Test 1 & 2: Get tree (should auto-create default 'main' branch & README.md)
  const treeRes = await req(`${API_BASE}/projects/${projectId}/repository/tree`, {
    headers: authHeaders,
  });
  console.log('✓ Repository tree fetched:', {
    branch: treeRes.data?.data?.branch?.name,
    filesCount: treeRes.data?.data?.files?.length,
  });

  const readme = treeRes.data?.data?.files?.find((f) => f.name === 'README.md');
  if (!readme) throw new Error('README.md was not automatically initialized on default branch');
  console.log('✓ README.md verified on main branch');

  // 4. Test 3: Create folder
  const folderRes = await req(`${API_BASE}/projects/${projectId}/repository/folders`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      parentPath: '',
      folderName: 'src',
    },
  });
  console.log('✓ Folder "src" created');

  const subFolderRes = await req(`${API_BASE}/projects/${projectId}/repository/folders`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      parentPath: 'src',
      folderName: 'components',
    },
  });
  console.log('✓ Folder "src/components" created');

  // 5. Test 4: Create file
  const createFileRes = await req(`${API_BASE}/projects/${projectId}/repository/files`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      parentPath: 'src/components',
      fileName: 'Navbar.jsx',
      content: 'export default function Navbar() {\n  return <nav>Navbar v1</nav>;\n}\n',
    },
  });
  const createdFile = createFileRes.data?.data?.file;
  console.log('✓ File "src/components/Navbar.jsx" created with id:', createdFile.id);

  // 6. Test 5: Edit file
  const updateFileRes = await req(`${API_BASE}/projects/${projectId}/repository/files/${createdFile.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: {
      content: 'export default function Navbar() {\n  return <nav className="nav-header">Navbar v2 Updated</nav>;\n}\n',
    },
  });
  console.log('✓ File updated successfully. New size:', updateFileRes.data?.data?.file?.size);

  // 7. Test 6: Create commit
  const commitRes = await req(`${API_BASE}/projects/${projectId}/commits`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      message: 'Add Navbar component and update markup',
    },
  });
  const commit = commitRes.data?.data?.commit;
  console.log('✓ Commit created successfully:', {
    id: commit.id,
    hash: commit.hash,
    message: commit.message,
    filesChanged: commit.filesChangedCount,
  });

  // 8. Test 7: Get commit history
  const commitsListRes = await req(`${API_BASE}/projects/${projectId}/commits`, {
    headers: authHeaders,
  });
  console.log('✓ Commits history fetched. Total commits:', commitsListRes.data?.data?.count);

  // 9. Test 8: Get commit details & diffs
  const commitDetailRes = await req(`${API_BASE}/projects/${projectId}/commits/${commit.id}`, {
    headers: authHeaders,
  });
  console.log('✓ Commit details fetched. Diffs count:', commitDetailRes.data?.data?.commit?.diffs?.length);

  // 10. Test 9: Create new branch
  const branchRes = await req(`${API_BASE}/projects/${projectId}/branches`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      name: 'feature/sidebar',
      sourceBranchName: 'main',
    },
  });
  const newBranch = branchRes.data?.data?.branch;
  console.log('✓ Branch "feature/sidebar" created:', newBranch.id);

  // 11. Test 10 & 11: Create file on feature branch
  const featureFileRes = await req(`${API_BASE}/projects/${projectId}/repository/files`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      branch: 'feature/sidebar',
      parentPath: 'src/components',
      fileName: 'Sidebar.jsx',
      content: 'export default function Sidebar() {\n  return <aside>Sidebar</aside>;\n}\n',
    },
  });
  console.log('✓ File "Sidebar.jsx" created on "feature/sidebar" branch');

  // 12. Test 12: Commit on feature branch
  const featureCommitRes = await req(`${API_BASE}/projects/${projectId}/commits`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      branchName: 'feature/sidebar',
      message: 'Add Sidebar component on feature branch',
    },
  });
  console.log('✓ Commit created on "feature/sidebar":', featureCommitRes.data?.data?.commit?.message);

  // 13. Test 13: Verify file isolation between branches
  const mainTreeRes = await req(`${API_BASE}/projects/${projectId}/repository/tree?branch=main`, {
    headers: authHeaders,
  });
  const mainFiles = mainTreeRes.data?.data?.flatList || mainTreeRes.data?.data?.files || [];
  const sidebarOnMain = mainFiles.find((f) => f.path === 'src/components/Sidebar.jsx');
  if (sidebarOnMain) {
    throw new Error('Isolation failed: Sidebar.jsx unexpectedly exists on main branch!');
  }
  console.log('✓ Branch isolation verified: Sidebar.jsx does not exist on main branch');

  const featureTreeRes = await req(`${API_BASE}/projects/${projectId}/repository/tree?branch=feature/sidebar`, {
    headers: authHeaders,
  });
  const featureFiles = featureTreeRes.data?.data?.flatList || featureTreeRes.data?.data?.files || [];
  const sidebarOnFeature = featureFiles.find((f) => f.path === 'src/components/Sidebar.jsx');
  if (!sidebarOnFeature) {
    throw new Error('Feature branch missing Sidebar.jsx!');
  }
  console.log('✓ Branch isolation verified: Sidebar.jsx exists on feature/sidebar branch');

  // 14. Test: File history endpoint
  const fileHistoryRes = await req(
    `${API_BASE}/projects/${projectId}/repository/files/${createdFile.id}/history`,
    { headers: authHeaders }
  );
  console.log('✓ File history fetched. Commits for Navbar.jsx:', fileHistoryRes.data?.data?.count);

  // 15. Test: Prevent deleting default branch
  const branchesRes = await req(`${API_BASE}/projects/${projectId}/branches`, {
    headers: authHeaders,
  });
  const mainBranch = branchesRes.data?.data?.branches?.find((b) => b.isDefault || b.name === 'main');
  try {
    await req(`${API_BASE}/projects/${projectId}/branches/${mainBranch.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    throw new Error('Should not have allowed deleting main branch');
  } catch (err) {
    if (err.status === 400) {
      console.log('✓ Default branch deletion successfully rejected with 400 Bad Request');
    } else {
      throw err;
    }
  }

  // 16. Test: RBAC check - viewer cannot create file
  const viewerEmail = `viewer_${Date.now()}@example.com`;
  const viewerRegister = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: {
      name: 'Viewer User',
      email: viewerEmail,
      password: 'Password123!',
    },
  });
  const viewerToken = viewerRegister.data?.data?.token;
  const viewerHeaders = { Authorization: `Bearer ${viewerToken}` };

  const Member = require('../models/ProjectMembership');
  await Member.create({
    project: projectId,
    user: viewerRegister.data?.data?.user?.id || viewerRegister.data?.data?.user?._id,
    role: 'VIEWER',
    joinedAt: new Date(),
  });

  try {
    await req(`${API_BASE}/projects/${projectId}/repository/files`, {
      method: 'POST',
      headers: viewerHeaders,
      body: {
        fileName: 'Unauthorized.txt',
        content: 'Should fail',
      },
    });
    throw new Error('Viewer was able to create file!');
  } catch (err) {
    if (err.status === 403) {
      console.log('✓ RBAC verified: VIEWER received 403 Forbidden on file creation');
    } else {
      throw err;
    }
  }

  // 17. Test: Cross-project access restriction
  const otherProjectRes = await req(`${API_BASE}/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      name: `Other Project ${Date.now()}`,
      description: 'Second project',
    },
  });
  const otherProjectId = otherProjectRes.data?.data?.project?.id || otherProjectRes.data?.data?.project?._id || otherProjectRes.data?.data?.id;

  try {
    await req(`${API_BASE}/projects/${otherProjectId}/repository/files/${createdFile.id}`, {
      headers: authHeaders,
    });
    throw new Error('Should not have allowed accessing another project file');
  } catch (err) {
    if (err.status === 404 || err.status === 403) {
      console.log('✓ Cross-project file access correctly rejected with status:', err.status);
    } else {
      throw err;
    }
  }

  await mongoose.disconnect();

  console.log('\n=========================================');
  console.log('🎉 ALL PHASE 6 LIFECYCLE TESTS PASSED!');
  console.log('=========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err.data || err.message);
  process.exit(1);
});
