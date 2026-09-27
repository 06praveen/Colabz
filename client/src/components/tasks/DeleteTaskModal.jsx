import React from 'react';
import Modal from '../ui/Modal';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteTaskModal({ isOpen, onClose, task, onDeleted }) {
  const { deleteTask } = useTasks();
  const { addToast } = useToast();

  const handleDelete = async () => {
    if (!task) return;
    await deleteTask(task.id || task.identifier);
    addToast({
      title: 'Task deleted',
      message: `Task ${task.identifier || ''} has been removed.`,
      type: 'info'
    });

    if (onDeleted) onDeleted();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete task?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 92, 112, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger)',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Are you sure you want to delete this task?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
              This will permanently remove <strong>{task?.identifier || 'this task'}</strong> ("{task?.title}") from this project.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="clb-btn"
            style={{
              backgroundColor: 'var(--danger)',
              color: '#FFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Trash2 size={15} />
            Delete Task
          </button>
        </div>
      </div>
    </Modal>
  );
}
