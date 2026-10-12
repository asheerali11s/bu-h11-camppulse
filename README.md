# 📡 CampPulse - Campus Event & Society Hub

> **Empowering student life by unifying campus communications into a real-time visual feed and interactive radar.**

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Leaflet OpenStreetMap**, **Supabase PostgreSQL**, and **Row-Level Security (RLS)**.

---

## 🌟 Key Highlights & Product Features

### 1. 🎓 Normal Mode (Public / All Students)
- **Interactive Campus Radar (Leaflet/OSM):** Dynamically loaded on the client side with custom pulsing markers color-coded by event category, venue locations, and rich event details.
- **Dual View Interface:** Seamless 1-click toggle between **Dual View** (Map + Chronological Grid), **Full Map**, and **Grid Feed**.
- **Live "Happening Now" Filter:** Real-time filter highlighting events starting in the next 2 hours or currently active on campus.
- **Multi-Category Filters:** Tech, Sports, Drama, Free Food, Workshops, Music, and Academic.
- **One-Click .ics Calendar Export:** RFC 5545-compliant `.ics` calendar generator compatible with Google Calendar, Apple Calendar, and Outlook.
- **Society Profiles Viewer Modal:** Deep-dive modal showing society bio, logo, executive contact details, and **"Recruiting!"** badge.
- **Campus Flash Ticker:** Live real-time marquee broadcasting urgent campus announcements (e.g., free food giveaways, venue changes).

### 2. 🎪 Society Admin Mode (Society Heads & Team Execs)
- **Protected Dashboard (`/dashboard/society`):** Dedicated workspace restricted to society executives.
- **Event Creator Modal:** Form with title, category, description, venue presets, coordinate selector, start/end date-time, and capacity limits.
- **HOD Venue Tracking:** Live tracking of event review status (**Pending HOD Review**, **Approved & Live**, or **Feedback / Action Required**).
- **Society Profile Manager:** Edit society bio, logo URL, and toggle the live **"Recruiting!"** status badge.
- **Flash Announcement Broadcaster:** Trigger instant campus-wide announcements displayed in the header marquee.

### 3. 🏛️ Department (HOD) Mode (Department Heads)
- **HOD Clearance Queue (`/dashboard/dept`):** Review and approve/reject event requests assigned to department auditoriums, labs, and lawns.
- **Venue Clash Detection Engine:** Automatic detection of conflicting bookings for the same hall at overlapping times with visual warning alerts.
- **Approval Workflow:** 1-click approval with celebratory confetti, or rejection modal requiring structured feedback for rescheduling.
- **Department Venue Utilization:** Real-time occupancy monitor across Sir Syed Auditorium, CS Lab 1, Seminar Hall B, Robotics Arena, etc.

### 4. ⚡ Developer Mode (Super Admin / Platform Owner)
- **Dark Neon Cyber Console (`/dashboard/dev`):** High-tech telemetry control room.
- **User Management & RBAC Promotion:** Promote or reassign user roles across `developer`, `hod`, `society_admin`, and `student` with instantaneous reactive updates.
- **Real-Time Role Simulator:** Header widget allowing developers and reviewers to test any of the 4 modes with 1 click.
- **System Audit Log Viewer:** Real-time security audit trails tracking system boots, event approvals, role promotions, and cache purges.
- **Database Cache Override:** Instant cache reset tool to reload factory seed baselines.

---

## 🗄️ Database Architecture & Schema (Supabase PostgreSQL)

The full database schema with Row Level Security (RLS) and initial seed data is located in [`supabase/schema.sql`](./supabase/schema.sql).

### Tables & Enums:
1. `user_role_enum`: `('developer', 'hod', 'society_admin', 'student')`
2. `profiles`: `id` (FK to `auth.users`), `email`, `full_name`, `role`, `department_id`, `society_id`, `avatar_url`, timestamps.
3. `departments`: `id`, `name`, `code`, `hod_name`, `venues: text[]`, timestamps.
4. `societies`: `id`, `name`, `description`, `logo_url`, `is_recruiting: boolean`, `department_id`, `contact_email`, `instagram_handle`, `member_count`.
5. `events`: `id`, `title`, `description`, `category`, `location_name`, `latitude`, `longitude`, `start_time`, `end_time`, `society_id`, `approved_by_hod: boolean`, `rejection_reason: text`, `capacity`, `attendee_count`.
6. `flash_announcements`: `id`, `message`, `category`, `society_id`, `society_name`, `active: boolean`, timestamps.
7. `system_audit_logs`: `id`, `user_email`, `action`, `details`, `severity`, timestamps.

### Row Level Security (RLS) Policies:
- **Profiles:** Anyone can read public profiles; only users with role `'developer'` can promote or reassign user roles.
- **Societies:** Publicly readable; only `'society_admin'` (for their society) or `'developer'` can update profiles.
- **Events:** Anyone can read approved events (`approved_by_hod = true`). Only `'society_admin'` or `'developer'` can create events. Only `'hod'` or `'developer'` can approve venue allocations.
- **Flash Announcements:** Publicly viewable when active; only `'society_admin'` and `'developer'` can post.

---

## 📁 Project Directory Structure

```text
BAHRIAEVENTS/
├── app/
│   ├── dashboard/
│   │   ├── dept/
│   │   │   └── page.tsx         # 🏛️ HOD Venue Clearance Queue & Clash Engine
│   │   ├── dev/
│   │   │   └── page.tsx         # ⚡ Developer Console & Role Promotion
│   │   └── society/
│   │       └── page.tsx         # 🎪 Society Exec Event Creator & Recruitment Hub
│   ├── globals.css              # Tailwind directives & Leaflet styling
│   ├── layout.tsx               # Root AppProvider, Navbar & Footer
│   └── page.tsx                 # 🧭 Home Page (Dual Map & Grid Feed, Happening Now)
├── components/
│   ├── CampusMap.tsx            # 🗺️ Client-side dynamic Leaflet map with pulsing pins
│   ├── EventCard.tsx            # 🎫 Event Card with .ics download & RSVP
│   ├── Navbar.tsx               # 🧭 Dynamic RBAC navigation & Mode Simulator
│   └── SocietyModal.tsx         # ℹ️ Society Profile Viewer with "Recruiting!" badge
├── context/
│   └── AppContext.tsx           # 🔄 State management, Supabase/Local sync, Audit logs
├── hooks/
│   └── useUserRole.ts           # 🛡️ React hook fetching user profile & active role
├── supabase/
│   └── schema.sql               # 🗄️ Full PostgreSQL DDL, RLS policies & seed data
├── types/
│   └── index.ts                 # 🏷️ Strongly typed TypeScript interfaces
├── utils/
│   ├── calendar.ts              # 📅 RFC 5545 .ics generator for calendar sync
│   ├── mockData.ts              # 🧪 Seed data for instant preview & testing
│   └── supabase.ts              # ⚡ Supabase client initialization & fallback
├── .env.local.example           # Supabase environment variables template
├── package.json                 # Dependencies & scripts
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **npm** or **pnpm**

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Interactive RBAC Mode Switcher
In the top-right corner of the navigation bar, click the **Role Simulator** pill (e.g. `🎓 Student (Normal)`). You can switch between:
1. `🎓 Student (Normal)` - Explore map, grid feed, and export calendar events.
2. `🎪 Society Admin` - Access `/dashboard/society` to create events and post announcements.
3. `🏛️ Department HOD` - Access `/dashboard/dept` to review pending venue requests with clash detection.
4. `⚡ Developer (Super Admin)` - Access `/dashboard/dev` to promote user roles and audit logs.

### 5. Connecting a Live Supabase Backend (Optional)
To connect your own hosted Supabase PostgreSQL project:
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to **SQL Editor**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
3. Copy your project's URL and Anon Key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Restart the server (`npm run dev`).
