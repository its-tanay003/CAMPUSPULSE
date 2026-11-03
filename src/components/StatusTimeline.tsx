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
    <div className="bg-[#151C2F] border border-[#334155] rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-[#334155] pb-4">
        <div>
          <h3 className="font-extrabold text-[#F8FAFC] text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            Event Lifecycle Status Timeline
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Transparent tracking from initial club draft to administrative approval and public publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Current State:</span>
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
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
              : 'bg-[#0B1020] text-[#94A3B8] border-[#334155]'
          }`}>
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Reviewer Feedback Callout when changes requested or rejected */}
      {(status === 'changes_requested' || status === 'rejected') && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
          status === 'changes_requested'
            ? 'bg-orange-950/40 border-orange-500/40 text-orange-100'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
        }`}>
          {status === 'changes_requested' ? (
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1.5 flex-1 text-xs">
            <div className="font-bold flex items-center justify-between">
              <span>Administrative Review Outcome: {status === 'changes_requested' ? 'Action Required' : 'Proposal Rejected'}</span>
              {approvalsHistory[0]?.created_at && (
                <span className="text-[10px] opacity-75 font-mono">
                  {new Date(approvalsHistory[0].created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              )}
            </div>

            <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
              <div className="text-[#94A3B8] flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                Reviewer: <strong className="text-white">{approvalsHistory[0]?.reviewer_name || 'Dean of Student Welfare'}</strong>
              </div>
              <p className="text-white leading-relaxed font-normal">
                "{approvalsHistory[0]?.reason || 'Please review the requested changes or rejection rationale.'}"
              </p>
            </div>

            {onActionClick && actionButtonLabel && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onActionClick}
                  className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 shadow"
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
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#334155]">
        {steps.map((step, idx) => {
          const isDone = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Bullet */}
              <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                isCurrent
                  ? 'bg-[#7C5CFC] border-[#38BDF8] text-white ring-4 ring-[#7C5CFC]/20'
                  : isDone
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-[#151C2F] border-[#334155] text-[#94A3B8]'
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
              <div className={`rounded-xl p-4 border transition ${
                isCurrent 
                  ? 'bg-[#1E293B] border-[#7C5CFC]/60 shadow-md' 
                  : 'bg-[#0B1020]/60 border-[#334155]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
                    {step.title}
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#7C5CFC]/30 text-[#38BDF8] border border-[#7C5CFC]/40">
                        Current Step
                      </span>
                    )}
                  </h4>

                  {step.timestamp && (
                    <span className="text-[11px] text-[#94A3B8] font-mono">
                      {new Date(step.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {step.description}
                </p>

                {step.decisionNote && (
                  <div className="mt-2 text-xs bg-black/40 p-2 rounded-lg border border-white/5 text-slate-300">
                    <strong className="text-white">Note:</strong> {step.decisionNote}
                  </div>
                )}

                {step.actionRequired && (
                  <div className="mt-2.5 pt-2 border-t border-[#334155] text-xs font-semibold flex items-center gap-1.5 text-[#38BDF8]">
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
