# CampusPulse (INT335 P17 Design Thinking & Innovation)

> **"Too Many Posters, Too Little Signal — Relevant Campus Event Discovery and Scheduling Clash Management"**

CampusPulse is a campus-first event discovery, student participation, and scheduling conflict resolution platform engineered to solve two connected problems in university environments:
1. **For Students:** Discover high-value campus events that match personal interests and time constraints without being overwhelmed by scattered WhatsApp forwards or physical notice boards.
2. **For Organizers & Campus Administration:** Publish verified club activities and detect physical venue double-bookings and category audience collisions in real time using an explainable mathematical formula (`A.start < B.end AND B.start < A.end`).

---

## 📚 Table of Contents
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Design System & Color Tokens](#-design-system--color-tokens)
- [Key Features](#-key-features)
- [Route Inventory](#-route-inventory)
- [Explainable Zero-Clash Radar](#-explainable-zero-clash-radar)
- [Database Schema & Security](#-database-schema--security)
- [Local Development & Verification](#-local-development--verification)
- [Role Simulation & Demo Profiles](#-role-simulation--demo-profiles)
- [Documentation Index](#-documentation-index)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite 8, React Router v7.
- **Styling:** Tailwind CSS v4 with custom semantic tokens and fluid typography.
- **Motion & Transitions:** Kinetic Spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`), smooth page transitions, and accessible `prefers-reduced-motion` modes.
- **Backend & Database:** PostgreSQL + Supabase with Row Level Security (RLS) under `supabase/migrations/`.
- **Security & Authorization:** Role-Based Access Control (Student, Organizer, Admin) with database-enforced boundaries. Anonymous public keys only in browser; service-role keys are strictly never bundled.
- **Calendar & Offline Sync:** Native `.ics` iCalendar generator supporting single-event downloads and aggregated student agenda exports for Apple Calendar, Google Calendar, and Microsoft Outlook.
- **Accessibility:** WCAG 2.2 Level AA compliance, focus trap modals, visible focus rings, aria-describedby errors.

---

## 🎨 Design System & Color Tokens

CampusPulse features a clean, high-contrast modern campus visual identity:

| Token Name | Hex Value | Usage / Semantic Role |
| :--- | :--- | :--- |
| **Primary Indigo** | `#5145E5` | Main brand identity, primary CTA buttons, active state pills. |
| **Midnight Navy** | `#11152B` | High-contrast headings, hero typography, deep brand accents. |
| **Fresh Lime** | `#C8F169` | Energetic highlight, verified badges, icon accents. |
| **Soft Lavender** | `#F0EDFF` | Subtle elevated chips, hover states, soft card tints. |
| **Cloud Background** | `#F7F8FC` | Main canvas background with gentle radial mesh. |
| **White Surface** | `#FFFFFF` | Card surfaces, modals, elevated panels. |
| **Secondary Text** | `#687087` | Body text, descriptions, secondary metadata. |
| **Muted Text** | `#9299AA` | Subtle captions, timestamps, placeholder text. |
| **Border Subtle** | `#E7E9F0` | Clean structural dividers and card borders. |
| **Success Emerald** | `#16A36A` | Approved status, verified chapter indicators, confirmed seats. |
| **Warning Amber** | `#E9A23B` | Schedule collision alerts, pending review status. |
| **Error Rose** | `#E5484D` | Hard venue collisions, cancelled events, form validation errors. |

---

## 🚀 Key Features

### 1. Public Landing Page (`/`) vs Student Dashboard (`/home`)
- **Public Landing Page:** Conversion-driven editorial experience showcasing an asymmetric hero narrative, live platform spotlight, curated category tracks, 3-step campus architecture, and an organizer call-to-action banner.
- **Student Dashboard Portal:** Utility-first workspace displaying personalized student greetings, active pass wallet counts, schedule clash diagnostics, and filtered feeds (*Recommended*, *Saved Passes*, *Upcoming 48H*).

### 2. Multi-Parameter Event Discovery (`/discover`)
- Search across title, tags, society, and hall location.
- Live category filters: Technology, Workshops, Cultural, Sports, Music, Research, Photography, Volunteering, Academic.
- Dynamic date, venue, and cost filters (Free vs Paid).

### 3. Rich Event Detail Experience (`/events/:id`)
- **Overview & Specifications:** Description, room capacity limits, and registration cutoffs.
- **Session Agenda & Flow:** Structured milestone timeline from welcome to certificate distribution.
- **Rules & Participation Guidelines:** Eligibility criteria and university honor code guidelines.
- **Live Announcements:** Real-time organizer broadcasts for room/timing shifts.
- **Student Reviews & Feedback:** 1-to-5 star rating system with verified attendee comments.

### 4. Integrated Personal Calendar & Export (`/calendar`)
- Personal schedule conflict detection with side-by-side comparison.
- Universal `.ics` export for single events or entire student agendas for Apple, Google, and Outlook Calendars.

### 5. 7-Step Organizer Creation Wizard (`/organizer/create`)
- Step 1: Basic Information & Chapter Selection
- Step 2: Description & Target Demographics
- Step 3: Date & Time Intervals
- Step 4: Authoritative Venue Allocation with Live Clash Radar
- Step 5: Banner & Media Preview
- Step 6: Challenge & Competition Rules (Min/Max Teams, Prizes)
- Step 7: Review Summary & Dean Clearance Submission

### 6. Campus Notification Center
- Top navigation notification bell with live unread count.
- Instant alerts on seat confirmation, schedule changes, and administrative approvals.

### 7. Campus Chapters & Society Directory (`/clubs` & `/clubs/:id`)
- Searchable club directory with classification filters (`club`, `society`, `department`, `cell`).
- Dedicated chapter profile pages with member counts, executive lead contacts, upcoming events, and archives.
- Direct organization follow/unfollow capability.

### 8. Administrator Governance & Clearance Portal (`/admin/approvals`)
- Centralized approval queue with automated conflict audit notes.
- Structured decisions: `Approve & Publish`, `Request Edits`, or `Reject` with mandatory reviewer feedback.
- Immutable append-only audit trail logging all administrative actions.
- Venue management master registry and student club charter verification.

---

## 🗺️ Route Inventory

| Path | Component | Target Role | Description |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | Public | Conversion landing page for new visitors |
| `/home` | `StudentHomePage.tsx` | Student | Personalized daily student dashboard |
| `/discover` | `DiscoverPage.tsx` | Public / Student | Full event catalogue with filters |
| `/events/:id` | `EventDetailPage.tsx` | All Users | Deep event experience with tabs & pass registration |
| `/calendar` | `CalendarPage.tsx` | Student / Org | Personal & master calendar with .ics export |
| `/my-events` | `MyEventsPage.tsx` | Student | Pass wallet and saved bookmarks |
| `/clubs` | `ClubsDirectoryPage.tsx`| All Users | Campus clubs & student chapters directory |
| `/clubs/:id` | `ClubDetailPage.tsx` | All Users | Dedicated organization profile page |
| `/organizer` | `OrganizerDashboardPage.tsx`| Organizer | Organizer studio overview & statistics |
| `/organizer/events` | `OrganizerEventsPage.tsx` | Organizer | Event proposal management table |
| `/organizer/create` | `CreateEventPage.tsx` | Organizer | 7-step guided event proposal wizard |
| `/organizer/clashes`| `ClashCheckPage.tsx` | Organizer | Interactive conflict radar simulator |
| `/admin` | `AdminDashboardPage.tsx` | Admin | Dean & administrative KPI dashboard |
| `/admin/approvals` | `AdminApprovalsPage.tsx` | Admin | Clearance review queue with conflict evidence |
| `/admin/events` | `AdminEventsDirectoryPage.tsx`| Admin | Complete event governance directory |
| `/admin/venues` | `AdminVenuesPage.tsx` | Admin | Campus venue master registry |
| `/admin/organizers` | `AdminOrganizersPage.tsx` | Admin | Student chapter charter verification |
| `/profile` | `ProfilePage.tsx` | Authenticated | User preferences & role simulator |
| `/login` | `LoginPage.tsx` | Public | Campus member login |
| `/signup` | `SignupPage.tsx` | Public | New campus user registration |

---

## 📐 Explainable Zero-Clash Radar

CampusPulse uses a deterministic mathematical interval check:

$$\text{Overlap}(A, B) \iff (A.\text{start} < B.\text{end}) \land (B.\text{start} < A.\text{end})$$

- **Half-Open Intervals $[t_{\text{start}}, t_{\text{end}})$:** Adjacent events do **not** collide.
- **Hard Conflict:** Same authoritative venue + overlapping interval $\rightarrow$ **Blocks submission**.
- **Advisory Warning:** Concurrent category events on the same day $\rightarrow$ **Warns of audience split**.

---

## 💾 Database Schema & Security

Relational PostgreSQL schema with Row-Level Security policies located in `supabase/migrations/`:
- `20261029000001_campuspulse_initial_schema.sql`: Core tables, foreign keys, and indexes.
- `20261029000002_campuspulse_rls_policies.sql`: Row level security rules isolating private drafts.
- `20261029000003_campuspulse_security_hardening.sql`: Role self-elevation defense.
- `20261103000004_campuspulse_event_lifecycle_transitions.sql`: Status machine transition guards.

---

## 🏃 Local Development & Verification

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# Server live at http://localhost:5173/

# 3. Execute comprehensive QA test suite (55 tests)
npm test

# 4. Compile TypeScript and build production bundle
npm run build

# 5. Preview production build locally
npm run preview
```

---

## 👥 Role Simulation & Demo Profiles

CampusPulse includes a built-in role demonstration simulator located in the top navigation bar:
- **Student View:** Tanay Tanishk (`user-student-01`)
- **Organizer View:** GDSC / ACM Student Lead (`user-organizer-01`)
- **Administrator View:** Dr. R. K. Verma (Estate & Student Welfare Admin - `user-admin-01`)

---

## 📖 Documentation Index

- [Technical Architecture & Specifications](file:///C:/New%20Volume%20(D)/INT%20project/docs/TECHNICAL_ARCHITECTURE.md)
- [Feature Matrix & Competitor Adoption Guide](file:///C:/New%20Volume%20(D)/INT%20project/docs/FEATURE_GUIDE.md)
- [5–7 Minute Live Demonstration Playbook](file:///C:/New%20Volume%20(D)/INT%20project/docs/DEMO_SCRIPT.md)
