import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BrandedLoadingScreen } from './components/BrandedLoadingScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { PageTransitionWrapper } from './components/PageTransitionWrapper';

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
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
          {/* Skip link for keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
          >
            Skip to main content
          </a>

          <Navbar onOpenOnboarding={() => setOnboardingOpen(true)} />

          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <PageTransitionWrapper>
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
            </PageTransitionWrapper>
          </main>

          {/* Accessible Footer with Complete Links (Light Theme) */}
          <footer className="bg-white text-slate-600 text-xs py-12 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand column */}
                <div className="space-y-3 md:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 p-0.5 shadow-sm">
                      <div className="w-full h-full bg-indigo-600 rounded-[10px] flex items-center justify-center font-black text-white text-xs">
                        P
                      </div>
                    </div>
                    <span className="text-base font-black text-slate-900">CampusPulse</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connecting students with campus happenings through clash-free scheduling and verified chapter networks.
                  </p>
                </div>

                {/* Explore Links */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">Discover</div>
                  <ul className="space-y-1.5 text-xs">
                    <li><Link to="/discover" className="hover:text-indigo-600 transition">All Campus Events</Link></li>
                    <li><Link to="/calendar" className="hover:text-indigo-600 transition">Master Schedule</Link></li>
                    <li><Link to="/clubs" className="hover:text-indigo-600 transition">Student Chapters</Link></li>
                    <li><Link to="/my-events" className="hover:text-indigo-600 transition">Saved Passes</Link></li>
                  </ul>
                </div>

                {/* Organizers & Governance */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">Workspaces</div>
                  <ul className="space-y-1.5 text-xs">
                    <li><Link to="/organizer" className="hover:text-indigo-600 transition">Organizer Studio</Link></li>
                    <li><Link to="/organizer/create" className="hover:text-indigo-600 transition">Submit Event Proposal</Link></li>
                    <li><Link to="/organizer/clashes" className="hover:text-indigo-600 transition">Clash Radar Simulator</Link></li>
                    <li><Link to="/admin/approvals" className="hover:text-indigo-600 transition">Dean Review Queue</Link></li>
                  </ul>
                </div>

                {/* Policies & Institutional Integrity */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">Standards</div>
                  <p className="text-xs text-slate-500">
                    Built for INT335 Design Thinking & Campus Innovation. Strictly enforces row-level security and authoritative venue conflict resolution.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-emerald-600 font-bold">
                    <span>STATUS: ALL ENGINES OPERATIONAL</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
                <div>
                  © {new Date().getFullYear()} CampusPulse. All rights reserved.
                </div>
                <div className="flex items-center gap-6">
                  <a href="#privacy" className="hover:text-slate-600 transition">Privacy & RLS Standards</a>
                  <a href="#terms" className="hover:text-slate-600 transition">Terms of Service</a>
                  <span className="font-mono text-slate-500">v1.0.0-light</span>
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
