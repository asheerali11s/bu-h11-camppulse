'use client';

import React from 'react';
import { CampusEvent } from '@/types';
import { downloadEventICS, getGoogleCalendarLink } from '@/utils/calendar';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Users,
  Download,
  Share2,
  ExternalLink,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  onOpenSocietyModal?: (societyId: string) => void;
  onFocusOnMap?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onOpenSocietyModal,
  onFocusOnMap,
}) => {
  const { toggleBookmark, rsvpEvent } = useApp();

  const now = new Date();
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const isHappeningNow =
    (now >= startTime && now <= endTime) ||
    (startTime.getTime() - now.getTime() > 0 &&
      startTime.getTime() - now.getTime() <= 2 * 60 * 60 * 1000);

  const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
    Tech: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    Sports: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    Drama: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    'Free Food': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Workshops: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    Music: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    Academic: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  };

  const currentCat = categoryStyles[event.category] || categoryStyles.Tech;

  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = `${startTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${endTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  return (
    <div
      className={`group relative rounded-2xl bg-slate-900 border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${
        isHappeningNow
          ? 'border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-emerald-900/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Banner Accents */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${currentCat.bg} ${currentCat.text} ${currentCat.border}`}
            >
              {event.category}
            </span>

            {isHappeningNow && (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>HAPPENING NOW</span>
              </span>
            )}
          </div>

          <button
            onClick={() => toggleBookmark(event.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              event.is_bookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
            }`}
            title={event.is_bookmarked ? 'Saved to bookmarks' : 'Bookmark event'}
          >
            <Bookmark className={`w-4 h-4 ${event.is_bookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
          {event.title}
        </h3>

        {/* Society Header */}
        <button
          onClick={() => onOpenSocietyModal && event.society_id && onOpenSocietyModal(event.society_id)}
          className="flex items-center space-x-2 text-xs text-slate-400 hover:text-indigo-400 transition-colors mb-3 group/soc"
        >
          {event.society?.logo_url && (
            <img
              src={event.society.logo_url}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-slate-700"
            />
          )}
          <span className="font-medium underline-offset-2 group-hover/soc:underline">
            {event.society?.name || 'Campus Society'}
          </span>
          {event.society?.is_recruiting && (
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
              Recruiting!
            </span>
          )}
        </button>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Location & Time specs */}
        <div className="space-y-1.5 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-200">{formattedDate}</span>
            <span className="text-slate-500">•</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />
            <span className="text-slate-400">{formattedTime}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>

            {onFocusOnMap && (
              <button
                onClick={() => onFocusOnMap(event)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline shrink-0 ml-2"
              >
                Pin on Map
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>
            <strong className="text-slate-200 font-semibold">{event.attendee_count || 0}</strong>
            {event.capacity ? ` / ${event.capacity}` : ''} attending
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick RSVP Button */}
          <button
            onClick={() => rsvpEvent(event.id)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center space-x-1"
          >
            <CheckCircle className="w-3 h-3 text-indigo-400" />
            <span>RSVP</span>
          </button>

          {/* One-click .ics Calendar Export */}
          <button
            onClick={() => downloadEventICS(event)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center"
            title="Download .ics file for Apple, Google, or Outlook calendar sync"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
