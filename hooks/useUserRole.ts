'use client';

import { useApp } from '@/context/AppContext';
import { UserProfile, UserRole } from '@/types';

export interface UseUserRoleReturn {
  user: UserProfile | null;
  role: UserRole;
  isDeveloper: boolean;
  isHod: boolean;
  isSocietyAdmin: boolean;
  isStudent: boolean;
  switchRole: (role: UserRole) => void;
  loading: boolean;
}

/**
 * Custom React hook to fetch and monitor current user profile, role, and permission flags.
 * Supports active role switching for real-time mode previewing across the 4 modes.
 */
export function useUserRole(): UseUserRoleReturn {
  const { currentUser, activeRole, switchRole, loading } = useApp();

  return {
    user: currentUser,
    role: activeRole,
    isDeveloper: activeRole === 'developer',
    isHod: activeRole === 'hod',
    isSocietyAdmin: activeRole === 'society_admin',
    isStudent: activeRole === 'student',
    switchRole,
    loading,
  };
}
