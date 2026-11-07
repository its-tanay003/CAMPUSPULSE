import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { ConflictCheckResult } from '../types';

interface ClashWarningBoxProps {
  conflictResult: ConflictCheckResult;
  onSelectResolution?: (resolution: string) => void;
  allowedToProceed?: boolean;
}

export const ClashWarningBox: React.FC<ClashWarningBoxProps> = ({ 
  conflictResult,
  allowedToProceed = false 
}) => {
  const { conflicts, has_hard_conflict, unverified_venue_warning } = conflictResult;

  return (
    <div className="space-y-4">
      {/* Fallback Warning for Unverified/Missing Venue Records */}
      {unverified_venue_warning && (
        <div className="glass-card border-l-4 border-l-amber-500 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-800">Unverified Venue Record</div>
            <div className="text-amber-200/80 mt-1 leading-relaxed">
              {unverified_venue_warning}
            </div>
          </div>
        </div>
      )}

      {/* Clear Schedule State */}
      {conflicts.length === 0 && (
        <div className="glass-card border-l-4 border-l-emerald-500 rounded-2xl p-5 text-emerald-200 text-sm flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-700">Schedule Clear — No Collisions Detected</div>
            <div className="text-slate-300 text-xs mt-1 leading-relaxed">
              The proposed time window does not intersect with any authoritative room reservations or concurrent category events.
            </div>
          </div>
        </div>
      )}

      {/* Conflicts List */}
      {conflicts.map((conflict, idx) => {
        const isHard = conflict.severity === 'hard_conflict';
        const isAdvisory = conflict.severity === 'advisory_warning';

        return (
          <div
            key={idx}
            className={`glass-card rounded-2xl border p-5 text-sm transition-all ${
              isHard
                ? 'border-rose-500/50 bg-rose-950/20 text-rose-100'
                : isAdvisory
                ? 'border-amber-500/50 bg-amber-950/20 text-amber-100'
                : 'border-cyan-500/50 bg-cyan-950/20 text-cyan-100'
            }`}
          >
            <div className="flex items-start gap-3.5">
              {isHard ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isAdvisory ? (
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-white">{conflict.title}</span>
                  <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider ${
                    isHard 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                      : isAdvisory 
                      ? 'bg-amber-500/20 text-amber-800 border border-amber-500/40' 
                      : 'bg-cyan-500/20 text-indigo-600 border border-cyan-500/40'
                  }`}>
                    {conflict.severity.replace('_', ' ')}
                  </span>
                </div>

                {/* Specific Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400">Conflicting Event: </span>
                    <strong className="text-white">{conflict.conflicting_event.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Venue: </span>
                    <strong className="text-white">{conflict.venue_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Date & Timing: </span>
                    <strong className="text-white">
                      {conflict.date_string} ({conflict.start_time} – {conflict.end_time})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Source: </span>
                    <strong className="text-indigo-600">{conflict.source_authority}</strong>
                  </div>
                </div>

                {/* Formal Rule Triggered */}
                <div className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-100 text-slate-400">
                  <strong className="text-white font-sans">Detection Logic:</strong> {conflict.rule_triggered}
                </div>

                {/* Plain-English Rationale */}
                <p className="text-xs leading-relaxed text-slate-300">
                  {conflict.rationale}
                </p>

                {/* Overlap Window */}
                {conflict.overlapping_interval && (
                  <div className="text-xs font-semibold text-indigo-600 font-mono">
                    Calculated Overlap Interval: <span className="underline decoration-cyan-500/40">{conflict.overlapping_interval}</span>
                  </div>
                )}

                {/* Available Resolution Actions */}
                {conflict.available_resolutions && conflict.available_resolutions.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Suggested Resolutions:
                    </span>
                    <ul className="text-xs space-y-1 text-slate-300">
                      {conflict.available_resolutions.map((res, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2">
                          <span className="text-indigo-600">•</span>
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Blocking Validation Error notice for Hard Conflicts */}
      {has_hard_conflict && !allowedToProceed && (
        <div className="glass-card border-rose-500/50 bg-rose-950/30 text-rose-200 text-xs p-4 rounded-2xl flex items-center justify-between">
          <span>
            <strong className="text-rose-300">Blocking Rule:</strong> Authoritative venue double-bookings cannot be submitted for administrative approval until the venue or time slot is modified.
          </span>
        </div>
      )}
    </div>
  );
};
