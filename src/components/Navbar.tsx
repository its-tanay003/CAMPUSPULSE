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
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnboarding }) => {
  const { currentUser, switchRole, savedEvents } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const savedCount = savedEvents.filter(s => s.user_id === currentUser?.id).length;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl text-slate-900 border-b border-slate-200/80 shadow-sm">
      {/* Top Banner: Verification & Demo Data Notice with Live Status */}
      <aside aria-label="Prototype demo indicator" className="bg-slate-50 border-b border-slate-200/60 text-slate-600 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto text-center font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse shrink-0" aria-hidden="true" />
          <span className="text-[11px] sm:text-xs text-slate-700">
            <strong className="text-indigo-600 font-semibold">CampusPulse Live:</strong> Zero-clash scheduling & authoritative university event governance.
          </span>
        </div>
      </aside>

      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group rounded-2xl p-1 transition-transform active:scale-95 active-press">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 p-0.5 shadow-md group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-indigo-600 rounded-[14px] flex items-center justify-center font-black text-white text-lg">
                <Zap className="w-5 h-5 text-amber-800 fill-amber-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Campus<span className="text-indigo-600">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/80">
                Live
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              to="/discover"
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                isActive('/discover') 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              Discover
            </Link>
            <Link
              to="/calendar"
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                isActive('/calendar') 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              Calendar
            </Link>
            <Link
              to="/clubs"
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                isActive('/clubs') 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              Clubs
            </Link>
          </div>
        </div>

        {/* Right Section: Role Simulator, Onboarding Trigger, Workspace & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Onboarding / Tour Trigger */}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              aria-label="Open welcome tour"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-2xl transition border border-slate-200 cursor-pointer active-press"
              title="Tour & Product Intro"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              aria-haspopup="menu"
              aria-expanded={roleSwitcherOpen}
              aria-label={`Role simulator menu. Current role: ${currentUser?.role || 'Guest'}`}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs px-3.5 py-2 min-h-[36px] rounded-full text-slate-700 transition-all shadow-sm cursor-pointer active-press"
              title="Switch user role for test evaluation"
            >
              <span 
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${
                  currentUser?.role === 'admin' 
                    ? 'bg-purple-600 ring-2 ring-purple-600/20' 
                    : currentUser?.role === 'organizer' 
                    ? 'bg-blue-600 ring-2 ring-blue-600/20' 
                    : 'bg-emerald-600 ring-2 ring-emerald-600/20'
                }`} 
              />
              <span className="font-semibold capitalize text-slate-800">{currentUser?.role || 'Guest'} Role</span>
              <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">Simulate</span>
            </button>

            {roleSwitcherOpen && (
              <div 
                role="menu"
                aria-label="Select simulation role"
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-page-enter"
              >
                <div className="px-4 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
                    className={`w-full text-left px-4 py-2.5 min-h-[40px] flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                      currentUser?.role === r ? 'text-indigo-600 font-bold bg-indigo-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="capitalize">{r} Persona</span>
                    {currentUser?.role === r && <CheckCircle2 className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access to Role Dashboards */}
          {currentUser?.role === 'organizer' && (
            <Link
              to="/organizer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition shadow-sm active-press"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-200" />
              Organizer Studio
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin/approvals"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition shadow-sm active-press"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
              Admin Portal
            </Link>
          )}

          {/* Saved / My Events for Students */}
          {currentUser && (
            <Link
              to="/my-events"
              className="text-slate-500 hover:text-slate-900 p-2.5 rounded-2xl hover:bg-slate-100 transition relative border border-slate-200 active-press"
              title="My Schedule & Saved"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
                  {savedCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 text-xs text-slate-600 hover:text-slate-900 active-press"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 shadow-sm">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-semibold text-slate-800 line-clamp-1">{currentUser?.full_name?.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-500 capitalize">{currentUser?.role}</div>
            </div>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => switchRole(currentUser?.role === 'student' ? 'organizer' : currentUser?.role === 'organizer' ? 'admin' : 'student')}
            aria-label={`Current simulation role: ${currentUser?.role}. Click to switch role.`}
            className="text-[11px] bg-slate-100 px-2.5 py-1.5 min-h-[36px] rounded-xl text-indigo-700 border border-slate-200 font-semibold active-press cursor-pointer"
          >
            {currentUser?.role}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-xl active-press cursor-pointer"
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
          className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-page-enter shadow-lg"
        >
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200 text-sm font-semibold">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 border border-slate-200 hover:bg-slate-100"
            >
              <Compass className="w-4 h-4 text-indigo-600" /> Discover
            </Link>
            <Link
              to="/calendar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 border border-slate-200 hover:bg-slate-100"
            >
              <Calendar className="w-4 h-4 text-indigo-600" /> Calendar
            </Link>
            <Link
              to="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 border border-slate-200 hover:bg-slate-100"
            >
              <Bookmark className="w-4 h-4 text-amber-500" /> My Schedule
            </Link>
            <Link
              to="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-800 flex items-center gap-2 border border-slate-200 hover:bg-slate-100"
            >
              <Layers className="w-4 h-4 text-indigo-600" /> Clubs
            </Link>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
              Role Workspaces
            </div>
            {currentUser?.role === 'organizer' && (
              <Link
                to="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-semibold"
              >
                Organizer Studio (Create & Clash Check)
              </Link>
            )}
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/approvals"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-sm font-semibold"
              >
                Admin Review & Approval Queue
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl bg-slate-50 text-slate-800 text-sm font-semibold border border-slate-200"
            >
              Profile & Preferences
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
