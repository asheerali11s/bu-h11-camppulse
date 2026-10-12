'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { CampusEvent } from '@/types';
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Building,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function DepartmentHODPage() {
  const { role, isHod, isDeveloper, switchRole } = useUserRole();
  const { events, approveEvent, rejectEvent, departments } = useApp();

  const [rejectingEvent, setRejectingEvent] = useState<CampusEvent | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedVenueFilter, setSelectedVenueFilter] = useState<string>('All');

  // HOD's active department (CS Department by default)
  const currentDept = departments[0];

  // Pending events queue awaiting HOD decision
  const pendingEvents = events.filter((e) => !e.approved_by_hod && !e.rejection_reason);
  const approvedDeptEvents = events.filter((e) => e.approved_by_hod);

  // Venue Clash Detection Engine
  const detectClash = (targetEvent: CampusEvent) => {
    const targetStart = new Date(targetEvent.start_time).getTime();
    const targetEnd = new Date(targetEvent.end_time).getTime();

    const conflicts = events.filter((other) => {
      if (other.id === targetEvent.id) return false;
      if (other.location_name !== targetEvent.location_name) return false;

      const otherStart = new Date(other.start_time).getTime();
      const otherEnd = new Date(other.end_time).getTime();

      // Check overlap
      return (
        (targetStart >= otherStart && targetStart < otherEnd) ||
        (targetEnd > otherStart && targetEnd <= otherEnd) ||
        (targetStart <= otherStart && targetEnd >= otherEnd)
      );
    });

    return conflicts;
  };

  const handleApprove = async (eventId: string) => {
    // Fire celebratory confetti on approval
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback if canvas not available
    }

    await approveEvent(eventId);
  };

  const handleConfirmReject = async () => {
    if (!rejectingEvent || !rejectReason.trim()) return;
    await rejectEvent(rejectingEvent.id, rejectReason);
    setRejectingEvent(null);
    setRejectReason('');
  };

  // If user role doesn't have permission
  if (!isHod && !isDeveloper) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Department Head Access Restricted</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          The HOD Queue is reserved for Department Heads to approve hall allocations and prevent
          scheduling conflicts. Switch to HOD mode to review:
        </p>
        <button
          onClick={() => switchRole('hod')}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-600/30 transition-all inline-flex items-center space-x-2"
        >
          <span>🏛️ Switch to HOD Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Department Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-800/40 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Department Approval Authority • {currentDept.code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Department Venue & Event Clearance Queue
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Chairperson: <strong>{currentDept.hod_name}</strong> • Department of {currentDept.name}
          </p>
        </div>

        {/* Queue Metrics */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[110px]">
            <div className="text-2xl font-black text-amber-400">{pendingEvents.length}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Pending Queue
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[110px]">
            <div className="text-2xl font-black text-emerald-400">{approvedDeptEvents.length}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Cleared Halls
            </div>
          </div>
        </div>
      </div>

      {/* Pending Event Review Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              Action Items: Society Event Requests ({pendingEvents.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Automated conflict analysis active for all rooms
          </span>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">All Venue Clearances Up-to-Date!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no pending events waiting for hall allocation. New requests from society
              execs will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingEvents.map((ev) => {
              const conflicts = detectClash(ev);
              const hasClash = conflicts.length > 0;

              return (
                <div
                  key={ev.id}
                  className={`p-6 rounded-3xl bg-slate-900 border transition-all ${
                    hasClash
                      ? 'border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Event summary */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {ev.category}
                        </span>

                        <span className="text-xs text-slate-400 flex items-center space-x-1">
                          <span>Society:</span>
                          <strong className="text-slate-200">{ev.society?.name || 'Club'}</strong>
                        </span>

                        {hasClash ? (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>VENUE CLASH DETECTED! ({conflicts.length} Overlap)</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Venue Slot Free</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white">{ev.title}</h3>
                      <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                        {ev.description}
                      </p>

                      {/* Specs */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-semibold">{ev.location_name}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {new Date(ev.start_time).toLocaleDateString([], {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {new Date(ev.start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(ev.end_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Capacity: {ev.capacity || 100}</span>
                        </div>
                      </div>

                      {/* Overlapping warning banner */}
                      {hasClash && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 space-y-1">
                          <div className="font-bold flex items-center space-x-1.5 text-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Schedule Conflict Details:</span>
                          </div>
                          <p className="text-rose-300/80">
                            Another event is already scheduled at <strong>{ev.location_name}</strong>{' '}
                            during this timeframe ({conflicts.map((c) => c.title).join(', ')}).
                            Please request a reschedule or suggest an alternative hall.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleApprove(ev.id)}
                        className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Hall Booking</span>
                      </button>

                      <button
                        onClick={() => setRejectingEvent(ev)}
                        className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Reject / Feedback</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Department Venue Utilization Overview */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-indigo-400" />
              <span>Department Venue Utilization Overview</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status and scheduled timeline across campus auditoriums, labs, and courtyards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentDept.venues.map((venueName) => {
            const venueEvents = events.filter(
              (e) => e.location_name.includes(venueName) && e.approved_by_hod
            );
            const isCurrentlyOccupied = venueEvents.some((e) => {
              const now = Date.now();
              return (
                now >= new Date(e.start_time).getTime() &&
                now <= new Date(e.end_time).getTime()
              );
            });

            return (
              <div
                key={venueName}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">{venueName}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCurrentlyOccupied
                        ? 'bg-rose-500 animate-ping'
                        : venueEvents.length > 0
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Status:</span>
                  <strong
                    className={
                      isCurrentlyOccupied
                        ? 'text-rose-400'
                        : venueEvents.length > 0
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }
                  >
                    {isCurrentlyOccupied
                      ? 'In Session Now'
                      : venueEvents.length > 0
                      ? `${venueEvents.length} Scheduled`
                      : 'Available'}
                  </strong>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                  {venueEvents.length > 0 ? (
                    <span className="truncate block">Next: {venueEvents[0].title}</span>
                  ) : (
                    <span>No upcoming bookings</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* REJECTION REASON MODAL */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Reject Event Request or Request Reschedule
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Event: <strong>{rejectingEvent.title}</strong>
              <br />
              Provide constructive feedback to the society execs regarding why this venue request
              was denied or suggestions for rescheduling.
            </p>

            <textarea
              required
              rows={4}
              placeholder="e.g. Venue is booked for department faculty meeting. Please reschedule to Friday 3:00 PM or request Seminar Hall B instead."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setRejectingEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
