'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useUserRole } from '@/hooks/useUserRole';
import { CampusEvent, EventCategory } from '@/types';
import { ACADEMIC_DEPARTMENTS } from '@/utils/mockData';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  X,
  UserCheck,
} from 'lucide-react';

export default function HomePage() {
  const {
    events,
    currentUser,
    registerForEvent,
    unregisterFromEvent,
    toggleBookmark,
  } = useApp();
  const { isSocietyAdmin, isDeveloper } = useUserRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectAttendeesModal, setInspectAttendeesModal] = useState<CampusEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Workshop',
    'Seminar',
    'Tech Talk',
    'Competition',
    'Sports & Athletics',
    'Cultural & Arts',
    'Annual Gala',
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterClick = async (eventId: string) => {
    const res = await registerForEvent(eventId);
    showToast(res.message);
  };

  const handleUnregisterClick = async (eventId: string) => {
    await unregisterFromEvent(eventId);
    showToast('Registration cancelled.');
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Must be approved by Admin, unless user is the Platform Admin or author previewing it
      const isVisible = ev.approved_by_hod || isDeveloper || ev.created_by_enrollment === currentUser?.enrollment_id;
      if (!isVisible) return false;

      if (selectedDept !== 'All' && ev.target_department && ev.target_department !== 'All Departments' && ev.target_department !== selectedDept) {
        return false;
      }

      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchLoc = ev.location_name.toLowerCase().includes(q);
        const matchSoc = ev.society?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchSoc) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedDept, selectedCategory, searchQuery, isDeveloper, currentUser]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-200 text-xs font-semibold shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0f2b5c]" />
              <span>Plot 83, Sector H-11/4 Islamabad • Official Campus Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bahria University H-11 Campus Events
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Official campus event directory and student registration portal. Explore verified academic seminars, technical workshops, and society activities.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center space-x-2"
              >
                <span>Notice Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {(isSocietyAdmin || isDeveloper) && (
                <Link
                  href="/dashboard/society"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs transition-colors flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#0f2b5c]" />
                  <span>Post Upcoming Event</span>
                </Link>
              )}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[140px]">
            <div className="text-3xl font-bold text-[#0f2b5c] font-mono">{events.length}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Active Events
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">H-11 Campus</div>
          </div>
        </div>
      </section>

      {/* Control Bar: Search & Department / Category Filter Pills */}
      <section className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search upcoming events by title, society, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2b5c] focus:ring-1 focus:ring-[#0f2b5c] transition-colors shadow-sm"
          />
        </div>

        {/* Department Filters */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Filter by Academic Department:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', ...ACADEMIC_DEPARTMENTS].map((dept) => {
              const active = selectedDept === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filters */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Event Category:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* POSTS SECTION: The Live Event Feed where students can register */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#0f2b5c]" />
            <span>Upcoming Event Posts ({filteredEvents.length})</span>
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-16 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                No Event Posts Available
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                There are currently no events matching the active filter. Appointed Society Heads can post upcoming events directly through the Society Portal.
              </p>
            </div>

            {(isSocietyAdmin || isDeveloper) && (
              <div className="pt-2">
                <Link
                  href="/dashboard/society"
                  className="px-4 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white text-xs font-semibold shadow-sm inline-flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post an Upcoming Event</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((ev) => {
              const isRegistered = ev.registered_students?.some(
                (s) => s.enrollment_id === currentUser?.enrollment_id
              );
              const attendeeCount = ev.registered_students?.length || ev.attendee_count || 0;

              return (
                <article
                  key={ev.id}
                  className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all overflow-hidden shadow-sm hover:shadow"
                >
                  {/* Post Header: Society & Category */}
                  <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0f2b5c] font-bold font-serif text-sm">
                        {ev.society?.code || 'BU'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {ev.society?.name || 'BU H-11 Student Society'}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Target: {ev.target_department || 'All Departments'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(ev.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        ev.is_bookmarked
                          ? 'bg-slate-100 text-slate-900 border-slate-300'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                      title="Bookmark Event"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Banner Image */}
                  {ev.banner_url && (
                    <div className="h-60 sm:h-72 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={ev.banner_url}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {ev.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {ev.description}
                    </p>

                    {/* Venue & Date Badge Bar */}
                    <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-semibold font-mono">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>
                          {new Date(ev.start_time).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} • {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="hidden sm:block text-slate-300">•</div>

                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{ev.location_name}</span>
                      </div>
                    </div>

                    {/* REGISTRATION ACTION BAR */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-600 font-semibold flex items-center space-x-1.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{attendeeCount} Students Registered</span>
                        </span>

                        {(isSocietyAdmin || isDeveloper) && (
                          <button
                            onClick={() => setInspectAttendeesModal(ev)}
                            className="text-[11px] text-[#0f2b5c] hover:underline font-semibold"
                          >
                            View List ({attendeeCount})
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        {isRegistered ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Registered</span>
                            </span>
                            <button
                              onClick={() => handleUnregisterClick(ev.id)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegisterClick(ev.id)}
                            className="px-5 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-sm"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Register for Event</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* INSPECT ATTENDEES MODAL */}
      {inspectAttendeesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#0f2b5c]" />
                <h3 className="text-base font-bold text-slate-900">
                  Registered Attendees ({inspectAttendeesModal.registered_students?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setInspectAttendeesModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Event: <strong>{inspectAttendeesModal.title}</strong>
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {(!inspectAttendeesModal.registered_students || inspectAttendeesModal.registered_students.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No students registered yet.
                </div>
              ) : (
                inspectAttendeesModal.registered_students.map((st, i) => (
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
