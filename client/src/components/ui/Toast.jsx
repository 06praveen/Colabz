import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const toastIcons = {
  success: <CheckCircle2 size={18} color="var(--success)" />,
  info: <Info size={18} color="var(--accent-secondary)" />,
  warning: <AlertTriangle size={18} color="var(--warning)" />,
  danger: <AlertCircle size={18} color="var(--danger)" />
};

const toastBorders = {
  success: 'rgba(61, 219, 130, 0.3)',
  info: 'rgba(94, 161, 255, 0.3)',
  warning: 'rgba(255, 184, 0, 0.3)',
  danger: 'rgba(255, 92, 112, 0.3)'
};

export default function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: 'calc(100vw - 3rem)',
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-elevated)',
              border: `1px solid ${toastBorders[toast.type] || 'var(--border-default)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              backdropFilter: 'blur(12px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {toastIcons[toast.type] || toastIcons.info}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: toast.message ? '0.2rem' : 0 }}>
                  {toast.title}
                </div>
              )}
              {toast.message && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss toast"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
