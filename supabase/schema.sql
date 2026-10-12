-- ==============================================================================
-- CampPulse (Campus Event & Society Hub) - PostgreSQL & Supabase Database Schema
-- ==============================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define User Roles
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('developer', 'hod', 'society_admin', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  hod_name TEXT,
  venues TEXT[] DEFAULT ARRAY['Auditorium', 'Conference Room', 'Department Lab'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SOCIETIES TABLE
CREATE TABLE IF NOT EXISTS public.societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_recruiting BOOLEAN DEFAULT FALSE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  contact_email TEXT,
  instagram_handle TEXT,
  member_count INT DEFAULT 45,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'student',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  society_id UUID REFERENCES public.societies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTS TABLE
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
  approved_by_hod BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  capacity INT DEFAULT 100,
  attendee_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FLASH ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.flash_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  category TEXT DEFAULT 'urgent',
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
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
ALTER TABLE public.flash_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get role of currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role_enum AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- 1) Anyone can read user profiles (public campus directory)
CREATE POLICY "Profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 2) Users can update their own profile name / avatar
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Normal users cannot promote their own role
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.current_user_role() = 'developer'
  );

-- 3) ONLY Developers can update user roles
CREATE POLICY "Developers can update any user role"
  ON public.profiles FOR UPDATE
  USING (public.current_user_role() = 'developer')
  WITH CHECK (public.current_user_role() = 'developer');

-- ------------------------------------------------------------------------------
-- SOCIETIES POLICIES
-- 1) Anyone can view societies
CREATE POLICY "Societies are viewable by everyone"
  ON public.societies FOR SELECT
  USING (true);

-- 2) Society Admin can update their assigned society
CREATE POLICY "Society admins can update their society"
  ON public.societies FOR UPDATE
  USING (
    public.current_user_role() = 'developer'
    OR (
      public.current_user_role() = 'society_admin'
      AND id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ------------------------------------------------------------------------------
-- EVENTS POLICIES
-- 1) Anyone can read approved events (Students & Public)
CREATE POLICY "Anyone can view approved events"
  ON public.events FOR SELECT
  USING (
    approved_by_hod = true
    OR public.current_user_role() IN ('developer', 'hod')
    OR (
      public.current_user_role() = 'society_admin'
      AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 2) Only society_admin or developer can insert events
CREATE POLICY "Society Admins and Developers can insert events"
  ON public.events FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('society_admin', 'developer')
  );

-- 3) Only society_admin (owner), hod (for approval), or developer can update events
CREATE POLICY "Society admins, HODs, and Devs can update events"
  ON public.events FOR UPDATE
  USING (
    public.current_user_role() = 'developer'
    OR public.current_user_role() = 'hod'
    OR (
      public.current_user_role() = 'society_admin'
      AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 4) Only society_admin (owner) or developer can delete events
CREATE POLICY "Society admins and Devs can delete events"
  ON public.events FOR DELETE
  USING (
    public.current_user_role() = 'developer'
    OR (
      public.current_user_role() = 'society_admin'
      AND society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- ------------------------------------------------------------------------------
-- FLASH ANNOUNCEMENTS POLICIES
CREATE POLICY "Flash announcements readable by all"
  ON public.flash_announcements FOR SELECT
  USING (active = true OR public.current_user_role() = 'developer');

CREATE POLICY "Society Admins and Devs can post flash announcements"
  ON public.flash_announcements FOR INSERT
  WITH CHECK (public.current_user_role() IN ('society_admin', 'developer'));

-- ------------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
CREATE POLICY "Developers can read audit logs"
  ON public.system_audit_logs FOR SELECT
  USING (public.current_user_role() = 'developer');

CREATE POLICY "Anyone can write audit logs"
  ON public.system_audit_logs FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- SEED DATA (MIGRATION & DEMO SETUP)
-- ==============================================================================

-- 1. Seed Departments
INSERT INTO public.departments (id, name, code, hod_name, venues) VALUES
('d1111111-1111-1111-1111-111111111111', 'Computer Science & Software Engineering', 'CS', 'Dr. Farooq Azam', ARRAY['CS Lab 1', 'CS Lab 2', 'Sir Syed Auditorium', 'CS Lawn']),
('d2222222-2222-2222-2222-222222222222', 'Electrical & Robotics Engineering', 'EE', 'Dr. Nadia Kausar', ARRAY['Robotics Lab', 'Circuits Studio', 'Seminar Hall B']),
('d3333333-3333-3333-3333-333333333333', 'Management & Media Sciences', 'MS', 'Prof. Tariq Hashmi', ARRAY['Executive Lounge', 'Media Studio', 'Central Amphitheater'])
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Societies
INSERT INTO public.societies (id, name, description, logo_url, is_recruiting, department_id, contact_email, instagram_handle, member_count) VALUES
('s1111111-1111-1111-1111-111111111111', 'ACM Student Chapter', 'Premier computing society organizing annual hackathons, code sprints, and tech workshops.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=128&q=80', true, 'd1111111-1111-1111-1111-111111111111', 'acm@campus.edu', '@acm_campus', 142),
('s2222222-2222-2222-2222-222222222222', 'Bahria Dramatic Society (BDS)', 'The heart of theatre, comedy skits, mime performances, and annual campus gala.', 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=128&q=80', true, 'd3333333-3333-3333-3333-333333333333', 'drama@campus.edu', '@bds_theatre', 88),
('s3333333-3333-3333-3333-333333333333', 'Google Developer Student Club', 'University developers passionate about Flutter, Cloud, AI, and Google Cloud tech.', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&q=80', false, 'd1111111-1111-1111-1111-111111111111', 'gdsc@campus.edu', '@gdsc_bu', 160),
('s4444444-4444-4444-4444-444444444444', 'Campus Sports & Adventure Club', 'Fostering athletic excellence with football leagues, badminton championships, and hiking treks.', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=128&q=80', true, 'd2222222-2222-2222-2222-222222222222', 'sports@campus.edu', '@campus_sports', 210),
('s5555555-5555-5555-5555-555555555555', 'Culinary & Free Bites Circle', 'Bringing delicious refreshments, networking dinners, and baking pop-ups to students.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&q=80', true, 'd3333333-3333-3333-3333-333333333333', 'foodies@campus.edu', '@campusbites', 95)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Campus Events
INSERT INTO public.events (id, title, description, category, location_name, latitude, longitude, start_time, end_time, society_id, approved_by_hod, capacity, attendee_count) VALUES
('e1111111-1111-1111-1111-111111111111', 'HackPulse 2026: 24hr Campus Hackathon', 'Build AI and Web3 apps in 24 hours. Free energy drinks, mentorship from FAANG alumni, and $1,500 prize pool.', 'Tech', 'CS Lab 1 & Main Hall', 33.7182, 73.0298, NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '12 hours', 's1111111-1111-1111-1111-111111111111', true, 120, 94),
('e2222222-2222-2222-2222-222222222222', 'Midnight Pizza & Code Jam', 'Grab two free slices of pizza, meet open source contributors, and collaborate on student projects.', 'Free Food', 'CS Lawn & Cafeteria Court', 33.7185, 73.0305, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', 's5555555-5555-5555-5555-555555555555', true, 200, 185),
('e3333333-3333-3333-3333-333333333333', 'Annual Spring Gala: Campus Theatre Night', 'Watch 3 back-to-back comedy and dramatic plays performed by Bahria Dramatic Society.', 'Drama', 'Sir Syed Auditorium', 33.7175, 73.0292, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 's2222222-2222-2222-2222-222222222222', true, 450, 310),
('e4444444-4444-4444-4444-444444444444', 'Inter-Dept Futsal Championship Finale', 'CS vs EE grand finale match with commentary, floodlights, and trophy ceremony.', 'Sports', 'Central Sports Complex', 33.7192, 73.0312, NOW() + INTERVAL '1 day 2 hours', NOW() + INTERVAL '1 day 5 hours', 's4444444-4444-4444-4444-444444444444', true, 300, 240),
('e5555555-5555-5555-5555-555555555555', 'Hands-on Generative AI & Next.js Workshop', 'Live interactive workshop building agentic apps using Supabase and Next.js App Router.', 'Workshops', 'Seminar Hall B', 33.7179, 73.0289, NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 2 hours', 's3333333-3333-3333-3333-333333333333', true, 80, 72),
('e6666666-6666-6666-6666-666666666666', 'RoboWars 2026 Arena Battles', 'High-voltage combat robotics face-off in the reinforced glass battle cage. Sparks will fly!', 'Tech', 'Robotics Lab Outdoor Plaza', 33.7188, 73.0294, NOW() + INTERVAL '5 hours', NOW() + INTERVAL '8 hours', 's1111111-1111-1111-1111-111111111111', false, 150, 0)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Flash Announcements
INSERT INTO public.flash_announcements (id, message, category, society_name, active) VALUES
('a1111111-1111-1111-1111-111111111111', '🍕 Free Pizza distribution at CS Lawn starts in 45 mins! Bring your Student ID.', 'urgent', 'Culinary & Free Bites Circle', true),
('a2222222-2222-2222-2222-222222222222', '⚡ HackPulse 2026 check-in desk is now open at CS Lab 1. Team registrations finalized.', 'highlight', 'ACM Student Chapter', true),
('a3333333-3333-3333-3333-333333333333', '🎭 BDS Auditions for Spring Play are happening today at the Amphitheater until 6 PM.', 'reminder', 'Bahria Dramatic Society', true)
ON CONFLICT (id) DO NOTHING;
