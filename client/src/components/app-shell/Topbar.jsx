import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, HelpCircle, Menu, Command } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import ProfileMenu from './ProfileMenu';

export default function Topbar({
  currentProject,
  onOpenCommandPalette,
  onToggleMobileMenu,
  onOpenHelpModal
}) {
  const location = useLocation();

  const getBreadcrumbLabel = () => {
    const path = location.pathname;
    if (path === '/app/dashboard' || path === '/app') return 'overview';
    if (path.startsWith('/app/projects')) return 'projects';
    if (path.startsWith('/app/messages')) return 'messages';
    if (path.startsWith('/app/notifications')) return 'notifications';
    if (path.startsWith('/app/settings')) return 'settings';
    return 'workspace';
  };

  const isMac = typeof window !== 'undefined' && window.navigator?.platform?.toUpperCase().indexOf('MAC') >= 0;

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'rgba(11, 13, 16, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%'
      }}
    >
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Mobile menu icon button */}
        <button
          onClick={onToggleMobileMenu}
          className="mobile-only-btn"
          aria-label="Open mobile menu"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-muted)' }}>colabz</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            {currentProject ? currentProject.name : 'workspace'}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{getBreadcrumbLabel()}</span>
        </div>
      </div>

      {/* Center: Command Search Bar Trigger (Cmd/Ctrl + K) */}
      <div style={{ flex: 1, maxWidth: '380px', margin: '0 1rem' }}>
        <button
          onClick={onOpenCommandPalette}
          aria-label="Search workspace (Ctrl K)"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.85rem',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)';
            e.currentTarget.style.backgroundColor = 'rgba(23, 26, 32, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.backgroundColor = 'var(--bg-input)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={14} color="var(--text-muted)" />
            <span>Search anything...</span>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              padding: '0.1rem 0.4rem',
              borderRadius: '3px',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            {isMac ? '⌘K' : 'Ctrl K'}
          </span>
        </button>
      </div>

      {/* Right: Notifications, Help, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Help button */}
        <button
          onClick={onOpenHelpModal}
          aria-label="Help and documentation"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <HelpCircle size={18} />
        </button>

        {/* Notifications */}
        <NotificationPanel />

        {/* Vertical divider */}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Profile Menu Dropdown */}
        <ProfileMenu />
      </div>
    </header>
  );
}
