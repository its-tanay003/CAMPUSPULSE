import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';
import { ClashWarningBox } from '../components/ClashWarningBox';

export const ClashCheckPage: React.FC = () => {
  const { events, venues } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[1]?.id || events[0]?.id || '');
  const targetEvent = events.find(e => e.id === selectedEventId) || events[0];

  const conflictResult = detectEventConflicts(
    {
      start_time: targetEvent.start_time,
      end_time: targetEvent.end_time,
      venue_id: targetEvent.venue_id,
      category: targetEvent.category
    },
    events,
    venues,
    targetEvent.id
  );

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Deterministic Engine</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                P17 Conflict & Clash Verification Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Evaluates exact interval collisions (<code className="text-cyan-400 font-mono">A.start &lt; B.end AND B.start &lt; A.end</code>) across authoritative campus venues.
              </p>
            </div>
          </div>
        </div>

        {/* Event Selector */}
        <div className="glass-card rounded-3xl p-6 sm:p-7">
          <label htmlFor="test-event-select" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Select An Event to Analyze for Scheduling Clashes
          </label>
          <select
            id="test-event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-3.5 bg-[#050814]/80 border border-white/10 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id} className="bg-[#0b1020] text-white">
                [{ev.status.toUpperCase()}] {ev.title} ({ev.venue?.name})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-2.5">
            Tip: Select "Annual Flagship Hackathon 2026: Code the Campus" to see the seeded double-booking clash with "Agentic AI Workshop" at Block 34 Mini Audi.
          </p>
        </div>

        {/* Selected Event Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 glass-card p-6 rounded-3xl text-xs">
          <div>
            <span className="text-slate-400 font-mono">Selected Event:</span>
            <div className="font-bold text-white text-sm mt-1">{targetEvent.title}</div>
          </div>
          <div>
            <span className="text-slate-400 font-mono">Venue:</span>
            <div className="font-bold text-cyan-400 mt-1">{targetEvent.venue?.name}</div>
          </div>
          <div>
            <span className="text-slate-400 font-mono">Time Window:</span>
            <div className="font-bold text-white font-mono mt-1">
              {new Date(targetEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(targetEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Live Analysis Output */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 glow-indigo">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h2 className="font-bold text-white text-base flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Automated Audit Findings
            </h2>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#050814]/80 text-cyan-300 border border-white/10">
              {conflictResult.conflicts.length} finding{conflictResult.conflicts.length === 1 ? '' : 's'}
            </span>
          </div>

          <ClashWarningBox conflictResult={conflictResult} allowedToProceed={false} />

          {/* Mathematical Proof Card */}
          <div className="bg-[#050814]/80 rounded-2xl p-5 border border-white/10 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Explainable Verification Rule Documentation
            </div>
            <p className="leading-relaxed text-slate-400">
              In accordance with Section 07 of the INT335 P17 Blueprint, schedule detection is fully deterministic and explainable. No black-box scores or opaque AI heuristics are used. Hard conflicts represent physical venue resource overlap, while strong warnings highlight audience attention splitting across identical categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
