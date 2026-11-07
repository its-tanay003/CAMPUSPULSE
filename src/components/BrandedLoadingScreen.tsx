import React, { useEffect, useState } from 'react';
import { Calendar, ShieldCheck, Zap } from 'lucide-react';

interface BrandedLoadingScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const BrandedLoadingScreen: React.FC<BrandedLoadingScreenProps> = ({ 
  onFinish, 
  minDurationMs = 1200 
}) => {
  const [progress, setProgress] = useState(12);
  const [fading, setFading] = useState(false);
  const [phaseText, setPhaseText] = useState('INITIALIZING REPOSITORY');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(48);
      setPhaseText('CALIBRATING CLASH RADAR');
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(85);
      setPhaseText('VERIFYING CHAPTER FEEDS');
    }, 700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setPhaseText('SYNCHRONIZED');
    }, 1000);

    const t4 = setTimeout(() => setFading(true), minDurationMs);
    const t5 = setTimeout(() => onFinish && onFinish(), minDurationMs + 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A13] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Loading CampusPulse"
      role="status"
    >
      {/* Dynamic kinetic background aurora orbs */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-[#C7F36B]/15 rounded-full blur-[90px] pointer-events-none translate-x-28 -translate-y-20 animate-pulse duration-700" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none -translate-x-24 translate-y-24" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm space-y-7">
        {/* Animated Brand Emblem with 3D Float */}
        <div className="relative group">
          <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-[#C7F36B] p-0.5 shadow-2xl glow-indigo animate-bounce duration-1000">
            <div className="w-full h-full bg-[#0D1326] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Zap className="w-11 h-11 text-[#C7F36B] fill-[#C7F36B]/25 filter drop-shadow-[0_0_12px_rgba(199,243,107,0.6)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7F36B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C7F36B]"></span>
          </span>
        </div>

        {/* Wordmark and Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Campus<span className="bg-gradient-to-r from-[#C7F36B] via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Pulse</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Your Campus · Your Community · Your Moments
          </p>
        </div>

        {/* High Precision Progress Bar with Micro-counter */}
        <div className="w-full space-y-2.5">
          <div className="w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-[#C7F36B] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(199,243,107,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-wider text-slate-400">
            <span className="text-[#C7F36B]">{phaseText}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-3 border-t border-white/10 font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
            Zero-Clash Radar
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Verified Registry
          </span>
        </div>
      </div>
    </div>
  );
};
