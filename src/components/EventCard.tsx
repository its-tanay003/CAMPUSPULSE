import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { CampusEvent } from '../types';
import { useApp } from '../context/AppContext';

interface EventCardProps {
  event: CampusEvent;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, compact = false }) => {
  const { toggleSaveEvent, isEventSaved, isEventRegistered } = useApp();
  const saved = isEventSaved(event.id);
  const registered = isEventRegistered(event.id);

  const startDate = new Date(event.start_time);
  const dateFormatted = startDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const timeFormatted = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article
      className={`group bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md hover:border-[#7C5CFC]/60 hover:shadow-xl transition-all duration-300 flex flex-col ${
        compact ? 'p-3' : 'p-0'
      }`}
    >
      {/* Cover Image & Category Badges */}
      {!compact && (
        <div className="relative h-44 w-full bg-[#0B1020] overflow-hidden">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={`Poster for ${event.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151C2F] via-transparent to-transparent pointer-events-none" />

          {/* Top category chip */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#151C2F]/90 backdrop-blur-md text-[#38BDF8] border border-[#334155] shadow">
              {event.category}
            </span>
            {event.cost === 'Free' ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                Free Entry
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                {event.cost}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {event.status === 'published' && (
              <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Approved
              </span>
            )}
            {event.status === 'pending_review' && (
              <span className="bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Under Review
              </span>
            )}
            {event.status === 'cancelled' && (
              <span className="bg-rose-500/30 backdrop-blur-md text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Cancelled
              </span>
            )}
            {event.status === 'draft' && (
              <span className="bg-slate-800/80 backdrop-blur-md text-[#94A3B8] border border-[#334155] text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Draft
              </span>
            )}
          </div>

          {/* Save Action Floating on Image */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleSaveEvent(event.id);
            }}
            aria-label={saved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
            className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-all ${
              saved 
                ? 'bg-[#7C5CFC] text-white ring-2 ring-[#7C5CFC]/50' 
                : 'bg-[#151C2F]/80 backdrop-blur-md text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC] border border-[#334155]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organiser line */}
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1.5 font-medium">
            <span className="truncate">{event.organization?.name || 'Campus Organiser'}</span>
            {event.organization?.is_verified && (
              <span className="text-[10px] bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 font-bold px-1.5 py-0.5 rounded">
                Verified
              </span>
            )}
          </div>

          {/* Title with link */}
          <h3 className="font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors line-clamp-2 text-base leading-snug">
            <Link to={`/events/${event.id}`}>
              {event.title}
            </Link>
          </h3>

          {/* Date, Time & Venue in Readable Plain Text */}
          <div className="mt-3.5 space-y-2 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="font-semibold text-[#F8FAFC]">{dateFormatted}</span>
              <span className="text-[#334155]">·</span>
              <span>{timeFormatted}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
              <span className="truncate">{event.venue?.name || 'On-campus'}</span>
            </div>
          </div>
        </div>

        {/* Footer info: Registered indicator & CTA */}
        <div className="mt-5 pt-3.5 border-t border-[#334155] flex items-center justify-between text-xs">
          <div>
            {registered ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Registered
              </span>
            ) : saved ? (
              <span className="text-purple-300 font-semibold bg-[#7C5CFC]/20 px-2 py-0.5 rounded-lg border border-[#7C5CFC]/30">
                Saved in schedule
              </span>
            ) : (
              <span className="text-[#94A3B8] text-[11px]">
                {event.target_audience}
              </span>
            )}
          </div>

          <Link
            to={`/events/${event.id}`}
            className="text-[#38BDF8] hover:text-cyan-300 font-bold flex items-center gap-1 transition"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
};
