'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  MessageSquare,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function SocietyDashboardPage() {
  const { role, isSocietyAdmin, isDeveloper, switchRole } = useUserRole();
  const {
    currentUser,
    events,
    societies,
    addEvent,
    deleteEvent,
    updateSociety,
    addAnnouncement,
  } = useApp();

  // Active Society (either matched to user or first society)
  const currentSociety = societies.find((s) => s.id === currentUser.society_id) || societies[0];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Form states
  const [profileName, setProfileName] = useState(currentSociety?.name || '');
  const [profileBio, setProfileBio] = useState(currentSociety?.description || '');
  const [profileLogo, setProfileLogo] = useState(currentSociety?.logo_url || '');
  const [isRecruiting, setIsRecruiting] = useState(currentSociety?.is_recruiting ?? true);

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

  const [flashMessage, setFlashMessage] = useState('');
  const [flashCategory, setFlashCategory] = useState<'urgent' | 'highlight' | 'reminder'>('urgent');

  const venuePresets = [
    { name: 'CS Lab 1 & Software Innovation Hall', lat: 33.7182, lng: 73.0298 },
    { name: 'Sir Syed Main Auditorium', lat: 33.7175, lng: 73.0292 },
    { name: 'CS Lawn & Cafeteria Courtyard', lat: 33.7185, lng: 73.0305 },
    { name: 'Seminar Hall B (Engineering Wing)', lat: 33.7179, lng: 73.0289 },
    { name: 'Central Sports Complex Arena', lat: 33.7192, lng: 73.0312 },
    { name: 'Robotics & Automation Plaza', lat: 33.7188, lng: 73.0294 },
    { name: 'Open Amphitheater Stage', lat: 33.7184, lng: 73.0301 },
  ];

  const myEvents = useMemo(() => {
    return events.filter((e) => e.society_id === currentSociety?.id);
  }, [events, currentSociety]);

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
      title: eventTitle.trim(),
      description: eventDescription || 'Official campus event organized by the society.',
      category: eventCategory,
      location_name: eventVenue,
      latitude: eventLat,
      longitude: eventLng,
      start_time: startDateTime,
      end_time: endDateTime,
      society_id: currentSociety.id,
      capacity: Number(eventCapacity),
    });

    setIsCreateModalOpen(false);
    setEventTitle('');
    setEventDescription('');
  };

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

  if (!isSocietyAdmin && !isDeveloper) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-navy-850 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Society Executive Privileges Required</h2>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          You are currently viewing in <strong>{role.toUpperCase()}</strong> mode. To manage society
          affairs, draft event proposals, and broadcast campus flashes, switch your active mode:
        </p>
        <button
          onClick={() => switchRole('society_admin')}
          className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold transition-all"
        >
          <span>🎪 Switch to Society Admin Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner (Navy & Gold) */}
      <div className="relative rounded-3xl bg-navy-900 border border-gold-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentSociety?.logo_url}
            alt=""
            className="w-16 h-16 rounded-2xl border-2 border-gold-500/40 object-cover shadow-gold"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentSociety?.name}</h1>
              {currentSociety?.is_recruiting && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/10 text-gold-300 border border-gold-500/40 animate-pulse">
                  Recruiting!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-1">
              Led by {currentSociety?.lead_name} ({currentSociety?.lead_enrollment}) • {currentSociety?.department}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/chat"
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 text-xs font-bold border border-gold-500/30 transition-colors flex items-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
            <span>Society Chat Room</span>
          </Link>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 text-xs font-semibold border border-navy-700 transition-colors flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsFlashModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 text-xs font-bold border border-gold-500/30 transition-colors flex items-center space-x-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-gold-400" />
            <span>Broadcast Flash</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Draft Event</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-750">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Drafted Events
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{myEvents.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-750">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Cleared by HOD
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {myEvents.filter((e) => e.approved_by_hod).length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-750">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Queue
          </div>
          <div className="text-2xl font-black text-gold-400 font-mono mt-1">
            {myEvents.filter((e) => !e.approved_by_hod).length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-750">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Recruitment Drive
          </div>
          <div className="text-xs font-bold text-slate-200 mt-2 flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                currentSociety?.is_recruiting ? 'bg-gold-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span>{currentSociety?.is_recruiting ? 'Accepting Applicants' : 'Closed'}</span>
          </div>
        </div>
      </div>

      {/* Society Event Management Table */}
      <div className="rounded-3xl bg-navy-900 border border-navy-750 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-navy-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Society Event Proposals</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit venue clearance requests to department heads. Real-time status sync.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            <span>New Proposal</span>
          </button>
        </div>

        {myEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-sm font-bold text-white">No Event Proposals Created Yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Click &quot;New Proposal&quot; to draft an event for Sir Syed Auditorium, CS Lab 1, or the Amphitheater.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-navy-950/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="px-6 py-3.5">Event Title & Schedule</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Requested Venue</th>
                  <th className="px-6 py-3.5">HOD Clearance</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {myEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{ev.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-gold-400" />
                        <span>
                          {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                          {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-navy-950 text-gold-300 border border-gold-500/20">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                        <span>{ev.location_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ev.approved_by_hod ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Cleared (Live on Radar)</span>
                        </span>
                      ) : ev.rejection_reason ? (
                        <div className="text-xs">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <AlertCircle className="w-3 h-3" />
                            <span>Action Required</span>
                          </span>
                          <p className="text-[11px] text-rose-300 mt-1 max-w-xs">{ev.rejection_reason}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-gold-500/10 text-gold-300 border border-gold-500/30">
                          <Clock className="w-3.5 h-3.5 text-gold-400" />
                          <span>Under HOD Review</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete proposal"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-navy-900 border border-gold-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-bold text-white">Draft Collegiate Event Proposal</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
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
                  placeholder="e.g. Annual Campus Code Sprint 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={eventCapacity}
                    onChange={(e) => setEventCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Venue Preset Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Venue *</label>
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
                          ? 'bg-navy-800 text-gold-300 border-gold-500'
                          : 'bg-navy-950 text-slate-400 border-navy-800 hover:border-navy-700'
                      }`}
                    >
                      {v.name.split('(')[0]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Venue location..."
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date & Time</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                    />
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-24 px-2 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date & Time</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                    />
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-24 px-2 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Outline key activities, guest speakers, and schedule..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Submit Proposal for HOD Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLASH ANNOUNCEMENT MODAL */}
      {isFlashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Broadcast Campus Flash</h3>
              <button onClick={() => setIsFlashModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastFlash} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message (Broadcasts across campus marquee)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Audition registrations close at 5:00 PM today at Sir Syed Auditorium!"
                  value={flashMessage}
                  onChange={(e) => setFlashMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsFlashModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Broadcast Flash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SOCIETY PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Manage Society Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Society Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Logo URL</label>
                <input
                  type="url"
                  required
                  value={profileLogo}
                  onChange={(e) => setProfileLogo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Charter & Bio</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100"
                />
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Recruitment Badge</div>
                  <div className="text-[11px] text-slate-400">Display &quot;Recruiting!&quot; badge across campus feed</div>
                </div>
                <input
                  type="checkbox"
                  checked={isRecruiting}
                  onChange={(e) => setIsRecruiting(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
