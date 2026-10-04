const { GoogleGenerativeAI } = require("@google/generative-ai");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const SYSTEM_INSTRUCTION = `You are the AI Coding Assistant integrated into Colabz, a collaborative developer workspace combining GitHub repository collaboration with real-time team chat, tasks, issues, and voice/video calling.

Your role:
- Provide clear, expert coding explanations and solutions.
- Help developers understand code, functions, classes, and logic.
- Debug errors: diagnose the root cause, provide a clean fix, and explain why the solution works.
- Guide users on project setup, environment configuration, dependency issues, and architecture.
- Format all code with markdown syntax backticks and appropriate language tags (e.g., \`\`\`javascript).
- Be concise, accurate, professional, and friendly.`;

/**
 * Normalizes and prepares conversation history strictly adhering to Gemini's API specification:
 * 1. Roles must map to 'user' or 'model'.
 * 2. The history array MUST begin with a 'user' turn.
 * 3. Roles must strictly alternate: 'user' -> 'model' -> 'user' -> 'model'.
 * 4. Since the pending prompt sent via chat.sendMessage() is from 'user', history must end on a 'model' turn.
 * 5. Caps recent history to a sliding window of maxTurns (default 6).
 */
const prepareHistory = (history = [], maxTurns = 6) => {
  if (!Array.isArray(history) || history.length === 0) return [];

  // Step 1: Normalize roles and filter non-empty content
  const normalized = history
    .map((item) => {
      const rawRole = String(item.role || item.author || "").toLowerCase();
      const role = rawRole === "assistant" || rawRole === "model" || rawRole === "bot" ? "model" : "user";
      const text = String(item.text || item.content || "").trim();
      return { role, text };
    })
    .filter((item) => item.text.length > 0);

  if (normalized.length === 0) return [];

  // Step 2: Slice to recent turns (sliding window)
  let windowed = normalized.slice(-maxTurns);

  // Step 3: Ensure history begins with a 'user' turn (required by Gemini API)
  const firstUserIdx = windowed.findIndex((item) => item.role === "user");
  if (firstUserIdx === -1) return []; // No user message available to start history
  windowed = windowed.slice(firstUserIdx);

  // Step 4: Ensure strictly alternating roles (merge adjacent turns from the same role)
  const alternating = [];
  for (const item of windowed) {
    if (alternating.length === 0) {
      alternating.push(item);
    } else {
      const last = alternating[alternating.length - 1];
      if (last.role === item.role) {
        last.text += "\n\n" + item.text;
      } else {
        alternating.push(item);
      }
    }
  }

  // Step 5: Since chat.sendMessage() provides the next 'user' prompt,
  // the pre-existing history must end with a 'model' turn.
  if (alternating.length > 0 && alternating[alternating.length - 1].role === "user") {
    alternating.pop();
  }

  // Step 6: Map to Gemini SDK parts format
  return alternating.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
};

/**
 * Builds the user prompt augmented with contextual information (code snippet, error message, action type).
 */
const buildPromptWithContext = ({ prompt, codeSnippet, errorSnippet, actionType, projectContext }) => {
  const sections = [];

  if (projectContext) {
    sections.push(`[Project Context: ${projectContext}]`);
  }

  if (actionType === "explain") {
    sections.push("TASK: Explain the following code clearly, identifying its purpose, key functions, and data flow.");
  } else if (actionType === "debug") {
    sections.push("TASK: Analyze the following error and/or code, identify why it happens, provide the corrected code, and explain the fix.");
  } else if (actionType === "setup") {
    sections.push("TASK: Provide troubleshooting assistance for this project setup, installation, or configuration problem.");
  } else if (actionType === "summarize") {
    sections.push("TASK: Provide a clear high-level summary of this project, its architecture, and its primary technologies.");
  }

  if (codeSnippet && codeSnippet.trim()) {
    sections.push(`\`\`\`\n${codeSnippet.trim()}\n\`\`\``);
  }

  if (errorSnippet && errorSnippet.trim()) {
    sections.push(`[Error Message / Stack Trace]:\n\`\`\`\n${errorSnippet.trim()}\n\`\`\``);
  }

  if (prompt && prompt.trim()) {
    sections.push(prompt.trim());
  }

  return sections.join("\n\n");
};

/**
 * Generates an AI response using Google Gemini API or provides a helpful fallback if API key is not yet configured.
 */
const generateAiResponse = async ({
  prompt,
  codeSnippet = "",
  errorSnippet = "",
  actionType = "general",
  projectContext = "",
  history = [],
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const fullPrompt = buildPromptWithContext({
    prompt,
    codeSnippet,
    errorSnippet,
    actionType,
    projectContext,
  });

  // If no Gemini API key is configured yet, provide a clear, helpful response
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    return {
      text: `### 💡 Colabz AI Assistant (Setup Notice)\n\n` +
        `The AI assistant backend is **operational and ready**!\n\n` +
        `To enable live responses from Google Gemini:\n` +
        `1. Open the backend \`.env\` file.\n` +
        `2. Add your Gemini API key: \`GEMINI_API_KEY=your_actual_key\`\n` +
        `3. Restart the server.\n\n` +
        `> **Query received**: "${prompt || actionType}"\n` +
        (codeSnippet ? `> **Code analyzed**: \`${codeSnippet.slice(0, 60)}...\`\n` : "") +
        `*(Once the API key is placed in .env, Gemini will stream full intelligent code explanations, debugging, and fixes).*`,
      isFallback: true,
      model: DEFAULT_MODEL,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const formattedHistory = prepareHistory(history);

    // If conversation history exists, use multi-turn chat
    if (formattedHistory.length > 0) {
      const chat = model.startChat({
        history: formattedHistory,
      });
      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response;
      return {
        text: response.text(),
        isFallback: false,
        model: DEFAULT_MODEL,
      };
    } else {
      // Single turn generation
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return {
        text: response.text(),
        isFallback: false,
        model: DEFAULT_MODEL,
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`AI Service Error: ${error.message}`);
  }
};

module.exports = {
  generateAiResponse,
  buildPromptWithContext,
  prepareHistory,
};
