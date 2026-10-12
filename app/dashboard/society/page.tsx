'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { CampusEvent, EventCategory, CampusFloor } from '@/types';
import { BU_H11_FLOORS, BU_H11_COORDINATES } from '@/utils/mockData';
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
  Layers,
} from 'lucide-react';

export default function SocietyDashboardPage() {
  const { role, isSocietyAdmin, isDeveloper, switchRole } = useUserRole();
  const {
    currentUser,
    events,
    societies,
    addEvent,
    deleteEvent,
    createSociety,
    updateSociety,
    addAnnouncement,
  } = useApp();

  // Find or determine user's society
  const currentSociety = societies.find((s) => s.lead_enrollment === currentUser?.enrollment_id) || societies[0];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isNewSocietyModalOpen, setIsNewSocietyModalOpen] = useState(false);

  // New Society form state
  const [socName, setSocName] = useState('');
  const [socCode, setSocCode] = useState('');
  const [socDesc, setSocDesc] = useState('');
  const [socDept, setSocDept] = useState(currentUser?.department || 'Department of Computer Science & Software Engineering');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState<EventCategory>('Tech');
  const [eventFloor, setEventFloor] = useState<CampusFloor>('1st');
  const [eventLab, setEventLab] = useState('High-Tech AI & Data Science Lab');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('14:00');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('17:00');
  const [eventCapacity, setEventCapacity] = useState(60);

  const [flashMessage, setFlashMessage] = useState('');
  const [flashCategory, setFlashCategory] = useState<'urgent' | 'highlight' | 'reminder'>('urgent');

  const selectedFloorFacilities = BU_H11_FLOORS.find((f) => f.floor === eventFloor)?.facilities || [];

  const myEvents = useMemo(() => {
    if (!currentSociety) return [];
    return events.filter((e) => e.society_id === currentSociety.id);
  }, [events, currentSociety]);

  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socName.trim() || !socCode.trim()) return;

    await createSociety({
      name: socName.trim(),
      code: socCode.trim(),
      description: socDesc.trim() || 'Official student society of BU H-11 Campus.',
      department: socDept,
    });

    setIsNewSocietyModalOpen(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !currentSociety) return;

    const startDateTime = eventStartDate
      ? new Date(`${eventStartDate}T${eventStartTime}`).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    const endDateTime = eventEndDate
      ? new Date(`${eventEndDate}T${eventEndTime}`).toISOString()
      : new Date(Date.now() + 4 * 3600 * 1000).toISOString();

    await addEvent({
      title: eventTitle.trim(),
      description: eventDescription || 'Official BU H-11 campus event.',
      category: eventCategory,
      location_name: `${eventLab} (${eventFloor} Floor, H-11 Block)`,
      floor: eventFloor,
      lab_name: eventLab,
      latitude: BU_H11_COORDINATES.lat,
      longitude: BU_H11_COORDINATES.lng,
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
    if (!flashMessage.trim() || !currentSociety) return;

    await addAnnouncement({
      message: flashMessage,
      category: flashCategory,
      society_name: currentSociety.name,
    });

    setFlashMessage('');
    setIsFlashModalOpen(false);
  };

  if (!isSocietyAdmin && !isDeveloper) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-navy-850 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Society Executive Privileges Required</h2>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          You are currently viewing in <strong>{role.toUpperCase()}</strong> mode. To manage BU H-11 societies and draft event proposals, switch your active mode:
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
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-navy-900 border border-gold-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-gold-500/30 text-xs font-semibold text-gold-300 mb-2">
            <span>BU (Bahria University H-11 CAMPUS) • Executive Workspace</span>
          </div>

          {currentSociety ? (
            <div className="flex items-center space-x-4 mt-2">
              <img
                src={currentSociety.logo_url}
                alt=""
                className="w-14 h-14 rounded-2xl border-2 border-gold-500/40 object-cover shadow-gold"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{currentSociety.name}</h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Lead: {currentSociety.lead_name} ({currentSociety.lead_enrollment}) • {currentSociety.department}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black text-white">No Society Registered Yet</h1>
              <p className="text-xs text-slate-400 mt-1">
                You are authenticated as a Society Head. Click below to charter your new society at BU H-11 Campus.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!currentSociety ? (
            <button
              onClick={() => setIsNewSocietyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              <span>Charter New Society</span>
            </button>
          ) : (
            <>
              <Link
                href="/chat"
                className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 text-xs font-bold border border-gold-500/30 transition-colors flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                <span>Society Chat Room</span>
              </Link>

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
            </>
          )}
        </div>
      </div>

      {/* Events Queue Table */}
      <div className="rounded-3xl bg-navy-900 border border-navy-750 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-navy-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">BU H-11 Venue Booking Proposals</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit lab and auditorium clearance requests to department chairpersons.
            </p>
          </div>
          {currentSociety && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black uppercase tracking-wider shadow-gold"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              <span>New Proposal</span>
            </button>
          )}
        </div>

        {myEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-sm font-bold text-white">No Event Proposals Created</h3>
            <p className="text-xs max-w-sm mx-auto">
              Draft an event for the AI Lab (1st Floor), Robotics Arena (2nd Floor), or Sir Syed Auditorium (Ground Floor).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-navy-950/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="px-6 py-3.5">Event Title</th>
                  <th className="px-6 py-3.5">Floor &amp; Lab</th>
                  <th className="px-6 py-3.5">Schedule</th>
                  <th className="px-6 py-3.5">HOD Clearance</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {myEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-white text-xs">{ev.title}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-200 block">{ev.location_name}</span>
                      <span className="text-[10px] text-gold-400 font-mono">Floor: {ev.floor}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      • {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      {ev.approved_by_hod ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approved (Live)</span>
                        </span>
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

      {/* CREATE EVENT MODAL WITH BU H-11 FLOOR & LAB SELECTOR */}
      {isCreateModalOpen && currentSociety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-navy-900 border border-gold-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-bold text-white">Draft BU H-11 Event Proposal</h3>
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
                  placeholder="e.g. AI Prompt Challenge or Robotics Face-Off"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as EventCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:border-gold-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={eventCapacity}
                    onChange={(e) => setEventCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:border-gold-500"
                  />
                </div>
              </div>

              {/* BU H-11 Floor & Lab Architecture Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-navy-950 border border-navy-800">
                <div>
                  <label className="block text-xs font-semibold text-gold-300 mb-1">
                    BU H-11 Floor *
                  </label>
                  <select
                    value={eventFloor}
                    onChange={(e) => {
                      const f = e.target.value as CampusFloor;
                      setEventFloor(f);
                      const facs = BU_H11_FLOORS.find((fl) => fl.floor === f)?.facilities || [];
                      if (facs.length > 0) setEventLab(facs[0].name);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                  >
                    <option value="Ground">Ground Floor (Auditorium &amp; Quad)</option>
                    <option value="1st">1st Floor (Computer Science &amp; SE Labs)</option>
                    <option value="2nd">2nd Floor (Electrical &amp; Robotics Labs)</option>
                    <option value="3rd">3rd Floor (Earth Sciences &amp; Media Studio)</option>
                    <option value="Outdoor">Outdoor Campus Grounds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold-300 mb-1">
                    Specific Lab / Hall Facility *
                  </label>
                  <select
                    value={eventLab}
                    onChange={(e) => setEventLab(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                  >
                    {selectedFloorFacilities.map((fac) => (
                      <option key={fac.name} value={fac.name}>
                        {fac.name} (Cap: {fac.capacity})
                      </option>
                    ))}
                  </select>
                </div>
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
                  placeholder="Outline key activities, student prerequisites, and agenda..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:border-gold-500"
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
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Submit Proposal to HOD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHARTER NEW SOCIETY MODAL */}
      {isNewSocietyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Charter New Society at BU H-11</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter society details. A private executive chat room will automatically be established for your team.
            </p>

            <form onSubmit={handleCreateSociety} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Society Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BU H-11 Autonomous Robotics Society"
                  value={socName}
                  onChange={(e) => setSocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Acronym Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARS"
                  value={socCode}
                  onChange={(e) => setSocCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={socDept}
                  onChange={(e) => setSocDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                >
                  <option value="Department of Computer Science & Software Engineering">
                    Department of Computer Science &amp; Software Engineering
                  </option>
                  <option value="Department of Electrical Engineering & Robotics">
                    Department of Electrical Engineering &amp; Robotics
                  </option>
                  <option value="Department of Earth & Environmental Sciences">
                    Department of Earth &amp; Environmental Sciences
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Charter Description</label>
                <textarea
                  rows={2}
                  placeholder="Mission statement and student activities..."
                  value={socDesc}
                  onChange={(e) => setSocDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsNewSocietyModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Register Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLASH ANNOUNCEMENT MODAL */}
      {isFlashModalOpen && currentSociety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Broadcast BU H-11 Campus Flash</h3>

            <form onSubmit={handleBroadcastFlash} className="space-y-4">
              <div>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Coding jam registration is open at 1st Floor AI Lab!"
                  value={flashMessage}
                  onChange={(e) => setFlashMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsFlashModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
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
    </div>
  );
}
