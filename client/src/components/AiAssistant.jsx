import React, { useState, useEffect, useRef } from 'react';
import { sendAiMessage, checkAiStatus } from '../services/aiApi';

const QUICK_ACTIONS = [
  { id: 'explain', label: '🔍 Explain Code', actionType: 'explain', placeholder: 'Ask about this code...' },
  { id: 'debug', label: '🐞 Debug Error', actionType: 'debug', placeholder: 'Explain the error you are seeing...' },
  { id: 'setup', label: '⚙️ Setup / Config Help', actionType: 'setup', placeholder: 'Describe your setup problem...' },
  { id: 'summarize', label: '📋 Summarize Project', actionType: 'summarize', placeholder: 'Ask for a project summary...' },
  { id: 'general', label: '💬 General Question', actionType: 'general', placeholder: 'Ask any coding question...' },
];

/**
 * Lightweight formatting for AI responses with code blocks and basic markdown.
 */
function MarkdownText({ content }) {
  if (!content) return null;

  // Split by fenced code blocks: ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="ai-markdown">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```$/);
          const lang = match ? match[1] || 'code' : 'code';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div className="code-block" key={index}>
              <div className="code-block-header">
                <span>{lang}</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(code.trim())}
                >
                  Copy
                </button>
              </div>
              <pre>
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        // Render standard text with paragraphs, bullet points, bolding, and inline code
        const lines = part.split('\n');
        return (
          <div key={index} className="prose-segment">
            {lines.map((line, lineIdx) => {
              if (!line.trim()) return <div key={lineIdx} className="blank-line" />;
              
              if (line.startsWith('### ')) {
                return <h4 key={lineIdx} className="ai-heading">{line.slice(4)}</h4>;
              }
              if (line.startsWith('## ')) {
                return <h3 key={lineIdx} className="ai-heading">{line.slice(3)}</h3>;
              }
              if (line.startsWith('# ')) {
                return <h2 key={lineIdx} className="ai-heading">{line.slice(2)}</h2>;
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="ai-bullet">
                    <span className="bullet-dot">•</span>
                    <span>{renderInline(line.slice(2))}</span>
                  </div>
                );
              }

              return <p key={lineIdx} className="ai-p">{renderInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInline(text) {
  // Parses `inline code` and **bold**
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={idx} className="ai-inline-code">{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={idx}>{token.slice(2, -2)}</strong>;
    }
    return token;
  });
}

export default function AiAssistant({ repo, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      text: "👋 Hi! I am your **Colabz AI Coding Assistant**.\n\nI can help you understand code, diagnose errors, summarize this repository, or assist with setup problems.\n\nChoose a quick action below or type your question!",
      time: 'Just now',
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [errorSnippet, setErrorSnippet] = useState('');
  const [actionType, setActionType] = useState('general');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [status, setStatus] = useState({ configured: false, model: 'gemini-3.8-flash' });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkAiStatus().then(setStatus);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleActionSelect = (action) => {
    setActionType(action.id);
    if (action.id === 'explain' || action.id === 'debug') {
      setShowCodeInput(true);
    }
    if (action.id === 'summarize') {
      // Direct one-click execution for project summary
      executeSubmit({
        customPrompt: `Summarize the ${repo ? repo.name : 'current'} project and its structure.`,
        customAction: 'summarize',
      });
    }
  };

  const executeSubmit = async ({ customPrompt, customAction } = {}) => {
    const finalPrompt = customPrompt !== undefined ? customPrompt : prompt;
    const finalAction = customAction || actionType;

    const hasPrompt = finalPrompt.trim().length > 0;
    const hasCode = codeSnippet.trim().length > 0;
    const hasError = errorSnippet.trim().length > 0;

    if (!hasPrompt && !hasCode && !hasError && finalAction !== 'summarize') {
      setErrorNotice('Please enter a question, code snippet, or error message.');
      return;
    }

    setErrorNotice('');
    const userMsgId = `usr-${Date.now()}`;
    const userDisplay = [
      finalPrompt.trim(),
      hasCode ? `\n\`\`\`\n${codeSnippet.trim()}\n\`\`\`` : '',
      hasError ? `\n[Error]: ${errorSnippet.trim()}` : '',
    ].filter(Boolean).join('\n');

    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text: userDisplay || `[Requested: ${finalAction}]`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const response = await sendAiMessage({
        prompt: finalPrompt,
        codeSnippet,
        errorSnippet,
        actionType: finalAction,
        projectId: repo?._id || repo?.id || repo?.projectId,
        projectContext: repo ? `Repository: ${repo.name} (${repo.language || 'JavaScript'})` : 'Colabz Workspace',
        history: messages.map((m) => ({ role: m.role, text: m.text })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: response.reply,
          isFallback: response.isFallback,
          model: response.model,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setErrorNotice(err.message || 'Failed to get response from AI assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSubmit();
  };

  const clearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        text: "✨ Conversation cleared. What code or issue would you like to explore next?",
        time: 'Just now',
      },
    ]);
    setCodeSnippet('');
    setErrorSnippet('');
    setShowCodeInput(false);
    setErrorNotice('');
  };

  if (!isOpen) return null;

  const currentAction = QUICK_ACTIONS.find((a) => a.id === actionType) || QUICK_ACTIONS[0];

  return (
    <div className="ai-overlay" onClick={onClose}>
      <aside className="ai-drawer card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="ai-header">
          <div className="ai-title-wrap">
            <span className="ai-badge">🤖 AI Assistant</span>
            <div>
              <h3>Colabz Copilot</h3>
              <small>
                {repo ? `${repo.name} · ` : ''}
                <span className={status.configured ? 'status-live' : 'status-demo'}>
                  {status.configured ? `● ${status.model}` : '● Ready (Dev Mode)'}
                </span>
              </small>
            </div>
          </div>
          <div className="ai-actions">
            <button type="button" className="ai-btn-text" onClick={clearChat} title="Clear conversation">
              Clear
            </button>
            <button type="button" className="ai-close-btn" onClick={onClose} title="Close AI Assistant">
              ×
            </button>
          </div>
        </header>

        {/* Quick Action Chips */}
        <div className="ai-chips">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`ai-chip ${actionType === action.id ? 'active' : ''}`}
              onClick={() => handleActionSelect(action)}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="ai-messages">
          {messages.map((msg) => (
            <article key={msg.id} className={`ai-message ${msg.role === 'user' ? 'ai-user' : 'ai-bot'}`}>
              <div className="ai-msg-header">
                <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}</strong>
                <time>{msg.time}</time>
              </div>
              <div className="ai-bubble">
                <MarkdownText content={msg.text} />
              </div>
            </article>
          ))}

          {loading && (
            <div className="ai-message ai-bot">
              <div className="ai-msg-header">
                <strong>AI Assistant</strong>
                <time>Thinking...</time>
              </div>
              <div className="ai-bubble ai-loading">
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
                <em>Analyzing code with Gemini...</em>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Notice */}
        {errorNotice && (
          <div className="ai-error-notice">
            <span>⚠️ {errorNotice}</span>
            <button type="button" onClick={() => setErrorNotice('')}>×</button>
          </div>
        )}

        {/* Expandable Code / Error Snippet Drawer */}
        <div className="ai-attachment-section">
          <button
            type="button"
            className="ai-toggle-attach"
            onClick={() => setShowCodeInput(!showCodeInput)}
          >
            {showCodeInput ? '▾ Hide Code / Error inputs' : '▸ Attach Code or Error message'}
            {(codeSnippet || errorSnippet) && <b className="attach-badge">✓ attached</b>}
          </button>

          {showCodeInput && (
            <div className="ai-attach-inputs">
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste code snippet here..."
                rows={3}
                className="ai-textarea-code"
              />
              <textarea
                value={errorSnippet}
                onChange={(e) => setErrorSnippet(e.target.value)}
                placeholder="Paste error message or stack trace here..."
                rows={2}
                className="ai-textarea-error"
              />
            </div>
          )}
        </div>

        {/* Message Composer Form */}
        <form className="ai-composer" onSubmit={handleSubmit}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={currentAction.placeholder}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="ai-send-btn">
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </aside>
    </div>
  );
}
