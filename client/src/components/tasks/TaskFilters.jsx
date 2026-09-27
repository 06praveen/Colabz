import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Search, Filter, ArrowUpDown, LayoutList, LayoutGrid, X } from 'lucide-react';

export default function TaskFilters() {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    filters,
    setFilters,
    clearFilters
  } = useTasks();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.assignee || filters.label || searchQuery
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}
    >
      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 240px', maxWidth: '400px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none' }} />
          <input
            type="text"
            className="clb-input"
            placeholder="Search tasks..."
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls: Filter, Sort, View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Filter Dropdown */}
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="clb-btn clb-btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8125rem',
              borderColor: filters.status || filters.priority || filters.assignee || filters.label ? 'var(--accent-primary)' : 'var(--border-default)'
            }}
          >
            <Filter size={14} color={filters.status || filters.priority || filters.assignee || filters.label ? 'var(--accent-primary)' : 'currentColor'} />
            <span>Filter</span>
          </button>

          {isFilterOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 100,
                width: '240px',
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
                  Filter Tasks
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

              {/* Status Filter */}
              <div className="clb-input-group">
                <label className="clb-label" style={{ fontSize: '0.75rem' }}>Status</label>
                <select
                  className="clb-input"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  style={{ fontSize: '0.8125rem', height: '32px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="TODO">Todo</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="IN REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
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

        {/* Sort Menu */}
        <div ref={sortRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="clb-btn clb-btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>

          {isSortOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 100,
                width: '180px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                padding: '0.35rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {[
                { id: 'updated', label: 'Recently Updated' },
                { id: 'priority', label: 'Priority' },
                { id: 'dueDate', label: 'Due Date' },
                { id: 'created', label: 'Created Date' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortOption(opt.id);
                    setIsSortOpen(false);
                  }}
                  className="clb-btn-ghost"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.8125rem',
                    color: sortOption === opt.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontWeight: sortOption === opt.id ? 600 : 400
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher: List | Board */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px'
          }}
        >
          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'list' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.785rem',
              fontWeight: viewMode === 'list' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
          >
            <LayoutList size={14} />
            <span>List</span>
          </button>

          <button
            onClick={() => setViewMode('board')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'board' ? 'var(--bg-elevated)' : 'transparent',
              color: viewMode === 'board' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.785rem',
              fontWeight: viewMode === 'board' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
          >
            <LayoutGrid size={14} />
            <span>Board</span>
          </button>
        </div>
      </div>
    </div>
  );
}
