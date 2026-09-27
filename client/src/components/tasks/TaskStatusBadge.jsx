import React from 'react';
import { Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TaskStatusBadge({ status = 'TODO' }) {
  const norm = String(status).toUpperCase();

  let badgeClass = 'clb-badge-neutral';
  let Icon = Circle;
  let label = status;

  if (norm === 'TODO') {
    badgeClass = 'clb-badge-neutral';
    Icon = Circle;
    label = 'Todo';
  } else if (norm === 'IN PROGRESS') {
    badgeClass = 'clb-badge-warning';
    Icon = Clock;
    label = 'In Progress';
  } else if (norm === 'IN REVIEW') {
    badgeClass = 'clb-badge-primary';
    Icon = AlertCircle;
    label = 'In Review';
  } else if (norm === 'DONE') {
    badgeClass = 'clb-badge-success';
    Icon = CheckCircle2;
    label = 'Done';
  }

  return (
    <span className={`clb-badge ${badgeClass}`}>
      <Icon size={11} />
      <span>{label}</span>
    </span>
  );
}
