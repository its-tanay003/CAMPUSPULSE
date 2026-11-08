# CampusPulse — Complete Technical & Product Documentation

> **Campus-First Event Discovery, Participation, Scheduling, & Governance Intelligence Platform**  
> *Developed for INT335 Design Thinking & Campus Innovation*

---

## 🌟 Executive Summary & Vision

CampusPulse solves two interconnected structural problems in campus university ecosystems:
1. **For Students:** Severe event fragmentation across ephemeral WhatsApp groups, unofficial Instagram stories, and cluttered physical poster boards leads to missed hackathons, workshops, and symposiums.
2. **For Organizers & Campus Administration:** Accidental double-booking of physical halls, timing collisions between identical target demographics, and lack of verified administrative approval pipelines.

CampusPulse integrates the operational governance of **Cvent**, the discovery simplicity of **Eventbrite**, the personalized agenda of **Whova**, and the competition/challenge structure of **Unstop**, wrapped in a campus-first, modern design system.

---

## 🏗️ Technical Stack & Architecture

- **Frontend Core:** React 19, TypeScript, Vite 8, React Router v7.
- **Styling & Design Tokens:** Tailwind CSS v4, Custom Semantic CSS Tokens (`--color-primary-indigo`, `--color-midnight-navy`, `--color-fresh-lime`, `--color-soft-lavender`, `--color-cloud-bg`).
- **Motion & Physics:** Kinetic spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`), smooth route transitions via `PageTransitionWrapper`, and accessible `prefers-reduced-motion` fallbacks.
- **Backend & Database:** PostgreSQL + Supabase with Row Level Security (RLS) under `supabase/migrations/`.
- **Calendar & Offline Sync:** Native `.ics` iCalendar generator supporting single-event downloads and aggregated student agenda exports for Apple Calendar, Google Calendar, and Outlook.
- **Testing & Verification:** Comprehensive node test suite (`node --test tests/*.test.ts`) validating 55 test assertions across authorization, scheduling logic, lifecycle state machines, and edge cases.
- **Accessibility:** WCAG 2.2 AA compliant, high-contrast typography, accessible visible focus rings, aria-describedby form controls, and screen-reader skip links.

---

## 🗺️ Complete Route Inventory

| Route | View Component | Audience / Persona | Description |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | Public Visitors | Conversion-driven editorial landing page: hero, search, tracks, 3-step architecture, and organizer CTA. |
| `/home` | `StudentHomePage.tsx` | Students | Dedicated daily student hub: personalized greetings, pass wallet count, clash radar health, and 48H feeds. |
| `/discover` | `DiscoverPage.tsx` | All Users | Multi-parameter discovery catalogue: search, category chips, date picker, cost filter, and venue filters. |
| `/events/:id` | `EventDetailPage.tsx` | All Users | Comprehensive event page: Overview, Session Agenda, Rules/Eligibility, Live Announcements, and Reviews. |
| `/calendar` | `CalendarPage.tsx` | Students & Organizers | Integrated agenda & master calendar: personal collision alerts, week/agenda views, and `.ics` exports. |
| `/my-events` | `MyEventsPage.tsx` | Students | Student pass wallet: active confirmed tickets, saved bookmark listings, and past attendance records. |
| `/clubs` | `ClubsDirectoryPage.tsx` | All Users | Searchable directory of student chapters, technical societies, and guilds with follow actions. |
| `/clubs/:id` | `ClubDetailPage.tsx` | All Users | Dedicated organization profile: verified charter status, member counts, upcoming events, and archives. |
| `/organizer` | `OrganizerDashboardPage.tsx` | Organizers & Admins | Organizer Studio: proposal lifecycle overview, pending review counts, draft metrics, and quick create. |
| `/organizer/events` | `OrganizerEventsPage.tsx` | Organizers & Admins | Event management table: filter by draft/published/review status, edit proposals, and view reviewer notes. |
| `/organizer/create` | `CreateEventPage.tsx` | Organizers & Admins | 7-step guided creation wizard with live venue clash radar and draft saving. |
| `/organizer/edit/:id` | `CreateEventPage.tsx` | Organizers & Admins | Edit proposal with self-exclusion collision checking and historical status timeline. |
| `/organizer/clashes` | `ClashCheckPage.tsx` | Organizers & Admins | Standalone interactive clash simulator for testing venue availability before formal submissions. |
| `/admin` | `AdminDashboardPage.tsx` | Administrators | Dean & Administrator executive dashboard: KPI cards, clearance volume, and recent audit actions. |
| `/admin/approvals` | `AdminApprovalsPage.tsx` | Administrators | Authoritative clearance queue: clash radar evidence, approve, request changes, or reject with rationale. |
| `/admin/events` | `AdminEventsDirectoryPage.tsx`| Administrators | Institutional event directory: override status, force-cancel events, and inspect audit logs. |
| `/admin/venues` | `AdminVenuesPage.tsx` | Administrators | Venue master registry: toggle room availability, edit capacities, and set data-source authority. |
| `/admin/organizers` | `AdminOrganizersPage.tsx` | Administrators | Chapter governance: issue or revoke official university verified charter status. |
| `/profile` | `ProfilePage.tsx` | Authenticated Users | User profile: calibrate interests, view campus affiliation, and toggle simulation roles. |
| `/login` | `LoginPage.tsx` | Public / Students | Authenticate into existing student, organizer, or administrator profiles. |
| `/signup` | `SignupPage.tsx` | Public / Students | Register new student or organizer campus profile. |

---

## 📐 Explainable Zero-Clash Conflict Detection

CampusPulse avoids opaque black-box AI scores for physical scheduling decisions. Instead, it executes an **authoritative half-open interval collision check**:

$$\text{Overlap}(A, B) \iff (A.\text{start} < B.\text{end}) \land (B.\text{start} < A.\text{end})$$

### Boundary Rules
- **Half-Open Intervals $[t_{\text{start}}, t_{\text{end}})$:** If Event A concludes at 14:00 and Event B commences at 14:00 in the same room, $(10 < 14) \land (14 < 14)$ evaluates to **FALSE**. Adjacent bookings do **not** clash.
- **Hard Conflict:** Same authoritative venue ID + overlapping interval + active published/review event $\rightarrow$ **Blocks submission**.
- **Advisory Warning:** Same category/audience on the same day in different venues $\rightarrow$ **Warns organizer of audience split**.
- **Status Exclusions:** Cancelled, completed, and self-referential editing records are excluded from collision locks.

---

## 🛡️ Security, RBAC & Supabase RLS Policies

CampusPulse enforces database-grade multi-tenant authorization:

1. **Role-Based Access Control (RBAC):**
   - **Student:** Can browse published events, register passes, save bookmarks, follow clubs, and leave feedback. Cannot approve events or self-publish.
   - **Organizer:** Can propose drafts, run clash checks, and manage own club events. Blocked from self-publishing directly to public feeds.
   - **Administrator (Dean):** Has exclusive authority to transition proposals to `published`, `changes_requested`, or `rejected`. Manages venues and charters.
2. **Immutable Audit Trail:**
   - Every administrative clearance action is saved append-only in `event_approvals` with reviewer ID, decision, mandatory rationale, and ISO timestamp.
3. **Row-Level Security (RLS) Migrations:**
   - `20261029000001_campuspulse_initial_schema.sql`: Core schema, foreign keys, and indexes.
   - `20261029000002_campuspulse_rls_policies.sql`: RLS rules isolating private drafts from public feeds.
   - `20261029000003_campuspulse_security_hardening.sql`: Prevents unauthorized user role elevation.
   - `20261103000004_campuspulse_event_lifecycle_transitions.sql`: Validates permitted lifecycle state machines.

---

## 🧪 Comprehensive QA Verification Suite

CampusPulse includes a 55-test suite executed via Node's native test runner (`node --test tests/*.test.ts`).

### Test Coverage Highlights
- **`adminWorkspace.test.ts` (12 tests):** RBAC authority enforcement, collision evidence in review, reason requirements, and charter management.
- **`clashDetector.test.ts` (8 tests):** Half-open intervals, adjacent boundary checks, non-authoritative venue handling, and submission re-checks.
- **`comprehensiveQaPlan.test.ts` (23 tests):** Student bookmarking isolation, cross-user privacy, organizer draft workflows, and deadline expirations.
- **`submissionWorkflow.test.ts` (12 tests):** Anti-self-approval protection, illegal state skipping defense, and explainable status timeline generation.

---

## 💻 Local Development & Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
# Live at: http://localhost:5173/

# 3. Execute QA test suite (55 tests)
npm test

# 4. Build production bundle (TypeScript + Vite)
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 👥 Role Simulation & Demo Data

To evaluate all platform personas without needing multi-account login credentials, use the **Role Simulator** pill in the top navigation bar:
- **Student Persona:** Tanay Tanishk (`user-student-01`)
- **Organizer Persona:** GDSC / ACM Student Chapter Lead (`user-organizer-01`)
- **Administrator Persona:** Dr. R. K. Verma (Estate & Student Welfare Admin — `user-admin-01`)

