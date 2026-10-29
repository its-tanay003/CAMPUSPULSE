import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';

export const AdminApprovalsPage: React.FC = () => {
  const { events, venues, reviewEventApproval, currentUser, approvals } = useApp();

  const [activeReviewEventId, setActiveReviewEventId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');

  const pendingEvents = events.filter(e => e.status === 'pending_review');
  const activeEvent = events.find(e => e.id === activeReviewEventId);

  const conflicts = activeEvent
    ? detectEventConflicts(
        {
          start_time: activeEvent.start_time,
          end_time: activeEvent.end_time,
          venue_id: activeEvent.venue_id,
          category: activeEvent.category
        },
        events,
        venues,
        activeEvent.id
      )
    : [];

  const handleExecuteDecision = () => {
    if (!activeReviewEventId) return;
    if (!reviewReason.trim()) {
      alert('Please provide an administrative reason or audit comment.');
      return;
    }

    reviewEventApproval(activeReviewEventId, actionType, reviewReason);
    setActiveReviewEventId(null);
    setReviewReason('');
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Campus Admin Clearance Portal
              </span>
              <span className="text-xs text-[#94A3B8]">· {currentUser?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-1 tracking-tight">
              Event Approval & Estate Governance
            </h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Review club submissions, inspect room reservation collisions, and issue structured decisions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0B1020] text-purple-300 px-4 py-2 rounded-xl text-xs font-bold border border-[#334155]">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{pendingEvents.length} Pending Review</span>
          </div>
        </div>

        {/* Pending Submissions Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
              Pending Submissions Queue
            </h2>

            {pendingEvents.length > 0 ? (
              pendingEvents.map(event => {
                const isSelected = event.id === activeReviewEventId;

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      setActiveReviewEventId(event.id);
                      setReviewReason('');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-[#151C2F] ${
                      isSelected
                        ? 'border-[#7C5CFC] ring-2 ring-[#7C5CFC]/40 shadow-xl'
                        : 'border-[#334155] hover:border-[#7C5CFC]/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#38BDF8] bg-[#0B1020] px-2 py-0.5 rounded-lg border border-[#334155]">
                        {event.organization?.name}
                      </span>
                      <span className="text-[#94A3B8]">
                        {new Date(event.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base leading-snug">
                      {event.title}
                    </h3>

                    <div className="mt-2.5 text-xs text-[#94A3B8] flex items-center gap-3">
                      <span>Venue: <strong className="text-[#F8FAFC]">{event.venue?.name}</strong></span>
                      <span>·</span>
                      <span>Category: {event.category}</span>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between text-xs border-t border-[#334155] pt-3">
                      <span className="text-[#94A3B8]">Lead: {event.organization?.lead_name}</span>
                      <span className="font-bold text-[#7C5CFC] hover:text-[#38BDF8] transition">Review Submission →</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-8 text-center shadow">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="font-bold text-[#F8FAFC] text-sm">Review Queue Empty</h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  All club event submissions have been evaluated by administration.
                </p>
              </div>
            )}
          </div>

          {/* Review Decision Workspace */}
          <div className="lg:col-span-6">
            {activeEvent ? (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-xl space-y-6 sticky top-20">
                <div className="border-b border-[#334155] pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    Audit Review
                  </span>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mt-2">{activeEvent.title}</h3>
                  <div className="text-xs text-[#94A3B8] mt-1">
                    Submitted by {activeEvent.organization?.name} ({activeEvent.contact_email})
                  </div>
                </div>

                {/* Conflict Analysis on Selected Event */}
                <div>
                  <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                    Automated Conflict Diagnostic
                  </h4>
                  {conflicts.length > 0 ? (
                    <div className="space-y-2">
                      {conflicts.map((c, i) => (
                        <div key={i} className="text-xs p-3 rounded-xl border bg-rose-950/60 border-rose-500/40 text-rose-200">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            {c.title}
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed">{c.rationale}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs p-3 rounded-xl border bg-emerald-950/40 border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Zero room clashes detected for this time interval.
                    </div>
                  )}
                </div>

                {/* Decision Form */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                    Administrative Action
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('approved')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        actionType === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-[#0B1020] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Approve & Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('changes_requested')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        actionType === 'changes_requested'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                          : 'bg-[#0B1020] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Request Edits
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('rejected')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        actionType === 'rejected'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-[#0B1020] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Reject
                    </button>
                  </div>

                  <div>
                    <label htmlFor="admin-reason" className="block text-xs font-semibold text-[#94A3B8] mb-1">
                      Reason / Feedback to Organizer *
                    </label>
                    <textarea
                      id="admin-reason"
                      rows={3}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="e.g. Approved. Room 34 key can be collected from Estate office."
                      className="w-full text-xs p-3 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-2 focus:ring-[#7C5CFC]"
                    />
                  </div>

                  <button
                    onClick={handleExecuteDecision}
                    className="w-full bg-[#7C5CFC] hover:bg-[#6B46E5] text-white text-xs font-bold py-3 rounded-xl transition shadow-lg"
                  >
                    Confirm & Record Decision in Audit Log
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-8 text-center text-[#94A3B8] text-sm shadow">
                Select an event from the left queue to evaluate facts and issue approval.
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail History */}
        <div className="mt-12 bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md">
          <div className="p-5 border-b border-[#334155] flex items-center justify-between">
            <h2 className="font-bold text-[#F8FAFC] text-base">Administrative Audit Trail</h2>
            <span className="text-xs text-[#94A3B8]">{approvals.length} recorded actions</span>
          </div>

          <div className="divide-y divide-[#334155] text-xs">
            {approvals.map(app => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full border ${
                      app.decision === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {app.decision}
                    </span>
                    <span className="font-semibold text-[#F8FAFC]">Event #{app.event_id}</span>
                    <span className="text-[#334155]">·</span>
                    <span className="text-[#94A3B8]">By {app.reviewer_name}</span>
                  </div>
                  <div className="text-[#94A3B8] mt-1 italic">"{app.reason}"</div>
                </div>

                <div className="text-[#94A3B8] font-mono text-[11px] shrink-0">
                  {new Date(app.created_at).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
