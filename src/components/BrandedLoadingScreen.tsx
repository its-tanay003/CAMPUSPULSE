import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, Zap, ShieldCheck } from 'lucide-react';

interface BrandedLoadingScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const BrandedLoadingScreen: React.FC<BrandedLoadingScreenProps> = ({ 
  onFinish, 
  minDurationMs = 1200 
}) => {
  const [progress, setProgress] = useState(15);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(65), 350);
    const timer2 = setTimeout(() => setProgress(100), 850);
    const timer3 = setTimeout(() => setFading(true), minDurationMs);
    const timer4 = setTimeout(() => onFinish && onFinish(), minDurationMs + 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [minDurationMs, onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090D1A] transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading CampusPulse"
      role="status"
    >
      {/* Dynamic ambient background glow */}
      <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-80 h-80 bg-[#C7F36B]/10 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-16" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm space-y-6">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-[#C7F36B] p-0.5 shadow-2xl glow-indigo animate-bounce duration-1000">
            <div className="w-full h-full bg-[#101828] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Zap className="w-10 h-10 text-[#C7F36B] fill-[#C7F36B]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C7F36B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C7F36B]"></span>
          </span>
        </div>

        {/* Wordmark and Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            Campus<span className="text-[#C7F36B]">Pulse</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Your Campus · Your Community · Your Moments
          </p>
        </div>

        {/* High Precision Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-[#C7F36B] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>SYNCHRONIZING REPOSITORY</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7F36B]" />
            Zero-Clash Engine
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Verified Chapters
          </span>
        </div>
      </div>
    </div>
  );
};
