import React, { useState, useRef, useEffect } from 'react';
import { useIssues } from '../../context/IssueContext';
import { Search, Filter, X } from 'lucide-react';

export default function IssueFilters() {
  const { searchQuery, setSearchQuery, filters, setFilters, clearFilters } = useIssues();
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = Boolean(filters.priority || filters.assignee || filters.label || searchQuery);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '400px', display: 'flex', alignItems: 'center' }}>
        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }} />
        <input
          type="text"
          className="clb-input"
          placeholder="Search issues by title, number, or label..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: '2.2rem',
            paddingRight: searchQuery ? '2.2rem' : '0.75rem',
            fontSize: '0.8125rem',
            height: '36px'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '0.6rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <div ref={filterRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="clb-btn clb-btn-secondary"
          style={{
            padding: '0.45rem 0.75rem',
            fontSize: '0.8125rem',
            borderColor: filters.priority || filters.assignee || filters.label ? 'var(--accent-primary)' : 'var(--border-default)'
          }}
        >
          <Filter size={14} color={filters.priority || filters.assignee || filters.label ? 'var(--accent-primary)' : 'currentColor'} />
          <span>Filter</span>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 100,
              width: '220px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Filter Issues
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.725rem', cursor: 'pointer', padding: 0 }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="clb-input-group">
              <label className="clb-label" style={{ fontSize: '0.75rem' }}>Priority</label>
              <select
                className="clb-input"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                style={{ fontSize: '0.8125rem', height: '32px' }}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
