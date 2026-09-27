import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskList from '../../components/tasks/TaskList';
import TaskBoard from '../../components/tasks/TaskBoard';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import { Plus, CheckSquare, RefreshCw, AlertCircle } from 'lucide-react';
import MotionButton from '../../components/motion/MotionButton';
import ColabzOctopus from '../../components/motion/ColabzOctopus';

export default function Tasks() {
  const {
    tasks,
    loading,
    error,
    searchQuery,
    viewMode,
    sortOption,
    filters,
    clearFilters,
    reloadTasks
  } = useTasks();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter tasks locally
  const filteredTasks = tasks.filter((t) => {
    // Status filter
    if (filters.status && String(t.status).toUpperCase() !== String(filters.status).toUpperCase()) {
      return false;
    }
    // Priority filter
    if (filters.priority && String(t.priority).toLowerCase() !== String(filters.priority).toLowerCase()) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchId = t.identifier.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchAssignee = t.assignee?.name.toLowerCase().includes(q);
      const matchLabel = t.labels?.some((l) => l.toLowerCase().includes(q));

      if (!matchTitle && !matchId && !matchDesc && !matchAssignee && !matchLabel) {
        return false;
      }
    }
    return true;
  });

  // Sort tasks locally
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === 'priority') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const pA = priorityOrder[String(a.priority).toLowerCase()] || 0;
      const pB = priorityOrder[String(b.priority).toLowerCase()] || 0;
      return pB - pA;
    }
    if (sortOption === 'dueDate') {
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    }
    if (sortOption === 'created') {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }
    // Default: updated
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });

  // 1. Loading State
  if (loading) {
    return (
      <div className="clb-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <RefreshCw size={24} color="var(--accent-primary)" style={{ animation: 'clb-spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Loading project tasks...
        </span>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="clb-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <AlertCircle size={28} color="var(--danger)" />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Something went wrong.
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>{error}</p>
        </div>
        <button onClick={reloadTasks} className="clb-btn clb-btn-secondary">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
              Tasks
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Plan, track, and assign project deliverables.
            </p>
          </div>
          <div className="desktop-only-sidebar">
            <ColabzOctopus mode="task-handoff" width={54} height={44} />
          </div>
        </div>

        <MotionButton variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          New Task
        </MotionButton>
      </div>

      {/* Search & Filter Controls Bar */}
      <TaskFilters />

      {/* Main Task Workspace Content */}
      {tasks.length === 0 ? (
        /* Empty Tasks State (Requirement #31) */
        <div
          className="clb-card"
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}
          >
            <CheckSquare size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              No tasks yet
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
              Create your first task to start organizing this project.
            </p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="clb-btn clb-btn-primary" style={{ marginTop: '0.5rem' }}>
            <Plus size={15} />
            Create Task
          </button>
        </div>
      ) : sortedTasks.length === 0 ? (
        /* Filtered No Match State (Requirement #31) */
        <div
          className="clb-card"
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            No tasks match your filters.
          </p>
          <button onClick={clearFilters} className="clb-btn clb-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
            Clear filters
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* Board View */
        <TaskBoard tasks={sortedTasks} />
      ) : (
        /* List View */
        <TaskList tasks={sortedTasks} />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
