'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useUserRole } from '@/hooks/useUserRole';
import { CampusEvent, EventCategory } from '@/types';
import { EventCard } from '@/components/EventCard';
import { SocietyModal } from '@/components/SocietyModal';
import {
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  Flame,
  Search,
  Sparkles,
  Calendar,
  Building,
  Users,
  Compass,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

const CampusMap = dynamic(
  () => import('@/components/CampusMap').then((mod) => mod.CampusMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] bg-navy-900 border border-navy-800 rounded-3xl flex flex-col items-center justify-center text-slate-400 animate-pulse">
        <MapPin className="w-8 h-8 text-gold-400 mb-2 animate-bounce" />
        <span className="text-xs font-semibold text-slate-300">Loading Campus OpenStreetMap Radar...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  const { events, societies, currentUser } = useApp();
  const { isSocietyAdmin, isDeveloper } = useUserRole();

  const [activeView, setActiveView] = useState<'split' | 'grid' | 'map'>('split');
  const [happeningNowOnly, setHappeningNowOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalSocietyId, setModalSocietyId] = useState<string | null>(null);

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Tech',
    'Sports',
    'Drama',
    'Free Food',
    'Workshops',
    'Music',
    'Academic',
  ];

  // Approved events for public student view
  const approvedEvents = useMemo(() => {
    return events.filter((e) => e.approved_by_hod);
  }, [events]);

  // Happening Now count
  const happeningNowCount = useMemo(() => {
    const now = new Date();
    return approvedEvents.filter((event) => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      return (
        (now >= start && now <= end) ||
        (start.getTime() - now.getTime() > 0 &&
          start.getTime() - now.getTime() <= 2 * 60 * 60 * 1000)
      );
    }).length;
  }, [approvedEvents]);

  // Filtered list
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return approvedEvents
      .filter((event) => {
        if (happeningNowOnly) {
          const start = new Date(event.start_time);
          const end = new Date(event.end_time);
          const isLive =
            (now >= start && now <= end) ||
            (start.getTime() - now.getTime() > 0 &&
              start.getTime() - now.getTime() <= 2 * 60 * 60 * 1000);
          if (!isLive) return false;
        }

        if (selectedCategory !== 'All' && event.category !== selectedCategory) {
          return false;
        }

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = event.title.toLowerCase().includes(q);
          const matchLocation = event.location_name.toLowerCase().includes(q);
          const matchDesc = event.description.toLowerCase().includes(q);
          const matchSociety = event.society?.name.toLowerCase().includes(q);
          if (!matchTitle && !matchLocation && !matchDesc && !matchSociety) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [approvedEvents, happeningNowOnly, selectedCategory, searchQuery]);

  const activeSocietyModalData = useMemo(() => {
    if (!modalSocietyId) return null;
    return societies.find((s) => s.id === modalSocietyId) || null;
  }, [modalSocietyId, societies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sleek Collegiate Hero Section (Deep Dark Blue & Gold) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-[#040812] border border-gold-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-gold-500/30 text-xs font-semibold text-gold-300">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Verified Campus Intelligence • Bahria University</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Collegiate Events &amp; <span className="text-gold-400 font-serif">Society Hub</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Official campus radar replacing fragmented chats and paper flyers. Interactive venue maps,
              department-verified bookings, and real-time society discussion rooms.
            </p>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Society Chats</span>
              </Link>

              {(isSocietyAdmin || isDeveloper) && (
                <Link
                  href="/dashboard/society"
                  className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 border border-gold-500/30 font-bold text-xs transition-colors flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4 text-gold-400" />
                  <span>Create Society Event</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-700 text-center">
              <div className="text-2xl font-black text-white font-mono">{approvedEvents.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Active Events
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-700 text-center">
              <div className="text-2xl font-black text-gold-400 font-mono flex items-center justify-center space-x-1">
                <span>{happeningNowCount}</span>
                {happeningNowCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping inline-block" />
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Live Now
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-850/80 border border-navy-700 text-center">
              <div className="text-2xl font-black text-white font-mono">{societies.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Societies
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar: Search, Category Filters, Views, Happening Now */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search verified events, venues (e.g. CS Lab 1), or societies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-750 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Happening Now Toggle & View Switcher */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setHappeningNowOnly(!happeningNowOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border shadow-sm ${
                happeningNowOnly
                  ? 'bg-gold-500 text-navy-950 border-gold-400 shadow-gold'
                  : 'bg-navy-900 text-slate-300 border-navy-750 hover:border-gold-500/40'
              }`}
            >
              <Flame className={`w-4 h-4 ${happeningNowOnly ? 'fill-navy-950 text-navy-950' : 'text-gold-400'}`} />
              <span>Happening Now ({happeningNowCount})</span>
            </button>

            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-navy-900 border border-navy-750">
              <button
                onClick={() => setActiveView('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  activeView === 'split'
                    ? 'bg-navy-800 text-gold-400 shadow-sm border border-gold-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dual</span>
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  activeView === 'map'
                    ? 'bg-navy-800 text-gold-400 shadow-sm border border-gold-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setActiveView('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  activeView === 'grid'
                    ? 'bg-navy-800 text-gold-400 shadow-sm border border-gold-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-navy-800 text-gold-300 border-gold-500/50 shadow-gold'
                    : 'bg-navy-900 text-slate-400 border-navy-800 hover:text-white hover:border-navy-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content: Clean State when no events exist */}
      {filteredEvents.length === 0 ? (
        <div className="p-16 rounded-3xl bg-navy-900 border border-gold-500/20 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400 shadow-gold">
            <Calendar className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-black text-white tracking-tight">
              No Public Events Scheduled
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The event slate is clean. Verified society heads can draft new proposals in the Society
              Dashboard, which will appear on the campus radar immediately following Department HOD venue clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {(isSocietyAdmin || isDeveloper) ? (
              <Link
                href="/dashboard/society"
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold transition-all inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Draft New Society Event</span>
              </Link>
            ) : (
              <Link
                href="/chat"
                className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 border border-gold-500/30 text-xs font-bold transition-all inline-flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-gold-400" />
                <span>Join Verified Campus Chats</span>
              </Link>
            )}

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setHappeningNowOnly(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-navy-950 text-slate-400 hover:text-white text-xs font-semibold border border-navy-800"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Split Mode: Interactive Map on Top, Grid Below */}
          {activeView === 'split' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Interactive Campus Radar
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Click pin to view hall clearance &amp; export .ics
                  </span>
                </div>
                <CampusMap
                  events={filteredEvents}
                  selectedEventId={selectedEventId}
                  onSelectEvent={(ev) => setSelectedEventId(ev.id)}
                  height="460px"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <LayoutGrid className="w-4 h-4 text-gold-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Chronological Event Queue ({filteredEvents.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onOpenSocietyModal={(sId) => setModalSocietyId(sId)}
                      onFocusOnMap={(ev) => {
                        setSelectedEventId(ev.id);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'map' && (
            <div className="space-y-4">
              <CampusMap
                events={filteredEvents}
                selectedEventId={selectedEventId}
                onSelectEvent={(ev) => setSelectedEventId(ev.id)}
                height="680px"
              />
            </div>
          )}

          {activeView === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpenSocietyModal={(sId) => setModalSocietyId(sId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Society Profile Viewer Modal */}
      <SocietyModal
        society={activeSocietyModalData}
        events={events}
        isOpen={!!modalSocietyId}
        onClose={() => setModalSocietyId(null)}
      />
    </div>
  );
}
