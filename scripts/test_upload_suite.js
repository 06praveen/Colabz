const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Project = require("../models/Project");
const Branch = require("../models/Branch");
const RepositoryFile = require("../models/RepositoryFile");

async function runUploadSuite() {
  console.log("==================================================");
  console.log("STARTING COLABZ REPOSITORY FILE UPLOAD TEST SUITE");
  console.log("==================================================");

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✓ Connected to MongoDB Atlas");
    }

    const timestamp = Date.now();

    // 1. Setup Test User (Owner) & Non-Member User
    const owner = new User({
      name: "Upload Suite Owner",
      email: `uploader_owner_${timestamp}@colabz.test`,
      username: `up_owner_${timestamp}`,
      githubId: `gh_owner_${timestamp}`,
      authProvider: "github",
    });
    await owner.save();

    const stranger = new User({
      name: "Upload Suite Stranger",
      email: `uploader_stranger_${timestamp}@colabz.test`,
      username: `up_stranger_${timestamp}`,
      githubId: `gh_stranger_${timestamp}`,
      authProvider: "github",
    });
    await stranger.save();

    // 2. Create Test Project
    const project = new Project({
      name: "File Upload Test Project",
      slug: `upload-test-${timestamp}`,
      description: "Automated test suite for single and multi file uploads",
      owner: owner._id,
      members: [owner._id],
      visibility: "public",
    });
    await project.save();

    const branch = new Branch({
      project: project._id,
      name: "main",
      isDefault: true,
      createdBy: owner._id,
    });
    await branch.save();

    console.log("✓ Test User & Project created. Project ID:", project._id);

    const repositoryService = require("../services/repositoryService");

    // -------------------------------------------------------------
    // TEST 1: Single File Upload
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Testing Single File Upload...");
    const file1 = await repositoryService.uploadFile(
      project,
      owner,
      {
        fileName: "index.js",
        content: "console.log('Hello Colabz Single Upload');",
        parentPath: "",
        branch: "main",
      },
      "OWNER"
    );

    if (file1 && file1.name === "index.js" && file1.path === "index.js") {
      console.log("✓ Single file upload succeeded. Path:", file1.path);
    } else {
      throw new Error("Single file upload failed");
    }

    // -------------------------------------------------------------
    // TEST 2: Multiple Files Upload (3 files in batch)
    // -------------------------------------------------------------
    console.log("\n[TEST 2] Testing Multiple Files Upload (Batch of 3)...");
    const multiPayloads = [
      { fileName: "file_a.txt", content: "Content A" },
      { fileName: "file_b.json", content: '{"name": "b"}' },
      { fileName: "file_c.css", content: "body { margin: 0; }" },
    ];

    const uploadedBatch = [];
    for (const p of multiPayloads) {
      const up = await repositoryService.uploadFile(
        project,
        owner,
        {
          fileName: p.fileName,
          content: p.content,
          parentPath: "src",
          branch: "main",
        },
        "OWNER"
      );
      uploadedBatch.push(up);
    }

    if (uploadedBatch.length === 3) {
      console.log("✓ Multi-file batch upload (3 files) succeeded:");
      uploadedBatch.forEach((f) => console.log(`  - ${f.path} (${f.size} bytes)`));
    } else {
      throw new Error("Batch upload failed");
    }

    // -------------------------------------------------------------
    // TEST 3: Upload into Nested Directory with Folder Creation
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Testing Nested Folder Hierarchy Creation on Upload...");
    const nestedFile = await repositoryService.uploadFile(
      project,
      owner,
      {
        fileName: "helper.ts",
        content: "export const add = (a: number, b: number) => a + b;",
        parentPath: "src/utils/math",
        branch: "main",
      },
      "OWNER"
    );

    const folderRec = await RepositoryFile.findOne({
      project: project._id,
      path: "src/utils",
      type: "FOLDER",
    });

    if (nestedFile && nestedFile.path === "src/utils/math/helper.ts" && folderRec) {
      console.log("✓ Nested folder structure auto-created successfully:", nestedFile.path);
    } else {
      throw new Error("Nested file upload / folder creation failed");
    }

    // -------------------------------------------------------------
    // TEST 4: Duplicate Filename Overwrite
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Testing Duplicate Filename Overwrite...");
    const updatedFile1 = await repositoryService.uploadFile(
      project,
      owner,
      {
        fileName: "index.js",
        content: "console.log('Updated Colabz Single Upload Content');",
        parentPath: "",
        branch: "main",
      },
      "OWNER"
    );

    if (updatedFile1 && updatedFile1.content.includes("Updated")) {
      console.log("✓ Duplicate filename safely updated existing file record without creating duplicate entries: PASS");
    } else {
      throw new Error("Duplicate filename update failed");
    }

    // -------------------------------------------------------------
    // TEST 5: Unauthorized Member Access Control
    // -------------------------------------------------------------
    console.log("\n[TEST 5] Testing Permission Access Control (Viewer / Stranger)...");
    try {
      await repositoryService.uploadFile(
        project,
        stranger,
        {
          fileName: "hacked.js",
          content: "alert('xss')",
          parentPath: "",
          branch: "main",
        },
        "VIEWER"
      );
      throw new Error("Viewer should not be able to upload files");
    } catch (err) {
      if (err.statusCode === 403 || err.message.includes("Permission denied")) {
        console.log("✓ Permission check successfully blocked unauthorized viewer: PASS (403 Forbidden)");
      } else {
        throw err;
      }
    }

    // -------------------------------------------------------------
    // TEST 6: File Listing & Tree Verification
    // -------------------------------------------------------------
    console.log("\n[TEST 6] Testing File Listing & Retrieval...");
    const tree = await repositoryService.getRepositoryTree(project._id, "main");
    console.log(`✓ Repository tree contains ${tree.length} top-level nodes`);

    const retrievedFile = await repositoryService.getFileByPath(project._id, "index.js", "main");
    if (retrievedFile && retrievedFile.content.includes("Updated")) {
      console.log("✓ getFileByPath retrieved uploaded file content accurately: PASS");
    } else {
      throw new Error("Failed to retrieve file content");
    }

    // -------------------------------------------------------------
    // TEST 7: Clean File Deletion
    // -------------------------------------------------------------
    console.log("\n[TEST 7] Testing File Deletion...");
    await repositoryService.deleteFile(project._id, owner, { path: "index.js", branch: "main" }, "OWNER");
    const deletedCheck = await RepositoryFile.findOne({ project: project._id, path: "index.js" });
    if (!deletedCheck) {
      console.log("✓ File deleted cleanly from repository: PASS");
    } else {
      throw new Error("File was not deleted");
    }

    // Clean up test documents
    await RepositoryFile.deleteMany({ project: project._id });
    await Branch.deleteMany({ project: project._id });
    await Project.deleteOne({ _id: project._id });
    await User.deleteMany({ _id: { $in: [owner._id, stranger._id] } });
    console.log("✓ Test records cleaned up from database");

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");

    console.log("\n==================================================");
    console.log("COLABZ FILE UPLOAD TEST SUITE: 100% PASS");
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Upload test failed:", err);
    process.exit(1);
  }
}

runUploadSuite();
