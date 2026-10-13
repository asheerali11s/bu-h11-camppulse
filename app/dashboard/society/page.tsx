'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { CampusEvent, EventCategory } from '@/types';
import { ACADEMIC_DEPARTMENTS } from '@/utils/mockData';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  Tag,
  ArrowRight,
} from 'lucide-react';

const PRESET_BANNERS = [
  { label: 'Technology / AI Hackathon', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80' },
  { label: 'Academic Seminar / Workshop', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80' },
  { label: 'Coding & Robotics Arena', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { label: 'Sports & Futsal Tournament', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80' },
  { label: 'Cultural & Arts Gala', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
];

export default function SocietyDashboardPage() {
  const { isSocietyAdmin, isDeveloper } = useUserRole();
  const {
    currentUser,
    events,
    societies,
    addEvent,
    deleteEvent,
  } = useApp();

  const currentSociety = societies.find((s) => s.lead_enrollment === currentUser?.enrollment_id) || societies[0];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<CampusEvent | null>(null);

  // Event Form State (STRICTLY UPCOMING EVENT POSTING ONLY)
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState<EventCategory>('Workshop');
  const [eventTargetDept, setEventTargetDept] = useState('All Departments');
  const [eventLocation, setEventLocation] = useState('Sir Syed Auditorium');
  const [eventBanner, setEventBanner] = useState(PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('14:00');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('16:30');
  const [eventCapacity, setEventCapacity] = useState(100);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const myEvents = useMemo(() => {
    if (isDeveloper) return events;
    return events.filter(
      (e) => e.created_by_enrollment === currentUser?.enrollment_id || e.society_id === currentSociety?.id
    );
  }, [events, currentUser, currentSociety, isDeveloper]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const startDateTime = eventStartDate
      ? new Date(`${eventStartDate}T${eventStartTime}`).toISOString()
      : new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    const endDateTime = eventEndDate
      ? new Date(`${eventEndDate}T${eventEndTime}`).toISOString()
      : new Date(Date.now() + 26 * 3600 * 1000).toISOString();

    const bannerToUse = customBannerUrl.trim() || eventBanner;

    await addEvent({
      title: eventTitle.trim(),
      description: eventDescription.trim() || 'Join us for this official BU H-11 campus event.',
      category: eventCategory,
      location_name: eventLocation.trim(),
      banner_url: bannerToUse,
      target_department: eventTargetDept,
      start_time: startDateTime,
      end_time: endDateTime,
      capacity: eventCapacity,
      society_id: currentSociety?.id || 'soc-h11',
    });

    setIsCreateModalOpen(false);
    showToast(`Event "${eventTitle.trim()}" published to the campus feed!`);
    setEventTitle('');
    setEventDescription('');
  };

  if (!isSocietyAdmin && !isDeveloper) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-navy-900 border border-gold-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Society Executive Privileges Required</h2>
          <p className="text-xs text-slate-400">
            Only verified Society Heads appointed by the Platform Administrator can post upcoming campus events.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs"
          >
            Return to Campus Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-navy-900 text-gold-300 border border-gold-500/40 text-xs font-bold shadow-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-[#030814] border border-gold-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-gold-500/30 text-xs text-gold-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Society Executive Desk • {currentSociety?.name || 'BU H-11 Society'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Upcoming Event Management
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Post verified upcoming events directly to the student feed. Students across Bahria University H-11 can register instantly with their Enrollment ID.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Upcoming Event</span>
        </button>
      </section>

      {/* Posted Events Table / Cards */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gold-400" />
          <span>My Posted Events ({myEvents.length})</span>
        </h2>

        {myEvents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-navy-900 border border-navy-800 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-300">No events posted yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Post Upcoming Event&quot; above to publish your society&apos;s first event to the campus feed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-3xl bg-navy-900/90 border border-navy-800 hover:border-gold-500/40 transition-all overflow-hidden flex flex-col shadow-xl"
              >
                {ev.banner_url && (
                  <div className="h-44 w-full relative overflow-hidden bg-navy-950">
                    <img
                      src={ev.banner_url}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md text-[10px] font-bold text-gold-400 border border-gold-500/30">
                      {ev.category}
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{ev.description}</p>
                    <div className="text-[11px] text-slate-300 space-y-1 pt-1 font-mono">
                      <div className="flex items-center space-x-1.5 text-gold-300">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        <span>{new Date(ev.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-gold-400" />
                        <span>{ev.location_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEventForRegistrations(ev)}
                      className="text-xs text-gold-400 hover:text-gold-300 font-bold flex items-center space-x-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Registrations ({ev.registered_students?.length || ev.attendee_count || 0})</span>
                    </button>

                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* POST EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-bold text-white">Post Upcoming Campus Event</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Data Science Workshop 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Category *
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500 cursor-pointer"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Tech Talk">Tech Talk</option>
                    <option value="Competition">Competition</option>
                    <option value="Sports & Athletics">Sports &amp; Athletics</option>
                    <option value="Cultural & Arts">Cultural &amp; Arts</option>
                    <option value="Annual Gala">Annual Gala</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Department
                  </label>
                  <select
                    value={eventTargetDept}
                    onChange={(e) => setEventTargetDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500 cursor-pointer"
                  >
                    <option value="All Departments">All Departments (Open)</option>
                    {ACADEMIC_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Venue / Location Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Syed Auditorium or Computing Lab 1"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Description &amp; Schedule
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an overview of the event, requirements, guest speakers..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                />
              </div>

              {/* Banner Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Choose Banner Image
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESET_BANNERS.slice(0, 3).map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => {
                        setEventBanner(b.url);
                        setCustomBannerUrl('');
                      }}
                      className={`p-1.5 rounded-xl border text-left text-[10px] truncate ${
                        eventBanner === b.url && !customBannerUrl
                          ? 'border-gold-500 bg-navy-800 text-gold-300'
                          : 'border-navy-700 bg-navy-950 text-slate-400'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste custom image URL (https://...)"
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Publish to Campus Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTERED STUDENTS MODAL (Society Head can inspect who registered) */}
      {selectedEventForRegistrations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gold-400" />
                <h3 className="text-base font-bold text-white">
                  Registered Students ({selectedEventForRegistrations.registered_students?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventForRegistrations(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Event: <strong>{selectedEventForRegistrations.title}</strong>
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-navy-800">
              {(!selectedEventForRegistrations.registered_students || selectedEventForRegistrations.registered_students.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No students have registered for this event yet.
                </div>
              ) : (
                selectedEventForRegistrations.registered_students.map((st, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{st.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.enrollment_id} • {st.department} ({st.semester})
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(st.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
