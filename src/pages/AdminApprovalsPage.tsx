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
      <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#151C2F] border border-rose-500/30 rounded-2xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">Administrative Access Restricted</h2>
          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            Only institutional campus administrators (Dean of Student Welfare & Estate Allocation Office) have permission to issue approval decisions.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-xs font-semibold px-4 py-2 rounded-xl border border-[#334155] transition"
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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
            <Link to="/admin" className="hover:text-[#F8FAFC] transition">Admin Dashboard</Link>
            <span>/</span>
            <span className="text-[#F8FAFC] font-semibold">Clearance Queue</span>
          </div>

          <Link
            to="/admin/events"
            className="text-xs text-[#38BDF8] hover:underline font-semibold"
          >
            Browse All Campus Events ({events.length}) →
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Dean of Student Welfare & Estate Clearances
              </span>
              <span className="text-xs text-[#94A3B8]">· {currentUser?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-1 tracking-tight">
              Event Approval & Estate Governance
            </h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Inspect club submissions, verify schedule clash evidence, and record immutable audit decisions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0B1020] text-purple-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-[#334155] shadow-sm">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{pendingEvents.length} Pending Approval{pendingEvents.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Main Grid: Queue on Left, Full Inspection on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Pending Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Pending Queue ({pendingEvents.length})
                </h2>
                <span className="text-[11px] text-[#94A3B8]">Select to inspect</span>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter queue by title, club, venue..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-1 focus:ring-[#7C5CFC]"
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-[#151C2F] text-xs space-y-2 ${
                        isSelected
                          ? 'border-[#7C5CFC] ring-2 ring-[#7C5CFC]/40 shadow-xl'
                          : 'border-[#334155] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#7C5CFC] truncate max-w-[200px]">
                          {event.organization?.name || 'Club'}
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">
                          {new Date(event.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-[#F8FAFC] text-sm leading-snug">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8]">
                        <span>Venue: <strong className="text-slate-300">{event.venue?.name}</strong></span>
                        <span>·</span>
                        <span>{event.category}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#334155] text-[11px]">
                        {quickClash.has_hard_conflict ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Double-Booking Detected
                          </span>
                        ) : quickClash.conflicts.length > 0 ? (
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {quickClash.conflicts.length} Warning(s)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Schedule Clear
                          </span>
                        )}

                        <span className="text-[#38BDF8] font-bold">
                          {isSelected ? 'Inspecting →' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-8 text-center text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h3 className="font-bold text-[#F8FAFC]">Queue Empty</h3>
                  <p className="text-[#94A3B8] mt-1">
                    All club event proposals have been evaluated.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Full Inspection Dossier & Action Form (7 cols) */}
          <div className="lg:col-span-7">
            {activeEvent ? (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-xl space-y-6">
                {/* Dossier Header */}
                <div className="border-b border-[#334155] pb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeEvent.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-[#7C5CFC]">
                        {activeEvent.organization?.name}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-[#F8FAFC] mt-1.5">
                      {activeEvent.title}
                    </h2>
                  </div>

                  <Link
                    to={`/events/${activeEvent.id}`}
                    className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#38BDF8] border border-[#334155] px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1 shrink-0"
                  >
                    Public View <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Validation & Information Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0B1020] p-4 rounded-xl border border-[#334155]">
                  <div>
                    <span className="text-[#94A3B8] block text-[11px]">Host Organization:</span>
                    <strong className="text-[#F8FAFC]">{activeEvent.organization?.name}</strong>
                    <span className="text-[11px] text-[#94A3B8] block">Lead: {activeEvent.organization?.lead_name} ({activeEvent.contact_email})</span>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] block text-[11px]">Venue Allocation:</span>
                    <strong className="text-[#F8FAFC]">{activeEvent.venue?.name}</strong>
                    <span className="text-[11px] text-[#94A3B8] block">Authority: {activeEvent.venue?.authority || 'Central Estate Office'}</span>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] block text-[11px]">Schedule Window:</span>
                    <strong className="text-[#F8FAFC]">
                      {new Date(activeEvent.start_time).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </strong>
                    <span className="text-[11px] text-[#94A3B8] block">
                      {new Date(activeEvent.start_time).toLocaleTimeString('en-IN', { timeStyle: 'short' })} – {new Date(activeEvent.end_time).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#94A3B8] block text-[11px]">Registration & Admission:</span>
                    <strong className="text-[#F8FAFC]">{activeEvent.cost || 'Free'}</strong>
                    <span className="text-[11px] text-[#94A3B8] block">
                      Method: {activeEvent.registration_method} (Capacity: {activeEvent.capacity || 'Open'})
                    </span>
                  </div>
                </div>

                {/* Description & Intended Audience */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#94A3B8] uppercase tracking-wider text-[11px]">
                    Event Synopsis & Audience
                  </h4>
                  <p className="bg-[#0B1020] p-3 rounded-xl border border-[#334155] text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeEvent.description}
                  </p>
                  <div className="text-[11px] text-[#94A3B8]">
                    Target Demographic: <strong className="text-slate-200">{activeEvent.target_audience}</strong>
                  </div>
                </div>

                {/* Scheduling-Conflict Evidence Radar */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#94A3B8] uppercase tracking-wider text-[11px]">
                    Automated Conflict Radar & Evidence
                  </h4>
                  <ClashWarningBox
                    conflictResult={conflictResult}
                    allowedToProceed={true}
                  />
                </div>

                {/* Previous Decisions for this Event */}
                {eventApprovalHistory.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#334155]">
                    <h4 className="font-bold text-[#94A3B8] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#38BDF8]" />
                      Previous Review History ({eventApprovalHistory.length})
                    </h4>
                    <div className="space-y-2">
                      {eventApprovalHistory.map(app => (
                        <div key={app.id} className="p-3 bg-[#0B1020] rounded-xl border border-[#334155] text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#F8FAFC]">
                              Decision: {app.decision.toUpperCase()} by {app.reviewer_name}
                            </span>
                            <span className="text-[#94A3B8] font-mono">
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
                <div className="space-y-4 pt-4 border-t border-[#334155]">
                  <h4 className="font-bold text-[#F8FAFC] text-xs uppercase tracking-wider">
                    Executive Review Decision
                  </h4>

                  {/* Decision Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionType('approved')}
                      className={`p-3 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1 ${
                        actionType === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                          : 'bg-[#0B1020] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Approve & Publish
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('changes_requested')}
                      className={`p-3 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1 ${
                        actionType === 'changes_requested'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-500/40'
                          : 'bg-[#0B1020] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Request Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => setActionType('rejected')}
                      className={`p-3 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1 ${
                        actionType === 'rejected'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-500/40'
                          : 'bg-[#0B1020] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Submission
                    </button>
                  </div>

                  {/* Reason Textarea (Required for changes / reject) */}
                  <div>
                    <label htmlFor="review-reason-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">
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
                      className="w-full text-xs p-3 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-2 focus:ring-[#7C5CFC]"
                    />
                  </div>

                  {validationError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleExecuteDecision}
                    className={`w-full text-xs font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg ${
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
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center text-xs text-[#94A3B8]">
                Select an event from the pending submissions queue on the left to inspect facts.
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail Log Section */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md">
          <div className="p-5 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-[#F8FAFC] text-sm">Administrative Clearance Audit Trail</h3>
            </div>
            <span className="text-xs text-[#94A3B8]">{approvals.length} recorded actions</span>
          </div>

          <div className="divide-y divide-[#334155]">
            {approvals.length > 0 ? (
              approvals.map(app => (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold uppercase text-[10px] px-2.5 py-0.5 rounded-full border ${
                        app.decision === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : app.decision === 'changes_requested'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {app.decision.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-[#F8FAFC]">Event #{app.event_id}</span>
                      <span className="text-[#334155]">·</span>
                      <span className="text-[#38BDF8]">Reviewer: {app.reviewer_name}</span>
                    </div>
                    <div className="text-slate-300 italic">"{app.reason}"</div>
                  </div>

                  <div className="text-[#94A3B8] font-mono text-[11px] shrink-0">
                    {new Date(app.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                No historical clearance records logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
