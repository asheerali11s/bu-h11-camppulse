export type UserRole = 'developer' | 'hod' | 'society_admin' | 'student';

export interface UserProfile {
  id: string;
  enrollment_id: string; // e.g. "01-134221-042"
  email: string;
  full_name: string;
  department: string; // e.g. "Computer Science & Software Engineering"
  role: UserRole;
  society_id?: string | null;
  society_name?: string | null;
  avatar_url?: string;
  password?: string;
  created_at?: string;
}

export interface Society {
  id: string;
  name: string;
  code: string;
  description: string;
  logo_url: string;
  is_recruiting: boolean;
  department: string;
  lead_enrollment: string;
  lead_name: string;
  contact_email?: string;
  instagram_handle?: string;
  member_count?: number;
  created_at?: string;
}

export type EventCategory = 
  | 'Tech' 
  | 'Sports' 
  | 'Drama' 
  | 'Free Food' 
  | 'Workshops' 
  | 'Music' 
  | 'Academic';

export type CampusFloor = 'Ground' | '1st' | '2nd' | '3rd' | 'Outdoor';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location_name: string;
  floor: CampusFloor; // Ground, 1st (CS), 2nd (EE), 3rd (Research/Media), Outdoor
  lab_name?: string;  // e.g. "AI & Data Science Lab", "Sir Syed Auditorium"
  latitude: number;
  longitude: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  society_id: string;
  society?: Society;
  created_by_enrollment?: string;
  approved_by_hod: boolean;
  rejection_reason?: string;
  capacity?: number;
  attendee_count?: number;
  is_bookmarked?: boolean;
}

export interface FlashAnnouncement {
  id: string;
  message: string;
  category: 'urgent' | 'highlight' | 'reminder';
  society_name: string;
  created_at: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod_name?: string;
  venues: string[];
}

export interface SystemAuditLog {
  id: string;
  user_email: string;
  user_enrollment?: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export type ChannelType = 'general' | 'society' | 'direct';

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  society_id?: string;
  society_name?: string;
  is_private: boolean;
  member_enrollments: string[];
  created_by_enrollment: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  sender_name: string;
  sender_enrollment: string;
  sender_dept: string;
  sender_role: UserRole;
  content: string;
  created_at: string;
  is_system?: boolean;
}

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  token?: string;
  last_synced?: string;
  sync_status: 'idle' | 'syncing' | 'synced' | 'error';
  last_commit_hash?: string;
  total_commits?: number;
}
