import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useIssues } from '../../context/IssueContext';
import { useToast } from '../../context/ToastContext';
import { useMembers } from '../../context/MemberContext';
import { CircleDot } from 'lucide-react';

export default function CreateIssueModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [assigneeName, setAssigneeName] = useState('Praveen Tiwari');
  const [labelsInput, setLabelsInput] = useState('Bug');
  const [errorMsg, setErrorMsg] = useState('');

  const { createIssue } = useIssues();
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
      setErrorMsg('Issue title is required.');
      return;
    }

    setErrorMsg('');
    const assigneeObj = assigneesList.find((a) => a.name === assigneeName) || assigneesList[0];
    const labelsArr = labelsInput.split(',').map((l) => l.trim()).filter(Boolean);

    const created = await createIssue({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assigneeObj,
      labels: labelsArr
    });

    addToast({
      title: 'Issue opened',
      message: `Issue #${created.number} has been created.`,
      type: 'success'
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new issue">
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
            placeholder="e.g. Repository search input drops last character"
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
            rows={4}
            placeholder="Describe the bug, steps to reproduce, or feature requirement..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div className="clb-input-group">
            <label className="clb-label">Priority</label>
            <select className="clb-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

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
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Labels (comma separated)</label>
          <input
            type="text"
            className="clb-input"
            placeholder="e.g. Bug, Frontend, UI"
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <CircleDot size={15} />
            Submit new issue
          </button>
        </div>
      </form>
    </Modal>
  );
}
