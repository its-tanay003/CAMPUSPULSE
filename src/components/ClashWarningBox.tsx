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
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5 shadow">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300">Unverified Venue Record</div>
            <div className="text-amber-200/80 mt-0.5 leading-relaxed">
              {unverified_venue_warning}
            </div>
          </div>
        </div>
      )}

      {/* Clear Schedule State */}
      {conflicts.length === 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-emerald-200 text-sm flex items-start gap-3 shadow">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-300">Schedule Clear — No Collisions Detected</div>
            <div className="text-emerald-400/90 text-xs mt-0.5 leading-relaxed">
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
            className={`rounded-xl border p-4 text-sm transition-all shadow-md ${
              isHard
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-100'
                : isAdvisory
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-100'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {isHard ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isAdvisory ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold">{conflict.title}</span>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider ${
                    isHard 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                      : isAdvisory 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {conflict.severity.replace('_', ' ')}
                  </span>
                </div>

                {/* Specific Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-[#94A3B8]">Conflicting Event: </span>
                    <strong className="text-[#F8FAFC]">{conflict.conflicting_event.title}</strong>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">Venue: </span>
                    <strong className="text-[#F8FAFC]">{conflict.venue_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">Date & Timing: </span>
                    <strong className="text-[#F8FAFC]">
                      {conflict.date_string} ({conflict.start_time} – {conflict.end_time})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">Source: </span>
                    <strong className="text-[#38BDF8]">{conflict.source_authority}</strong>
                  </div>
                </div>

                {/* Formal Rule Triggered */}
                <div className="text-[11px] font-mono bg-black/20 p-2 rounded border border-white/5 text-[#94A3B8]">
                  <strong className="text-white">Detection Logic:</strong> {conflict.rule_triggered}
                </div>

                {/* Plain-English Rationale */}
                <p className="text-xs leading-relaxed text-[#F8FAFC]/90">
                  {conflict.rationale}
                </p>

                {/* Overlap Window */}
                {conflict.overlapping_interval && (
                  <div className="text-xs font-semibold text-[#38BDF8]">
                    Calculated Overlap Interval: <span className="underline">{conflict.overlapping_interval}</span>
                  </div>
                )}

                {/* Available Resolution Actions */}
                {conflict.available_resolutions && conflict.available_resolutions.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Suggested Resolutions:
                    </span>
                    <ul className="text-xs space-y-1 text-slate-300">
                      {conflict.available_resolutions.map((res, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-[#38BDF8]">•</span>
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
        <div className="bg-rose-950/80 border border-rose-500 text-rose-200 text-xs p-3.5 rounded-xl flex items-center justify-between shadow">
          <span>
            <strong>Blocking Rule:</strong> Authoritative venue double-bookings cannot be submitted for administrative approval until the venue or time slot is modified.
          </span>
        </div>
      )}
    </div>
  );
};
