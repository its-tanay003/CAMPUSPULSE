import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Bookmark, CheckCircle2, AlertCircle, ArrowUpRight, Trophy } from 'lucide-react';
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

  const isCompetition = event.category === 'Technology' || event.category === 'Academic' || event.title.toLowerCase().includes('hack') || event.title.toLowerCase().includes('challenge');

  return (
    <article
      className={`group cp-card overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative ${
        compact ? 'p-3.5' : 'p-0'
      }`}
    >
      {/* Cover Image & Category Badges */}
      {!compact && (
        <div className="relative h-48 w-full bg-[#F0EDFF] overflow-hidden">
          <img
            src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={`Poster for ${event.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11152B]/70 via-transparent to-transparent pointer-events-none" />

          {/* Top category chip */}
          <div className="absolute top-3.5 left-3.5 flex gap-1.5 flex-wrap z-10">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#11152B] border border-[#E7E9F0] shadow-xs">
              {event.category}
            </span>
            {isCompetition && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#11152B] text-[#C8F169] border border-[#C8F169]/40 flex items-center gap-1 shadow-xs font-mono">
                <Trophy className="w-3 h-3 text-[#C8F169]" /> Challenge
              </span>
            )}
            {event.cost === 'Free' ? (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#16A36A] text-white font-mono shadow-xs">
                Free Pass
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#5145E5] text-white font-mono shadow-xs">
                {event.cost}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 z-10">
            {event.status === 'published' && (
              <span className="bg-[#16A36A] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" /> Verified
              </span>
            )}
            {event.status === 'pending_review' && (
              <span className="bg-[#E9A23B] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-white" /> In Review
              </span>
            )}
            {event.status === 'cancelled' && (
              <span className="bg-[#E5484D] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow">
                Cancelled
              </span>
            )}
            {event.status === 'draft' && (
              <span className="bg-[#687087] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow">
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
            className={`absolute bottom-3.5 right-3.5 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl shadow-md transition-all cursor-pointer z-10 ${
              saved 
                ? 'bg-[#5145E5] text-[#C8F169] ring-2 ring-[#5145E5]' 
                : 'bg-white/95 backdrop-blur-md text-[#687087] hover:text-[#5145E5] border border-[#E7E9F0]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-[#C8F169]' : ''}`} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Organiser line */}
          <div className="flex items-center gap-2 text-xs text-[#687087] mb-2 font-medium">
            <span className="truncate">{event.organization?.name || 'Campus Chapter'}</span>
            {event.organization?.is_verified && (
              <span className="text-[10px] bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/30 font-bold px-2 py-0.5 rounded-full font-mono">
                Verified Chapter
              </span>
            )}
          </div>

          {/* Title with link */}
          <h3 className="font-extrabold text-[#11152B] group-hover:text-[#5145E5] transition-colors line-clamp-2 text-base sm:text-lg leading-snug tracking-tight">
            <Link to={`/events/${event.id}`}>
              {event.title}
            </Link>
          </h3>

          {/* Date, Time & Venue in Readable Plain Text */}
          <div className="mt-4 space-y-2 text-xs text-[#687087]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5145E5] shrink-0" />
              <span className="font-bold text-[#11152B]">{dateFormatted}</span>
              <span className="text-[#9299AA]">·</span>
              <span className="font-mono text-[#687087]">{timeFormatted}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5145E5] shrink-0" />
              <span className="truncate font-medium">{event.venue?.name || 'On-campus venue'}</span>
            </div>
          </div>
        </div>

        {/* Footer info: Registered indicator & CTA */}
        <div className="mt-5 pt-4 border-t border-[#E7E9F0] flex items-center justify-between text-xs">
          <div>
            {registered ? (
              <span className="inline-flex items-center gap-1.5 text-[#16A36A] font-bold bg-[#16A36A]/10 px-2.5 py-1 rounded-xl border border-[#16A36A]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" /> Registered
              </span>
            ) : saved ? (
              <span className="text-[#5145E5] font-bold bg-[#F0EDFF] px-2.5 py-1 rounded-xl border border-[#5145E5]/20 font-mono text-[11px]">
                Saved in Pass Wallet
              </span>
            ) : (
              <span className="text-[#9299AA] text-[11px] truncate max-w-[140px] sm:max-w-none">
                {event.target_audience}
              </span>
            )}
          </div>

          <Link
            to={`/events/${event.id}`}
            aria-label={`View details and registration for ${event.title}`}
            className="text-[#5145E5] hover:text-[#4338CA] font-bold flex items-center gap-1 transition p-1.5 min-h-[36px] group-hover:translate-x-0.5"
          >
            <span>Passes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
export default EventCard;
