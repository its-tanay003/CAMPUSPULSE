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
      className={`group glass-card rounded-3xl overflow-hidden hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/40 transition-all duration-300 flex flex-col relative ${
        compact ? 'p-3.5' : 'p-0'
      }`}
    >
      {/* Cover Image & Category Badges */}
      {!compact && (
        <div className="relative h-48 w-full bg-[#050814] overflow-hidden">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={`Poster for ${event.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1326] via-[#0D1326]/40 to-transparent pointer-events-none" />

          {/* Top category chip */}
          <div className="absolute top-3.5 left-3.5 flex gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#0D1326]/80 backdrop-blur-md text-cyan-300 border border-white/10 shadow-lg">
              {event.category}
            </span>
            {event.cost === 'Free' ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                Free Entry
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                {event.cost}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
            {event.status === 'published' && (
              <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
              </span>
            )}
            {event.status === 'pending_review' && (
              <span className="bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" /> Under Review
              </span>
            )}
            {event.status === 'cancelled' && (
              <span className="bg-rose-500/30 backdrop-blur-md text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow">
                Cancelled
              </span>
            )}
            {event.status === 'draft' && (
              <span className="bg-slate-800/80 backdrop-blur-md text-slate-300 border border-white/10 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow">
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
            aria-label={saved ? `Remove ${event.title} from saved schedule` : `Save ${event.title} to my schedule`}
            aria-pressed={saved}
            className={`absolute bottom-3.5 right-3.5 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl shadow-xl transition-all ${
              saved 
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-indigo-600/40' 
                : 'bg-[#050814]/80 backdrop-blur-md text-slate-300 hover:text-white border border-white/15 hover:border-white/30'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-cyan-300' : ''}`} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Organiser line */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <span className="truncate">{event.organization?.name || 'Campus Organiser'}</span>
            {event.organization?.is_verified && (
              <span className="text-[10px] bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 font-semibold px-2 py-0.5 rounded-full font-mono">
                Verified
              </span>
            )}
          </div>

          {/* Title with link */}
          <h3 className="font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 text-base sm:text-lg leading-snug tracking-tight">
            <Link to={`/events/${event.id}`}>
              {event.title}
            </Link>
          </h3>

          {/* Date, Time & Venue in Readable Plain Text */}
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-200">{dateFormatted}</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">{timeFormatted}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">{event.venue?.name || 'On-campus'}</span>
            </div>
          </div>
        </div>

        {/* Footer info: Registered indicator & CTA */}
        <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between text-xs">
          <div>
            {registered ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Registered
              </span>
            ) : saved ? (
              <span className="text-indigo-300 font-semibold bg-indigo-500/15 px-2.5 py-1 rounded-xl border border-indigo-500/30 font-mono text-[11px]">
                Saved in schedule
              </span>
            ) : (
              <span className="text-slate-400 text-[11px] truncate max-w-[140px] sm:max-w-none">
                {event.target_audience}
              </span>
            )}
          </div>

          <Link
            to={`/events/${event.id}`}
            aria-label={`View details and registration for ${event.title}`}
            className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 transition p-1.5 min-h-[36px] group-hover:translate-x-0.5"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
};
