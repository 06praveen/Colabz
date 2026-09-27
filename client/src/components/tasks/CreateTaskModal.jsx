import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { useMembers } from '../../context/MemberContext';
import { CheckSquare } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('Medium');
  const [assigneeName, setAssigneeName] = useState('Praveen Tiwari');
  const [labelsInput, setLabelsInput] = useState('Frontend');
  const [dueDate, setDueDate] = useState('2026-10-10');
  const [errorMsg, setErrorMsg] = useState('');

  const { createTask } = useTasks();
  const { addToast } = useToast();
  const { members } = useMembers();

  const assigneesList = members && members.length > 0
    ? members.map(m => ({ name: m.name, initials: m.initials, role: m.role }))
    : [
        { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
        { name: 'Rahul Sharma', initials: 'RH', role: 'Developer' }
      ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }

    setErrorMsg('');
    const assigneeObj = assigneesList.find((a) => a.name === assigneeName) || assigneesList[0];
    const labelsArr = labelsInput.split(',').map((l) => l.trim()).filter(Boolean);

    const created = await createTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assigneeObj,
      labels: labelsArr,
      dueDate
    });

    addToast({
      title: 'Task created',
      message: `Task ${created.identifier || ''} has been created successfully.`,
      type: 'success'
    });

    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('Medium');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new task">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: 'rgba(255, 92, 112, 0.1)',
              border: '1px solid rgba(255, 92, 112, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.8125rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="clb-input-group">
          <label className="clb-label">Title *</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. Implement mobile layout for repository"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrorMsg('');
            }}
            required
            autoFocus
          />
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Description (optional)</label>
          <textarea
            className="clb-input"
            rows={3}
            placeholder="Add details, acceptance criteria, or relevant links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div className="clb-input-group">
            <label className="clb-label">Status</label>
            <select className="clb-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="TODO">Todo</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="IN REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="clb-input-group">
            <label className="clb-label">Priority</label>
            <select className="clb-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div className="clb-input-group">
            <label className="clb-label">Assignee</label>
            <select className="clb-input" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)}>
              {assigneesList.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.initials})
                </option>
              ))}
            </select>
          </div>

          <div className="clb-input-group">
            <label className="clb-label">Due Date</label>
            <input
              type="date"
              className="clb-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Labels (comma separated)</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. Frontend, UI, Mobile"
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <CheckSquare size={15} />
            Create task
          </button>
        </div>
      </form>
    </Modal>
  );
}
