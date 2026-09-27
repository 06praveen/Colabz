import React from 'react';

export default function ActivityFilters({ activeFilter, onFilterChange }) {
  const filterTabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'repository', label: 'Repository' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'issues', label: 'Issues' },
    { id: 'members', label: 'Members' },
    { id: 'chat', label: 'Chat' },
    { id: 'calls', label: 'Calls' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
        scrollbarWidth: 'none'
      }}
    >
      {filterTabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-default)',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.borderColor = 'var(--border-default)';
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
