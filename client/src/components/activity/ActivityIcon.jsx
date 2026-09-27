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
  switch (type) {
    case 'commit_pushed':
      return <GitCommit size={size} color="#3b82f6" />;
    case 'branch_created':
      return <GitBranch size={size} color="#60a5fa" />;
    case 'pull_request_created':
      return <GitPullRequest size={size} color="#a855f7" />;
    case 'task_created':
    case 'task_assigned':
    case 'task_completed':
      return <CheckSquare size={size} color="#8b5cf6" />;
    case 'issue_opened':
    case 'issue_closed':
      return <CircleDot size={size} color="#f59e0b" />;
    case 'member_joined':
    case 'member_invited':
      return <UserPlus size={size} color="#10b981" />;
    case 'call_started':
    case 'call_ended':
      return <PhoneCall size={size} color="#06b6d4" />;
    case 'message_sent':
      return <MessageSquare size={size} color="#ec4899" />;
    case 'project_created':
      return <FolderPlus size={size} color="#6366f1" />;
    default:
      return <GitCommit size={size} color="var(--accent-primary)" />;
  }
}
