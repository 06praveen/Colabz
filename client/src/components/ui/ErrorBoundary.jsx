import React from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/app/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '3rem 1.5rem',
            maxWidth: '600px',
            margin: '2rem auto',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Something went wrong.
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              An unexpected runtime error occurred. You can reload this view or return to the workspace dashboard.
            </p>
            {this.state.error?.message && (
              <code
                style={{
                  display: 'block',
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--warning)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </code>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              className="clb-btn clb-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
              }}
            >
              <RefreshCw size={14} />
              <span>Reload</span>
            </button>
            <button
              onClick={this.handleGoDashboard}
              className="clb-btn clb-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
              }}
            >
              <LayoutDashboard size={14} />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

