import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { ConflictItem } from '../types';

interface ClashWarningBoxProps {
  conflicts: ConflictItem[];
  onDismissNonBlocking?: () => void;
  allowedToProceed?: boolean;
}

export const ClashWarningBox: React.FC<ClashWarningBoxProps> = ({ 
  conflicts, 
  allowedToProceed = false 
}) => {
  if (conflicts.length === 0) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-emerald-200 text-sm flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-emerald-300">Schedule Clear — No Known Clashes Detected</div>
          <div className="text-emerald-400/90 text-xs mt-0.5 leading-relaxed">
            The selected venue and time slot do not collide with any authoritative campus room reservations.
          </div>
        </div>
      </div>
    );
  }

  const hasHardConflict = conflicts.some(c => c.severity === 'hard_conflict');

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, idx) => {
        const isHard = conflict.severity === 'hard_conflict';
        const isStrong = conflict.severity === 'strong_warning';

        return (
          <div
            key={idx}
            className={`rounded-xl border p-4 text-sm transition-all shadow-md ${
              isHard
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-100'
                : isStrong
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-100'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {isHard ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isStrong ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-sm font-extrabold">{conflict.title}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider ${
                      isHard 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                        : isStrong 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {conflict.severity.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono bg-black/30 p-2 rounded-lg border border-white/5 text-[#94A3B8]">
                  <strong className="text-white">Trigger Rule:</strong> {conflict.rule_triggered}
                </div>

                <p className="text-xs leading-relaxed text-[#F8FAFC]/90">
                  {conflict.rationale}
                </p>

                {conflict.overlapping_interval && (
                  <div className="text-xs font-semibold text-[#38BDF8]">
                    Colliding Event: <span className="underline">{conflict.conflicting_event.title}</span> ({conflict.overlapping_interval})
                  </div>
                )}

                <div className="pt-2 text-xs font-semibold flex items-center gap-1.5 border-t border-white/10">
                  <span className="opacity-75">Action Path:</span>
                  <span className="text-[#F8FAFC]">{conflict.suggested_action}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {hasHardConflict && !allowedToProceed && (
        <div className="bg-rose-950/80 border border-rose-500 text-rose-200 text-xs p-3.5 rounded-xl flex items-center justify-between shadow">
          <span>
            <strong>Blocking Validation Error:</strong> Venue double-booking cannot be submitted directly without room reassignment.
          </span>
        </div>
      )}
    </div>
  );
};
