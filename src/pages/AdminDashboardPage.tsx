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
      <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#151C2F] border border-rose-500/30 rounded-2xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">Administrative Access Restricted</h2>
          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            Only provisioned institutional administrators (Dean of Student Welfare & Estate Allocation Office) can access the Campus Admin Workspace.
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

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Institutional Administration
              </span>
              <span className="text-xs text-[#94A3B8]">
                · {currentUser?.full_name} ({currentUser?.email})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Administrative Operations & Governance
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
              Clearance oversight for campus venues, student organization proposals, and schedule clash resolution across all University blocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/approvals"
              className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              Approval Queue ({pendingEvents.length})
            </Link>
            <Link
              to="/admin/events"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              All Campus Events
            </Link>
            <Link
              to="/admin/venues"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              Venues Registry
            </Link>
            <Link
              to="/admin/organizers"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
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
            className="p-4 rounded-2xl border bg-[#151C2F] border-amber-500/40 hover:border-amber-500 transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-300">{pendingEvents.length}</div>
              <div className="text-[10px] text-[#94A3B8] group-hover:text-[#38BDF8] transition">Review queue →</div>
            </div>
          </Link>

          {/* Published Events */}
          <Link
            to="/admin/events?status=published"
            className="p-4 rounded-2xl border bg-[#151C2F] border-emerald-500/40 hover:border-emerald-500 transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">Published Events</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-300">{publishedEvents.length}</div>
              <div className="text-[10px] text-[#94A3B8] group-hover:text-[#38BDF8] transition">Active on feeds →</div>
            </div>
          </Link>

          {/* Requiring Changes */}
          <Link
            to="/admin/events?status=changes_requested"
            className="p-4 rounded-2xl border bg-[#151C2F] border-orange-500/40 hover:border-orange-500 transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-400">Needs Changes</span>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-orange-300">{changesRequestedEvents.length}</div>
              <div className="text-[10px] text-[#94A3B8] group-hover:text-[#38BDF8] transition">Awaiting organizer edit →</div>
            </div>
          </Link>

          {/* Cancelled Events */}
          <Link
            to="/admin/events?status=cancelled"
            className="p-4 rounded-2xl border bg-[#151C2F] border-slate-700 hover:border-slate-500 transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Cancelled Events</span>
              <XCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-300">{cancelledEvents.length}</div>
              <div className="text-[10px] text-[#94A3B8] group-hover:text-[#38BDF8] transition">Delisted records →</div>
            </div>
          </Link>

          {/* Unresolved Conflict Warnings */}
          <Link
            to="/organizer/clashes"
            className="p-4 rounded-2xl border bg-[#151C2F] border-amber-500/40 hover:border-amber-500 col-span-2 lg:col-span-1 transition flex flex-col justify-between group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400">Conflict Radar</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-300">{unresolvedConflictCount}</div>
              <div className="text-[10px] text-[#94A3B8] group-hover:text-[#38BDF8] transition">Venue collisions →</div>
            </div>
          </Link>
        </div>

        {/* Priority Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Approval Queue Preview */}
          <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h2 className="font-bold text-[#F8FAFC] text-sm">Urgent Clearance Submissions</h2>
              </div>
              <Link to="/admin/approvals" className="text-xs text-[#38BDF8] hover:underline font-semibold">
                Open Queue →
              </Link>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="py-8 text-center text-[#94A3B8] text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No submissions awaiting administrative decision.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvents.slice(0, 3).map(e => (
                  <div key={e.id} className="p-3.5 bg-[#0B1020] rounded-xl border border-[#334155] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#38BDF8] font-semibold">{e.organization?.name}</div>
                      <h4 className="font-bold text-[#F8FAFC] text-xs truncate">{e.title}</h4>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">
                        {e.venue?.name} · {new Date(e.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <Link
                      to="/admin/approvals"
                      className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Audit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Audit Log Trail */}
          <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-[#F8FAFC] text-sm">Recent Administrative Audit Decisions</h2>
              </div>
              <span className="text-xs text-[#94A3B8]">{approvals.length} total</span>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {approvals.slice(0, 5).map(app => (
                <div key={app.id} className="p-3 bg-[#0B1020] rounded-xl border border-[#334155] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      app.decision === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : app.decision === 'changes_requested'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {app.decision.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      {new Date(app.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] italic">"{app.reason}"</div>
                  <div className="text-[10px] text-[#94A3B8]">Reviewer: {app.reviewer_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

