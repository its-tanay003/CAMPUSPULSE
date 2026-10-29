# CampusPulse (INT335 P17 Design Thinking Project)

> **"Too Many Posters, Too Little Signal — Relevant Campus Event Discovery and Scheduling Clash Management"**

CampusPulse is a campus-first event discovery and scheduling conflict resolution platform engineered to solve two connected problems:
1. **For Students:** Discover high-value campus events that match personal interests and time constraints without being overwhelmed by scattered WhatsApp forwards or physical notice boards.
2. **For Organizers & Campus Administration:** Publish verified club activities and detect physical venue double-bookings and category audience collisions in real time using an explainable mathematical formula (`A.start < B.end AND B.start < A.end`).

---

## 🛠️ Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Modern token hierarchy: Deep Navy `#0B192C`, Amber Orange `#FF6500`, Slate neutrals)
- **Routing:** React Router v7 (`/`, `/discover`, `/events/:id`, `/calendar`, `/my-events`, `/clubs`, `/organizer`, `/organizer/create`, `/organizer/clashes`, `/admin/approvals`, `/profile`)
- **Backend & Database:** PostgreSQL + Supabase Row Level Security (RLS) schema included under `supabase/schema.sql`
- **Security & Authorization:** Role-based access control (Student, Organizer, Admin) with database-enforced boundaries. Anonymous public keys only in browser; service-role keys are strictly never exposed.
- **Calendar & Offline Export:** Deterministic `.ics` export for Google Calendar, Apple Calendar, and Microsoft Outlook.

---

## 🚀 Key Features

### 1. Student Experience & Discovery (P0)
- **Zero-Gate Public Discovery:** Browse approved events without being forced to register or authenticate first.
- **Multi-parameter Search & Filters:** Search by title, tags, description, venue, and club. Filter by category, admission type (Free/Paid), and venue location.
- **Personal Calendar & Schedule:** Distinct states for "Saved Bookmark" vs "Confirmed Registration".
- **Personal Conflict Radar:** Instant alert if two events saved by a student collide in the same time window.
- **1-Click Registration & .ics Export:** Register for internal campus events or follow external links, with direct calendar integration.

### 2. Organizer Studio & Explainable Clash Detection (P0)
- **Multi-step Event Drafting:** Form validation across title, description, venue allocation, timing, category, and capacity.
- **Explainable Clash Verification Engine:** Real-time venue collision checks against authoritative room bookings (`Shanti Devi Mittal Audi`, `Block 34 Mini Audi`, `UniPolis`, `Innovation Lab`, `Block 28 Seminar Hall`).
- **Seeded Double-Booking Detection:** The platform detects the collision between ACM's "Code the Campus Hackathon" and GDSC's "Agentic AI Workshop" at Block 34 Mini Audi.
- **Audience Collision Warnings:** Identifies same-day, same-cohort overlaps to protect student attendance.

### 3. Administrator Clearance & Governance Portal (P0)
- **Centralized Approvals Queue:** Review submitted club events with automated conflict audit notes.
- **Structured Decisions:** Issue `Approve & Publish`, `Request Edits`, or `Reject` with audit explanations.
- **Tamper-evident Audit History:** Complete log of administrative reviews with timestamps and reviewer IDs.

---

## 💾 Database Schema & Supabase Setup

The relational PostgreSQL schema with Row-Level Security policies is located at:
`supabase/schema.sql`

Tables defined:
- `profiles`
- `organizations`
- `organization_members`
- `venues`
- `events`
- `saved_events`
- `registrations`
- `approvals`
- `event_conflict_reviews`
- `followed_organizations`
- `notification_preferences`
- `feedback`

---

## 🏃 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Typecheck and build for production
npm run build
```

---

## 👥 Demo Profiles for INT335 Evaluation

CampusPulse includes a built-in role demonstration simulator located in the top navigation bar:
- **Student View:** Tanay Tanishk (`user-student-01`)
- **Organizer View:** GDSC / ACM Student Lead (`user-organizer-01`)
- **Administrator View:** Dr. R. K. Verma (Estate & Student Welfare Admin - `user-admin-01`)
