import React, { useState } from 'react';
import { 
  Tag, 
  Bell, 
  Building, 
  CheckCircle2, 
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventCategory } from '../types';

const ALL_INTERESTS: EventCategory[] = [
  'Technology',
  'Workshops',
  'Cultural',
  'Music',
  'Sports',
  'Research',
  'Photography',
  'Volunteering',
  'Academic'
];

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUserInterests } = useApp();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser?.interests || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    updateUserInterests(selectedInterests);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-500/25">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{currentUser?.full_name}</h1>
                <span className="text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                  {currentUser?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentUser?.email}</p>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-2 pt-1">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentUser?.campus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Taxonomy */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Tag className="w-5 h-5 text-cyan-400" />
              Interest Taxonomy & Feed Personalization
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Transparent, user-controlled rules: events matching your chosen tags appear with a "Matches Your Interests" indicator.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {ALL_INTERESTS.map(interest => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 min-h-[38px] rounded-xl text-xs font-semibold transition border cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-md shadow-indigo-600/30 font-bold'
                      : 'bg-[#050814]/80 hover:bg-[#0b1020] text-slate-400 hover:text-white border-white/10'
                  }`}
                >
                  {interest} {active && '✓'}
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-white/[0.08]">
            <span className="text-xs text-slate-400 font-mono">
              {selectedInterests.length} categories active
            </span>

            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Preferences successfully updated!
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-cyan-400" />
            Alerts & Opt-in Controls
          </h2>
          <div className="space-y-3 text-xs text-slate-400">
            <label className="flex items-center gap-3.5 p-4 bg-[#050814]/80 rounded-2xl border border-white/10 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <div>
                <div className="font-semibold text-white">Event Schedule Conflict Warnings</div>
                <div className="text-[11px] text-slate-400">Notify me when 2 saved events overlap in time</div>
              </div>
            </label>
            <label className="flex items-center gap-3.5 p-4 bg-[#050814]/80 rounded-2xl border border-white/10 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <div>
                <div className="font-semibold text-white">Registered Event Material Changes</div>
                <div className="text-[11px] text-slate-400">Alert me if venue or time changes for events I'm attending</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
