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
  GraduationCap,
} from 'lucide-react';

export default function DepartmentHODPage() {
  const { role, isHod, isDeveloper, switchRole } = useUserRole();
  const { events, approveEvent, rejectEvent, departments } = useApp();

  const [rejectingEvent, setRejectingEvent] = useState<CampusEvent | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const currentDept = departments[0];
  const pendingEvents = events.filter((e) => !e.approved_by_hod && !e.rejection_reason);
  const approvedDeptEvents = events.filter((e) => e.approved_by_hod);

  // Clash Detection
  const detectClash = (targetEvent: CampusEvent) => {
    const targetStart = new Date(targetEvent.start_time).getTime();
    const targetEnd = new Date(targetEvent.end_time).getTime();

    const conflicts = events.filter((other) => {
      if (other.id === targetEvent.id) return false;
      if (other.location_name !== targetEvent.location_name) return false;

      const otherStart = new Date(other.start_time).getTime();
      const otherEnd = new Date(other.end_time).getTime();

      return (
        (targetStart >= otherStart && targetStart < otherEnd) ||
        (targetEnd > otherStart && targetEnd <= otherEnd) ||
        (targetStart <= otherStart && targetEnd >= otherEnd)
      );
    });

    return conflicts;
  };

  const handleApprove = async (eventId: string) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
    await approveEvent(eventId);
  };

  const handleConfirmReject = async () => {
    if (!rejectingEvent || !rejectReason.trim()) return;
    await rejectEvent(rejectingEvent.id, rejectReason);
    setRejectingEvent(null);
    setRejectReason('');
  };

  if (!isHod && !isDeveloper) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-navy-850 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Department Head Clearance Access</h2>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          The HOD Queue is restricted to Department Chairpersons for auditorium bookings and conflict
          mitigation. Switch your active role to HOD to review requests:
        </p>
        <button
          onClick={() => switchRole('hod')}
          className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all"
        >
          <span>🏛️ Switch to HOD Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Department Header */}
      <div className="rounded-3xl bg-navy-900 border border-gold-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-gold-500/30 text-xs font-semibold text-gold-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Official Venue Clearance Desk • {currentDept.code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Department Venue &amp; Hall Clearance Queue
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Chairperson: <strong>{currentDept.hod_name}</strong> • Department of {currentDept.name}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-700 text-center min-w-[110px]">
            <div className="text-2xl font-black text-gold-400 font-mono">{pendingEvents.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Pending Queue
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-navy-850 border border-navy-700 text-center min-w-[110px]">
            <div className="text-2xl font-black text-emerald-400 font-mono">{approvedDeptEvents.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Cleared Halls
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gold-400" />
            <h2 className="text-base font-bold text-white">
              Pending Venue Requests ({pendingEvents.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Automated schedule conflict verification active</span>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-navy-900 border border-navy-750 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">All Venue Requests Cleared</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no pending society events awaiting auditorium or lab booking clearance.
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
                  className={`p-6 rounded-3xl bg-navy-900 border transition-all ${
                    hasClash
                      ? 'border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : 'border-navy-750 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-navy-950 text-gold-300 border border-gold-500/30">
                          {ev.category}
                        </span>

                        <span className="text-xs text-slate-400">
                          Organizer:{' '}
                          <strong className="text-slate-200">{ev.society?.name || 'Society'}</strong>
                        </span>

                        {hasClash ? (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>VENUE CLASH DETECTED! ({conflicts.length} Overlap)</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Venue Slot Free</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                      <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-400" />
                          <span className="font-semibold">{ev.location_name}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gold-400" />
                          <span>
                            {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            •{' '}
                            {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                            -{' '}
                            {new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {hasClash && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200">
                          <strong>Conflict Notice:</strong> Another booking is scheduled at{' '}
                          <strong>{ev.location_name}</strong> during this slot. Please suggest an alternative hall.
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleApprove(ev.id)}
                        className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider transition-all shadow-gold flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Clear &amp; Approve</span>
                      </button>

                      <button
                        onClick={() => setRejectingEvent(ev)}
                        className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
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

      {/* Rejection Modal */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Venue Rejection / Reschedule Note</h3>
            <p className="text-xs text-slate-400 mb-4">
              Provide feedback to the society head regarding why venue clearance was withheld.
            </p>

            <textarea
              required
              rows={4}
              placeholder="e.g. Venue is reserved for mid-term exams. Please reschedule or request CS Lab 2."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-navy-800 mt-4">
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
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
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
