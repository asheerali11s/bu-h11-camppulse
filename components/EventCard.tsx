'use client';

import React from 'react';
import { CampusEvent } from '@/types';
import { downloadEventICS } from '@/utils/calendar';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Users,
  Download,
  Flame,
  CheckCircle,
  Building,
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
      className={`group relative rounded-3xl bg-navy-900 border transition-all duration-300 hover:shadow-2xl hover:border-gold-500/40 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${
        isHappeningNow
          ? 'border-gold-400/60 ring-1 ring-gold-400/40 shadow-gold'
          : 'border-navy-750'
      }`}
    >
      {/* Top Banner Accents */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-navy-950 text-gold-300 border border-gold-500/30">
              {event.category}
            </span>

            {isHappeningNow && (
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/40 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-gold-400" />
                <span>HAPPENING NOW</span>
              </span>
            )}
          </div>

          <button
            onClick={() => toggleBookmark(event.id)}
            className={`p-1.5 rounded-xl border transition-colors ${
              event.is_bookmarked
                ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-navy-800'
            }`}
            title={event.is_bookmarked ? 'Saved to bookmarks' : 'Bookmark event'}
          >
            <Bookmark className={`w-4 h-4 ${event.is_bookmarked ? 'fill-gold-400 text-gold-400' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors line-clamp-1 mb-1.5">
          {event.title}
        </h3>

        {/* Society Header */}
        <button
          onClick={() => onOpenSocietyModal && event.society_id && onOpenSocietyModal(event.society_id)}
          className="flex items-center space-x-2 text-xs text-slate-300 hover:text-gold-300 transition-colors mb-3 group/soc"
        >
          {event.society?.logo_url && (
            <img
              src={event.society.logo_url}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-gold-500/30"
            />
          )}
          <span className="font-semibold underline-offset-2 group-hover/soc:underline">
            {event.society?.name || 'Campus Society'}
          </span>
          {event.society?.is_recruiting && (
            <span className="bg-emerald-500/10 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
              Recruiting!
            </span>
          )}
        </button>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Location & Time specs */}
        <div className="space-y-1.5 text-xs text-slate-300 pt-3 border-t border-navy-800">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className="font-semibold text-slate-200">{formattedDate}</span>
            <span className="text-slate-600">•</span>
            <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0 ml-1" />
            <span className="text-slate-400 font-mono text-[11px]">{formattedTime}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center space-x-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </div>

            {onFocusOnMap && (
              <button
                onClick={() => onFocusOnMap(event)}
                className="text-[11px] text-gold-400 hover:text-gold-300 font-bold underline shrink-0 ml-2"
              >
                Pin on Map
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-6 py-3.5 bg-navy-950/70 border-t border-navy-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>
            <strong className="text-slate-200 font-semibold">{event.attendee_count || 0}</strong>
            {event.capacity ? ` / ${event.capacity}` : ''} RSVPs
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick RSVP Button */}
          <button
            onClick={() => rsvpEvent(event.id)}
            className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1 shadow-gold"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>RSVP</span>
          </button>

          {/* One-click .ics Calendar Export */}
          <button
            onClick={() => downloadEventICS(event)}
            className="p-2 rounded-xl bg-navy-900 hover:bg-navy-850 text-gold-400 border border-navy-700 hover:border-gold-500/40 text-xs font-medium transition-colors"
            title="Download .ics file for Apple, Google, or Outlook calendar sync"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
