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
    <header className="sticky top-0 z-50 bg-[#0B1020]/95 backdrop-blur-md text-[#F8FAFC] border-b border-[#334155] shadow-lg">
      {/* Top Banner: Verification & Demo Data Notice */}
      <aside aria-label="Prototype demo indicator" className="bg-[#7C5CFC]/10 border-b border-[#7C5CFC]/20 text-[#38BDF8] text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto text-center font-medium">
          <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" aria-hidden="true" />
          <span>CampusPulse Prototype: Verified campus event layer & explainable schedule clash detection.</span>
        </div>
      </aside>

      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group rounded-lg p-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#38BDF8] flex items-center justify-center font-bold text-white text-xl shadow-md">
              P
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
                Campus<span className="text-[#7C5CFC]">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#151C2F] text-[#94A3B8] px-1.5 py-0.5 rounded border border-[#334155]">
                P17
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <Link
              to="/discover"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/discover') 
                  ? 'bg-[#151C2F] text-[#38BDF8] border border-[#334155]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151C2F]/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover
            </Link>
            <Link
              to="/calendar"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/calendar') 
                  ? 'bg-[#151C2F] text-[#38BDF8] border border-[#334155]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151C2F]/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            <Link
              to="/clubs"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/clubs') 
                  ? 'bg-[#151C2F] text-[#38BDF8] border border-[#334155]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151C2F]/60'
              }`}
            >
              <Layers className="w-4 h-4" />
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
              className="flex items-center gap-2 bg-[#151C2F] hover:bg-[#1E293B] border border-[#334155] text-xs px-3 py-1.5 rounded-full text-[#F8FAFC] transition shadow-sm"
              title="Switch user role for test evaluation"
            >
              <span className={`w-2 h-2 rounded-full ${
                currentUser?.role === 'admin' 
                  ? 'bg-purple-400' 
                  : currentUser?.role === 'organizer' 
                  ? 'bg-cyan-400' 
                  : 'bg-emerald-400'
              }`} />
              <span className="font-semibold capitalize">{currentUser?.role || 'Guest'} Role</span>
              <span className="text-[10px] bg-[#0B1020] text-[#94A3B8] px-1 py-0.5 rounded font-mono">Simulate</span>
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#151C2F] border border-[#334155] rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider border-b border-[#334155]">
                  Role Simulator
                </div>
                {(['student', 'organizer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-[#1E293B] transition ${
                      currentUser?.role === r ? 'text-[#38BDF8] font-bold bg-[#1E293B]/50' : 'text-[#F8FAFC]'
                    }`}
                  >
                    <span className="capitalize">{r} Persona</span>
                    {currentUser?.role === r && <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access to Role Dashboards */}
          {currentUser?.role === 'organizer' && (
            <Link
              to="/organizer"
              className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Organizer Studio
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin/approvals"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}

          {/* Saved / My Events for Students */}
          {currentUser && (
            <Link
              to="/my-events"
              className="text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-xl hover:bg-[#151C2F] transition relative"
              title="My Schedule & Saved"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7C5CFC] text-white text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 pl-2.5 border-l border-[#334155] text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center font-bold text-white border border-[#334155]">
              <User className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-semibold text-[#F8FAFC] line-clamp-1">{currentUser?.full_name?.split(' ')[0]}</div>
              <div className="text-[10px] text-[#94A3B8] capitalize">{currentUser?.role}</div>
            </div>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => switchRole(currentUser?.role === 'student' ? 'organizer' : currentUser?.role === 'organizer' ? 'admin' : 'student')}
            className="text-[11px] bg-[#151C2F] px-2.5 py-1 rounded-lg text-[#38BDF8] border border-[#334155] font-semibold"
          >
            {currentUser?.role}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#151C2F] border-b border-[#334155] px-4 pt-3 pb-6 space-y-3">
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
