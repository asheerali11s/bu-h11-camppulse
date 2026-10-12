'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { CampusEvent, EventCategory } from '@/types';
import {
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Building,
  Image as ImageIcon,
  ShieldAlert,
} from 'lucide-react';

// Dynamic import for CampusMap coordinate picker
const CampusMap = dynamic(
  () => import('@/components/CampusMap').then((mod) => mod.CampusMap),
  { ssr: false }
);

export default function SocietyDashboardPage() {
  const { role, isSocietyAdmin, isDeveloper, switchRole } = useUserRole();
  const {
    events,
    societies,
    addEvent,
    deleteEvent,
    updateSociety,
    addAnnouncement,
  } = useApp();

  // Active Society managed by this admin (defaulting to ACM Student Chapter or first society)
  const currentSociety = societies[0];

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Profile edit form state
  const [profileName, setProfileName] = useState(currentSociety?.name || '');
  const [profileBio, setProfileBio] = useState(currentSociety?.description || '');
  const [profileLogo, setProfileLogo] = useState(currentSociety?.logo_url || '');
  const [isRecruiting, setIsRecruiting] = useState(currentSociety?.is_recruiting ?? true);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState<EventCategory>('Tech');
  const [eventVenue, setEventVenue] = useState('CS Lab 1');
  const [eventLat, setEventLat] = useState(33.7182);
  const [eventLng, setEventLng] = useState(73.0298);
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('14:00');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('17:00');
  const [eventCapacity, setEventCapacity] = useState(120);

  // Flash announcement form state
  const [flashMessage, setFlashMessage] = useState('');
  const [flashCategory, setFlashCategory] = useState<'urgent' | 'highlight' | 'reminder'>('urgent');

  // Venue preset options with campus coordinates
  const venuePresets = [
    { name: 'CS Lab 1 & Main Hall', lat: 33.7182, lng: 73.0298 },
    { name: 'Sir Syed Auditorium', lat: 33.7175, lng: 73.0292 },
    { name: 'CS Lawn & Cafeteria Court', lat: 33.7185, lng: 73.0305 },
    { name: 'Seminar Hall B', lat: 33.7179, lng: 73.0289 },
    { name: 'Central Sports Complex Ground', lat: 33.7192, lng: 73.0312 },
    { name: 'Robotics Lab Outdoor Plaza', lat: 33.7188, lng: 73.0294 },
    { name: 'Central Amphitheater', lat: 33.7184, lng: 73.0301 },
  ];

  // Filter events belonging to this society
  const myEvents = useMemo(() => {
    return events.filter((e) => e.society_id === currentSociety?.id);
  }, [events, currentSociety]);

  // Handle Event Submission
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventVenue.trim()) return;

    const startDateTime = eventStartDate
      ? new Date(`${eventStartDate}T${eventStartTime}`).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    const endDateTime = eventEndDate
      ? new Date(`${eventEndDate}T${eventEndTime}`).toISOString()
      : new Date(Date.now() + 4 * 3600 * 1000).toISOString();

    await addEvent({
      title: eventTitle,
      description: eventDescription || 'Exciting campus activity hosted by the society.',
      category: eventCategory,
      location_name: eventVenue,
      latitude: eventLat,
      longitude: eventLng,
      start_time: startDateTime,
      end_time: endDateTime,
      society_id: currentSociety.id,
      capacity: Number(eventCapacity),
    });

    // Reset & Close
    setIsCreateModalOpen(false);
    setEventTitle('');
    setEventDescription('');
  };

  // Handle Flash Announcement Broadcast
  const handleBroadcastFlash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashMessage.trim()) return;

    await addAnnouncement({
      message: flashMessage,
      category: flashCategory,
      society_name: currentSociety.name,
    });

    setFlashMessage('');
    setIsFlashModalOpen(false);
  };

  // Handle Society Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSociety(currentSociety.id, {
      name: profileName,
      description: profileBio,
      logo_url: profileLogo,
      is_recruiting: isRecruiting,
    });
    setIsEditProfileOpen(false);
  };

  // If user role doesn't have permission
  if (!isSocietyAdmin && !isDeveloper) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Society Admin Access Required</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          You are currently viewing in <strong>{role.toUpperCase()}</strong> mode. To access the
          Society Executive workspace, switch your active role:
        </p>
        <button
          onClick={() => switchRole('society_admin')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center space-x-2"
        >
          <span>🎪 Switch to Society Admin Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentSociety?.logo_url}
            alt={currentSociety?.name}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-lg"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentSociety?.name}</h1>
              {currentSociety?.is_recruiting && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  Recruiting!
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl line-clamp-1">
              {currentSociety?.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsFlashModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors flex items-center space-x-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Flash Announcement</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Society Health & Event Queue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Events
          </div>
          <div className="text-2xl font-black text-white mt-1">{myEvents.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Live / Approved
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {myEvents.filter((e) => e.approved_by_hod).length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending HOD Review
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {myEvents.filter((e) => !e.approved_by_hod).length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recruitment Status
          </div>
          <div className="text-sm font-bold text-slate-200 mt-2 flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                currentSociety?.is_recruiting ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span>{currentSociety?.is_recruiting ? 'Open (Recruiting)' : 'Closed'}</span>
          </div>
        </div>
      </div>

      {/* Society Event Management Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Submitted Society Events</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track event scheduling, HOD department venue approvals, and RSVPs.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>
        </div>

        {myEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">No events created for this society yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Event Details</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Venue & Coordinates</th>
                  <th className="px-6 py-3.5">HOD Status</th>
                  <th className="px-6 py-3.5">RSVPs</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {myEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{ev.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {new Date(ev.start_time).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(ev.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{ev.location_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        [{ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}]
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ev.approved_by_hod ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved (Live)</span>
                        </span>
                      ) : ev.rejection_reason ? (
                        <div className="text-xs">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            <AlertCircle className="w-3 h-3" />
                            <span>Action Required</span>
                          </span>
                          <p className="text-[11px] text-rose-300 mt-1 max-w-xs">
                            Reason: {ev.rejection_reason}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Under HOD Review</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-200">{ev.attendee_count || 0}</span>
                      <span className="text-slate-500 text-xs"> / {ev.capacity}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Create New Campus Event</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Prompt Engineering Challenge"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Sports">Sports</option>
                    <option value="Drama">Drama</option>
                    <option value="Free Food">Free Food</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Music">Music</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Capacity (Seats / Hall limit)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={eventCapacity}
                    onChange={(e) => setEventCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Venue Preset Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Venue / Location *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {venuePresets.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => {
                        setEventVenue(v.name);
                        setEventLat(v.lat);
                        setEventLng(v.lng);
                      }}
                      className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                        eventVenue === v.name
                          ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Or custom venue name..."
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date & Time
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                    />
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-28 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Date & Time
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                    />
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-28 px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Description & Agenda
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key activities, guest speakers, prerequisites, and prizes..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>HOD Approval Notice:</strong> Once submitted, your event will enter the
                  Department HOD queue for venue clearance before going live on the campus radar.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Submit for HOD Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLASH ANNOUNCEMENT MODAL */}
      {isFlashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Broadcast Campus Flash</h3>
              </div>
              <button onClick={() => setIsFlashModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastFlash} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Flash Message (Appears on Live Campus Marquee)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 🍕 Free Pizza distribution starting in 15 mins at CS Lawn!"
                  value={flashMessage}
                  onChange={(e) => setFlashMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={flashCategory}
                  onChange={(e) => setFlashCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
                >
                  <option value="urgent">🔥 Urgent / Happening Now</option>
                  <option value="highlight">⚡ Highlight / Milestone</option>
                  <option value="reminder">⏰ Deadline Reminder</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFlashModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Broadcast Live Flash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SOCIETY PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Manage Society Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Society Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  required
                  value={profileLogo}
                  onChange={(e) => setProfileLogo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  About / Bio
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100"
                />
              </div>

              {/* Recruitment Status Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Recruitment Status Badge</div>
                  <div className="text-[11px] text-slate-400">
                    Display &quot;Recruiting!&quot; badge across campus feed
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isRecruiting}
                  onChange={(e) => setIsRecruiting(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
