import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useIssues } from '../../context/IssueContext';
import { useToast } from '../../context/ToastContext';
import { useMembers } from '../../context/MemberContext';
import { Edit } from 'lucide-react';

export default function EditIssueModal({ isOpen, onClose, issue }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [assigneeName, setAssigneeName] = useState('Praveen Tiwari');
  const [labelsInput, setLabelsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { updateIssue } = useIssues();
  const { addToast } = useToast();
  const { members } = useMembers();

  const assigneesList = members && members.length > 0
    ? members.map(m => ({ name: m.name, initials: m.initials, role: m.role }))
    : [
        { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
        { name: 'Rahul Sharma', initials: 'RH', role: 'Developer' }
      ];

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || '');
      setDescription(issue.description || '');
      setPriority(issue.priority || 'Medium');
      setAssigneeName(issue.assignee?.name || 'Praveen Tiwari');
      setLabelsInput(issue.labels ? issue.labels.join(', ') : '');
    }
  }, [issue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Issue title is required.');
      return;
    }

    const assigneeObj = assigneesList.find((a) => a.name === assigneeName) || assigneesList[0];
    const labelsArr = labelsInput.split(',').map((l) => l.trim()).filter(Boolean);

    await updateIssue(issue.id || issue.number, {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assigneeObj,
      labels: labelsArr
    });

    addToast({
      title: 'Issue updated',
      message: `Issue #${issue.number} has been updated.`,
      type: 'success'
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit issue #${issue?.number || ''}`}>
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
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrorMsg('');
            }}
            required
          />
        </div>

        <div className="clb-input-group">
          <label className="clb-label">Description</label>
          <textarea
            className="clb-input"
            rows={4}
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
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="clb-btn clb-btn-ghost">
            Cancel
          </button>
          <button type="submit" className="clb-btn clb-btn-primary">
            <Edit size={15} />
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
