import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  Mail, 
  User, 
  Search, 
  Filter, 
  ExternalLink,
  Info,
  Check,
  XCircle,
  HelpCircle,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';
import { ClashWarningBox } from '../components/ClashWarningBox';
import { StatusTimeline } from '../components/StatusTimeline';
import type { CampusEvent } from '../types';

export const AdminApprovalsPage: React.FC = () => {
  const { events, venues, organizations, reviewEventApproval, currentUser, approvals } = useApp();

  const [activeReviewEventId, setActiveReviewEventId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');
  const [filterQuery, setFilterQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewHistoryModal, setViewHistoryModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filtered queue of pending reviews
  const pendingEvents = events.filter(e => {
    if (e.status !== 'pending_review') return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchOrg = e.organization?.name?.toLowerCase().includes(q);
      const matchVenue = e.venue?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchVenue) return false;
    }
    return true;
  });

  const activeEvent: CampusEvent | undefined = events.find(e => e.id === activeReviewEventId) || pendingEvents[0];

  // Run full conflict diagnostic on currently selected event
  const conflictResult = activeEvent
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
    : { has_conflicts: false, has_hard_conflict: false, can_submit: true, conflicts: [], checked_at: '' };

  // Previous approvals for selected event
  const eventApprovalHistory = activeEvent
    ? approvals.filter(a => a.event_id === activeEvent.id)
    : [];

  // Security Access Guardian
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto glass-card rounded-3xl p-8 glow-indigo">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Only institutional campus administrators (Dean of Student Welfare & Estate Allocation Office) have permission to issue approval decisions.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="bg-white hover:bg-white text-xs font-semibold px-4 py-2.5 rounded-2xl border border-slate-200 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Decision Execution
  const handleExecuteDecision = () => {
    setValidationError(null);

    if (!activeEvent) {
      setValidationError('Please select an event from the queue to review.');
      return;
    }

    // Require reason when requesting changes or rejecting
    if ((actionType === 'changes_requested' || actionType === 'rejected') && !reviewReason.trim()) {
      setValidationError(`An administrative reason is required when ${actionType === 'changes_requested' ? 'requesting changes' : 'rejecting an event'}.`);
      return;
    }

    // Default reason for approvals if left blank
    const finalReason = reviewReason.trim() || 'Approved. Event specifications and venue booking verified with campus administration.';

    reviewEventApproval(activeEvent.id, actionType, finalReason);
    setReviewReason('');
    setActiveReviewEventId(null);
  };

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/admin" className="hover:text-indigo-600 transition">Admin Dashboard</Link>
            <span>/</span>
            <span className="text-white font-semibold">Clearance Queue</span>
          </div>

          <Link
            to="/admin/events"
            className="text-xs text-indigo-400 hover:text-indigo-600 font-semibold underline"
          >
            Browse All Campus Events ({events.length}) →
          </Link>
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase">
                Dean of Student Welfare & Estate Clearances
              </span>
              <span className="text-xs text-slate-400 font-mono">· {currentUser?.full_name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
              Event Approval & Estate Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Inspect club submissions, verify schedule clash evidence, and record immutable audit decisions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-white text-indigo-600 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{pendingEvents.length} Pending Approval{pendingEvents.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Main Grid: Queue on Left, Full Inspection on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Search & Pending Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  Pending Queue ({pendingEvents.length})
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">Select to inspect</span>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter queue by title, club, venue..."
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Event List Cards */}
            <div className="space-y-3">
              {pendingEvents.length > 0 ? (
                pendingEvents.map(event => {
                  const isSelected = activeEvent?.id === event.id;

                  // Quick conflict indicator for card
                  const quickClash = detectEventConflicts(
                    {
                      start_time: event.start_time,
                      end_time: event.end_time,
                      venue_id: event.venue_id,
                      category: event.category
                    },
                    events,
                    venues,
                    event.id
                  );

                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        setActiveReviewEventId(event.id);
                        setReviewReason('');
                        setValidationError(null);
                      }}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer glass-card text-xs space-y-2.5 ${
                        isSelected
                          ? 'border-indigo-500/80 ring-2 ring-indigo-500/40 glow-indigo'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400 truncate max-w-[200px]">
                          {event.organization?.name || 'Club'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(event.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-white text-sm leading-snug">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>Venue: <strong className="text-slate-200">{event.venue?.name}</strong></span>
                        <span>·</span>
                        <span className="text-indigo-600 font-mono">{event.category}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-[11px]">
                        {quickClash.has_hard_conflict ? (
                          <span className="text-rose-400 font-mono font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Double-Booking Detected
                          </span>
                        ) : quickClash.conflicts.length > 0 ? (
                          <span className="text-amber-700 font-mono font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {quickClash.conflicts.length} Warning(s)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-mono font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Schedule Clear
                          </span>
                        )}

                        <span className="text-indigo-600 font-bold">
                          {isSelected ? 'Inspecting →' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="glass-card rounded-3xl p-8 text-center text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                  <h3 className="font-bold text-white">Queue Empty</h3>
                  <p className="text-slate-400 mt-1">
                    All club event proposals have been evaluated.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Full Inspection Dossier & Action Form (7 cols) */}
          <div className="lg:col-span-7">
            {activeEvent ? (
              <div className="glass-card rounded-3xl p-6 sm:p-7 glow-indigo space-y-6">
                {/* Dossier Header */}
                <div className="border-b border-slate-200 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30">
                        {activeEvent.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-indigo-400">
                        {activeEvent.organization?.name}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white mt-1.5">
                      {activeEvent.title}
                    </h2>
                  </div>

                  <Link
                    to={`/events/${activeEvent.id}`}
                    className="text-xs bg-white hover:bg-white text-indigo-600 border border-slate-200 px-3.5 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0"
                  >
                    Public View <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Validation & Information Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[11px] font-mono">Host Organization:</span>
                    <strong className="text-white">{activeEvent.organization?.name}</strong>
                    <span className="text-[11px] text-slate-400 block">Lead: {activeEvent.organization?.lead_name} ({activeEvent.contact_email})</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[11px] font-mono">Venue Allocation:</span>
                    <strong className="text-white">{activeEvent.venue?.name}</strong>
                    <span className="text-[11px] text-slate-400 block">Authority: {activeEvent.venue?.authority || 'Central Estate Office'}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[11px] font-mono">Schedule Window:</span>
                    <strong className="text-white font-mono">
                      {new Date(activeEvent.start_time).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </strong>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {new Date(activeEvent.start_time).toLocaleTimeString('en-IN', { timeStyle: 'short' })} – {new Date(activeEvent.end_time).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 block text-[11px] font-mono">Registration & Admission:</span>
                    <strong className="text-white">{activeEvent.cost || 'Free'}</strong>
                    <span className="text-[11px] text-slate-400 block">
                      Method: {activeEvent.registration_method} (Capacity: {activeEvent.capacity || 'Open'})
                    </span>
                  </div>
                </div>

                {/* Description & Intended Audience */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-mono font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Event Synopsis & Audience
                  </h4>
                  <p className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeEvent.description}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Target Demographic: <strong className="text-slate-200">{activeEvent.target_audience}</strong>
                  </div>
                </div>

                {/* Scheduling-Conflict Evidence Radar */}
                <div className="space-y-2">
                  <h4 className="font-mono font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Automated Conflict Radar & Evidence
                  </h4>
                  <ClashWarningBox
                    conflictResult={conflictResult}
                    allowedToProceed={true}
                  />
                </div>

                {/* Previous Decisions for this Event */}
                {eventApprovalHistory.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-200">
                    <h4 className="font-mono font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-600" />
                      Previous Review History ({eventApprovalHistory.length})
                    </h4>
                    <div className="space-y-2">
                      {eventApprovalHistory.map(app => (
                        <div key={app.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-white">
                              Decision: {app.decision.toUpperCase()} by {app.reviewer_name}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(app.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="text-slate-300 italic">"{app.reason}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Form */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Executive Review Decision
                  </h4>

                  {/* Decision Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('approved')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        actionType === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Approve & Publish
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('changes_requested')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        actionType === 'changes_requested'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-500/40'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Request Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('rejected')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        actionType === 'rejected'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-500/40'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Submission
                    </button>
                  </div>

                  {/* Reason Textarea (Required for changes / reject) */}
                  <div>
                    <label htmlFor="review-reason-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                      Reason / Administrative Comments {(actionType !== 'approved') && <span className="text-rose-400">*</span>}
                    </label>
                    <textarea
                      id="review-reason-input"
                      rows={3}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder={
                        actionType === 'approved'
                          ? 'e.g. Venue booking confirmed with Room 34 in-charge. All safety protocols cleared.'
                          : actionType === 'changes_requested'
                          ? 'e.g. Please alter starting time by +1 hour or select Block 28 Hall B to avoid collision.'
                          : 'e.g. Incompatible with University examination blackout dates.'
                      }
                      className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {validationError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleExecuteDecision}
                    className={`w-full text-xs font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                      actionType === 'approved'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : actionType === 'changes_requested'
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Commit Decision to Immutable Audit Trail
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center text-xs text-slate-400">
                Select an event from the pending submissions queue on the left to inspect facts.
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail Log Section */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-white text-base">Administrative Clearance Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{approvals.length} recorded actions</span>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {approvals.length > 0 ? (
              approvals.map(app => (
                <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-extrabold uppercase text-[10px] px-2.5 py-0.5 rounded-full border ${
                        app.decision === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' 
                          : app.decision === 'changes_requested'
                          ? 'bg-amber-500/20 text-amber-800 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {app.decision.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-white">Event #{app.event_id}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-indigo-600 font-semibold">Reviewer: {app.reviewer_name}</span>
                    </div>
                    <div className="text-slate-300 italic">"{app.reason}"</div>
                  </div>

                  <div className="text-slate-400 font-mono text-[11px] shrink-0">
                    {new Date(app.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No historical clearance records logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
