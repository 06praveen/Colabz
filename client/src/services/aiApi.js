import api from './api';

/**
 * Sends a message or coding task to the backend AI assistant.
 * @param {Object} params
 * @param {string} [params.prompt] - User prompt / question
 * @param {string} [params.codeSnippet] - Optional code snippet
 * @param {string} [params.errorSnippet] - Optional error message / stack trace
 * @param {string} [params.actionType='general'] - 'general' | 'explain' | 'debug' | 'setup' | 'summarize'
 * @param {string} [params.projectContext] - Active repository / project context
 * @param {string} [params.projectId] - Optional active project ID for server-side authorization
 * @param {Array} [params.history=[]] - Recent conversation history turns
 * @returns {Promise<{ reply: string, isFallback: boolean, model: string, actionType: string }>}
 */
export async function sendAiMessage({
  prompt = '',
  codeSnippet = '',
  errorSnippet = '',
  actionType = 'general',
  projectContext = '',
  projectId = null,
  history = [],
}) {
  const payload = {
    prompt: prompt.trim(),
    codeSnippet: codeSnippet.trim(),
    errorSnippet: errorSnippet.trim(),
    actionType,
    projectContext: projectContext.trim(),
    projectId,
    history: Array.isArray(history) ? history.slice(-6) : [],
  };

  try {
    const res = await api.post('/ai/chat', payload);
    return res.data?.data || res.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to get response from AI assistant';
    throw new Error(message);
  }
}

/**
 * Checks the status and configured model of the backend AI service.
 * @returns {Promise<{ configured: boolean, model: string, service: string }>}
 */
export async function checkAiStatus() {
  try {
    const res = await api.get('/ai/status');
    return res.data?.data || res.data;
  } catch {
    return { configured: false, model: 'gemini-3.8-flash' };
  }
}
