import React, { useState } from 'react';
import { 
  Tag, 
  Bell, 
  Building, 
  CheckCircle2, 
  Save,
  Sparkles,
  ShieldCheck,
  User
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
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-[#C7F36B] p-0.5 shadow-xl glow-indigo">
              <div className="w-full h-full bg-[#101828] rounded-[22px] flex items-center justify-center font-black text-2xl text-white">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{currentUser?.full_name}</h1>
                <span className="text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/40">
                  {currentUser?.role} persona
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentUser?.email}</p>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-2 pt-1 font-mono">
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
              <Tag className="w-5 h-5 text-[#C7F36B]" />
              Interest Taxonomy & Feed Personalization
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Transparent, user-controlled rules: events matching your chosen tags appear on your discovery feed and student dashboard.
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
                      ? 'bg-[#4F46E5] text-white border-indigo-400/50 shadow-md font-bold'
                      : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border-white/10'
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
              className="bg-gradient-to-r from-emerald-500 to-[#C7F36B] hover:opacity-95 text-slate-950 text-xs font-black px-5 py-2.5 rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
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
            <label className="flex items-center gap-3.5 p-4 bg-black/40 rounded-2xl border border-white/10 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
              <div>
                <div className="font-semibold text-white">Event Schedule Conflict Warnings</div>
                <div className="text-[11px] text-slate-400">Notify me when 2 saved events overlap in time</div>
              </div>
            </label>
            <label className="flex items-center gap-3.5 p-4 bg-black/40 rounded-2xl border border-white/10 cursor-pointer">
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
