import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity as ActivityIcon, Search, Folder, Filter } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import ActivityFilters from '../../components/activity/ActivityFilters';
import { mockProjects } from '../../mock/projects';

export default function Activity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectParam = searchParams.get('project') || 'all';

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState(selectedProjectParam);

  const { activity } = useNotificationContext();

  useEffect(() => {
    if (selectedProjectParam) {
      setProjectFilter(selectedProjectParam);
    }
  }, [selectedProjectParam]);

  const handleProjectFilterChange = (projId) => {
    setProjectFilter(projId);
    if (projId === 'all') {
      searchParams.delete('project');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ project: projId });
    }
  };

  // Filter activity items
  const filteredActivities = activity.filter((item) => {
    // Project filter
    if (projectFilter !== 'all' && item.projectId !== projectFilter) {
      return false;
    }

    // Category type filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'repository' && item.entityType !== 'repository') return false;
      if (activeFilter === 'tasks' && item.entityType !== 'task') return false;
      if (activeFilter === 'issues' && item.entityType !== 'issue') return false;
      if (activeFilter === 'members' && item.entityType !== 'member') return false;
      if (activeFilter === 'chat' && item.entityType !== 'conversation') return false;
      if (activeFilter === 'calls' && item.entityType !== 'call') return false;
    }

    // Search query
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const detailMatch = item.detail ? item.detail.toLowerCase().includes(q) : false;
      return titleMatch || detailMatch;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ActivityIcon size={24} color="var(--accent-primary)" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Activity Center
            </h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Historical timeline of everything happening across your team and repositories.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={16} color="var(--text-muted)" />
          <select
            value={projectFilter}
            onChange={(e) => handleProjectFilterChange(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Projects</option>
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <ActivityFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search activity timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
        </div>
      </div>

      {/* Timeline Feed */}
      <ActivityTimeline activities={filteredActivities} />
    </div>
  );
}
