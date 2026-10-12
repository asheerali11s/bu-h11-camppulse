import {
  CampusEvent,
  Society,
  FlashAnnouncement,
  Department,
  UserProfile,
  SystemAuditLog,
  ChatChannel,
  ChatMessage,
  CampusFloor,
} from '@/types';

// ==============================================================================
// BU (Bahria University H-11 CAMPUS) ISLAMABAD DIRECTORY & LAB ARCHITECTURE
// Location: Plot 83, Sector H-11/4, Islamabad (Lat: 33.6582, Lng: 73.0175)
// ==============================================================================

export const BU_H11_COORDINATES = {
  lat: 33.6582,
  lng: 73.0175,
  name: 'Bahria University H-11 Campus, Islamabad',
  address: 'Plot 83, Sector H-11/4, Islamabad, Pakistan',
};

// Multi-Floor and Lab Model for BU H-11 Campus
export interface H11FloorPlan {
  floor: CampusFloor;
  label: string;
  wings: string;
  facilities: { name: string; type: 'lab' | 'hall' | 'sports' | 'general'; capacity: number }[];
}

export const BU_H11_FLOORS: H11FloorPlan[] = [
  {
    floor: 'Ground',
    label: 'Ground Level & Central Quad',
    wings: 'Main Entrance, Administration & Auditoriums',
    facilities: [
      { name: 'Sir Syed Multi-Purpose Hall & Auditorium', type: 'hall', capacity: 550 },
      { name: 'Central Student Cafeteria & Courtyard', type: 'general', capacity: 300 },
      { name: 'Admissions & Student Affairs Directorate', type: 'general', capacity: 80 },
      { name: 'Central Sports Complex (Futsal & Basketball)', type: 'sports', capacity: 400 },
    ],
  },
  {
    floor: '1st',
    label: '1st Floor • Computing & Software Engineering',
    wings: 'CS & SE Departmental Labs & Lecture Theatres',
    facilities: [
      { name: 'High-Tech AI & Data Science Lab', type: 'lab', capacity: 60 },
      { name: 'Software Engineering Development Lab 1', type: 'lab', capacity: 50 },
      { name: 'General Purpose Computer Programming Lab 2', type: 'lab', capacity: 55 },
      { name: 'Final Year Project (FYP) Innovation Bay', type: 'lab', capacity: 40 },
      { name: 'CS Lecture Theatres (LT-101 to LT-105)', type: 'hall', capacity: 120 },
    ],
  },
  {
    floor: '2nd',
    label: '2nd Floor • Electrical Engineering & Robotics',
    wings: 'Hardware, Embedded Systems & Robotics',
    facilities: [
      { name: 'Prototyping & Combat Robotics Arena Lab', type: 'lab', capacity: 50 },
      { name: 'Embedded System Design & Microprocessor Lab', type: 'lab', capacity: 45 },
      { name: 'Analog & Digital Electronic Circuits Lab', type: 'lab', capacity: 40 },
      { name: 'EE Seminar Hall B', type: 'hall', capacity: 150 },
    ],
  },
  {
    floor: '3rd',
    label: '3rd Floor • Earth Sciences, Media & Executive',
    wings: 'Environmental Science Labs, Studios & Faculty Suites',
    facilities: [
      { name: 'Environmental Science Lab (XRD & Spectrophotometry)', type: 'lab', capacity: 40 },
      { name: 'Digital Media Production & Broadcast Studio', type: 'lab', capacity: 35 },
      { name: 'Department Chairpersons & Faculty Lounges', type: 'general', capacity: 30 },
      { name: 'Executive Conference Boardroom', type: 'hall', capacity: 60 },
    ],
  },
  {
    floor: 'Outdoor',
    label: 'Campus Outdoor Grounds & Facilities',
    wings: 'Plot 83 Exterior Spaces',
    facilities: [
      { name: 'Main Campus Football & Cricket Ground', type: 'sports', capacity: 800 },
      { name: 'Outdoor Amphitheater Stage', type: 'hall', capacity: 400 },
      { name: 'Girls Hostel Lawn & Recreational Court', type: 'general', capacity: 150 },
    ],
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cs-h11',
    name: 'Department of Computer Science & Software Engineering',
    code: 'CS & SE',
    hod_name: 'Department Head',
    venues: [
      'High-Tech AI & Data Science Lab (1st Floor)',
      'Software Engineering Lab 1 (1st Floor)',
      'General Purpose Computer Lab 2 (1st Floor)',
      'Sir Syed Multi-Purpose Auditorium (Ground Floor)',
    ],
  },
  {
    id: 'dept-ee-h11',
    name: 'Department of Electrical Engineering & Robotics',
    code: 'EE & Robotics',
    hod_name: 'Department Head',
    venues: [
      'Prototyping & Combat Robotics Arena (2nd Floor)',
      'Embedded System Design Lab (2nd Floor)',
      'Analog Electronics Lab (2nd Floor)',
      'EE Seminar Hall B (2nd Floor)',
    ],
  },
  {
    id: 'dept-ees-h11',
    name: 'Department of Earth & Environmental Sciences',
    code: 'E&ES',
    hod_name: 'Department Head',
    venues: [
      'Environmental Science Research Lab (3rd Floor)',
      'Sample Analysis & XRD Facility (3rd Floor)',
    ],
  },
  {
    id: 'dept-media-h11',
    name: 'Department of Media & Management Sciences',
    code: 'Media & BBS',
    hod_name: 'Department Head',
    venues: [
      'Digital Media Production Studio (3rd Floor)',
      'Outdoor Amphitheater (Ground Floor)',
      'Executive Conference Boardroom (3rd Floor)',
    ],
  },
];

// CLEAN SLATE: All pre-added placeholder users and dummy societies removed as requested!
export const MOCK_USERS: UserProfile[] = [];

export const INITIAL_SOCIETIES: Society[] = [];

export const INITIAL_EVENTS: CampusEvent[] = [];

export const INITIAL_ANNOUNCEMENTS: FlashAnnouncement[] = [
  {
    id: 'ann-h11-1',
    message: 'Welcome to BU (Bahria University H-11 Campus) Portal. Verified student registration is active.',
    category: 'highlight',
    society_name: 'H-11 Campus Administration',
    created_at: new Date().toISOString(),
    active: true,
  },
];

export const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: 'chan-h11-general',
    name: 'BU H-11 Campus Quad',
    type: 'general',
    description: 'Official H-11 Campus-wide discussion channel for all verified students & societies.',
    is_private: false,
    member_enrollments: [],
    created_by_enrollment: 'CAMPUS-ADMIN',
    avatar_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&q=80',
    last_message: 'Welcome to the Bahria University H-11 Campus verified network.',
    last_message_time: new Date().toISOString(),
    unread_count: 0,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-boot-h11',
    user_email: 'admin@bahria.edu.pk',
    user_enrollment: 'BU-H11-ADMIN',
    action: 'CAMPUS_INIT',
    details: 'BU (Bahria University H-11 Campus) online network initialized. Clean database slate active.',
    timestamp: new Date().toISOString(),
    severity: 'info',
  },
];
