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

interface AppContextType {
  // Current user & Auth
  currentUser: UserProfile;
  isAuthenticated: boolean;
  activeRole: UserRole;
  usersList: UserProfile[];
  login: (enrollmentIdOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    enrollment_id: string;
    full_name: string;
    email: string;
    department: string;
    role: UserRole;
    society_id?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;

  // Data
  events: CampusEvent[];
  societies: Society[];
  announcements: FlashAnnouncement[];
  departments: Department[];
  auditLogs: SystemAuditLog[];

  // WhatsApp-Style Chat Engine
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  sendMessage: (channelId: string, content: string) => Promise<void>;
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

  // Real-Time GitHub Database Sync Engine
  githubConfig: GitHubSyncConfig;
  updateGitHubConfig: (config: Partial<GitHubSyncConfig>) => void;
  triggerGitHubSync: () => Promise<{ success: boolean; message: string }>;

  // Event & Society Actions
  addEvent: (eventData: Omit<CampusEvent, 'id' | 'approved_by_hod' | 'attendee_count'>) => Promise<void>;
  updateEvent: (eventId: string, patch: Partial<CampusEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  approveEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string, reason: string) => Promise<void>;
  updateSociety: (societyId: string, patch: Partial<Society>) => Promise<void>;
  addAnnouncement: (announcement: Omit<FlashAnnouncement, 'id' | 'created_at' | 'active'>) => Promise<void>;
  toggleBookmark: (eventId: string) => void;
  rsvpEvent: (eventId: string) => void;
  purgeCache: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'camppulse_v2_store';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [usersList, setUsersList] = useState<UserProfile[]>(MOCK_USERS);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [societies, setSocieties] = useState<Society[]>(INITIAL_SOCIETIES);
  const [announcements, setAnnouncements] = useState<FlashAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Chat Engine State
  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState<string>(INITIAL_CHANNELS[0].id);

  // GitHub Real-Time Database Sync State
  const [githubConfig, setGithubConfig] = useState<GitHubSyncConfig>({
    owner: 'bahria-campus',
    repo: 'camppulse-database',
    branch: 'main',
    sync_status: 'idle',
    total_commits: 4,
  });

  // Load persistent state from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_user`);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      const savedUsersList = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_users_list`);
      if (savedUsersList) {
        setUsersList(JSON.parse(savedUsersList));
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
      }

      const savedMessages = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_messages`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }

      const savedLogs = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_logs`);
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      }

      const savedGitConfig = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_github`);
      if (savedGitConfig) {
        setGithubConfig(JSON.parse(savedGitConfig));
      }
    } catch (e) {
      console.warn('LocalStorage hydrate notice:', e);
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
      user_email: currentUser.email,
      user_enrollment: currentUser.enrollment_id,
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
  const login = async (enrollmentIdOrEmail: string, _password?: string) => {
    const q = enrollmentIdOrEmail.trim().toLowerCase();
    const found = usersList.find(
      (u) =>
        u.enrollment_id.toLowerCase() === q ||
        u.email.toLowerCase() === q ||
        u.enrollment_id.replace(/-/g, '').toLowerCase() === q.replace(/-/g, '')
    );

    if (!found) {
      return {
        success: false,
        message: 'No verified student or executive record found with this Enrollment ID.',
      };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    persist('user', found);
    logAudit('USER_LOGIN', `User ${found.full_name} (${found.enrollment_id}) signed in.`);
    return { success: true };
  };

  // Auth: Register
  const register = async (userData: {
    enrollment_id: string;
    full_name: string;
    email: string;
    department: string;
    role: UserRole;
    society_id?: string;
  }) => {
    // Validate enrollment format (e.g. 01-134221-042)
    const cleanEnrollment = userData.enrollment_id.trim();
    const existing = usersList.find(
      (u) => u.enrollment_id.toLowerCase() === cleanEnrollment.toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        message: `Enrollment ID '${cleanEnrollment}' is already registered on CampPulse. Please log in instead.`,
      };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      enrollment_id: cleanEnrollment,
      full_name: userData.full_name.trim(),
      email: userData.email.trim(),
      department: userData.department,
      role: userData.role,
      society_id: userData.society_id || null,
      avatar_url: `https://images.unsplash.com/photo-${1535713875002 + (usersList.length % 5)}?w=100&q=80`,
      created_at: new Date().toISOString(),
    };

    const updatedUsers = [...usersList, newUser];
    setUsersList(updatedUsers);
    persist('users_list', updatedUsers);

    // Also auto-add new student to the Campus Quad general channel
    setChannels((prev) => {
      const quad = prev.find((c) => c.id === 'chan-general');
      if (quad && !quad.member_enrollments.includes(newUser.enrollment_id)) {
        const modQuad = {
          ...quad,
          member_enrollments: [...quad.member_enrollments, newUser.enrollment_id],
        };
        const res = prev.map((c) => (c.id === 'chan-general' ? modQuad : c));
        persist('channels', res);
        return res;
      }
      return prev;
    });

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    persist('user', newUser);
    logAudit('USER_REGISTERED', `New verified enrollment created: ${newUser.enrollment_id} (${newUser.department})`);

    return { success: true };
  };

  const logout = () => {
    logAudit('USER_LOGOUT', `User ${currentUser.enrollment_id} signed out.`);
    setIsAuthenticated(false);
  };

  const switchRole = (newRole: UserRole) => {
    const matched = usersList.find((u) => u.role === newRole) || {
      ...currentUser,
      role: newRole,
    };
    setCurrentUser(matched);
    persist('user', matched);
    logAudit('ROLE_SIMULATOR_SWITCH', `Switched active mode to [${newRole.toUpperCase()}]`);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsersList(updated);
    persist('users_list', updated);

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
      persist('user', { ...currentUser, role: newRole });
    }

    logAudit('ROLE_PROMOTION', `Elevated user ID ${userId} to role '${newRole}'`, 'warning');
  };

  // WhatsApp-Style Chat: Send Message
  const sendMessage = async (channelId: string, content: string) => {
    if (!content.trim()) return;

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

    // Update channel snippet
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

    logAudit('CHAT_MESSAGE_SENT', `[${currentUser.enrollment_id}] sent message in channel ${channelId}`);
  };

  // WhatsApp-Style Chat: Invite student to society room by Enrollment ID
  const inviteToSocietyChannel = async (channelId: string, targetEnrollmentId: string) => {
    const cleanId = targetEnrollmentId.trim();
    const targetUser = usersList.find(
      (u) => u.enrollment_id.toLowerCase() === cleanId.toLowerCase()
    );

    if (!targetUser) {
      return {
        success: false,
        message: `Student with Enrollment ID '${cleanId}' was not found in the verified campus registry.`,
      };
    }

    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return { success: false, message: 'Channel not found.' };

    if (channel.member_enrollments.includes(targetUser.enrollment_id)) {
      return {
        success: false,
        message: `${targetUser.full_name} (${targetUser.enrollment_id}) is already a member of this chat.`,
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

    // Add a system welcome message inside the chat
    const sysMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      channel_id: channelId,
      sender_id: 'sys',
      sender_name: 'CampPulse Concierge',
      sender_enrollment: 'SYSTEM',
      sender_dept: 'Administration',
      sender_role: 'developer',
      content: `${targetUser.full_name} (${targetUser.enrollment_id} • ${targetUser.department}) was invited by ${currentUser.full_name}.`,
      created_at: new Date().toISOString(),
      is_system: true,
    };
    const updatedMessages = [...messages, sysMsg];
    setMessages(updatedMessages);
    persist('messages', updatedMessages);

    logAudit(
      'SOCIETY_CHAT_INVITE',
      `${currentUser.enrollment_id} invited ${targetUser.enrollment_id} to '${channel.name}'`
    );

    return {
      success: true,
      message: `Successfully invited ${targetUser.full_name} (${targetUser.enrollment_id})!`,
    };
  };

  // Create Channel
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
    const members = Array.from(
      new Set([currentUser.enrollment_id, ...(data.initial_members || [])])
    );

    const newChan: ChatChannel = {
      id: newChanId,
      name: data.name,
      type: data.type,
      description: data.description || '',
      society_id: data.society_id,
      society_name: data.society_name,
      is_private: data.is_private,
      member_enrollments: members,
      created_by_enrollment: currentUser.enrollment_id,
      last_message: 'Group created.',
      last_message_time: new Date().toISOString(),
      avatar_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&q=80',
    };

    const updated = [...channels, newChan];
    setChannels(updated);
    persist('channels', updated);
    setActiveChannelId(newChanId);

    logAudit('CHAT_GROUP_CREATED', `Created new group '${newChan.name}' by ${currentUser.enrollment_id}`);
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
      `Synchronized live campus state to GitHub repo [${githubConfig.owner}/${githubConfig.repo}] (${res.commitHash || 'SNAPSHOT'})`
    );

    return res;
  };

  // Event Management Actions
  const addEvent = async (eventData: Omit<CampusEvent, 'id' | 'approved_by_hod' | 'attendee_count'>) => {
    const newId = `e-${Date.now()}`;
    const targetSociety = societies.find((s) => s.id === eventData.society_id);

    const newEvent: CampusEvent = {
      ...eventData,
      id: newId,
      approved_by_hod: false,
      attendee_count: 0,
      society: targetSociety,
      created_by_enrollment: currentUser.enrollment_id,
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    persist('events', updated);
    logAudit('EVENT_CREATED', `Society submitted new event '${newEvent.title}' for venue ${newEvent.location_name}`);

    // Auto trigger GitHub sync in background
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
    logAudit('EVENT_APPROVED', `HOD approved venue allocation for: ${target?.title || eventId}`);
    triggerGitHubSync().catch(console.error);
  };

  const rejectEvent = async (eventId: string, reason: string) => {
    const target = events.find((e) => e.id === eventId);
    const updated = events.map((ev) =>
      ev.id === eventId ? { ...ev, approved_by_hod: false, rejection_reason: reason } : ev
    );
    setEvents(updated);
    persist('events', updated);
    logAudit('EVENT_REJECTED', `HOD rejected '${target?.title}': ${reason}`, 'warning');
    triggerGitHubSync().catch(console.error);
  };

  const updateSociety = async (societyId: string, patch: Partial<Society>) => {
    const updated = societies.map((soc) => (soc.id === societyId ? { ...soc, ...patch } : soc));
    setSocieties(updated);
    persist('societies', updated);
    logAudit('SOCIETY_PROFILE_UPDATED', `Updated society ${societyId} profile/recruitment status`);
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

  const rsvpEvent = (eventId: string) => {
    const updated = events.map((e) => {
      if (e.id === eventId) {
        return { ...e, attendee_count: (e.attendee_count || 0) + 1 };
      }
      return e;
    });
    setEvents(updated);
    persist('events', updated);
    logAudit('STUDENT_RSVP', `[${currentUser.enrollment_id}] RSVPed to event ID ${eventId}`);
    triggerGitHubSync().catch(console.error);
  };

  const purgeCache = () => {
    localStorage.clear();
    setEvents(INITIAL_EVENTS);
    setSocieties(INITIAL_SOCIETIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setUsersList(MOCK_USERS);
    setCurrentUser(MOCK_USERS[0]);
    setChannels(INITIAL_CHANNELS);
    setMessages(INITIAL_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAudit('CACHE_PURGED', 'Database state reset to clean baseline (zero filler events)', 'critical');
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
        activeRole: currentUser.role,
        usersList,
        login,
        register,
        logout,
        switchRole,
        updateUserRole,
        events: enrichedEvents,
        societies,
        announcements,
        departments,
        auditLogs,
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
        updateSociety,
        addAnnouncement,
        toggleBookmark,
        rsvpEvent,
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
