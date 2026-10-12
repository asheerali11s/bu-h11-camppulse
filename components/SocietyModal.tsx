'use client';

import React from 'react';
import { Society, CampusEvent } from '@/types';
import { X, Users, Mail, Instagram, Sparkles, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { downloadEventICS } from '@/utils/calendar';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative p-6 flex items-end">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pt-0 pb-6 -mt-12 flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4">
            <div className="flex items-end space-x-4">
              <img
                src={society.logo_url}
                alt={society.name}
                className="w-24 h-24 rounded-2xl border-4 border-slate-900 object-cover shadow-xl bg-slate-800"
              />
              <div className="mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white">{society.name}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <span>{society.category || 'Student Club'}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{society.member_count || 120} members</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Recruitment Badge */}
            <div className="shrink-0">
              {society.is_recruiting ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RECRUITING EXECS NOW!</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
                  <span>Applications Closed</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio / Description */}
          <div className="mb-6 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              About This Society
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{society.description}</p>
          </div>

          {/* Contact & Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>{society.contact_email || 'society@campus.edu'}</span>
            </div>
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>{society.instagram_handle || '@campus_society'}</span>
            </div>
          </div>

          {/* Active Events Hosted By Society */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Hosted Campus Events ({societyEvents.length})</span>
            </h4>

            {societyEvents.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No active public events scheduled right now.
              </p>
            ) : (
              <div className="space-y-2.5">
                {societyEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-200">{ev.title}</h5>
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px] mt-0.5">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{ev.location_name}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadEventICS(ev)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition-colors text-[11px] font-semibold"
                    >
                      📅 .ics
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
