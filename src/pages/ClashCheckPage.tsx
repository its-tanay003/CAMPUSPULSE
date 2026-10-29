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

  const conflicts = detectEventConflicts(
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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
                P17 Conflict & Clash Verification Engine
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Evaluates exact interval collisions (<code>A.start &lt; B.end AND B.start &lt; A.end</code>) across authoritative campus venues.
              </p>
            </div>
          </div>
        </div>

        {/* Event Selector */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <label htmlFor="test-event-select" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Select An Event to Analyze for Scheduling Clashes
          </label>
          <select
            id="test-event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-3 bg-[#0B1020] border border-[#334155] rounded-xl text-sm font-semibold text-[#F8FAFC]"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                [{ev.status.toUpperCase()}] {ev.title} ({ev.venue?.name})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#94A3B8] mt-2">
            Tip: Select "Annual Flagship Hackathon 2026: Code the Campus" to see the seeded double-booking clash with "Agentic AI Workshop" at Block 34 Mini Audi.
          </p>
        </div>

        {/* Selected Event Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-[#151C2F]/50 p-5 rounded-2xl border border-[#334155] text-xs">
          <div>
            <span className="text-[#94A3B8] font-medium">Selected Event:</span>
            <div className="font-bold text-[#F8FAFC] text-sm mt-0.5">{targetEvent.title}</div>
          </div>
          <div>
            <span className="text-[#94A3B8] font-medium">Venue:</span>
            <div className="font-bold text-[#38BDF8] mt-0.5">{targetEvent.venue?.name}</div>
          </div>
          <div>
            <span className="text-[#94A3B8] font-medium">Time Window:</span>
            <div className="font-bold text-[#F8FAFC] mt-0.5">
              {new Date(targetEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(targetEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Live Analysis Output */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#334155] pb-4">
            <h2 className="font-bold text-[#F8FAFC] text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#38BDF8]" />
              Automated Audit Findings
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0B1020] text-[#38BDF8] border border-[#334155]">
              {conflicts.length} finding{conflicts.length === 1 ? '' : 's'}
            </span>
          </div>

          <ClashWarningBox conflicts={conflicts} allowedToProceed={false} />

          {/* Mathematical Proof Card */}
          <div className="bg-[#0B1020] rounded-xl p-4 border border-[#334155] text-xs text-[#94A3B8] space-y-2">
            <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#38BDF8]" />
              Explainable Verification Rule Documentation
            </div>
            <p className="leading-relaxed">
              In accordance with Section 07 of the INT335 P17 Blueprint, schedule detection is fully deterministic and explainable. No black-box scores or opaque AI heuristics are used. Hard conflicts represent physical venue resource overlap, while strong warnings highlight audience attention splitting across identical categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
