import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileEdit, 
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { buildEventStatusTimeline, StatusTimelineStep } from '../lib/lifecycleManager';
import type { EventStatus, ApprovalAction } from '../types';

interface StatusTimelineProps {
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  approvalsHistory?: ApprovalAction[];
  onActionClick?: () => void;
  actionButtonLabel?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  status,
  createdAt,
  updatedAt,
  approvalsHistory = [],
  onActionClick,
  actionButtonLabel
}) => {
  const steps: StatusTimelineStep[] = buildEventStatusTimeline(
    status,
    createdAt,
    updatedAt,
    approvalsHistory
  );

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 glow-indigo space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Event Lifecycle Status Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent tracking from initial club draft to administrative approval and public publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Current State:</span>
          <span className={`text-[11px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
            status === 'published'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : status === 'pending_review'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : status === 'changes_requested'
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              : status === 'rejected'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : status === 'draft'
              ? 'bg-slate-700/50 text-slate-300 border-slate-600'
              : 'bg-[#050814]/80 text-slate-400 border-white/10'
          }`}>
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Reviewer Feedback Callout when changes requested or rejected */}
      {(status === 'changes_requested' || status === 'rejected') && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          status === 'changes_requested'
            ? 'glass-card border-orange-500/50 bg-orange-950/20 text-orange-100'
            : 'glass-card border-rose-500/50 bg-rose-950/20 text-rose-100'
        }`}>
          {status === 'changes_requested' ? (
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-2 flex-1 text-xs">
            <div className="font-bold flex items-center justify-between">
              <span className="text-white">Administrative Review Outcome: {status === 'changes_requested' ? 'Action Required' : 'Proposal Rejected'}</span>
              {approvalsHistory[0]?.created_at && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(approvalsHistory[0].created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              )}
            </div>

            <div className="bg-[#050814]/80 p-3 rounded-xl border border-white/10 space-y-1.5">
              <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Reviewer: <strong className="text-white">{approvalsHistory[0]?.reviewer_name || 'Dean of Student Welfare'}</strong>
              </div>
              <p className="text-slate-300 leading-relaxed font-normal">
                "{approvalsHistory[0]?.reason || 'Please review the requested changes or rejection rationale.'}"
              </p>
            </div>

            {onActionClick && actionButtonLabel && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onActionClick}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition inline-flex items-center gap-2 shadow cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  {actionButtonLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stepper Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {steps.map((step, idx) => {
          const isDone = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Bullet */}
              <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                isCurrent
                  ? 'bg-indigo-600 border-cyan-400 text-white ring-4 ring-indigo-500/20'
                  : isDone
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-[#050814] border-white/20 text-slate-400'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className={`rounded-2xl p-4 sm:p-5 border transition ${
                isCurrent 
                  ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md' 
                  : 'bg-[#050814]/60 border-white/10'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    {step.title}
                    {isCurrent && (
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/40">
                        Current Step
                      </span>
                    )}
                  </h4>

                  {step.timestamp && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(step.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>

                {step.decisionNote && (
                  <div className="mt-2.5 text-xs bg-[#050814]/80 p-2.5 rounded-xl border border-white/10 text-slate-300">
                    <strong className="text-white">Note:</strong> {step.decisionNote}
                  </div>
                )}

                {step.actionRequired && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Next Action: {step.actionRequired}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

