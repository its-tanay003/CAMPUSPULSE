import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { ClashCheckPage } from './pages/ClashCheckPage';
import { AdminApprovalsPage } from './pages/AdminApprovalsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ClubsDirectoryPage } from './pages/ClubsDirectoryPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#0B1020] text-[#F8FAFC] antialiased selection:bg-[#7C5CFC] selection:text-white">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public & Student Routes */}
              <Route path="/" element={<LandingPage />} />
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
              <Route path="/organizer/create" element={<CreateEventPage />} />
              <Route path="/organizer/clashes" element={<ClashCheckPage />} />

              {/* Administrator Approvals & Governance Routes */}
              <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
              <Route path="/admin" element={<Navigate to="/admin/approvals" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Accessible Footer */}
          <footer className="bg-[#151C2F] text-[#94A3B8] text-xs py-8 border-t border-[#334155]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#F8FAFC] text-sm">CampusPulse</span> · INT335 Design Thinking Project
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Demonstration prototype with consented campus venue and club models.
                </p>
              </div>

              <div className="flex items-center gap-6 text-[11px]">
                <a href="#privacy" className="hover:text-[#F8FAFC] transition">Privacy & RLS Standards</a>
                <a href="#terms" className="hover:text-[#F8FAFC] transition">Terms of Service</a>
                <span className="font-mono text-[#94A3B8]">v1.0.0-p17</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
