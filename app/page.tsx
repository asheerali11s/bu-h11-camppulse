'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useUserRole } from '@/hooks/useUserRole';
import { CampusEvent, EventCategory } from '@/types';
import { ACADEMIC_DEPARTMENTS } from '@/utils/mockData';
import {
  Search,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Bookmark,
  Share2,
  PlusCircle,
  ShieldCheck,
  Building,
  Tag,
  ArrowRight,
  Download,
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
  }, [events, selectedDept, selectedCategory, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-navy-900 text-gold-300 border border-gold-500/40 text-xs font-bold shadow-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-[#030713] border border-gold-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-gold-500/30 text-xs font-semibold text-gold-300">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Plot 83, Sector H-11/4 Islamabad • Official Campus Feed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              BU (<span className="text-gold-400 font-serif">Bahria University H-11 CAMPUS</span>) Events
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Live society postings and event registration board. Discover upcoming seminars, workshops, and competitions posted by verified society executives.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all flex items-center space-x-2"
              >
                <span>View APP Updates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {(isSocietyAdmin || isDeveloper) && (
                <Link
                  href="/dashboard/society"
                  className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 border border-gold-500/30 font-bold text-xs transition-colors flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4 text-gold-400" />
                  <span>Post Upcoming Event</span>
                </Link>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-navy-850/80 border border-navy-700/80 text-center shrink-0 min-w-[140px]">
            <div className="text-3xl font-black text-gold-400 font-mono">{events.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Active Events
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">H-11 Slate</div>
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
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-navy-900 border border-navy-750 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors shadow-lg"
          />
        </div>

        {/* Department Filters */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Filter by Academic Department:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', ...ACADEMIC_DEPARTMENTS].map((dept) => {
              const active = selectedDept === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-gold'
                      : 'bg-navy-900 text-slate-400 border-navy-800 hover:text-white'
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
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Event Category:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-navy-800 text-gold-300 border-gold-500/50'
                      : 'bg-navy-950 text-slate-400 border-navy-850 hover:text-white'
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
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gold-400" />
            <span>Upcoming Event Posts ({filteredEvents.length})</span>
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-16 rounded-3xl bg-navy-900 border border-gold-500/20 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400 shadow-gold">
              <Calendar className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-black text-white tracking-tight">
                No Event Posts Available
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The event board is currently clean. Appointed Society Heads can post upcoming events directly in the Society Portal to open registration for all students.
              </p>
            </div>

            {(isSocietyAdmin || isDeveloper) && (
              <div className="pt-2">
                <Link
                  href="/dashboard/society"
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold inline-flex items-center space-x-2"
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
                  className="rounded-3xl bg-navy-900/90 border border-gold-500/20 hover:border-gold-500/40 transition-all overflow-hidden shadow-2xl"
                >
                  {/* Post Header: Society & Category */}
                  <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-navy-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-navy-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold font-serif shadow-sm">
                        {ev.society?.code || 'BU'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white">
                            {ev.society?.name || 'BU H-11 Student Society'}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30 font-semibold">
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Target: {ev.target_department || 'All Departments'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(ev.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        ev.is_bookmarked
                          ? 'bg-gold-500 text-navy-950 border-gold-400'
                          : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                      }`}
                      title="Bookmark Event"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Banner Image */}
                  {ev.banner_url && (
                    <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-navy-950">
                      <img
                        src={ev.banner_url}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {ev.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {ev.description}
                    </p>

                    {/* Venue & Date Badge Bar */}
                    <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-navy-950 border border-navy-800 text-xs">
                      <div className="flex items-center space-x-1.5 text-gold-300 font-semibold font-mono">
                        <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                        <span>
                          {new Date(ev.start_time).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} • {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="hidden sm:block text-slate-600">•</div>

                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                        <span>{ev.location_name}</span>
                      </div>
                    </div>

                    {/* REGISTRATION ACTION BAR */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-navy-800/80">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-300 font-bold flex items-center space-x-1.5">
                          <Users className="w-4 h-4 text-gold-400" />
                          <span>{attendeeCount} Students Registered</span>
                        </span>

                        {(isSocietyAdmin || isDeveloper) && (
                          <button
                            onClick={() => setInspectAttendeesModal(ev)}
                            className="text-[11px] text-gold-400 hover:underline font-bold"
                          >
                            View List ({attendeeCount})
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        {isRegistered ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Registered</span>
                            </span>
                            <button
                              onClick={() => handleUnregisterClick(ev.id)}
                              className="px-3 py-2 rounded-xl bg-navy-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-navy-800 text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegisterClick(ev.id)}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all flex items-center space-x-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gold-400" />
                <h3 className="text-base font-bold text-white">
                  Registered Attendees ({inspectAttendeesModal.registered_students?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setInspectAttendeesModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Event: <strong>{inspectAttendeesModal.title}</strong>
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-navy-800">
              {(!inspectAttendeesModal.registered_students || inspectAttendeesModal.registered_students.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No students registered yet.
                </div>
              ) : (
                inspectAttendeesModal.registered_students.map((st, i) => (
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
