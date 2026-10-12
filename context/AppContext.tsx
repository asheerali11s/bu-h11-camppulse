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
} from '@/types';
import {
  INITIAL_EVENTS,
  INITIAL_SOCIETIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DEPARTMENTS,
  MOCK_USERS,
  INITIAL_AUDIT_LOGS,
} from '@/utils/mockData';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';

interface AppContextType {
  // Current user & role
  currentUser: UserProfile;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  usersList: UserProfile[];
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;

  // Data
  events: CampusEvent[];
  societies: Society[];
  announcements: FlashAnnouncement[];
  departments: Department[];
  auditLogs: SystemAuditLog[];

  // Actions
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
  isLiveSupabase: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'camppulse_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [usersList, setUsersList] = useState<UserProfile[]>(MOCK_USERS);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [societies, setSocieties] = useState<Society[]>(INITIAL_SOCIETIES);
  const [announcements, setAnnouncements] = useState<FlashAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isLiveSupabase = isSupabaseConfigured();

  // Load persistent state from localStorage or Supabase on mount
  useEffect(() => {
    try {
      const savedUserRole = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_role`) as UserRole;
      if (savedUserRole) {
        const found = MOCK_USERS.find((u) => u.role === savedUserRole);
        if (found) setCurrentUser(found);
      }

      const savedEvents = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_events`);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }

      const savedSocieties = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_societies`);
      if (savedSocieties) {
        setSocieties(JSON.parse(savedSocieties));
      }

      const savedAnnouncements = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_announcements`);
      if (savedAnnouncements) {
        setAnnouncements(JSON.parse(savedAnnouncements));
      }

      const savedUsers = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_users`);
      if (savedUsers) {
        setUsersList(JSON.parse(savedUsers));
      }

      const savedLogs = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_logs`);
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      }

      const savedBookmarks = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}_bookmarks`);
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }
    } catch (e) {
      console.warn('Failed to parse cached localStorage state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state changes to localStorage
  const persistState = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  };

  const logAction = (action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_email: currentUser.email,
      action,
      details,
      timestamp: new Date().toISOString(),
      severity,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      persistState('logs', updated);
      return updated;
    });
  };

  // Switch role simulation (instantly toggles perspective between Student, Society, HOD, and Dev)
  const switchRole = (newRole: UserRole) => {
    const matched = usersList.find((u) => u.role === newRole) || {
      id: `u-${newRole}-${Date.now()}`,
      email: `${newRole}@campus.edu`,
      full_name: `${newRole.toUpperCase()} User`,
      role: newRole,
    };
    setCurrentUser(matched);
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}_role`, newRole);
    logAction('ROLE_SIMULATOR_SWITCH', `Switched active preview role to [${newRole.toUpperCase()}]`);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setUsersList(updated);
    persistState('users', updated);

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }

    logAction('USER_ROLE_PROMOTED', `Updated user ID ${userId} role to '${newRole}'`, 'warning');
  };

  const addEvent = async (eventData: Omit<CampusEvent, 'id' | 'approved_by_hod' | 'attendee_count'>) => {
    const newId = `e-${Date.now()}`;
    const targetSociety = societies.find((s) => s.id === eventData.society_id);

    const newEvent: CampusEvent = {
      ...eventData,
      id: newId,
      approved_by_hod: false, // Always requires HOD approval first!
      attendee_count: 0,
      society: targetSociety,
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    persistState('events', updated);
    logAction('EVENT_CREATED', `Society submitted new event '${newEvent.title}' for venue ${newEvent.location_name}`);

    // If live Supabase is connected, attempt sync
    if (isLiveSupabase) {
      try {
        await supabase.from('events').insert({
          id: newId,
          title: eventData.title,
          description: eventData.description,
          category: eventData.category,
          location_name: eventData.location_name,
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          society_id: eventData.society_id,
          approved_by_hod: false,
          capacity: eventData.capacity || 100,
        });
      } catch (err) {
        console.error('Supabase event insert error:', err);
      }
    }
  };

  const updateEvent = async (eventId: string, patch: Partial<CampusEvent>) => {
    const updated = events.map((ev) => (ev.id === eventId ? { ...ev, ...patch } : ev));
    setEvents(updated);
    persistState('events', updated);
    logAction('EVENT_UPDATED', `Updated event ID ${eventId}`);
  };

  const deleteEvent = async (eventId: string) => {
    const deleted = events.find((e) => e.id === eventId);
    const updated = events.filter((ev) => ev.id !== eventId);
    setEvents(updated);
    persistState('events', updated);
    logAction('EVENT_DELETED', `Deleted event: ${deleted?.title || eventId}`, 'warning');
  };

  const approveEvent = async (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    const updated = events.map((ev) =>
      ev.id === eventId ? { ...ev, approved_by_hod: true, rejection_reason: undefined } : ev
    );
    setEvents(updated);
    persistState('events', updated);
    logAction('EVENT_APPROVED', `HOD approved venue allocation for: ${target?.title || eventId}`);
  };

  const rejectEvent = async (eventId: string, reason: string) => {
    const target = events.find((e) => e.id === eventId);
    const updated = events.map((ev) =>
      ev.id === eventId ? { ...ev, approved_by_hod: false, rejection_reason: reason } : ev
    );
    setEvents(updated);
    persistState('events', updated);
    logAction('EVENT_REJECTED', `HOD rejected '${target?.title}': ${reason}`, 'warning');
  };

  const updateSociety = async (societyId: string, patch: Partial<Society>) => {
    const updated = societies.map((soc) => (soc.id === societyId ? { ...soc, ...patch } : soc));
    setSocieties(updated);
    persistState('societies', updated);
    logAction('SOCIETY_PROFILE_UPDATED', `Updated society ${societyId} profile/recruitment status`);
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
    persistState('announcements', updated);
    logAction('FLASH_ANNOUNCEMENT_BROADCAST', `Flash Announcement: ${newAnnouncement.message}`);
  };

  const toggleBookmark = (eventId: string) => {
    let next: string[];
    if (bookmarkedIds.includes(eventId)) {
      next = bookmarkedIds.filter((id) => id !== eventId);
    } else {
      next = [...bookmarkedIds, eventId];
    }
    setBookmarkedIds(next);
    persistState('bookmarks', next);
  };

  const rsvpEvent = (eventId: string) => {
    const updated = events.map((e) => {
      if (e.id === eventId) {
        return { ...e, attendee_count: (e.attendee_count || 0) + 1 };
      }
      return e;
    });
    setEvents(updated);
    persistState('events', updated);
    logAction('STUDENT_RSVP', `Student RSVPed to event ID ${eventId}`);
  };

  const purgeCache = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}_events`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}_societies`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}_announcements`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}_users`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}_logs`);
    setEvents(INITIAL_EVENTS);
    setSocieties(INITIAL_SOCIETIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setUsersList(MOCK_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAction('CACHE_PURGED', 'System cache purged and reloaded from factory seed baseline', 'critical');
  };

  // Merge society relationship into events
  const enrichedEvents = events.map((ev) => ({
    ...ev,
    society: societies.find((s) => s.id === ev.society_id) || ev.society,
    is_bookmarked: bookmarkedIds.includes(ev.id),
  }));

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole: currentUser.role,
        switchRole,
        usersList,
        updateUserRole,
        events: enrichedEvents,
        societies,
        announcements,
        departments,
        auditLogs,
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
        isLiveSupabase,
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
