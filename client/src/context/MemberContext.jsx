import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { memberService } from '../services/memberService';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';

const MemberContext = createContext(null);

export function MemberProvider({ projectId: propProjectId, children }) {
  const { user } = useAuth();
  const { currentProject } = useProject();

  const effectiveProjectId =
    propProjectId && propProjectId !== 'proj_1'
      ? propProjectId
      : currentProject?._id || currentProject?.id || propProjectId || 'proj_1';

  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [teamActivity, setTeamActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Recently joined'); // 'Recently joined', 'Name', 'Role'

  const currentUserId = user?._id || user?.id || 'usr_1';

  const loadMemberData = useCallback(async () => {
    if (!effectiveProjectId) {
      setMembers([]);
      setPendingInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [membersData, invitesData, membershipData] = await Promise.all([
        memberService.getMembers(effectiveProjectId).catch(() => []),
        memberService.getPendingInvitations(effectiveProjectId).catch(() => []),
        memberService.getMyMembership(effectiveProjectId).catch(() => null),
      ]);
      setMembers([...(membersData || [])]);
      setPendingInvitations([...(invitesData || [])]);
      setMyMembership(membershipData);
      setTeamActivity([]);
    } catch (err) {
      console.error('Failed to load member data:', err);
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    loadMemberData();
  }, [loadMemberData]);

  const addMember = async (payload) => {
    const member = await memberService.addMember(effectiveProjectId, payload);
    await loadMemberData();
    return member;
  };

  const inviteMember = async ({ emailOrUsername, username, email, role }) => {
    const invite = await memberService.inviteMember(effectiveProjectId, {
      emailOrUsername: emailOrUsername || username || email,
      username,
      email,
      role,
    });
    await loadMemberData();
    return invite;
  };

  const updateMemberRole = async (memberId, newRole) => {
    const updated = await memberService.updateMemberRole(effectiveProjectId, memberId, newRole);
    await loadMemberData();
    return updated;
  };

  const removeMember = async (memberId) => {
    await memberService.removeMember(effectiveProjectId, memberId);
    await loadMemberData();
    return true;
  };

  const cancelInvitation = async (invitationId) => {
    await memberService.cancelInvitation(effectiveProjectId, invitationId);
    await loadMemberData();
    return true;
  };

  const leaveProject = async () => {
    await memberService.leaveProject(effectiveProjectId);
    await loadMemberData();
    return true;
  };

  const getMember = useCallback(
    (memberId) => {
      return members.find(
        (m) =>
          m.id === memberId ||
          m._id === memberId ||
          m.userId === memberId ||
          m.username === memberId ||
          m.username === `@${memberId}`
      );
    },
    [members]
  );

  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.username && m.username.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.role && m.role.toLowerCase().includes(q))
      );
    }

    // Filter by role
    if (roleFilter && roleFilter !== 'All') {
      result = result.filter((m) => m.role?.toLowerCase() === roleFilter.toLowerCase());
    }

    // Sort
    if (sortOption === 'Name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'Role') {
      const rolePriority = { owner: 1, admin: 2, developer: 3, designer: 4, viewer: 5 };
      result.sort(
        (a, b) =>
          (rolePriority[a.role?.toLowerCase()] || 99) -
          (rolePriority[b.role?.toLowerCase()] || 99)
      );
    } else {
      // Recently joined or default
      result.sort((a, b) => (a.role === 'owner' ? -1 : 1));
    }

    return result;
  }, [members, searchQuery, roleFilter, sortOption]);

  const teamSummary = useMemo(() => {
    const total = members.length;
    const developers = members.filter((m) => m.role?.toLowerCase() === 'developer').length;
    const designers = members.filter((m) => m.role?.toLowerCase() === 'designer').length;
    const owners = members.filter((m) => m.role?.toLowerCase() === 'owner').length;
    const admins = members.filter((m) => m.role?.toLowerCase() === 'admin').length;
    const viewers = members.filter((m) => m.role?.toLowerCase() === 'viewer').length;

    return { total, developers, designers, owners, admins, viewers };
  }, [members]);

  return (
    <MemberContext.Provider
      value={{
        projectId: effectiveProjectId,
        members,
        filteredMembers,
        pendingInvitations,
        myMembership,
        teamActivity,
        teamSummary,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        sortOption,
        setSortOption,
        currentUserId,
        addMember,
        inviteMember,
        updateMemberRole,
        removeMember,
        leaveProject,
        cancelInvitation,
        getMember,
        reloadMembers: loadMemberData,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMembers must be used within a MemberProvider');
  }
  return context;
}

export default MemberContext;
