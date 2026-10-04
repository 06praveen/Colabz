import React from 'react';
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  CheckSquare,
  CircleDot,
  UserPlus,
  PhoneCall,
  MessageSquare,
  FolderPlus
} from 'lucide-react';

export default function ActivityIcon({ type, size = 14 }) {
  const t = (type || '').toLowerCase();

  if (t.includes('commit') || t.includes('file')) {
    return <GitCommit size={size} color="#3b82f6" />;
  }
  if (t.includes('branch')) {
    return <GitBranch size={size} color="#60a5fa" />;
  }
  if (t.includes('pull_request') || t.includes('merge')) {
    return <GitPullRequest size={size} color="#a855f7" />;
  }
  if (t.includes('task')) {
    return <CheckSquare size={size} color="#8b5cf6" />;
  }
  if (t.includes('issue')) {
    return <CircleDot size={size} color="#f59e0b" />;
  }
  if (t.includes('member') || t.includes('invite')) {
    return <UserPlus size={size} color="#10b981" />;
  }
  if (t.includes('call')) {
    return <PhoneCall size={size} color="#06b6d4" />;
  }
  if (t.includes('message') || t.includes('chat')) {
    return <MessageSquare size={size} color="#ec4899" />;
  }
  if (t.includes('project')) {
    return <FolderPlus size={size} color="#6366f1" />;
  }

  return <GitCommit size={size} color="var(--accent-primary)" />;
}
