export type UserRole = 'developer' | 'hod' | 'society_admin' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  society_id?: string | null;
  avatar_url?: string;
  created_at?: string;
}

export interface Society {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  is_recruiting: boolean;
  department_id?: string | null;
  contact_email?: string;
  instagram_handle?: string;
  member_count?: number;
  category?: string;
}

export type EventCategory = 
  | 'Tech' 
  | 'Sports' 
  | 'Drama' 
  | 'Free Food' 
  | 'Workshops' 
  | 'Music' 
  | 'Academic';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location_name: string;
  latitude: number;
  longitude: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  society_id: string;
  society?: Society;
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
  hod_name: string;
  venues: string[];
}

export interface SystemAuditLog {
  id: string;
  user_email: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}
