'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
} from 'lucide-react';

export default function DepartmentHODPage() {
  const { isHod, isDeveloper } = useUserRole();
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
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-[#0f2b5c] shadow-sm">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Department Head Clearance Access</h2>
        <p className="text-slate-500 text-xs max-w-md mx-auto">
          The HOD Queue is restricted to Department Chairpersons for auditorium bookings and venue approvals.
          Elevated department access is granted exclusively by the Platform Administrator.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm transition-all"
        >
          <span>Return to Campus Feed</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Department Header */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0f2b5c] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Venue Clearance Desk • {currentDept.code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Department Venue &amp; Hall Clearance Queue
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Chairperson: <strong>{currentDept.hod_name}</strong> • Department of {currentDept.name}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-2xl font-bold text-[#0f2b5c] font-mono">{pendingEvents.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Pending Queue
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-2xl font-bold text-emerald-700 font-mono">{approvedDeptEvents.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Cleared Halls
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#0f2b5c]" />
            <h2 className="text-sm font-bold text-slate-900">
              Pending Venue Requests ({pendingEvents.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Automated schedule conflict verification active</span>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">All Venue Requests Cleared</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                  className={`p-6 rounded-2xl bg-white border transition-all shadow-sm ${
                    hasClash
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {ev.category}
                        </span>

                        <span className="text-xs text-slate-500">
                          Organizer:{' '}
                          <strong className="text-slate-800">{ev.society?.name || 'Society'}</strong>
                        </span>

                        {hasClash ? (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Schedule Conflict Detected ({conflicts.length} Overlap)</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Venue Slot Free</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">{ev.location_name}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                          <strong>Conflict Notice:</strong> Another booking is scheduled at{' '}
                          <strong>{ev.location_name}</strong> during this slot. Please suggest an alternative hall.
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleApprove(ev.id)}
                        className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Clear &amp; Approve</span>
                      </button>

                      <button
                        onClick={() => setRejectingEvent(ev)}
                        className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <XCircle className="w-4 h-4 text-rose-500" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Venue Rejection / Reschedule Note</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide feedback to the society head regarding why venue clearance was withheld.
            </p>

            <textarea
              required
              rows={4}
              placeholder="e.g. Venue is reserved for mid-term exams. Please reschedule or request CS Lab 2."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setRejectingEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
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
