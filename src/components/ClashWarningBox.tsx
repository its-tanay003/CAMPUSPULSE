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
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 text-sm flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold">Schedule Clear — No Known Clashes Detected</div>
          <div className="text-emerald-700 text-xs mt-0.5">
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
            className={`rounded-lg border p-4 text-sm ${
              isHard
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : isStrong
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isHard ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : isStrong ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold flex items-center gap-2">
                    <span>{conflict.title}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
                      isHard ? 'bg-rose-200 text-rose-800' : isStrong ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'
                    }`}>
                      {conflict.severity.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono bg-black/5 p-1 rounded">
                  <strong>Trigger:</strong> {conflict.rule_triggered}
                </div>

                <p className="text-xs leading-relaxed">
                  {conflict.rationale}
                </p>

                {conflict.overlapping_interval && (
                  <div className="text-xs font-medium">
                    Colliding Event: <span className="underline">{conflict.conflicting_event.title}</span> ({conflict.overlapping_interval})
                  </div>
                )}

                <div className="pt-2 text-xs font-semibold flex items-center gap-1.5">
                  <span className="opacity-75">Action Path:</span>
                  <span>{conflict.suggested_action}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {hasHardConflict && !allowedToProceed && (
        <div className="bg-rose-100/80 border border-rose-300 text-rose-800 text-xs p-3 rounded flex items-center justify-between">
          <span>
            <strong>Blocking Validation Error:</strong> Venue double-booking cannot be submitted directly without room reassignment.
          </span>
        </div>
      )}
    </div>
  );
};

