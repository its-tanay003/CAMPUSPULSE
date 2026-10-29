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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Card */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#38BDF8] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#F8FAFC]">{currentUser?.full_name}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30">
                  {currentUser?.role}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">{currentUser?.email}</p>
              <div className="text-xs font-medium text-[#94A3B8] flex items-center gap-2 pt-1">
                <Building className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{currentUser?.campus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Taxonomy */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 sm:p-8 shadow-md space-y-6">
          <div className="border-b border-[#334155] pb-4">
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#38BDF8]" />
              Interest Taxonomy & Feed Personalization
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                    active
                      ? 'bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-sm font-bold'
                      : 'bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border-[#334155]'
                  }`}
                >
                  {interest} {active && '✓'}
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#334155]">
            <span className="text-xs text-[#94A3B8]">
              {selectedInterests.length} categories active
            </span>

            <button
              onClick={handleSave}
              className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Preferences successfully updated!
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 sm:p-8 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#38BDF8]" />
            Alerts & Opt-in Controls
          </h2>
          <div className="space-y-3 text-xs text-[#94A3B8]">
            <label className="flex items-center gap-3 p-3.5 bg-[#0B1020] rounded-xl border border-[#334155]">
              <input type="checkbox" defaultChecked className="rounded text-[#7C5CFC] focus:ring-[#7C5CFC]" />
              <div>
                <div className="font-semibold text-[#F8FAFC]">Event Schedule Conflict Warnings</div>
                <div className="text-[11px] text-[#94A3B8]">Notify me when 2 saved events overlap in time</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3.5 bg-[#0B1020] rounded-xl border border-[#334155]">
              <input type="checkbox" defaultChecked className="rounded text-[#7C5CFC] focus:ring-[#7C5CFC]" />
              <div>
                <div className="font-semibold text-[#F8FAFC]">Registered Event Material Changes</div>
                <div className="text-[11px] text-[#94A3B8]">Alert me if venue or time changes for events I'm attending</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
