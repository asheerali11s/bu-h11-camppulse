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
  Users,
  CheckCircle2,
  X,
  ShieldCheck,
} from 'lucide-react';

const PRESET_BANNERS = [
  { label: 'Technology / AI Hackathon', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80' },
  { label: 'Academic Seminar / Workshop', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80' },
  { label: 'Coding & Robotics Arena', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { label: 'Sports & Athletics Tournament', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80' },
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
    showToast(`Event "${eventTitle.trim()}" published to the campus feed.`);
    setEventTitle('');
    setEventDescription('');
  };

  if (!isSocietyAdmin && !isDeveloper) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-[#0f2b5c]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Society Executive Privileges Required</h2>
          <p className="text-xs text-slate-500">
            Only verified Society Heads appointed by the Platform Administrator can post upcoming campus events.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#0f2b5c] text-white font-semibold text-xs shadow-sm"
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
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-200 text-xs font-semibold shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0f2b5c]" />
            <span>Society Executive Desk • {currentSociety?.name || 'BU H-11 Society'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Upcoming Event Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Post verified upcoming events to the student feed. Students across Bahria University H-11 can register instantly with their Enrollment ID.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Upcoming Event</span>
        </button>
      </section>

      {/* Posted Events Table / Cards */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#0f2b5c]" />
          <span>My Posted Events ({myEvents.length})</span>
        </h2>

        {myEvents.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">No events posted yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Post Upcoming Event&quot; above to publish your society&apos;s first event to the campus feed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all overflow-hidden flex flex-col shadow-sm"
              >
                {ev.banner_url && (
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={ev.banner_url}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-semibold text-slate-800 border border-slate-200 shadow-sm">
                      {ev.category}
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                    <div className="text-[11px] text-slate-600 space-y-1 pt-1 font-mono">
                      <div className="flex items-center space-x-1.5 text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(ev.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.location_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEventForRegistrations(ev)}
                      className="text-xs text-[#0f2b5c] hover:underline font-semibold flex items-center space-x-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Registrations ({ev.registered_students?.length || ev.attendee_count || 0})</span>
                    </button>

                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#0f2b5c]" />
                <h3 className="text-lg font-bold text-slate-900">Post Upcoming Campus Event</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Data Science Workshop 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0f2b5c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Category *
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c] cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Department
                  </label>
                  <select
                    value={eventTargetDept}
                    onChange={(e) => setEventTargetDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c] cursor-pointer"
                  >
                    <option value="All Departments">All Departments (Open)</option>
                    {ACADEMIC_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue / Location Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Syed Auditorium or Computing Lab 1"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-[#0f2b5c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Description &amp; Schedule
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an overview of the event, requirements, guest speakers..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c]"
                />
              </div>

              {/* Banner Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      className={`p-2 rounded-xl border text-left text-[11px] truncate ${
                        eventBanner === b.url && !customBannerUrl
                          ? 'border-[#0f2b5c] bg-slate-100 text-[#0f2b5c] font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
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
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#0f2b5c]" />
                <h3 className="text-base font-bold text-slate-900">
                  Registered Students ({selectedEventForRegistrations.registered_students?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventForRegistrations(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Event: <strong>{selectedEventForRegistrations.title}</strong>
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {(!selectedEventForRegistrations.registered_students || selectedEventForRegistrations.registered_students.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No students have registered for this event yet.
                </div>
              ) : (
                selectedEventForRegistrations.registered_students.map((st, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{st.full_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {st.enrollment_id} • {st.department} ({st.semester})
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
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
