import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BrandedLoadingScreen } from './components/BrandedLoadingScreen';
import { OnboardingModal } from './components/OnboardingModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentHomePage } from './pages/StudentHomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { OrganizerEventsPage } from './pages/OrganizerEventsPage';
import { ClashCheckPage } from './pages/ClashCheckPage';
import { AdminApprovalsPage } from './pages/AdminApprovalsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminEventsDirectoryPage } from './pages/AdminEventsDirectoryPage';
import { AdminVenuesPage } from './pages/AdminVenuesPage';
import { AdminOrganizersPage } from './pages/AdminOrganizersPage';
import { ProfilePage } from './pages/ProfilePage';
import { ClubsDirectoryPage } from './pages/ClubsDirectoryPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export const App: React.FC = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    // Show onboarding for first-time visitors once loading finishes
    const completed = localStorage.getItem('cp_onboarding_completed');
    if (!completed) {
      const timer = setTimeout(() => setOnboardingOpen(true), 1400);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AppProvider>
      {initialLoading && (
        <BrandedLoadingScreen onFinish={() => setInitialLoading(false)} minDurationMs={1100} />
      )}

      <OnboardingModal 
        isOpen={onboardingOpen} 
        onClose={() => setOnboardingOpen(false)} 
      />

      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#090D1A] text-[#F8FAFC] antialiased selection:bg-[#4F46E5] selection:text-white">
          {/* Skip link for keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#4F46E5] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-[#C7F36B] text-xs"
          >
            Skip to main content
          </a>

          <Navbar onOpenOnboarding={() => setOnboardingOpen(true)} />

          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <Routes>
              {/* Public & Student Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<StudentHomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/my-events" element={<MyEventsPage />} />
              <Route path="/saved" element={<Navigate to="/my-events" replace />} />
              <Route path="/clubs" element={<ClubsDirectoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Organizer Studio Routes */}
              <Route path="/organizer" element={<OrganizerDashboardPage />} />
              <Route path="/organizer/events" element={<OrganizerEventsPage />} />
              <Route path="/organizer/create" element={<CreateEventPage />} />
              <Route path="/organizer/edit/:id" element={<CreateEventPage />} />
              <Route path="/organizer/clashes" element={<ClashCheckPage />} />

              {/* Administrator Approvals & Governance Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
              <Route path="/admin/events" element={<AdminEventsDirectoryPage />} />
              <Route path="/admin/venues" element={<AdminVenuesPage />} />
              <Route path="/admin/organizers" element={<AdminOrganizersPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Accessible Footer with Complete Links */}
          <footer className="bg-[#101828] text-slate-400 text-xs py-12 border-t border-white/[0.08]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand column */}
                <div className="space-y-3 md:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-[#C7F36B] p-0.5">
                      <div className="w-full h-full bg-[#101828] rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                        P
                      </div>
                    </div>
                    <span className="text-base font-extrabold text-white">CampusPulse</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connecting students with campus happenings through clash-free scheduling and verified chapter networks.
                  </p>
                </div>

                {/* Explore Links */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Discover</div>
                  <ul className="space-y-1.5 text-xs">
                    <li><Link to="/discover" className="hover:text-[#C7F36B] transition">All Campus Events</Link></li>
                    <li><Link to="/calendar" className="hover:text-[#C7F36B] transition">Master Schedule</Link></li>
                    <li><Link to="/clubs" className="hover:text-[#C7F36B] transition">Student Chapters</Link></li>
                    <li><Link to="/my-events" className="hover:text-[#C7F36B] transition">Saved Passes</Link></li>
                  </ul>
                </div>

                {/* Organizers & Governance */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Workspaces</div>
                  <ul className="space-y-1.5 text-xs">
                    <li><Link to="/organizer" className="hover:text-[#C7F36B] transition">Organizer Studio</Link></li>
                    <li><Link to="/organizer/create" className="hover:text-[#C7F36B] transition">Submit Event Proposal</Link></li>
                    <li><Link to="/organizer/clashes" className="hover:text-[#C7F36B] transition">Clash Radar Simulator</Link></li>
                    <li><Link to="/admin/approvals" className="hover:text-[#C7F36B] transition">Dean Review Queue</Link></li>
                  </ul>
                </div>

                {/* Policies & Institutional Integrity */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase text-white tracking-wider">Standards</div>
                  <p className="text-xs text-slate-400">
                    Built for INT335 Design Thinking & Campus Innovation. Strictly enforces row-level security and authoritative venue conflict resolution.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#C7F36B]">
                    <span>STATUS: ALL ENGINES OPERATIONAL</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                <div>
                  © {new Date().getFullYear()} CampusPulse. All rights reserved.
                </div>
                <div className="flex items-center gap-6">
                  <a href="#privacy" className="hover:text-slate-300 transition">Privacy & RLS Standards</a>
                  <a href="#terms" className="hover:text-slate-300 transition">Terms of Service</a>
                  <span className="font-mono text-slate-400">v1.0.0-p17</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
