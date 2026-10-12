-- ==============================================================================
-- CampPulse (Campus Event & Society Hub) - PostgreSQL & Supabase Database Schema
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEFINE ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('developer', 'hod', 'society_admin', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE channel_type_enum AS ENUM ('general', 'society', 'direct');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  hod_name TEXT,
  venues TEXT[] DEFAULT ARRAY['Sir Syed Auditorium', 'CS Lab 1', 'Seminar Hall B', 'Amphitheater'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SOCIETIES TABLE
CREATE TABLE IF NOT EXISTS public.societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_recruiting BOOLEAN DEFAULT TRUE,
  department TEXT NOT NULL,
  lead_enrollment TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  contact_email TEXT,
  instagram_handle TEXT,
  member_count INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES TABLE (Verified with Enrollment ID)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'student',
  society_id UUID REFERENCES public.societies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTS TABLE (Clean Slate - Created by Societies, Approved by HOD)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tech', 'Sports', 'Drama', 'Free Food', 'Workshops', 'Music', 'Academic')),
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  created_by_enrollment TEXT,
  approved_by_hod BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  capacity INT DEFAULT 100,
  attendee_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WHATSAPP-STYLE CHAT CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type channel_type_enum NOT NULL DEFAULT 'society',
  description TEXT,
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT TRUE,
  member_enrollments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by_enrollment TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_enrollment TEXT NOT NULL,
  sender_dept TEXT NOT NULL,
  sender_role user_role_enum NOT NULL DEFAULT 'student',
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FLASH ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.flash_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  category TEXT DEFAULT 'urgent',
  society_name TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GITHUB REAL-TIME DATABASE SYNC LOGS
CREATE TABLE IF NOT EXISTS public.github_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  commit_hash TEXT,
  status TEXT NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SYSTEM AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  user_enrollment TEXT,
  action TEXT NOT NULL,
  details TEXT,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role_enum AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Anyone can view; only Developers can update roles
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Developers can update user roles" ON public.profiles FOR UPDATE
  USING (public.current_user_role() = 'developer')
  WITH CHECK (public.current_user_role() = 'developer');

-- Societies: Anyone can view; Society Admins can edit their own society
CREATE POLICY "Societies viewable by all" ON public.societies FOR SELECT USING (true);
CREATE POLICY "Society admins update own society" ON public.societies FOR UPDATE
  USING (
    public.current_user_role() = 'developer'
    OR (public.current_user_role() = 'society_admin' AND id = (SELECT society_id FROM public.profiles WHERE id = auth.uid()))
  );

-- Events: Anyone can view approved events
CREATE POLICY "Approved events readable by public" ON public.events FOR SELECT
  USING (
    approved_by_hod = true
    OR public.current_user_role() IN ('developer', 'hod')
    OR (public.current_user_role() = 'society_admin' AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Society admins insert events" ON public.events FOR INSERT
  WITH CHECK (public.current_user_role() IN ('society_admin', 'developer'));

CREATE POLICY "HODs and Society admins update events" ON public.events FOR UPDATE
  USING (
    public.current_user_role() IN ('developer', 'hod')
    OR (public.current_user_role() = 'society_admin' AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid()))
  );

-- Chat Channels & Messages: Users can only view channels they are invited to or public general channel
CREATE POLICY "Channels readable by members" ON public.chat_channels FOR SELECT
  USING (
    is_private = false
    OR (SELECT enrollment_id FROM public.profiles WHERE id = auth.uid()) = ANY(member_enrollments)
    OR public.current_user_role() = 'developer'
  );

CREATE POLICY "Messages readable by channel members" ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channels c
      WHERE c.id = chat_messages.channel_id
      AND (
        c.is_private = false
        OR (SELECT enrollment_id FROM public.profiles WHERE id = auth.uid()) = ANY(c.member_enrollments)
        OR public.current_user_role() = 'developer'
      )
    )
  );

CREATE POLICY "Members can post messages" ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
