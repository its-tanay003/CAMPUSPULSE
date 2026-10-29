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
      className={`group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
        compact ? 'p-3' : 'p-0'
      }`}
    >
      {/* Cover Image & Category Badges */}
      {!compact && (
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={`Poster for ${event.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Top category chip */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/95 text-slate-800 shadow">
              {event.category}
            </span>
            {event.cost === 'Free' ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-600/90 text-white shadow">
                Free Entry
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600/90 text-white shadow">
                {event.cost}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {event.status === 'published' && (
              <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Approved
              </span>
            )}
            {event.status === 'pending_review' && (
              <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Under Review
              </span>
            )}
            {event.status === 'cancelled' && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Cancelled
              </span>
            )}
            {event.status === 'draft' && (
              <span className="bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
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
            className={`absolute bottom-3 right-3 p-2 rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              saved 
                ? 'bg-amber-500 text-white ring-2 ring-white' 
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-amber-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Organiser line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
            <span className="truncate">{event.organization?.name || 'Campus Organiser'}</span>
            {event.organization?.is_verified && (
              <span className="inline-block text-[10px] bg-blue-100 text-blue-700 font-semibold px-1 rounded">
                Verified
              </span>
            )}
          </div>

          {/* Title with link */}
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 text-base leading-snug">
            <Link to={`/events/${event.id}`} className="focus:outline-none focus:underline">
              {event.title}
            </Link>
          </h3>

          {/* Date, Time & Venue */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-medium text-slate-800">{dateFormatted}</span>
              <span className="text-slate-400">·</span>
              <span>{timeFormatted}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue?.name || 'On-campus'}</span>
            </div>
          </div>
        </div>

        {/* Footer info: Registered indicator & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            {registered ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Registered
              </span>
            ) : saved ? (
              <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                Saved in schedule
              </span>
            ) : (
              <span className="text-slate-400">
                {event.target_audience}
              </span>
            )}
          </div>

          <Link
            to={`/events/${event.id}`}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 focus:outline-none focus:underline"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
};

