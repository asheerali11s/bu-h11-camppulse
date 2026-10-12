'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { CampusEvent, EventCategory } from '@/types';
import { EventCard } from '@/components/EventCard';
import { SocietyModal } from '@/components/SocietyModal';
import {
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  Flame,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Building,
  Users,
  Compass,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

// Dynamically import CampusMap with SSR disabled to prevent Leaflet window reference errors
const CampusMap = dynamic(
  () => import('@/components/CampusMap').then((mod) => mod.CampusMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 animate-pulse">
        <MapPin className="w-8 h-8 text-indigo-500 mb-2 animate-bounce" />
        <span className="text-sm font-medium">Loading Campus Leaflet Radar...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  const { events, societies } = useApp();

  // View state: 'dual' (both map & grid), 'map' (full map), 'grid' (cards only)
  const [activeView, setActiveView] = useState<'split' | 'grid' | 'map'>('split');
  const [happeningNowOnly, setHappeningNowOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Society Modal State
  const [modalSocietyId, setModalSocietyId] = useState<string | null>(null);

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Tech',
    'Sports',
    'Drama',
    'Free Food',
    'Workshops',
    'Music',
  ];

  // Filter only approved events for the public student view
  const approvedEvents = useMemo(() => {
    return events.filter((e) => e.approved_by_hod);
  }, [events]);

  // Compute "Happening Now" events (currently underway or starting in next 2 hours)
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

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return approvedEvents
      .filter((event) => {
        // Happening Now filter
        if (happeningNowOnly) {
          const start = new Date(event.start_time);
          const end = new Date(event.end_time);
          const isLive =
            (now >= start && now <= end) ||
            (start.getTime() - now.getTime() > 0 &&
              start.getTime() - now.getTime() <= 2 * 60 * 60 * 1000);
          if (!isLive) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && event.category !== selectedCategory) {
          return false;
        }

        // Search query
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

  const recruitingSocietiesCount = useMemo(() => {
    return societies.filter((s) => s.is_recruiting).length;
  }, [societies]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome & Quick Stats */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Live Radar • Bahria University</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              What’s Happening on Campus Today?
            </h1>
            <p className="mt-2.5 text-slate-300 text-sm sm:text-base leading-relaxed">
              No more scattered WhatsApp groups, lost flyers, or buried Instagram stories. Explore
              real-time events, interactive venue maps, and active society recruitment in one spot.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-indigo-400">{approvedEvents.length}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Active Events
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center space-x-1">
                <span>{happeningNowCount}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Live Now / Soon
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-amber-400">{recruitingSocietiesCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Recruiting Clubs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Bar: Search, Category Pills, View Mode, Happening Now Switch */}
      <section className="space-y-4">
        {/* Search & Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, venues (e.g. CS Lab 1), or societies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Happening Now Toggle & View Switcher */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-1 sm:pb-0">
            {/* Live Happening Now Toggle Button */}
            <button
              onClick={() => setHappeningNowOnly(!happeningNowOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border shadow-sm ${
                happeningNowOnly
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Flame className={`w-4 h-4 ${happeningNowOnly ? 'fill-slate-950' : 'text-emerald-400'}`} />
              <span>Happening Now ({happeningNowCount})</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
              <button
                onClick={() => setActiveView('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  activeView === 'split'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Split View (Map & Grid)"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dual View</span>
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  activeView === 'map'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Full Map Radar"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setActiveView('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  activeView === 'grid'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Chronological Cards Grid"
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat === 'Free Food' ? '🍕 ' : cat === 'Sports' ? '⚽ ' : cat === 'Tech' ? '💻 ' : ''}
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Layout based on activeView */}
      {filteredEvents.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No events matched your filters</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {happeningNowOnly
              ? 'No events are scheduled in the next 2 hours. Try turning off the "Happening Now" toggle to view all upcoming campus events!'
              : 'Try clearing your search query or selecting "All" categories.'}
          </p>
          <button
            onClick={() => {
              setHappeningNowOnly(false);
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Split Mode: Interactive Map on Top, Grid Below */}
          {activeView === 'split' && (
            <div className="space-y-8">
              {/* Map Canvas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                      Interactive Campus Map Radar
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    Click any marker to view details & download .ics
                  </span>
                </div>
                <CampusMap
                  events={filteredEvents}
                  selectedEventId={selectedEventId}
                  onSelectEvent={(ev) => setSelectedEventId(ev.id)}
                  height="460px"
                />
              </div>

              {/* Chronological Grid Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                      Chronological Event Feed ({filteredEvents.length})
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

          {/* Full Map View */}
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

          {/* Full Grid View */}
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
