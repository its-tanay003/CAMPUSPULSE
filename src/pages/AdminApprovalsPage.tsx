import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Clock, 
  Building,
  User,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';

export const AdminApprovalsPage: React.FC = () => {
  const { events, venues, reviewEventApproval, currentUser, approvals } = useApp();

  const [activeReviewEventId, setActiveReviewEventId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');

  // Pending review events
  const pendingEvents = events.filter(e => e.status === 'pending_review');

  const activeEvent = events.find(e => e.id === activeReviewEventId);

  // If active event selected, calculate its conflicts
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Campus Admin Clearance Portal
              </span>
              <span className="text-xs text-slate-400">· {currentUser?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Event Approval & Estate Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review club submissions, inspect room reservation collisions, and issue structured decisions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-purple-50 text-purple-900 px-4 py-2 rounded-xl text-xs font-bold border border-purple-200">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{pendingEvents.length} Pending Review</span>
          </div>
        </div>

        {/* Pending Submissions Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
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
                    className={`p-5 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-100 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {event.organization?.name}
                      </span>
                      <span className="text-slate-400">
                        {new Date(event.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {event.title}
                    </h3>

                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-3">
                      <span>Venue: <strong>{event.venue?.name}</strong></span>
                      <span>·</span>
                      <span>Category: {event.category}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                      <span className="text-slate-500">Requested by {event.organization?.lead_name}</span>
                      <span className="font-bold text-purple-600">Review Submission →</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-900 text-sm">Review Queue Empty</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All club event submissions have been evaluated by administration.
                </p>
              </div>
            )}
          </div>

          {/* Review Decision Workspace */}
          <div className="lg:col-span-6">
            {activeEvent ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-20">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Audit Review
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{activeEvent.title}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Submitted by {activeEvent.organization?.name} ({activeEvent.contact_email})
                  </div>
                </div>

                {/* Conflict Analysis on Selected Event */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Automated Conflict Diagnostic
                  </h4>
                  {conflicts.length > 0 ? (
                    <div className="space-y-2">
                      {conflicts.map((c, i) => (
                        <div key={i} className="text-xs p-3 rounded-lg border bg-rose-50 border-rose-200 text-rose-900">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            {c.title}
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed">{c.rationale}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Zero room clashes detected for this time interval.
                    </div>
                  )}
                </div>

                {/* Decision Form */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Administrative Action
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('approved')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition ${
                        actionType === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Approve & Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('changes_requested')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition ${
                        actionType === 'changes_requested'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Request Edits
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('rejected')}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition ${
                        actionType === 'rejected'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Reject
                    </button>
                  </div>

                  <div>
                    <label htmlFor="admin-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason / Feedback to Organizer *
                    </label>
                    <textarea
                      id="admin-reason"
                      rows={3}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="e.g. Approved. Room 34 key can be collected from Estate office."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleExecuteDecision}
                    className="w-full bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition shadow"
                  >
                    Confirm & Record Decision in Audit Log
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                Select an event from the left queue to evaluate facts and issue approval.
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail History */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Administrative Audit Trail</h2>
            <span className="text-xs text-slate-500">{approvals.length} recorded actions</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {approvals.map(app => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                      app.decision === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {app.decision}
                    </span>
                    <span className="font-semibold text-slate-800">Event #{app.event_id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">By {app.reviewer_name}</span>
                  </div>
                  <div className="text-slate-600 mt-1 italic">"{app.reason}"</div>
                </div>

                <div className="text-slate-400 font-mono text-[11px] shrink-0">
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
