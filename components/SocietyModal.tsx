'use client';

import React from 'react';
import { Society, CampusEvent } from '@/types';
import { X, Users, Mail, MapPin, Building, MessageSquare, Calendar } from 'lucide-react';
import { downloadEventICS } from '@/utils/calendar';
import Link from 'next/link';

interface SocietyModalProps {
  society: Society | null;
  events: CampusEvent[];
  isOpen: boolean;
  onClose: () => void;
}

export const SocietyModal: React.FC<SocietyModalProps> = ({
  society,
  events,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !society) return null;

  const societyEvents = events.filter((e) => e.society_id === society.id && e.approved_by_hod);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header Banner */}
        <div className="h-28 bg-[#0f2b5c] border-b border-slate-200 relative p-6 flex items-end">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pt-0 pb-6 -mt-10 flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4">
            <div className="flex items-end space-x-4">
              <img
                src={society.logo_url}
                alt={society.name}
                className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md bg-slate-100"
              />
              <div className="mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{society.name}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span className="font-mono text-[#0f2b5c] font-bold">{society.code}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{society.member_count || 80} members</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Recruitment Badge */}
            <div className="shrink-0">
              {society.is_recruiting ? (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <span>Recruiting Members</span>
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                  <span>Applications Closed</span>
                </div>
              )}
            </div>
          </div>

          {/* Department Tag & Lead Info */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-700">
            <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Department: <strong>{society.department}</strong></span>
            </span>
            <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-1.5">
              <span className="text-[#0f2b5c] font-bold">President:</span>
              <span>{society.lead_name} ({society.lead_enrollment})</span>
            </span>
          </div>

          {/* Bio / Description */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Society Charter &amp; Mission
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{society.description}</p>
          </div>

          {/* Contact & Group Chat Trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{society.contact_email || 'society@bahria.edu.pk'}</span>
            </div>
            <Link
              href="/chat"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-[#0f2b5c] font-semibold transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#0f2b5c]" />
                <span>Open Notice Board</span>
              </div>
              <span className="text-[10px] text-slate-400">View Channel &rarr;</span>
            </Link>
          </div>

          {/* Active Events Hosted By Society */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Cleared Campus Events ({societyEvents.length})</span>
            </h4>

            {societyEvents.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No active approved events on the campus radar right now.
              </p>
            ) : (
              <div className="space-y-2.5">
                {societyEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-sm"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900">{ev.title}</h5>
                      <div className="flex items-center space-x-2 text-slate-500 text-[11px] mt-0.5">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{ev.location_name}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadEventICS(ev)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors text-[11px] font-semibold flex items-center space-x-1.5"
                    >
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Export (.ics)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
