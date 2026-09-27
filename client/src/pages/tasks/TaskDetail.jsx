import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { mockTaskService } from '../../services/mockTaskService';
import TaskStatusBadge from '../../components/tasks/TaskStatusBadge';
import TaskPriorityBadge from '../../components/tasks/TaskPriorityBadge';
import EditTaskModal from '../../components/tasks/EditTaskModal';
import DeleteTaskModal from '../../components/tasks/DeleteTaskModal';
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag, Clock, Activity, CheckSquare } from 'lucide-react';

export default function TaskDetail() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { updateTask } = useTasks();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const activeProjectId = projectId || 'proj_1';

  useEffect(() => {
    async function fetchTask() {
      setLoading(true);
      const found = await mockTaskService.getTaskById(activeProjectId, taskId);
      setTask(found);
      setLoading(false);
    }
    fetchTask();
  }, [activeProjectId, taskId]);

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    const updated = await updateTask(task.id || task.identifier, { status: newStatus });
    if (updated) setTask(updated);
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <button onClick={() => navigate(`/app/projects/${activeProjectId}/tasks`)} className="clb-btn clb-btn-ghost">
          <ArrowLeft size={14} /> Back to Tasks
        </button>

        <div className="clb-card" style={{ padding: '3rem 1.5rem', width: '100%', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Task not found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            The requested task identifier "{taskId}" does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(`/app/projects/${activeProjectId}/tasks`)}
        className="clb-btn clb-btn-ghost"
        style={{ alignSelf: 'flex-start', padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
      >
        <ArrowLeft size={14} />
        Back to Tasks
      </button>

      {/* Main Detail Header Card */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Identifier + Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                backgroundColor: 'rgba(0, 229, 163, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(0, 229, 163, 0.25)'
              }}
            >
              {task.identifier || 'COL-1'}
            </span>

            <TaskPriorityBadge priority={task.priority} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <button
              onClick={() => setIsEditOpen(true)}
              className="clb-btn clb-btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <Edit size={14} />
              Edit
            </button>

            <button
              onClick={() => setIsDeleteOpen(true)}
              className="clb-btn clb-btn-ghost"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
          {task.title}
        </h1>

        {/* Status Dropdown Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-elevated)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <span style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            STATUS
          </span>

          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="clb-input"
            style={{ width: 'auto', fontSize: '0.8125rem', height: '32px', padding: '0.2rem 0.6rem' }}
          >
            <option value="TODO">Todo</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="IN REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>

          <TaskStatusBadge status={task.status} />
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
            Description
          </h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {task.description || 'No description provided for this task.'}
          </div>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ASSIGNEE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.25rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 163, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>
                {task.assignee?.initials || 'PR'}
              </div>
              <span style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {task.assignee?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DUE DATE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
              <Calendar size={14} color="var(--accent-primary)" />
              <span>{task.dueDate || 'No due date'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LABELS</span>
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {task.labels && task.labels.length > 0 ? (
                task.labels.map((lbl) => (
                  <span key={lbl} style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-input)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                    {lbl}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="clb-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
          <Activity size={15} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Activity Log
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {task.activity && task.activity.length > 0 ? (
            task.activity.map((act) => (
              <div key={act.id} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.user}</span>
                <span>{act.action}</span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{act.time}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No recent activity.</div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditTaskModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} task={task} />
      <DeleteTaskModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} task={task} onDeleted={() => navigate(`/app/projects/${activeProjectId}/tasks`)} />
    </div>
  );
}
