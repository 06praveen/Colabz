import React from 'react';
import { CircleDot, CheckCircle2 } from 'lucide-react';

export default function IssueStatusBadge({ status = 'Open' }) {
  const isOpen = String(status).toLowerCase() === 'open';

  return (
    <span className={`clb-badge ${isOpen ? 'clb-badge-success' : 'clb-badge-neutral'}`}>
      {isOpen ? <CircleDot size={12} /> : <CheckCircle2 size={12} />}
      <span>{status}</span>
    </span>
  );
}
