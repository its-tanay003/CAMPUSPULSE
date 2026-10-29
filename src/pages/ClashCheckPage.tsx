import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';
import { ClashWarningBox } from '../components/ClashWarningBox';

export const ClashCheckPage: React.FC = () => {
  const { events, venues } = useApp();

  // Test target event selector for demo
  const [selectedEventId, setSelectedEventId] = useState<string>(events[1]?.id || events[0]?.id || '');
  
  // Custom test simulation parameters
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
    targetEvent.id // exclude self
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                P17 Conflict & Clash Verification Engine
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates exact interval collisions (<code>A.start &lt; B.end AND B.start &lt; A.end</code>) across authoritative campus venues.
              </p>
            </div>
          </div>
        </div>

        {/* Event Selector to test seeded clashes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-8">
          <label htmlFor="test-event-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select An Event to Analyze for Scheduling Clashes
          </label>
          <select
            id="test-event-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                [{ev.status.toUpperCase()}] {ev.title} ({ev.venue?.name})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Tip: Select "Annual Flagship Hackathon 2026: Code the Campus" to see the seeded double-booking clash with "Agentic AI Workshop" at Block 34 Mini Audi.
          </p>
        </div>

        {/* Selected Event Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Selected Event:</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{targetEvent.title}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Venue:</span>
            <div className="font-bold text-slate-900 mt-0.5">{targetEvent.venue?.name}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Time Window:</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {new Date(targetEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(targetEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Live Analysis Output */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              Automated Audit Findings
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {conflicts.length} finding{conflicts.length === 1 ? '' : 's'}
            </span>
          </div>

          <ClashWarningBox conflicts={conflicts} allowedToProceed={false} />

          {/* Mathematical Proof Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
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
