'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CampusEvent,
  Society,
  FlashAnnouncement,
  Department,
  UserProfile,
  UserRole,
  SystemAuditLog,
  ChatChannel,
  ChatMessage,
  GitHubSyncConfig,
  AcademicDepartment,
} from '@/types';
import {
  INITIAL_EVENTS,
  INITIAL_SOCIETIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DEPARTMENTS,
  MOCK_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
} from '@/utils/mockData';
import { syncDatabaseToGitHub } from '@/utils/githubSync';

// Owner Master Key for emergency owner elevation / root access
export const ADMIN_MASTER_KEY = 'asheer-admin-2026';

interface AppContextType {
  // Current user & Auth Gate
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  usersList: UserProfile[];
  login: (enrollmentIdOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    enrollment_id: string;
    full_name: string;
    email: string;
    department: AcademicDepartment;
    semester: string;
    password?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  unlockAdminPrivilege: (masterKey: string) => { success: boolean; message: string };

  // Admin Verification & Role Desk (Strictly Admin only)
  verifyUser: (userId: string) => Promise<void>;
  promoteUserRole: (userId: string, newRole: UserRole, societyName?: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Data
  events: CampusEvent[];
  societies: Society[];
  announcements: FlashAnnouncement[];
  departments: Department[];
  auditLogs: SystemAuditLog[];

  // Society Management (Society Head / Admin)
  createSociety: (data: {
    name: string;
    code: string;
    description: string;
    department: AcademicDepartment;
    logo_url?: string;
  }) => Promise<string>;
  updateSociety: (societyId: string, patch: Partial<Society>) => Promise<void>;

  // WhatsApp-Style Chat Engine
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  sendMessage: (channelId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  inviteToSocietyChannel: (channelId: string, targetEnrollmentId: string) => Promise<{ success: boolean; message: string }>;
  createChannel: (data: {
    name: string;
    type: 'general' | 'society' | 'direct';
    description?: string;
    society_id?: string;
    society_name?: string;
    is_private: boolean;
    initial_members?: string[];
  }) => Promise<string>;

  // GitHub Real-Time Database Sync Engine
  githubConfig: GitHubSyncConfig;
  updateGitHubConfig: (config: Partial<GitHubSyncConfig>) => void;
  triggerGitHubSync: () => Promise<{ success: boolean; message: string }>;

  // Event & Post Actions
  addEvent: (eventData: Omit<CampusEvent, 'id' | 'approved_by_hod' | 'attendee_count'>) => Promise<void>;
  updateEvent: (eventId: string, patch: Partial<CampusEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string, reason: string) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<{ success: boolean; message: string }>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  rsvpEvent: (eventId: string) => void;
  addAnnouncement: (announcement: Omit<FlashAnnouncement, 'id' | 'created_at' | 'active'>) => Promise<void>;
  toggleBookmark: (eventId: string) => void;
  purgeCache: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'bu_h11_store_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usersList, setUsersList] = useState<UserProfile[]>(MOCK_USERS);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [societies, setSocieties] = useState<Society[]>(INITIAL_SOCIETIES);
  const [announcements, setAnnouncements] = useState<FlashAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Chat Engine State: Initially exactly 1 channel "APP Updates"
  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState<string>(INITIAL_CHANNELS[0]?.id || 'chan-app-updates');

  // GitHub Real-Time Database Sync State
  const [githubConfig, setGithubConfig] = useState<GitHubSyncConfig>({
    owner: 'asheerali11s',
    repo: 'bu-h11-camppulse',
    branch: 'main',
    sync_status: 'idle',
    total_commits: 1,
  });

  // Load persistent state from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_user`);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setIsAuthenticated(true);
      }

      const savedUsersList = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_users_list`);
      if (savedUsersList) {
        setUsersList(JSON.parse(savedUsersList));
      } else {
        setUsersList(MOCK_USERS);
      }

      const savedEvents = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_events`);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }

      const savedSocieties = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_societies`);
      if (savedSocieties) {
        setSocieties(JSON.parse(savedSocieties));
      }

      const savedChannels = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_channels`);
      if (savedChannels) {
        setChannels(JSON.parse(savedChannels));
      } else {
        setChannels(INITIAL_CHANNELS);
      }

      const savedMessages = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_messages`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages(INITIAL_MESSAGES);
      }

      const savedLogs = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_logs`);
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      }

      const savedGitConfig = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_github`);
      if (savedGitConfig) {
        setGithubConfig(JSON.parse(savedGitConfig));
      }

      // Sync with Centralized Server Database
      fetch('/api/db')
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            if (res.data.users?.length) setUsersList(res.data.users);
            if (res.data.events) setEvents(res.data.events);
            if (res.data.societies) setSocieties(res.data.societies);
            if (res.data.channels) setChannels(res.data.channels);
            if (res.data.messages) setMessages(res.data.messages);
          }
        })
        .catch((e) => console.warn('Server sync notice:', e));
    } catch (e) {
      console.warn('LocalStorage hydration notice:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  };

  const logAudit = (action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_email: currentUser?.email || 'admin@bahria.edu.pk',
      user_enrollment: currentUser?.enrollment_id || 'UNVERIFIED',
      action,
      details,
      timestamp: new Date().toISOString(),
      severity,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      persist('logs', updated);
      return updated;
    });
  };

  // Auth: Login
  const login = async (enrollmentIdOrEmail: string, password?: string) => {
    const q = enrollmentIdOrEmail.trim().toLowerCase();

    // Check if logging in as Admin using master key directly
    if (q === 'asheer' || q === '01-134221-001') {
      const adminAcc = usersList.find((u) => u.enrollment_id === '01-134221-001') || MOCK_USERS[0];
      setCurrentUser(adminAcc);
      setIsAuthenticated(true);
      persist('user', adminAcc);
      logAudit('ADMIN_LOGIN', `Platform Owner logged into BU H-11 Portal.`);
      return { success: true };
    }

    const found = usersList.find(
      (u) =>
        u.enrollment_id.toLowerCase() === q ||
        u.email.toLowerCase() === q ||
        u.enrollment_id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === q.replace(/[^a-zA-Z0-9]/g, '')
    );

    if (!found) {
      return {
        success: false,
        message: 'No registered student account found with this Enrollment ID. Please register first.',
      };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    persist('user', found);
    logAudit('USER_LOGIN', `User ${found.full_name} (${found.enrollment_id} • ${found.department}) signed in.`);
    return { success: true };
  };

  // Auth: Register (Students CANNOT register as HOD, Society Head, or Admin! Always starts as 'student')
  const register = async (userData: {
    enrollment_id: string;
    full_name: string;
    email: string;
    department: AcademicDepartment;
    semester: string;
    password?: string;
  }) => {
    const cleanEnrollment = userData.enrollment_id.trim();
    const existing = usersList.find(
      (u) => u.enrollment_id.toLowerCase() === cleanEnrollment.toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        message: `Enrollment ID '${cleanEnrollment}' is already registered. Please log in instead.`,
      };
    }

    // New student accounts are always strictly 'student' role. Admin promotes to society_admin or hod.
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      enrollment_id: cleanEnrollment,
      full_name: userData.full_name.trim(),
      email: userData.email.trim(),
      department: userData.department,
      semester: userData.semester,
      role: 'student',
      is_verified: false, // Pending verification from platform admin
      avatar_url: `https://images.unsplash.com/photo-${1535713875002 + (usersList.length % 5)}?w=100&q=80`,
      created_at: new Date().toISOString(),
    };

    const updatedUsers = [...usersList, newUser];
    setUsersList(updatedUsers);
    persist('users_list', updatedUsers);

    // Auto-subscribe to APP Updates channel
    setChannels((prev) => {
      const updatesChan = prev.find((c) => c.id === 'chan-app-updates') || prev[0];
      if (updatesChan && !updatesChan.member_enrollments.includes(newUser.enrollment_id)) {
        const mod = {
          ...updatesChan,
          member_enrollments: [...updatesChan.member_enrollments, newUser.enrollment_id],
        };
        const next = prev.map((c) => (c.id === updatesChan.id ? mod : c));
        persist('channels', next);
        return next;
      }
      return prev;
    });

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    persist('user', newUser);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REGISTER_USER', payload: { user: newUser } }),
    }).catch(() => {});

    logAudit(
      'STUDENT_REGISTERED',
      `Student registered: ${newUser.enrollment_id} (${newUser.full_name} • ${newUser.department} • ${newUser.semester})`
    );

    triggerGitHubSync().catch(console.error);
    return { success: true };
  };

  const logout = () => {
    logAudit('USER_LOGOUT', `User ${currentUser?.enrollment_id} signed out.`);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}_user`);
  };

  // Root unlock with Admin Master Key
  const unlockAdminPrivilege = (masterKey: string) => {
    if (masterKey.trim() !== ADMIN_MASTER_KEY) {
      return { success: false, message: 'Invalid Admin Master Key. Access Denied.' };
    }
    if (!currentUser) {
      const adminAcc = usersList.find((u) => u.enrollment_id === '01-134221-001') || MOCK_USERS[0];
      setCurrentUser(adminAcc);
      setIsAuthenticated(true);
      persist('user', adminAcc);
      return { success: true, message: 'Platform Owner identity confirmed. Developer mode unlocked.' };
    }

    const elevated = { ...currentUser, role: 'developer' as UserRole, is_verified: true };
    setCurrentUser(elevated);
    persist('user', elevated);

    const updatedList = usersList.map((u) => (u.id === currentUser.id ? elevated : u));
    setUsersList(updatedList);
    persist('users_list', updatedList);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'PROMOTE_USER', payload: { userId: currentUser.id, role: 'developer' } }),
    }).catch(() => {});

    logAudit('ROOT_PRIVILEGE_UNLOCKED', `Admin master privilege unlocked for ${currentUser.enrollment_id}`, 'warning');
    return { success: true, message: 'Admin Master Privilege verified and activated.' };
  };

  // ADMIN DESK: Verify Student Account
  const verifyUser = async (userId: string) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, is_verified: true } : u));
    setUsersList(updated);
    persist('users_list', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'VERIFY_USER', payload: { userId } }),
    }).catch(() => {});

    if (currentUser?.id === userId) {
      const mod = { ...currentUser, is_verified: true };
      setCurrentUser(mod);
      persist('user', mod);
    }
    logAudit('STUDENT_VERIFIED', `Admin verified enrollment for student ID ${userId}`);
    triggerGitHubSync().catch(console.error);
  };

  // ADMIN DESK: Promote user role (Only admin can assign Society Head, HOD, or Developer)
  const promoteUserRole = async (userId: string, newRole: UserRole, societyName?: string) => {
    let assignedSocId: string | undefined;

    if (newRole === 'society_admin' && societyName?.trim()) {
      const socId = `soc-${Date.now()}`;
      assignedSocId = socId;
      const targetUser = usersList.find((u) => u.id === userId);

      const newSociety: Society = {
        id: socId,
        name: societyName.trim(),
        code: societyName.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 5) || 'SOC',
        description: `Official society chartered at BU H-11 Campus under ${targetUser?.department || 'University Directorate'}.`,
        logo_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&q=80',
        is_recruiting: true,
        department: targetUser?.department || 'Software Engineering',
        lead_enrollment: targetUser?.enrollment_id || '',
        lead_name: targetUser?.full_name || 'Society Head',
        created_at: new Date().toISOString(),
      };

      const updatedSoc = [...societies, newSociety];
      setSocieties(updatedSoc);
      persist('societies', updatedSoc);
    }

    const updated = usersList.map((u) =>
      u.id === userId
        ? {
            ...u,
            role: newRole,
            is_verified: true,
            society_name: societyName || u.society_name,
            society_id: assignedSocId || u.society_id,
          }
        : u
    );
    setUsersList(updated);
    persist('users_list', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'PROMOTE_USER', payload: { userId, role: newRole, societyName } }),
    }).catch(() => {});

    if (currentUser?.id === userId) {
      const mod = {
        ...currentUser,
        role: newRole,
        is_verified: true,
        society_name: societyName || currentUser.society_name,
        society_id: assignedSocId || currentUser.society_id,
      };
      setCurrentUser(mod);
      persist('user', mod);
    }

    logAudit('ROLE_ELEVATED', `Admin promoted user ID ${userId} to [${newRole.toUpperCase()}]`, 'warning');
    triggerGitHubSync().catch(console.error);
  };

  // ADMIN DESK: Delete / Reject User
  const deleteUser = async (userId: string) => {
    const updated = usersList.filter((u) => u.id !== userId);
    setUsersList(updated);
    persist('users_list', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_USER', payload: { userId } }),
    }).catch(() => {});

    logAudit('USER_DELETED', `Admin deleted user profile ID ${userId}`, 'warning');
    triggerGitHubSync().catch(console.error);
  };

  // Create Society
  const createSociety = async (data: {
    name: string;
    code: string;
    description: string;
    department: AcademicDepartment;
    logo_url?: string;
  }) => {
    const newId = `soc-${Date.now()}`;
    const newSociety: Society = {
      id: newId,
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description,
      department: data.department,
      logo_url: data.logo_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&q=80',
      is_recruiting: true,
      lead_enrollment: currentUser?.enrollment_id || 'UNKNOWN',
      lead_name: currentUser?.full_name || 'Society Head',
      contact_email: currentUser?.email || 'society@bahria.edu.pk',
      member_count: 1,
      created_at: new Date().toISOString(),
    };

    const updated = [...societies, newSociety];
    setSocieties(updated);
    persist('societies', updated);

    logAudit('SOCIETY_CREATED', `New society '${data.name}' chartered by ${currentUser?.enrollment_id}`);
    triggerGitHubSync().catch(console.error);
    return newId;
  };

  const updateSociety = async (societyId: string, patch: Partial<Society>) => {
    const updated = societies.map((soc) => (soc.id === societyId ? { ...soc, ...patch } : soc));
    setSocieties(updated);
    persist('societies', updated);
    logAudit('SOCIETY_UPDATED', `Updated society ${societyId}`);
    triggerGitHubSync().catch(console.error);
  };

  // WhatsApp-Style Chat: Send Message
  const sendMessage = async (channelId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    if (!content.trim() || !currentUser) return { success: false, error: 'User not authenticated' };

    const targetChannel = channels.find((c) => c.id === channelId);

    // RESTRICTION: In APP Updates (or any announcements-only channel), only Developer/Admin can message!
    if (targetChannel?.is_announcements_only && currentUser.role !== 'developer') {
      return {
        success: false,
        error: 'Permission Denied: Only the Platform Administrator can post in APP Updates.',
      };
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      channel_id: channelId,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_enrollment: currentUser.enrollment_id,
      sender_dept: currentUser.department,
      sender_role: currentUser.role,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    persist('messages', updatedMessages);

    setChannels((prev) => {
      const updated = prev.map((c) =>
        c.id === channelId
          ? {
              ...c,
              last_message: content.trim(),
              last_message_time: new Date().toISOString(),
            }
          : c
      );
      persist('channels', updated);
      return updated;
    });

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SEND_MESSAGE', payload: { message: newMsg } }),
    }).catch(() => {});

    logAudit('CHAT_MESSAGE_SENT', `[${currentUser.enrollment_id}] sent message in '${targetChannel?.name || channelId}'`);
    return { success: true };
  };

  // Invite student to chat by enrollment ID
  const inviteToSocietyChannel = async (channelId: string, targetEnrollmentId: string) => {
    const cleanId = targetEnrollmentId.trim();
    const targetUser = usersList.find(
      (u) => u.enrollment_id.toLowerCase() === cleanId.toLowerCase()
    );

    if (!targetUser) {
      return {
        success: false,
        message: `Student with Enrollment ID '${cleanId}' not found in BU H-11 registry.`,
      };
    }

    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return { success: false, message: 'Channel not found.' };

    if (channel.member_enrollments.includes(targetUser.enrollment_id)) {
      return {
        success: false,
        message: `${targetUser.full_name} (${targetUser.enrollment_id}) is already in this chat.`,
      };
    }

    const updatedChannels = channels.map((c) =>
      c.id === channelId
        ? {
            ...c,
            member_enrollments: [...c.member_enrollments, targetUser.enrollment_id],
          }
        : c
    );

    setChannels(updatedChannels);
    persist('channels', updatedChannels);

    const sysMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      channel_id: channelId,
      sender_id: 'sys',
      sender_name: 'BU H-11 Admin',
      sender_enrollment: 'SYSTEM',
      sender_dept: 'Administration',
      sender_role: 'developer',
      content: `${targetUser.full_name} (${targetUser.enrollment_id}) was added to ${channel.name}.`,
      created_at: new Date().toISOString(),
      is_system: true,
    };
    const updatedMessages = [...messages, sysMsg];
    setMessages(updatedMessages);
    persist('messages', updatedMessages);

    return {
      success: true,
      message: `Successfully invited ${targetUser.full_name}!`,
    };
  };

  const createChannel = async (data: {
    name: string;
    type: 'general' | 'society' | 'direct';
    description?: string;
    society_id?: string;
    society_name?: string;
    is_private: boolean;
    initial_members?: string[];
  }) => {
    const newChanId = `chan-${Date.now()}`;
    const myId = currentUser?.enrollment_id || '';
    const members = Array.from(new Set([myId, ...(data.initial_members || [])])).filter(Boolean);

    const newChan: ChatChannel = {
      id: newChanId,
      name: data.name,
      type: data.type,
      description: data.description || '',
      society_id: data.society_id,
      society_name: data.society_name,
      is_private: data.is_private,
      is_announcements_only: false,
      member_enrollments: members,
      created_by_enrollment: myId,
      last_message: 'Group created.',
      last_message_time: new Date().toISOString(),
      avatar_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&q=80',
    };

    const updated = [...channels, newChan];
    setChannels(updated);
    persist('channels', updated);
    setActiveChannelId(newChanId);

    logAudit('CHAT_GROUP_CREATED', `Created group '${newChan.name}' by ${myId}`);
    return newChanId;
  };

  // GitHub Real-Time Database Sync Engine
  const updateGitHubConfig = (patch: Partial<GitHubSyncConfig>) => {
    setGithubConfig((prev) => {
      const next = { ...prev, ...patch };
      persist('github', next);
      return next;
    });
  };

  const triggerGitHubSync = async () => {
    setGithubConfig((prev) => ({ ...prev, sync_status: 'syncing' }));

    const res = await syncDatabaseToGitHub(
      {
        users: usersList,
        events,
        societies,
        channels,
        messages,
        auditLogs,
      },
      {
        owner: githubConfig.owner,
        repo: githubConfig.repo,
        branch: githubConfig.branch,
        token: githubConfig.token,
      }
    );

    setGithubConfig((prev) => {
      const next: GitHubSyncConfig = {
        ...prev,
        sync_status: res.success ? 'synced' : 'error',
        last_synced: res.timestamp,
        last_commit_hash: res.commitHash || prev.last_commit_hash,
        total_commits: (prev.total_commits || 0) + (res.success ? 1 : 0),
      };
      persist('github', next);
      return next;
    });

    logAudit(
      'GITHUB_REALTIME_SYNC',
      `Synchronized BU H-11 campus database to GitHub [${githubConfig.owner}/${githubConfig.repo}]`
    );

    return res;
  };

  // Event Actions: Society Head posts upcoming events
  const addEvent = async (eventData: Omit<CampusEvent, 'id' | 'approved_by_hod' | 'attendee_count'>) => {
    const newId = `e-${Date.now()}`;
    const targetSociety = societies.find((s) => s.id === eventData.society_id);
    const isOwner = currentUser?.role === 'developer';

    const newEvent: CampusEvent = {
      ...eventData,
      id: newId,
      approved_by_hod: isOwner, // Requires Admin approval if posted by society head!
      attendee_count: 0,
      registered_students: [],
      society: targetSociety,
      created_by_enrollment: currentUser?.enrollment_id,
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    persist('events', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CREATE_EVENT', payload: { event: newEvent } }),
    }).catch(() => {});

    logAudit('EVENT_POSTED', `Upcoming event posted '${newEvent.title}' (Approved: ${isOwner})`);
    triggerGitHubSync().catch(console.error);
  };

  const updateEvent = async (eventId: string, patch: Partial<CampusEvent>) => {
    const updated = events.map((ev) => (ev.id === eventId ? { ...ev, ...patch } : ev));
    setEvents(updated);
    persist('events', updated);
    logAudit('EVENT_UPDATED', `Updated event ID ${eventId}`);
    triggerGitHubSync().catch(console.error);
  };

  const deleteEvent = async (eventId: string) => {
    const deleted = events.find((e) => e.id === eventId);
    const updated = events.filter((ev) => ev.id !== eventId);
    setEvents(updated);
    persist('events', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_EVENT', payload: { eventId } }),
    }).catch(() => {});

    logAudit('EVENT_DELETED', `Deleted event: ${deleted?.title || eventId}`, 'warning');
    triggerGitHubSync().catch(console.error);
  };

  const approveEvent = async (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    const updated = events.map((ev) =>
      ev.id === eventId ? { ...ev, approved_by_hod: true, rejection_reason: undefined } : ev
    );
    setEvents(updated);
    persist('events', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'APPROVE_EVENT', payload: { eventId } }),
    }).catch(() => {});

    logAudit('EVENT_APPROVED', `Admin approved campus post: ${target?.title || eventId}`);
    triggerGitHubSync().catch(console.error);
  };

  const rejectEvent = async (eventId: string, reason: string) => {
    const target = events.find((e) => e.id === eventId);
    const updated = events.map((ev) =>
      ev.id === eventId ? { ...ev, approved_by_hod: false, rejection_reason: reason } : ev
    );
    setEvents(updated);
    persist('events', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REJECT_EVENT', payload: { eventId, reason } }),
    }).catch(() => {});

    logAudit('EVENT_REJECTED', `Rejected '${target?.title}': ${reason}`, 'warning');
    triggerGitHubSync().catch(console.error);
  };

  // Student Event Registration (In-App 1-Click Registration)
  const registerForEvent = async (eventId: string) => {
    if (!currentUser) return { success: false, message: 'Please sign in first.' };

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found.' };

    const alreadyRegistered = targetEvent.registered_students?.some(
      (s) => s.enrollment_id === currentUser.enrollment_id
    );

    if (alreadyRegistered) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    const regEntry = {
      enrollment_id: currentUser.enrollment_id,
      full_name: currentUser.full_name,
      department: currentUser.department,
      semester: currentUser.semester,
      registered_at: new Date().toISOString(),
    };

    const updated = events.map((e) => {
      if (e.id === eventId) {
        const nextList = [...(e.registered_students || []), regEntry];
        return {
          ...e,
          registered_students: nextList,
          attendee_count: nextList.length,
        };
      }
      return e;
    });

    setEvents(updated);
    persist('events', updated);

    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REGISTER_FOR_EVENT', payload: { eventId, student: regEntry } }),
    }).catch(() => {});

    logAudit('STUDENT_EVENT_REGISTRATION', `[${currentUser.enrollment_id}] registered for '${targetEvent.title}'`);
    triggerGitHubSync().catch(console.error);
    return { success: true, message: `Successfully registered for ${targetEvent.title}!` };
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!currentUser) return;

    const updated = events.map((e) => {
      if (e.id === eventId) {
        const nextList = (e.registered_students || []).filter(
          (s) => s.enrollment_id !== currentUser.enrollment_id
        );
        return {
          ...e,
          registered_students: nextList,
          attendee_count: nextList.length,
        };
      }
      return e;
    });

    setEvents(updated);
    persist('events', updated);
    logAudit('STUDENT_EVENT_UNREGISTERED', `[${currentUser.enrollment_id}] cancelled registration for event ${eventId}`);
    triggerGitHubSync().catch(console.error);
  };

  const addAnnouncement = async (announcementData: Omit<FlashAnnouncement, 'id' | 'created_at' | 'active'>) => {
    const newAnnouncement: FlashAnnouncement = {
      ...announcementData,
      id: `a-${Date.now()}`,
      created_at: new Date().toISOString(),
      active: true,
    };
    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    persist('announcements', updated);
    logAudit('FLASH_ANNOUNCEMENT_BROADCAST', `Flash Announcement: ${newAnnouncement.message}`);
    triggerGitHubSync().catch(console.error);
  };

  const toggleBookmark = (eventId: string) => {
    let next: string[];
    if (bookmarkedIds.includes(eventId)) {
      next = bookmarkedIds.filter((id) => id !== eventId);
    } else {
      next = [...bookmarkedIds, eventId];
    }
    setBookmarkedIds(next);
    persist('bookmarks', next);
  };

  const purgeCache = () => {
    localStorage.clear();
    setEvents(INITIAL_EVENTS);
    setSocieties(INITIAL_SOCIETIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setUsersList(MOCK_USERS);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setChannels(INITIAL_CHANNELS);
    setMessages(INITIAL_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAudit('CACHE_PURGED', 'BU H-11 Database reset.', 'critical');
  };

  const enrichedEvents = events.map((ev) => ({
    ...ev,
    society: societies.find((s) => s.id === ev.society_id) || ev.society,
    is_bookmarked: bookmarkedIds.includes(ev.id),
  }));

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        activeRole: currentUser?.role || 'student',
        usersList,
        login,
        register,
        logout,
        unlockAdminPrivilege,
        verifyUser,
        promoteUserRole,
        deleteUser,
        events: enrichedEvents,
        societies,
        announcements,
        departments,
        auditLogs,
        createSociety,
        updateSociety,
        channels,
        messages,
        activeChannelId,
        setActiveChannelId,
        sendMessage,
        inviteToSocietyChannel,
        createChannel,
        githubConfig,
        updateGitHubConfig,
        triggerGitHubSync,
        addEvent,
        updateEvent,
        deleteEvent,
        approveEvent,
        rejectEvent,
        registerForEvent,
        unregisterFromEvent,
        rsvpEvent: (id: string) => {
          registerForEvent(id);
        },
        addAnnouncement,
        toggleBookmark,
        purgeCache,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
