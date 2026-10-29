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
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0B192C] text-white border-b border-slate-700 shadow-md">
      {/* Top Banner: Verification & Demo Data Notice as per P17 Blueprint */}
      <aside aria-label="Prototype demo indicator" className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto text-center font-medium">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span>INT335 Prototype Mode: Demonstrating verified campus event discovery & scheduling conflict detection.</span>
        </div>
      </aside>

      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#FF6500] to-amber-400 flex items-center justify-center font-bold text-white text-xl shadow">
              P
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Campus<span className="text-[#FF6500]">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                P17
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/discover"
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                isActive('/discover') 
                  ? 'bg-slate-800 text-amber-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover
            </Link>
            <Link
              to="/calendar"
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                isActive('/calendar') 
                  ? 'bg-slate-800 text-amber-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            <Link
              to="/clubs"
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                isActive('/clubs') 
                  ? 'bg-slate-800 text-amber-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              Clubs
            </Link>
          </div>
        </div>

        {/* Right Section: Role Simulator, Workspace Link & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Role Switcher Pill (Required for testing student vs organizer vs admin) */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs px-3 py-1.5 rounded-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              title="Switch user role for test evaluation"
            >
              <span className={`w-2 h-2 rounded-full ${
                currentUser?.role === 'admin' 
                  ? 'bg-purple-400' 
                  : currentUser?.role === 'organizer' 
                  ? 'bg-blue-400' 
                  : 'bg-emerald-400'
              }`} />
              <span className="font-medium capitalize">{currentUser?.role || 'Guest'} Role</span>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded">Switch</span>
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Role Demonstration Simulator
                </div>
                {(['student', 'organizer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 ${
                      currentUser?.role === r ? 'text-amber-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span className="capitalize">{r} view</span>
                    {currentUser?.role === r && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access to Role Dashboards */}
          {currentUser?.role === 'organizer' && (
            <Link
              to="/organizer"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Organizer Studio
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin/approvals"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}

          {/* Saved / My Events for Students */}
          {currentUser && (
            <Link
              to="/my-events"
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition relative"
              title="My Schedule & Saved"
            >
              <Bookmark className="w-5 h-5" />
            </Link>
          )}

          {/* User Profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 border-l border-slate-700 text-xs text-slate-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
              <User className="w-4 h-4 text-slate-300" />
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
            className="text-[11px] bg-slate-800 px-2 py-1 rounded text-amber-400 border border-slate-700"
          >
            {currentUser?.role}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-700 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800 text-sm">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-slate-800/60 text-slate-200 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-400" /> Discover
            </Link>
            <Link
              to="/calendar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-slate-800/60 text-slate-200 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" /> Calendar
            </Link>
            <Link
              to="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-slate-800/60 text-slate-200 flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4 text-amber-400" /> My Schedule
            </Link>
            <Link
              to="/clubs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-slate-800/60 text-slate-200 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-400" /> Clubs
            </Link>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Role Workspaces
            </div>
            {currentUser?.role === 'organizer' && (
              <Link
                to="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded bg-blue-950/60 border border-blue-800 text-blue-200 text-sm"
              >
                Organizer Studio (Create & Clash Check)
              </Link>
            )}
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/approvals"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded bg-purple-950/60 border border-purple-800 text-purple-200 text-sm"
              >
                Admin Review & Approval Queue
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded bg-slate-800/60 text-slate-200 text-sm"
            >
              Profile & Preferences
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
