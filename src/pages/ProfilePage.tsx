import React, { useState } from 'react';
import { 
  User, 
  Tag, 
  Bell, 
  Shield, 
  Building, 
  CheckCircle2, 
  Save,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCategory } from '../types';

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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-bold text-2xl shadow">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{currentUser?.full_name}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {currentUser?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
              <div className="text-xs font-medium text-slate-600 flex items-center gap-2 pt-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.campus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Taxonomy as per P17 Table 28 & Section 06 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              Interest Taxonomy & Feed Personalization
            </h2>
            <p className="text-xs text-slate-500 mt-1">
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
                      ? 'bg-[#0B192C] text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {interest} {active && '✓'}
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {selectedInterests.length} categories active
            </span>

            <button
              onClick={handleSave}
              className="bg-[#FF6500] hover:bg-[#e05800] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Preferences successfully updated!
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Alerts & Opt-in Controls
          </h2>
          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <div className="font-semibold text-slate-900">Event Schedule Conflict Warnings</div>
                <div className="text-slate-500 text-[11px]">Notify me when 2 saved events overlap in time</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <div className="font-semibold text-slate-900">Registered Event Material Changes</div>
                <div className="text-slate-500 text-[11px]">Alert me if venue or time changes for events I'm attending</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
