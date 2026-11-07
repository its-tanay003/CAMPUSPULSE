import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Loading CampusPulse"
      role="status"
    >
      {/* Light subtle aurora gradients */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-sky-50 rounded-full blur-[90px] pointer-events-none translate-x-28 -translate-y-20 animate-pulse duration-700" />
      <div className="absolute w-[300px] h-[300px] bg-emerald-50 rounded-full blur-[80px] pointer-events-none -translate-x-24 translate-y-24" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm space-y-7">
        {/* Animated Brand Emblem */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 p-0.5 shadow-xl animate-bounce duration-1000">
            <div className="w-full h-full bg-indigo-600 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Zap className="w-10 h-10 text-amber-800 fill-amber-300 filter drop-shadow-md" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Wordmark and Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
            Campus<span className="text-indigo-600">Pulse</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Your Campus · Your Community · Your Moments
          </p>
        </div>

        {/* High Precision Progress Bar */}
        <div className="w-full space-y-2.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-wider text-slate-500">
            <span className="text-indigo-600">{phaseText}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-3 border-t border-slate-200 font-mono">
          <span className="flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Engine
          </span>
          <span>·</span>
          <span>v1.0.0 Live</span>
        </div>
      </div>
    </div>
  );
};
export default BrandedLoadingScreen;
