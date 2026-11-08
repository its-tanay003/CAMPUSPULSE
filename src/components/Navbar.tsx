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
  Zap,
  Home,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { NotificationCenterModal } from './NotificationCenterModal';

interface NavbarProps {
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnboarding }) => {
  const { currentUser, switchRole, savedEvents, notifications } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const savedCount = savedEvents.filter(s => s.user_id === currentUser?.id).length;
  
  const userNotifs = notifications.filter(n => n.user_id === currentUser?.id);
  const unreadNotifsCount = userNotifs.filter(n => !n.is_read).length;

  return (
    <>
      <NotificationCenterModal 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl text-[#11152B] border-b border-[#E7E9F0] shadow-sm">
        {/* Top Banner: Verification & Conflict Radar Status */}
        <aside aria-label="Prototype demo indicator" className="bg-[#F0EDFF] border-b border-[#E7E9F0]/70 text-[#5145E5] text-xs px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto text-center font-medium">
            <span className="w-2 h-2 rounded-full bg-[#16A36A] shadow-[0_0_8px_rgba(22,163,106,0.6)] animate-pulse shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs text-[#11152B]">
              <strong className="text-[#5145E5] font-bold">CampusPulse Engine:</strong> Zero-clash room scheduling & verified campus chapter network.
            </span>
          </div>
        </aside>

        <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group rounded-2xl p-1 transition-transform active:scale-95 active-press">
              <div className="w-10 h-10 rounded-2xl bg-[#5145E5] p-0.5 shadow-md glow-indigo group-hover:scale-105 transition-all flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#C8F169] fill-[#C8F169]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-[#11152B] group-hover:text-[#5145E5] transition-colors">
                  Campus<span className="text-[#5145E5]">Pulse</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#F0EDFF] text-[#5145E5] px-2 py-0.5 rounded-full border border-[#5145E5]/20">
                  Live
                </span>
              </div>
            </Link>

            {/* Primary Nav Links */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <Link
                to="/home"
                className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                  isActive('/home') 
                    ? 'bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/30 shadow-xs font-bold' 
                    : 'text-[#687087] hover:text-[#11152B] hover:bg-[#F7F8FC]'
                }`}
              >
                <Home className="w-4 h-4 text-[#5145E5]" />
                Student Portal
              </Link>
              <Link
                to="/discover"
                className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                  isActive('/discover') 
                    ? 'bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/30 shadow-xs font-bold' 
                    : 'text-[#687087] hover:text-[#11152B] hover:bg-[#F7F8FC]'
                }`}
              >
                <Compass className="w-4 h-4 text-[#5145E5]" />
                Discover
              </Link>
              <Link
                to="/calendar"
                className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                  isActive('/calendar') 
                    ? 'bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/30 shadow-xs font-bold' 
                    : 'text-[#687087] hover:text-[#11152B] hover:bg-[#F7F8FC]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#5145E5]" />
                Calendar
              </Link>
              <Link
                to="/clubs"
                className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 hover-lift ${
                  isActive('/clubs') 
                    ? 'bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/30 shadow-xs font-bold' 
                    : 'text-[#687087] hover:text-[#11152B] hover:bg-[#F7F8FC]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#5145E5]" />
                Chapters
              </Link>
            </div>
          </div>

          {/* Right Section: Role Simulator, Notifications, Workspace & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              aria-label={`Open notifications. ${unreadNotifsCount} unread.`}
              className="p-2 text-[#687087] hover:text-[#5145E5] hover:bg-[#F0EDFF] rounded-2xl transition border border-[#E7E9F0] cursor-pointer relative active-press"
              title="Campus Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5484D] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                aria-label="Open welcome tour"
                className="p-2 text-[#687087] hover:text-[#5145E5] hover:bg-[#F0EDFF] rounded-2xl transition border border-[#E7E9F0] cursor-pointer active-press"
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
                className="flex items-center gap-2 bg-[#F7F8FC] hover:bg-white border border-[#E7E9F0] text-xs px-3.5 py-2 min-h-[36px] rounded-full text-[#11152B] transition-all shadow-xs cursor-pointer active-press"
                title="Switch user role for test evaluation"
              >
                <span 
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full ${
                    currentUser?.role === 'admin' 
                      ? 'bg-purple-600 ring-2 ring-purple-600/20' 
                      : currentUser?.role === 'organizer' 
                      ? 'bg-[#5145E5] ring-2 ring-[#5145E5]/20' 
                      : 'bg-[#16A36A] ring-2 ring-[#16A36A]/20'
                  }`} 
                />
                <span className="font-bold capitalize">{currentUser?.role || 'Guest'} Role</span>
                <span className="text-[10px] bg-[#E7E9F0] text-[#687087] px-1.5 py-0.5 rounded-full font-mono">Simulate</span>
              </button>

              {roleSwitcherOpen && (
                <div 
                  role="menu"
                  aria-label="Select simulation role"
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#E7E9F0] rounded-2xl shadow-xl py-2 z-50 text-xs animate-page-enter"
                >
                  <div className="px-4 py-2 text-[10px] font-mono font-bold text-[#9299AA] uppercase tracking-wider border-b border-[#E7E9F0]">
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
                      className={`w-full text-left px-4 py-2.5 min-h-[40px] flex items-center justify-between hover:bg-[#F0EDFF] transition cursor-pointer ${
                        currentUser?.role === r ? 'text-[#5145E5] font-bold bg-[#F0EDFF]/60' : 'text-[#11152B]'
                      }`}
                    >
                      <span className="capitalize">{r} Persona</span>
                      {currentUser?.role === r && <CheckCircle2 className="w-4 h-4 text-[#5145E5]" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Workspace Shortcut CTAs */}
            {currentUser?.role === 'organizer' && (
              <Link
                to="/organizer"
                className="bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition shadow-sm active-press"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#C8F169]" />
                Organizer Studio
              </Link>
            )}

            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/approvals"
                className="bg-[#11152B] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition shadow-sm active-press"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8F169]" />
                Dean Portal
              </Link>
            )}

            {/* Saved Passes Bookmark Shortcut */}
            {currentUser && (
              <Link
                to="/my-events"
                className="text-[#687087] hover:text-[#5145E5] p-2.5 rounded-2xl hover:bg-[#F0EDFF] transition relative border border-[#E7E9F0] active-press"
                title="My Schedule & Saved"
              >
                <Bookmark className="w-4 h-4" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5145E5] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                    {savedCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-3 border-l border-[#E7E9F0] text-xs text-[#687087] hover:text-[#11152B] active-press"
            >
              <div className="w-8 h-8 rounded-full bg-[#F0EDFF] border border-[#5145E5]/20 flex items-center justify-center font-bold text-[#5145E5] shadow-xs">
                <User className="w-4 h-4 text-[#5145E5]" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-bold text-[#11152B] line-clamp-1">{currentUser?.full_name?.split(' ')[0]}</div>
                <div className="text-[10px] text-[#9299AA] capitalize">{currentUser?.role}</div>
              </div>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              aria-label="Open notifications"
              className="p-2 min-h-[36px] text-[#5145E5] bg-[#F0EDFF] rounded-xl relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E5484D] text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => switchRole(currentUser?.role === 'student' ? 'organizer' : currentUser?.role === 'organizer' ? 'admin' : 'student')}
              aria-label={`Current simulation role: ${currentUser?.role}. Click to switch role.`}
              className="text-[11px] bg-[#F0EDFF] px-2.5 py-1.5 min-h-[36px] rounded-xl text-[#5145E5] border border-[#5145E5]/30 font-bold active-press cursor-pointer"
            >
              {currentUser?.role}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#687087] hover:text-[#11152B] rounded-xl active-press cursor-pointer"
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
            className="md:hidden bg-white border-b border-[#E7E9F0] px-4 pt-3 pb-6 space-y-3 animate-page-enter shadow-lg"
          >
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#E7E9F0] text-sm font-semibold">
              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#F7F8FC] text-[#11152B] flex items-center gap-2 border border-[#E7E9F0] hover:bg-[#F0EDFF]"
              >
                <Home className="w-4 h-4 text-[#5145E5]" /> Student Portal
              </Link>
              <Link
                to="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#F7F8FC] text-[#11152B] flex items-center gap-2 border border-[#E7E9F0] hover:bg-[#F0EDFF]"
              >
                <Compass className="w-4 h-4 text-[#5145E5]" /> Discover
              </Link>
              <Link
                to="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#F7F8FC] text-[#11152B] flex items-center gap-2 border border-[#E7E9F0] hover:bg-[#F0EDFF]"
              >
                <Calendar className="w-4 h-4 text-[#5145E5]" /> Calendar
              </Link>
              <Link
                to="/my-events"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[#F7F8FC] text-[#11152B] flex items-center gap-2 border border-[#E7E9F0] hover:bg-[#F0EDFF]"
              >
                <Bookmark className="w-4 h-4 text-amber-500" /> My Passes
              </Link>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-[#9299AA] uppercase tracking-wider mb-1">
                Role Workspaces
              </div>
              {currentUser?.role === 'organizer' && (
                <Link
                  to="/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 rounded-xl bg-[#F0EDFF] border border-[#5145E5]/30 text-[#5145E5] text-sm font-bold"
                >
                  Organizer Studio (Create & Clash Check)
                </Link>
              )}
              {currentUser?.role === 'admin' && (
                <Link
                  to="/admin/approvals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-sm font-bold"
                >
                  Dean Review & Approval Queue
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl bg-[#F7F8FC] text-[#11152B] text-sm font-semibold border border-[#E7E9F0]"
              >
                Profile & Preferences
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
export default Navbar;
