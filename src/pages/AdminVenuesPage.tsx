import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  HelpCircle, 
  ArrowLeft,
  Database,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Venue } from '../types';

export const AdminVenuesPage: React.FC = () => {
  const { venues, updateVenue, currentUser } = useApp();

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editName, setEditName] = useState('');
  const [editBuilding, setEditBuilding] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editAuthority, setEditAuthority] = useState('');
  const [editDataSource, setEditDataSource] = useState('');
  const [editIsAuthoritative, setEditIsAuthoritative] = useState(true);
  const [editIsActive, setEditIsActive] = useState(true);
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
            Only campus administrators with Estate Office clearance can manage physical room and venue inventory.
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

  const handleStartEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setEditName(venue.name);
    setEditBuilding(venue.building);
    setEditLocation(venue.location);
    setEditCapacity(venue.capacity ? String(venue.capacity) : '');
    setEditAuthority(venue.authority);
    setEditDataSource(venue.data_source || 'Central Estate Registry');
    setEditIsAuthoritative(venue.is_authoritative);
    setEditIsActive(venue.is_active);
    setMessage(null);
  };

  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;

    if (!editName.trim() || !editBuilding.trim() || !editAuthority.trim()) {
      setMessage({ type: 'error', text: 'Name, building, and allocation authority are required.' });
      return;
    }

    const res = updateVenue({
      id: editingVenue.id,
      name: editName.trim(),
      building: editBuilding.trim(),
      location: editLocation.trim(),
      capacity: editCapacity ? Number(editCapacity) : undefined,
      authority: editAuthority.trim(),
      data_source: editDataSource.trim(),
      is_authoritative: editIsAuthoritative,
      is_active: editIsActive
    });

    if (res.success) {
      setMessage({ type: 'success', text: `Venue "${editName}" record updated successfully.` });
      setEditingVenue(null);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update venue record.' });
    }
  };

  const handleToggleActive = (venue: Venue) => {
    const res = updateVenue({
      id: venue.id,
      is_active: !venue.is_active
    });
    if (res.success) {
      setMessage({
        type: 'success',
        text: `Venue "${venue.name}" is now ${!venue.is_active ? 'Active & Bookable' : 'Deactivated / Offline'}.`
      });
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
            to="/admin/organizers"
            className="text-xs text-indigo-400 hover:text-indigo-600 font-semibold underline"
          >
            Organizer Verification Governance →
          </Link>
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Campus Estate</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                Authoritative Campus Venue & Room Inventory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Manage university facilities, verify authoritative data sources, and activate/deactivate facilities for collision radar accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Alert Banner */}
        <div className="glass-card rounded-3xl p-5 text-xs text-slate-300 flex items-start gap-3.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Authoritative Data Standard: </strong>
            In accordance with campus scheduling governance, venues marked as <em>Authoritative</em> stem from verified estate feeds. Venues marked as <em>Demonstration/Non-Authoritative</em> will display disclaimers to prevent erroneous collision blocks.
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

        {/* Venue Registry Cards */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">Campus Facilities (<span className="font-mono text-indigo-600">{venues.length}</span>)</span>
            <span className="font-mono">Estate Management Registry</span>
          </div>

          <div className="divide-y divide-white/[0.08]">
            {venues.map(venue => (
              <div key={venue.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pill */}
                    <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      venue.is_active
                        ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600'
                    }`}>
                      {venue.is_active ? 'Active & Bookable' : 'Deactivated'}
                    </span>

                    {/* Authoritative Badge */}
                    {venue.is_authoritative ? (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Authoritative Source
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/30 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        Unconfirmed / Informal
                      </span>
                    )}

                    {/* Demo Record Badge */}
                    {venue.is_demo && (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-indigo-600 border border-cyan-500/30">
                        Demonstration Record
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-white text-base">
                    {venue.name}
                  </h3>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                    <span>Building: <strong className="text-slate-200">{venue.building}</strong></span>
                    <span>Location: <strong className="text-slate-200">{venue.location}</strong></span>
                    <span>Capacity: <strong className="text-slate-200 font-mono">{venue.capacity || 'N/A'}</strong></span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                    <span>Authority: <strong className="text-indigo-400">{venue.authority}</strong></span>
                    <span>·</span>
                    <span>Data Source: <strong className="text-slate-300">{venue.data_source || 'Central System'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(venue)}
                    className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-600 border border-indigo-500/40 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(venue)}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
                      venue.is_active
                        ? 'text-amber-800 hover:bg-amber-500/10 border-amber-500/30'
                        : 'text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    {venue.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editingVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 glow-indigo relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Edit Venue: {editingVenue.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingVenue(null)}
                  className="text-xs bg-white hover:bg-white text-slate-400 hover:text-indigo-600 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveVenue} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="venue-name-input" className="block font-mono font-semibold text-slate-400 mb-2">Venue Name *</label>
                  <input
                    id="venue-name-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="venue-building-input" className="block font-mono font-semibold text-slate-400 mb-2">Building Block *</label>
                    <input
                      id="venue-building-input"
                      type="text"
                      value={editBuilding}
                      onChange={(e) => setEditBuilding(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="venue-location-input" className="block font-mono font-semibold text-slate-400 mb-2">Zone / Campus Location</label>
                    <input
                      id="venue-location-input"
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="venue-cap-input" className="block font-mono font-semibold text-slate-400 mb-2">Capacity</label>
                    <input
                      id="venue-cap-input"
                      type="number"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="venue-authority-input" className="block font-mono font-semibold text-slate-400 mb-2">Governing Authority *</label>
                    <input
                      id="venue-authority-input"
                      type="text"
                      value={editAuthority}
                      onChange={(e) => setEditAuthority(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="venue-source-input" className="block font-mono font-semibold text-slate-400 mb-2">Authoritative Data Source Feed</label>
                  <input
                    id="venue-source-input"
                    type="text"
                    value={editDataSource}
                    onChange={(e) => setEditDataSource(e.target.value)}
                    placeholder="e.g. Official Campus Enterprise Room Allocation System"
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsAuthoritative}
                      onChange={(e) => setEditIsAuthoritative(e.target.checked)}
                      className="rounded bg-white border-slate-200 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-300">
                      Authoritative Booking Source (Direct venue collisions trigger Hard Conflicts)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="rounded bg-white border-slate-200 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-300">
                      Active Facility (Available for organizer booking requests)
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingVenue(null)}
                    className="bg-white hover:bg-white text-slate-400 hover:text-indigo-600 font-semibold px-4 py-2.5 rounded-2xl border border-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
