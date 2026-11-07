import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  X,
  Zap,
  Users
} from 'lucide-react';
import { Button } from './ui';
import { useApp } from '../context/AppContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_INTERESTS = [
  'Technology',
  'Cultural',
  'Sports',
  'Workshops',
  'Music',
  'Entrepreneurship',
  'Academic',
  'Social'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserInterests, switchRole } = useApp();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentUser?.interests || ['Technology', 'Workshops']
  );

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFinish = () => {
    updateUserInterests(selectedInterests);
    localStorage.setItem('cp_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="glass-card rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-white/10 glow-indigo relative overflow-hidden shadow-2xl">
        {/* Kinetic Ambient Aurora Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C7F36B]/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C7F36B]">
            <Zap className="w-4 h-4 fill-[#C7F36B]" />
            <span>CAMPUSPULSE ONBOARDING WALKTHROUGH</span>
          </div>
          <button
            onClick={handleFinish}
            aria-label="Skip walkthrough"
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Content with Smooth Slide Transitions */}
        <div className="py-6 space-y-6 relative z-10 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-page-enter">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[#C7F36B] shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 id="onboarding-title" className="text-2xl font-black text-white tracking-tight">
                  Welcome to CampusPulse
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your university intelligence network for verified event discovery, schedule clash detection, and instant student chapter registrations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 hover-lift">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    Discovery Feed
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Explore hackathons, cultural nights, and workshops with instant 1-click admission passes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1 hover-lift">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-[#C7F36B]" />
                    Zero-Clash Radar
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Prevent physical venue double-booking and identify personal overlaps on your schedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-page-enter">
              <div className="w-14 h-14 rounded-2xl bg-[#C7F36B]/20 border border-[#C7F36B]/30 flex items-center justify-center text-[#C7F36B] shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 id="onboarding-title" className="text-2xl font-black text-white tracking-tight">
                  Calibrate Your Interests
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Choose the campus topics you love. We’ll surface customized recommendations on your student agenda.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {AVAILABLE_INTERESTS.map(interest => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 cursor-pointer active-press ${
                        active
                          ? 'bg-[#4F46E5] border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 text-[#C7F36B]" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-page-enter">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 id="onboarding-title" className="text-2xl font-black text-white tracking-tight">
                  Choose Your Workspace Role
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  CampusPulse features distinct workspaces. You can switch personas anytime from the top navigation simulator.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className={`w-full p-4 rounded-2xl text-left border transition flex items-center justify-between cursor-pointer active-press ${
                    currentUser?.role === 'student'
                      ? 'bg-indigo-600/25 border-indigo-500 text-white'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Student Explorer</span>
                      <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md">Default</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Discover, register, bookmark, and resolve personal schedule collisions</div>
                  </div>
                  {currentUser?.role === 'student' && <Check className="w-4 h-4 text-[#C7F36B]" />}
                </button>

                <button
                  type="button"
                  onClick={() => switchRole('organizer')}
                  className={`w-full p-4 rounded-2xl text-left border transition flex items-center justify-between cursor-pointer active-press ${
                    currentUser?.role === 'organizer'
                      ? 'bg-indigo-600/25 border-indigo-500 text-white'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">Club & Society Organizer</div>
                    <div className="text-xs text-slate-400 mt-0.5">Propose events, check live venue availability, and track clearances</div>
                  </div>
                  {currentUser?.role === 'organizer' && <Check className="w-4 h-4 text-[#C7F36B]" />}
                </button>

                <button
                  type="button"
                  onClick={() => switchRole('admin')}
                  className={`w-full p-4 rounded-2xl text-left border transition flex items-center justify-between cursor-pointer active-press ${
                    currentUser?.role === 'admin'
                      ? 'bg-indigo-600/25 border-indigo-500 text-white'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">Dean & Campus Administrator</div>
                    <div className="text-xs text-slate-400 mt-0.5">Authoritative approval queue, venue master, and audit logs</div>
                  </div>
                  {currentUser?.role === 'admin' && <Check className="w-4 h-4 text-[#C7F36B]" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-[#C7F36B]' : 'w-2 bg-slate-700'
                }`} 
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 cursor-pointer active-press"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={handleFinish}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-[#C7F36B] text-slate-950 font-black cursor-pointer active-press"
              >
                <span>Enter CampusPulse</span>
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
