import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { mockMemberService } from '../services/mockMemberService';

const MemberContext = createContext(null);

export function MemberProvider({ projectId = 'proj_1', children }) {
  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Recently joined'); // 'Recently joined', 'Name', 'Role'

  const currentUserId = 'usr_1'; // Praveen Tiwari

  const loadMemberData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, invitesData, activityData] = await Promise.all([
        mockMemberService.getMembers(projectId),
        mockMemberService.getPendingInvitations(projectId),
        mockMemberService.getTeamActivity(projectId)
      ]);
      setMembers([...membersData]);
      setPendingInvitations([...invitesData]);
      setTeamActivity([...activityData]);
    } catch (err) {
      console.error('Failed to load member data:', err);
      setError('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadMemberData();
  }, [loadMemberData]);

  const inviteMember = async ({ emailOrUsername, role }) => {
    const invite = await mockMemberService.inviteMember(projectId, { emailOrUsername, role });
    await loadMemberData();
    return invite;
  };

  const updateMemberRole = async (memberId, newRole) => {
    const updated = await mockMemberService.updateMemberRole(projectId, memberId, newRole);
    await loadMemberData();
    return updated;
  };

  const removeMember = async (memberId) => {
    await mockMemberService.removeMember(projectId, memberId);
    await loadMemberData();
    return true;
  };

  const cancelInvitation = async (invitationId) => {
    await mockMemberService.cancelInvitation(projectId, invitationId);
    await loadMemberData();
    return true;
  };

  const getMember = useCallback((memberId) => {
    return members.find((m) => m.id === memberId || m.username === memberId);
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.username.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q)
      );
    }

    // Filter by role
    if (roleFilter && roleFilter !== 'All') {
      result = result.filter((m) => m.role.toLowerCase() === roleFilter.toLowerCase());
    }

    // Sort
    if (sortOption === 'Name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'Role') {
      const rolePriority = { owner: 1, admin: 2, developer: 3, designer: 4, viewer: 5 };
      result.sort((a, b) => (rolePriority[a.role] || 99) - (rolePriority[b.role] || 99));
    } else {
      // Recently joined (default order in mock)
      result.sort((a, b) => (a.id === 'usr_1' ? -1 : 1));
    }

    return result;
  }, [members, searchQuery, roleFilter, sortOption]);

  const teamSummary = useMemo(() => {
    const total = members.length;
    const developers = members.filter((m) => m.role === 'developer').length;
    const designers = members.filter((m) => m.role === 'designer').length;
    const owners = members.filter((m) => m.role === 'owner').length;
    const admins = members.filter((m) => m.role === 'admin').length;
    const viewers = members.filter((m) => m.role === 'viewer').length;

    return { total, developers, designers, owners, admins, viewers };
  }, [members]);

  return (
    <MemberContext.Provider
      value={{
        projectId,
        members,
        filteredMembers,
        pendingInvitations,
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
        inviteMember,
        updateMemberRole,
        removeMember,
        cancelInvitation,
        getMember,
        reloadMembers: loadMemberData
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
