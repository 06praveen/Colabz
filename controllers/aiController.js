const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const { generateAiResponse } = require("../services/aiService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Handles AI chat, code explanation, error debugging, and project summarization requests.
 * Route: POST /api/ai/chat
 */
const handleChat = async (req, res) => {
  try {
    const actionType = req.body.actionType || req.body.action || "general";
    const prompt = req.body.prompt || req.body.message || req.body.query || "";
    const codeSnippet = req.body.codeSnippet || req.body.code || "";
    const errorSnippet = req.body.errorSnippet || req.body.error || req.body.errorMessage || "";
    let projectContext = req.body.projectContext || req.body.context || "";
    const history = req.body.history || req.body.messages || [];
    const projectId = req.body.projectId || req.body.repoId || null;

    const userId = req.user ? (req.user._id || req.user.id) : null;

    // If a specific project is targeted, verify that the authenticated user is an active member
    if (projectId && userId) {
      let project = null;
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        project = await Project.findById(projectId);
      } else {
        project = await Project.findOne({ slug: projectId });
      }

      if (project) {
        const membership = await ProjectMembership.findOne({
          project: project._id,
          user: userId,
          status: "ACTIVE",
        });

        const isOwner = project.owner.toString() === userId.toString();
        if (!membership && !isOwner) {
          return sendError(
            res,
            "Not authorized to query AI assistant with private project context for this repository",
            403
          );
        }

        // Enrich project context safely without exposing internal sensitive tokens
        const techStack = (project.technologies || []).join(", ");
        projectContext = `Repository: ${project.name} | Language: ${project.language || "JavaScript"} | Tech Stack: ${techStack || "MERN"} | Default Branch: ${project.defaultBranch || "main"} | Description: ${project.description || "N/A"}`;
      }
    }

    const hasPrompt = typeof prompt === "string" && prompt.trim().length > 0;
    const hasCode = typeof codeSnippet === "string" && codeSnippet.trim().length > 0;
    const hasError = typeof errorSnippet === "string" && errorSnippet.trim().length > 0;
    const hasContext = typeof projectContext === "string" && projectContext.trim().length > 0;
    const isSpecialAction = actionType === "summarize" || actionType === "setup";

    if (!hasPrompt && !hasCode && !hasError && !hasContext && !isSpecialAction) {
      return sendError(
        res,
        "Please provide a prompt, code snippet, error message, or project context to analyze.",
        400
      );
    }

    // Supply helpful defaults for one-click action buttons
    let effectivePrompt = hasPrompt ? prompt.trim() : "";
    if (!effectivePrompt) {
      if (actionType === "summarize") {
        effectivePrompt = "Summarize this repository, its purpose, architecture, and technology stack.";
      } else if (actionType === "setup") {
        effectivePrompt = "Provide instructions and troubleshooting tips for setting up and running this project.";
      } else if (actionType === "explain" && hasCode) {
        effectivePrompt = "Explain what this code does and how it works.";
      } else if (actionType === "debug" && (hasError || hasCode)) {
        effectivePrompt = "Analyze this error and code, explain the cause, and provide a fix.";
      }
    }

    const response = await generateAiResponse({
      prompt: effectivePrompt,
      codeSnippet: hasCode ? codeSnippet.trim() : "",
      errorSnippet: hasError ? errorSnippet.trim() : "",
      actionType,
      projectContext: hasContext ? projectContext.trim() : "",
      history,
    });

    return sendSuccess(
      res,
      {
        reply: response.text,
        isFallback: response.isFallback,
        model: response.model,
        actionType,
      },
      200,
      "AI response generated successfully"
    );
  } catch (error) {
    console.error("AI Controller Error:", error.message);
    return sendError(
      res,
      error.message || "An error occurred while generating AI response.",
      500
    );
  }
};

/**
 * Returns the status of the AI service without revealing sensitive keys.
 * Route: GET /api/ai/status
 */
const getAiStatus = (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(
    apiKey && apiKey.trim() !== "" && apiKey !== "your_gemini_api_key_here"
  );

  return sendSuccess(
    res,
    {
      service: "Google Gemini",
      configured: isConfigured,
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    },
    200,
    "AI Service Status"
  );
};

module.exports = {
  handleChat,
  getAiStatus,
};
