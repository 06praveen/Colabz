import { mockIssues } from '../mock/issues';

let localIssuesStore = [...mockIssues];

export const mockIssueService = {
  async getIssues(projectId) {
    return localIssuesStore.filter((i) => i.projectId === projectId || !projectId);
  },

  async getIssueById(projectId, issueId) {
    const cleanId = String(issueId).replace('#', '');
    const issue = localIssuesStore.find(
      (i) => (i.id === issueId || String(i.number) === cleanId) && (i.projectId === projectId || !projectId)
    );
    return issue || localIssuesStore.find((i) => i.id === issueId || String(i.number) === cleanId) || null;
  },

  async createIssue(projectId, issueData) {
    const nextNum = 20 + localIssuesStore.length + 1;
    const newIssue = {
      id: `issue_${Date.now()}`,
      number: nextNum,
      projectId: projectId || 'proj_1',
      title: issueData.title,
      description: issueData.description || '',
      status: 'Open',
      priority: issueData.priority || 'Medium',
      assignee: issueData.assignee || { name: 'Praveen Tiwari', initials: 'PR', role: 'Maintainer' },
      author: 'Praveen Tiwari',
      authorInitials: 'PR',
      labels: issueData.labels || ['Bug'],
      createdAt: 'Just now',
      updatedAt: 'Just now',
      comments: []
    };

    localIssuesStore.unshift(newIssue);
    return newIssue;
  },

  async updateIssue(projectId, issueId, updates) {
    const cleanId = String(issueId).replace('#', '');
    const index = localIssuesStore.findIndex((i) => i.id === issueId || String(i.number) === cleanId);
    if (index === -1) return null;

    const updatedIssue = {
      ...localIssuesStore[index],
      ...updates,
      updatedAt: 'Just now'
    };

    localIssuesStore[index] = updatedIssue;
    return updatedIssue;
  },

  async deleteIssue(projectId, issueId) {
    const cleanId = String(issueId).replace('#', '');
    localIssuesStore = localIssuesStore.filter((i) => i.id !== issueId && String(i.number) !== cleanId);
    return true;
  },

  async addComment(projectId, issueId, commentText, authorName = 'Praveen Tiwari') {
    const cleanId = String(issueId).replace('#', '');
    const issue = localIssuesStore.find((i) => i.id === issueId || String(i.number) === cleanId);
    if (!issue) return null;

    const initials = authorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const newComment = {
      id: `comm_${Date.now()}`,
      author: authorName,
      initials: initials || 'PR',
      text: commentText,
      time: 'Just now'
    };

    if (!issue.comments) issue.comments = [];
    issue.comments.push(newComment);
    issue.updatedAt = 'Just now';

    return newComment;
  }
};
