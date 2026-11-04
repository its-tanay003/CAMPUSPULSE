import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  Bookmark, 
  ShieldCheck, 
  Menu, 
  X, 
  User, 
  Layers, 
  PlusCircle, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, savedEvents } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const savedCount = savedEvents.filter(s => s.user_id === currentUser?.id).length;

  return (
    <header className="sticky top-0 z-50 bg-[#050814]/85 backdrop-blur-xl text-[#F8FAFC] border-b border-white/[0.08] shadow-2xl">
      {/* Top Banner: Verification & Demo Data Notice */}
      <aside aria-label="Prototype demo indicator" className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-cyan-950/40 border-b border-white/[0.05] text-cyan-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto text-center font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" aria-hidden="true" />
          <span className="text-[11px] sm:text-xs text-slate-300">
            <strong className="text-cyan-300 font-semibold">CampusPulse Engine:</strong> Verified campus event registry & explainable clash detection.
          </span>
        </div>
      </aside>

      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group rounded-2xl p-1 transition-transform active:scale-95">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
              P
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Campus<span className="text-indigo-400">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/[0.06] text-cyan-300 px-2 py-0.5 rounded-full border border-white/10">
                P17
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              to="/discover"
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 ${
                isActive('/discover') 
                  ? 'bg-indigo-500/15 text-cyan-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Discover
            </Link>
            <Link
              to="/calendar"
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 ${
                isActive('/calendar') 
                  ? 'bg-indigo-500/15 text-cyan-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              Calendar
            </Link>
            <Link
              to="/clubs"
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 ${
                isActive('/clubs') 
                  ? 'bg-indigo-500/15 text-cyan-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Clubs
            </Link>
          </div>
        </div>

        {/* Right Section: Role Simulator, Workspace Link & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              aria-haspopup="menu"
              aria-expanded={roleSwitcherOpen}
              aria-label={`Role simulator menu. Current role: ${currentUser?.role || 'Guest'}`}
              className="flex items-center gap-2 bg-[#0D1326]/80 hover:bg-[#151D38] border border-white/10 hover:border-white/20 text-xs px-3.5 py-2 min-h-[36px] rounded-full text-slate-200 transition-all shadow-sm backdrop-blur-md"
              title="Switch user role for test evaluation"
            >
              <span 
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${
                  currentUser?.role === 'admin' 
                    ? 'bg-purple-400 ring-2 ring-purple-400/30' 
                    : currentUser?.role === 'organizer' 
                    ? 'bg-cyan-400 ring-2 ring-cyan-400/30' 
                    : 'bg-emerald-400 ring-2 ring-emerald-400/30'
                }`} 
              />
              <span className="font-semibold capitalize">{currentUser?.role || 'Guest'} Role</span>
              <span className="text-[10px] bg-white/[0.08] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">Simulate</span>
            </button>

            {roleSwitcherOpen && (
              <div 
                role="menu"
                aria-label="Select simulation role"
                className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl py-2 z-50 text-xs glow-indigo"
              >
                <div className="px-4 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.07]">
                  Role Simulator
                </div>
                {(['student', 'organizer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    role="menuitem"
                    onClick={() => {
                      switchRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 min-h-[40px] flex items-center justify-between hover:bg-white/[0.06] transition ${
                      currentUser?.role === r ? 'text-cyan-300 font-bold bg-indigo-500/10' : 'text-slate-200'
                    }`}
                  >
                    <span className="capitalize">{r} Persona</span>
                    {currentUser?.role === r && <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access to Role Dashboards */}
          {currentUser?.role === 'organizer' && (
            <Link
              to="/organizer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-300" />
              Organizer Studio
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin/approvals"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition shadow-lg shadow-purple-600/30 border border-purple-400/30"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
              Admin Portal
            </Link>
          )}

          {/* Saved / My Events for Students */}
          {currentUser && (
            <Link
              to="/my-events"
              className="text-slate-400 hover:text-white p-2.5 rounded-2xl hover:bg-white/[0.06] transition relative border border-white/5"
              title="My Schedule & Saved"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-md">
                  {savedCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08] text-xs text-slate-400 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-white shadow-sm">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-semibold text-slate-200 line-clamp-1">{currentUser?.full_name?.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser?.role}</div>
            </div>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => switchRole(currentUser?.role === 'student' ? 'organizer' : currentUser?.role === 'organizer' ? 'admin' : 'student')}
            aria-label={`Current simulation role: ${currentUser?.role}. Click to switch role.`}
            className="text-[11px] bg-[#151C2F] px-2.5 py-1.5 min-h-[36px] rounded-lg text-[#38BDF8] border border-[#334155] font-semibold"
          >
            {currentUser?.role}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          role="region" 
          aria-label="Mobile navigation drawer"
          className="md:hidden bg-[#151C2F] border-b border-[#334155] px-4 pt-3 pb-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#334155] text-sm font-semibold">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#0B1020] text-[#F8FAFC] flex items-center gap-2 border border-[#334155]"
            >
              <Compass className="w-4 h-4 text-[#7C5CFC]" /> Discover
            </Link>
            <Link
              to="/calendar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#0B1020] text-[#F8FAFC] flex items-center gap-2 border border-[#334155]"
            >
              <Calendar className="w-4 h-4 text-[#38BDF8]" /> Calendar
            </Link>
            <Link
              to="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#0B1020] text-[#F8FAFC] flex items-center gap-2 border border-[#334155]"
            >
              <Bookmark className="w-4 h-4 text-amber-400" /> My Schedule
            </Link>
            <Link
              to="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#0B1020] text-[#F8FAFC] flex items-center gap-2 border border-[#334155]"
            >
              <Layers className="w-4 h-4 text-emerald-400" /> Clubs
            </Link>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              Role Workspaces
            </div>
            {currentUser?.role === 'organizer' && (
              <Link
                to="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 text-[#F8FAFC] text-sm font-semibold"
              >
                Organizer Studio (Create & Clash Check)
              </Link>
            )}
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/approvals"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl bg-purple-900/30 border border-purple-700/50 text-[#F8FAFC] text-sm font-semibold"
              >
                Admin Review & Approval Queue
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl bg-[#0B1020] text-[#F8FAFC] text-sm font-semibold border border-[#334155]"
            >
              Profile & Preferences
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
