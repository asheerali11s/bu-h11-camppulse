import {
  CampusEvent,
  Society,
  FlashAnnouncement,
  Department,
  UserProfile,
  SystemAuditLog,
  ChatChannel,
  ChatMessage,
  AcademicDepartment,
} from '@/types';

// ==============================================================================
// BU (Bahria University H-11 CAMPUS) ISLAMABAD DIRECTORY
// ==============================================================================

export const BU_H11_INFO = {
  name: 'Bahria University H-11 Campus, Islamabad',
  address: 'Plot 83, Sector H-11/4, Islamabad, Pakistan',
};

export const BU_H11_COORDINATES = {
  lat: 33.6582,
  lng: 73.0175,
  name: 'Bahria University H-11 Campus, Islamabad',
  address: 'Plot 83, Sector H-11/4, Islamabad, Pakistan',
};

export const ACADEMIC_DEPARTMENTS: AcademicDepartment[] = [
  'Psychology',
  'Software Engineering',
  'Electrical Engineering',
  'Computer Science',
  'Artificial Intelligence',
];

export const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-se',
    name: 'Software Engineering',
    code: 'SE',
    venues: ['Software Engineering Hall', 'Computing Hub'],
  },
  {
    id: 'dept-cs',
    name: 'Computer Science',
    code: 'CS',
    venues: ['Sir Syed Auditorium', 'CS Seminar Hall'],
  },
  {
    id: 'dept-ai',
    name: 'Artificial Intelligence',
    code: 'AI',
    venues: ['AI Auditorium', 'Innovation Center'],
  },
  {
    id: 'dept-ee',
    name: 'Electrical Engineering',
    code: 'EE',
    venues: ['EE Seminar Hall', 'Robotics Arena'],
  },
  {
    id: 'dept-psych',
    name: 'Psychology',
    code: 'PSYCH',
    venues: ['Faculty Seminar Room', 'Human Behavior Lab'],
  },
];

// Clean Slate: Platform Owner / Master Developer account for Asheer
export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-admin-asheer',
    enrollment_id: '01-134221-001',
    full_name: 'Asheer Ali',
    email: 'asheer@bahria.edu.pk',
    department: 'Software Engineering',
    semester: '6th Semester',
    role: 'developer',
    is_verified: true,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SOCIETIES: Society[] = [];

export const INITIAL_EVENTS: CampusEvent[] = [];

export const INITIAL_ANNOUNCEMENTS: FlashAnnouncement[] = [
  {
    id: 'ann-h11-1',
    message: 'Welcome to BU (Bahria University H-11 CAMPUS) Event & Society Hub. Official platform active.',
    category: 'highlight',
    society_name: 'Platform Administration',
    created_at: new Date().toISOString(),
    active: true,
  },
];

// INITIALLY EXACTLY 1 CHAT: "APP Updates" (Only Admin/Developer can post!)
export const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: 'chan-app-updates',
    name: 'APP Updates',
    type: 'general',
    description: 'Official platform notifications and campus broadcasts. Only the Platform Administrator can post messages here.',
    is_private: false,
    is_announcements_only: true, // Restricted: only Developer/Admin can send
    member_enrollments: ['01-134221-001'],
    created_by_enrollment: '01-134221-001',
    avatar_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&q=80',
    last_message: 'Welcome to BU (Bahria University H-11 CAMPUS) Hub. System operational.',
    last_message_time: new Date().toISOString(),
    unread_count: 0,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    channel_id: 'chan-app-updates',
    sender_id: 'usr-admin-asheer',
    sender_name: 'Platform Administrator (Asheer Ali)',
    sender_enrollment: '01-134221-001',
    sender_dept: 'Software Engineering',
    sender_role: 'developer',
    content: '📢 Welcome to the official BU (Bahria University H-11 CAMPUS) Hub! All official event announcements and platform notices will be broadcast through this verified channel.',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-boot-h11',
    user_email: 'asheer@bahria.edu.pk',
    user_enrollment: '01-134221-001',
    action: 'PLATFORM_INIT',
    details: 'BU (Bahria University H-11 CAMPUS) online network initialized with strictly verified student onboarding and Admin control.',
    timestamp: new Date().toISOString(),
    severity: 'info',
  },
];
