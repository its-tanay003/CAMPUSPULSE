import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Filter, 
  Search, 
  ArrowRight,
  ExternalLink,
  Layers,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';
import type { EventStatus } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { events, venues, currentUser, approvals } = useApp();

  // Metrics
  const pendingEvents = events.filter(e => e.status === 'pending_review');
  const publishedEvents = events.filter(e => e.status === 'published');
  const changesRequestedEvents = events.filter(e => e.status === 'changes_requested');
  const cancelledEvents = events.filter(e => e.status === 'cancelled');

  // Dynamic unresolved conflict count across active campus events
  const eventsWithConflicts = events
    .filter(e => ['pending_review', 'published', 'changes_requested'].includes(e.status))
    .map(event => {
      const activeClashes = detectEventConflicts(
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
      return { event, clashes: activeClashes.conflicts };
    })
    .filter(item => item.clashes.length > 0);

  const unresolvedConflictCount = eventsWithConflicts.length;

  // Access Guardian
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto glass-card rounded-3xl p-8 glow-indigo">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Only provisioned institutional administrators (Dean of Student Welfare & Estate Allocation Office) can access the Campus Admin Workspace.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="bg-[#050814]/80 hover:bg-[#0b1020] text-xs font-semibold px-4 py-2.5 rounded-2xl border border-white/10 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-[10px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Institutional Administration
              </span>
              <span className="text-xs text-slate-400 font-mono">
                · {currentUser?.full_name} ({currentUser?.email})
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Administrative Operations & Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Clearance oversight for campus venues, student organization proposals, and schedule clash resolution across all University blocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/approvals"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Approval Queue ({pendingEvents.length})
            </Link>
            <Link
              to="/admin/events"
              className="bg-[#050814]/80 hover:bg-[#0b1020] text-white border border-white/10 font-semibold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 shadow"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              All Campus Events
            </Link>
            <Link
              to="/admin/venues"
              className="bg-[#050814]/80 hover:bg-[#0b1020] text-white border border-white/10 font-semibold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 shadow"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              Venues Registry
            </Link>
            <Link
              to="/admin/organizers"
              className="bg-[#050814]/80 hover:bg-[#0b1020] text-white border border-white/10 font-semibold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 shadow"
            >
              <Users className="w-4 h-4 text-amber-400" />
              Organizer Verification
            </Link>
          </div>
        </div>

        {/* Real Data Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Pending Approvals */}
          <Link
            to="/admin/approvals"
            className="p-5 rounded-3xl border glass-card border-amber-500/40 hover:border-amber-500 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-amber-400">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-amber-300">{pendingEvents.length}</div>
              <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition mt-1">Review queue →</div>
            </div>
          </Link>

          {/* Published Events */}
          <Link
            to="/admin/events?status=published"
            className="p-5 rounded-3xl border glass-card border-emerald-500/40 hover:border-emerald-500 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-emerald-400">Published Events</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-emerald-300">{publishedEvents.length}</div>
              <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition mt-1">Active on feeds →</div>
            </div>
          </Link>

          {/* Requiring Changes */}
          <Link
            to="/admin/events?status=changes_requested"
            className="p-5 rounded-3xl border glass-card border-orange-500/40 hover:border-orange-500 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-orange-400">Needs Changes</span>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-orange-300">{changesRequestedEvents.length}</div>
              <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition mt-1">Awaiting organizer edit →</div>
            </div>
          </Link>

          {/* Cancelled Events */}
          <Link
            to="/admin/events?status=cancelled"
            className="p-5 rounded-3xl border glass-card border-white/10 hover:border-white/20 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-400">Cancelled Events</span>
              <XCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-slate-300">{cancelledEvents.length}</div>
              <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition mt-1">Delisted records →</div>
            </div>
          </Link>

          {/* Unresolved Conflict Warnings */}
          <Link
            to="/organizer/clashes"
            className="p-5 rounded-3xl border glass-card border-amber-500/40 hover:border-amber-500 col-span-2 lg:col-span-1 transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-amber-400">Conflict Radar</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-amber-300">{unresolvedConflictCount}</div>
              <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition mt-1">Venue collisions →</div>
            </div>
          </Link>
        </div>

        {/* Priority Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Approval Queue Preview */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 glow-indigo space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="font-bold text-white text-base">Urgent Clearance Submissions</h2>
              </div>
              <Link to="/admin/approvals" className="text-xs text-indigo-400 hover:text-cyan-300 font-semibold underline">
                Open Queue →
              </Link>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No submissions awaiting administrative decision.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvents.slice(0, 3).map(e => (
                  <div key={e.id} className="p-4 bg-[#050814]/80 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="text-[11px] text-cyan-400 font-semibold">{e.organization?.name}</div>
                      <h4 className="font-bold text-white text-xs truncate">{e.title}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {e.venue?.name} · {new Date(e.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <Link
                      to="/admin/approvals"
                      className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition"
                    >
                      Audit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Audit Log Trail */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 glow-indigo space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-white text-base">Recent Administrative Audit Decisions</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">{approvals.length} total</span>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {approvals.slice(0, 5).map(app => (
                <div key={app.id} className="p-3.5 bg-[#050814]/80 rounded-2xl border border-white/10 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      app.decision === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : app.decision === 'changes_requested'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {app.decision.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(app.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] italic">"{app.reason}"</div>
                  <div className="text-[10px] text-slate-400 font-mono">Reviewer: {app.reviewer_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

