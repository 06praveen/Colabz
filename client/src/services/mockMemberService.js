import { mockMembers, mockPendingInvitations, ROLE_DESCRIPTIONS } from '../mock/members';

let membersStore = [...mockMembers];
let invitationsStore = [...mockPendingInvitations];

export const mockMemberService = {
  async getMembers(projectId) {
    if (!projectId) return membersStore;
    return membersStore.filter((m) => m.projectIds.includes(projectId));
  },

  async getMember(memberId, projectId) {
    const member = membersStore.find(
      (m) => m.id === memberId || m.username === memberId || m.username === `@${memberId}`
    );
    if (!member) return null;
    if (projectId && !member.projectIds.includes(projectId)) {
      // For mock consistency, return the member
      return member;
    }
    return member;
  },

  async inviteMember(projectId, { emailOrUsername, role }) {
    const trimmed = (emailOrUsername || '').trim();
    if (!trimmed) throw new Error('Email or username is required.');

    const newInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: projectId || 'proj_1',
      email: trimmed.includes('@') ? trimmed : `${trimmed}@example.com`,
      username: trimmed.includes('@') ? trimmed.split('@')[0] : trimmed,
      role: role.toLowerCase(),
      invitedAt: 'Just now',
      invitedBy: 'Praveen Tiwari'
    };

    invitationsStore.unshift(newInvite);
    return newInvite;
  },

  async updateMemberRole(projectId, memberId, newRole) {
    const memberIndex = membersStore.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) throw new Error('Member not found');

    const updated = {
      ...membersStore[memberIndex],
      role: newRole.toLowerCase()
    };
    membersStore[memberIndex] = updated;
    return updated;
  },

  async removeMember(projectId, memberId) {
    const member = membersStore.find((m) => m.id === memberId);
    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') {
      throw new Error('Project owner cannot be removed.');
    }

    membersStore = membersStore.filter((m) => m.id !== memberId);
    return true;
  },

  async getPendingInvitations(projectId) {
    if (!projectId) return invitationsStore;
    return invitationsStore.filter((inv) => inv.projectId === projectId);
  },

  async cancelInvitation(projectId, invitationId) {
    invitationsStore = invitationsStore.filter((inv) => inv.id !== invitationId);
    return true;
  },

  async getTeamActivity(projectId) {
    // Collect all activities from project members
    const allActivities = membersStore
      .flatMap((m) => (m.activities || []).map((a) => ({ ...a, memberName: m.name, memberInitials: m.initials })))
      .sort((a, b) => (a.time.includes('min') ? -1 : 1));
    return allActivities;
  }
};
