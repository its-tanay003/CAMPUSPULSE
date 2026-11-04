# CampusPulse (INT335 P17 Design Thinking Project)

> **"Too Many Posters, Too Little Signal — Relevant Campus Event Discovery and Scheduling Clash Management"**

CampusPulse is a campus-first event discovery and scheduling conflict resolution platform engineered to solve two connected problems:
1. **For Students:** Discover high-value campus events that match personal interests and time constraints without being overwhelmed by scattered WhatsApp forwards or physical notice boards.
2. **For Organizers & Campus Administration:** Publish verified club activities and detect physical venue double-bookings and category audience collisions in real time using an explainable mathematical formula (`A.start < B.end AND B.start < A.end`).

---

## 🛠️ Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS (Dark campus SaaS tokens: `#0B1020` base, `#151C2F` card surface, `#7C5CFC` primary accent, `#38BDF8` cyan highlight)
- **Routing:** React Router v7 with single-page application rewrites (`vercel.json`, `public/_redirects`)
- **Backend & Database:** PostgreSQL + Supabase Row Level Security (RLS) under `supabase/migrations/`
- **Security & Authorization:** Role-Based Access Control (Student, Organizer, Admin) with database-enforced boundaries. Anonymous public keys only in browser; service-role keys are strictly never bundled.
- **Calendar & Offline Export:** Deterministic `.ics` export for Google Calendar, Apple Calendar, and Microsoft Outlook.
- **Accessibility:** WCAG 2.2 Level AA compliance, focus trap modals, visible focus rings, aria-describedby errors.

---

## 🚀 Key Features

### 1. Student Experience & Discovery (P0)
- **Zero-Gate Public Discovery:** Browse approved events without being forced to register or authenticate first.
- **Multi-parameter Search & Filters:** Search across Title, Description, Organizer, Venue, and Category with active filter counts and reset controls.
- **Personal Calendar & Schedule:** Distinct states for "Saved Bookmark" vs "Confirmed Registration".
- **Personal Conflict Radar:** Instant alert if two events saved by a student collide in the same time window.
- **1-Click Registration & .ics Export:** Register for internal campus events or follow external links with direct calendar integration.

### 2. Organizer Studio & Explainable Clash Detection (P0)
- **Multi-step Event Drafting:** Form validation across title, description, venue allocation, timing, category, and capacity.
- **Explainable Clash Verification Engine:** Real-time venue collision checks against authoritative room bookings (`Shanti Devi Mittal Audi`, `Block 34 Mini Audi`, `UniPolis`, `Innovation Lab`, `Block 28 Seminar Hall`).
- **Seeded Double-Booking Detection:** Real-time clash detection between ACM's "Code the Campus Hackathon" and GDSC's "Agentic AI Workshop" at Block 34 Mini Audi.
- **Audience Collision Warnings:** Identifies same-day, same-cohort overlaps to protect student attendance.

### 3. Administrator Clearance & Governance Portal (P0)
- **Centralized Approvals Queue:** Review submitted club events with automated conflict audit notes.
- **Structured Decisions:** Issue `Approve & Publish`, `Request Edits`, or `Reject` with mandatory reviewer rationale.
- **Tamper-evident Audit History:** Append-only log of administrative reviews with timestamps and reviewer IDs.
- **Venue & Organizer Management:** Toggle active venues and verify student club charters with audit logs.

---

## 💾 Database Schema & Supabase Setup

The relational PostgreSQL schema with Row-Level Security policies is located in `supabase/migrations/`:
- `0001_campuspulse_initial_schema.sql`: Core tables, indexes, and triggers.
- `0002_campuspulse_rls_policies.sql`: Row level security rules for public vs authenticated users.
- `0003_campuspulse_security_hardening.sql`: Role self-elevation defense.
- `0004_campuspulse_event_lifecycle_transitions.sql`: Status machine guards.

---

## 🏃 Local Development & Verification

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Execute comprehensive QA test suite (55 tests)
npm test

# 4. Compile TypeScript and build production bundle
npm run build

# 5. Run production preview
npm run preview
```

---

## 👥 Demo Profiles for Evaluation

CampusPulse includes a built-in role demonstration simulator located in the top navigation bar:
- **Student View:** Tanay Tanishk (`user-student-01`)
- **Organizer View:** GDSC / ACM Student Lead (`user-organizer-01`)
- **Administrator View:** Dr. R. K. Verma (Estate & Student Welfare Admin - `user-admin-01`)

---

## 📖 Complete Technical & Demonstration Documentation

For the full 5–7 minute live demonstration script, mathematical collision formulas, and architectural justifications, please refer to the technical report artifact:
- [CampusPulse Technical Architecture & Demonstration Playbook](file:///C:/Users/hp/.gemini/antigravity/brain/578d16d0-83de-46ed-9edc-8a8523d10207/CAMPUSPULSE_DEMO_AND_TECHNICAL_DOCS.md)
