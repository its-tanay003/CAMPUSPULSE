import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Mail, 
  User, 
  ArrowLeft,
  Search,
  Filter,
  FileText,
  BadgeCheck,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Organization } from '../types';

export const AdminOrganizersPage: React.FC = () => {
  const { organizations, verifyOrganization, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionConfirm, setActionConfirm] = useState<'verify' | 'revoke' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Access Guard
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto glass-card rounded-3xl p-8 glow-indigo">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Only designated university administrators (Dean of Student Welfare) may review and verify campus student bodies.
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

  // Filter organizations
  const filteredOrgs = organizations.filter(o => {
    if (filterVerified === 'verified' && !o.is_verified) return false;
    if (filterVerified === 'unverified' && o.is_verified) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.name.toLowerCase().includes(q);
      const matchLead = o.lead_name.toLowerCase().includes(q);
      const matchEmail = o.contact_email.toLowerCase().includes(q);
      if (!matchName && !matchLead && !matchEmail) return false;
    }
    return true;
  });

  const handleExecuteVerification = (verify: boolean) => {
    if (!selectedOrg) return;

    if (!verify && !reviewNotes.trim()) {
      setMessage({ type: 'error', text: 'Review notes are required when revoking or denying verification.' });
      return;
    }

    const res = verifyOrganization(selectedOrg.id, verify, reviewNotes.trim());
    if (res.success) {
      setMessage({
        type: 'success',
        text: `Organization "${selectedOrg.name}" verification status successfully updated to ${verify ? 'Verified' : 'Unverified'}.`
      });
      setSelectedOrg(null);
      setActionConfirm(null);
      setReviewNotes('');
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update verification status.' });
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-600 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Administrator Dashboard
          </Link>

          <Link
            to="/admin/venues"
            className="text-xs text-indigo-400 hover:text-indigo-600 font-semibold underline"
          >
            Manage Venue Records →
          </Link>
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 flex items-center justify-center font-bold">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Institutional Governance</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                Student Organization & Club Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Review faculty charters, authorized student representatives, and enforce anti-self-verification policies.
              </p>
            </div>
          </div>
        </div>

        {/* Notice of Controlled Verification Standard */}
        <div className="glass-card rounded-3xl p-5 text-xs text-slate-300 flex items-start gap-3.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Controlled Verification Policy: </strong>
            Ordinary users and student leads cannot grant themselves verified status. Verified organizations obtain direct publishing clearance paths and authoritative badge trust on student discovery portals.
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'glass-card border-emerald-500/50 bg-emerald-950/20 text-emerald-700'
              : 'glass-card border-rose-500/50 bg-rose-950/20 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club, lead, email..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-mono font-semibold">Filter:</span>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="text-xs p-2.5 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Organizations ({organizations.length})</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>

        {/* Organizations Registry */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">Registered Campus Bodies (<span className="font-mono text-indigo-600">{filteredOrgs.length}</span>)</span>
            <span className="font-mono">Student Welfare Governance</span>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {filteredOrgs.map(org => (
              <div key={org.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Verified Status */}
                    {org.is_verified ? (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Official Body
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Unverified Organization
                      </span>
                    )}

                    <span className="text-xs uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-white text-indigo-600 border border-slate-200">
                      {org.type}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      {org.member_count ? `${org.member_count} members` : 'Open membership'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base">
                    {org.name}
                  </h3>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                    <span>Authorized Lead: <strong className="text-slate-200">{org.lead_name}</strong></span>
                    <span>Contact: <strong className="text-slate-200">{org.contact_email}</strong></span>
                  </div>

                  {/* Verification Audit Details */}
                  {org.is_verified && org.verified_by && (
                    <div className="text-[11px] text-emerald-700/90 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-2xl mt-1.5 space-y-0.5 font-mono">
                      <div>Verified By: <strong>{org.verified_by}</strong> on {org.verified_at ? new Date(org.verified_at).toLocaleDateString('en-IN') : 'Archive record'}</div>
                      {org.verification_notes && <div className="text-slate-300 italic font-sans">"{org.verification_notes}"</div>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  {org.is_verified ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrg(org);
                        setActionConfirm('revoke');
                        setReviewNotes('');
                      }}
                      className="text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      Revoke Verification
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrg(org);
                        setActionConfirm('verify');
                        setReviewNotes('Charter verified by Dean Student Welfare Office.');
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition shadow cursor-pointer"
                    >
                      Grant Verification →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Action Modal */}
        {selectedOrg && actionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4 glow-indigo">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-indigo-400" />
                  {actionConfirm === 'verify' ? 'Confirm Organization Verification' : 'Revoke Verification Status'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrg(null);
                    setActionConfirm(null);
                  }}
                  className="text-xs bg-white hover:bg-white text-slate-400 hover:text-indigo-600 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Target Organization: <strong className="text-white">{selectedOrg.name}</strong>
                </p>
                <p>
                  Lead Representative: <strong className="text-white">{selectedOrg.lead_name}</strong> ({selectedOrg.contact_email})
                </p>
                <p>
                  Reviewing Officer: <strong className="text-indigo-400">{currentUser?.full_name}</strong> ({currentUser?.role})
                </p>
              </div>

              <div>
                <label htmlFor="verification-notes-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                  Verification Audit Notes {actionConfirm === 'revoke' && <span className="text-rose-400">*</span>}
                </label>
                <textarea
                  id="verification-notes-input"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    actionConfirm === 'verify'
                      ? 'e.g. Registered club constitution verified. Faculty advisor consent received on file.'
                      : 'e.g. Failure to renew annual student charter or inactive leadership.'
                  }
                  className="w-full text-xs p-3.5 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrg(null);
                    setActionConfirm(null);
                  }}
                  className="bg-white hover:bg-white text-slate-400 hover:text-indigo-600 text-xs font-semibold px-4 py-2.5 rounded-2xl border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteVerification(actionConfirm === 'verify')}
                  className={`text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-lg cursor-pointer ${
                    actionConfirm === 'verify'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {actionConfirm === 'verify' ? 'Confirm Verification' : 'Confirm Revocation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

