# CampusPulse — 5 to 7 Minute Live Demonstration Playbook

> **Audience:** INT335 Evaluation Panel, Student Leaders, and Campus Administration  
> **Objective:** Demonstrate end-to-end zero-clash scheduling, student discovery, and Dean governance in a live walkthrough.

---

## ⏱️ Live Demonstration Schedule

### 1. Act I: The Problem & Public Discovery (0:00 – 1:30)
- **Starting Point:** Open browser at `http://localhost:5173/` as a public visitor.
- **Narrative:**
  > *"Every semester, university students miss high-value hackathons because notifications are buried across WhatsApp groups. Meanwhile, campus clubs accidentally double-book auditoriums."*
- **Action:**
  1. Showcase the **Landing Page**: point out the live status indicator (`Live Engine: Zero-clash room scheduling`), asymmetric hero, and instant search.
  2. Perform a search query: type `"Hack"` or `"AI"` and submit.
  3. Click **"Student Portal"** (`/home`) to transition from public view to the student personalized hub.

### 2. Act II: Student Hub & Personal Conflict Radar (1:30 – 3:00)
- **Persona:** `Student Role` (selected via the top nav role simulator).
- **Action:**
  1. View the student welcome greeting, showing interest-based recommendations (Technology & Workshops).
  2. Switch to **"Saved Passes"** tab to view saved event bookmarks.
  3. Navigate to **"Calendar"** (`/calendar`).
  4. Point out the **Personal Scheduling Conflict Alert** (e.g. Collision warning between concurrent sessions).
  5. Demonstrate **`.ics` Export**: Click `"Export All (.ics)"` to generate the universal calendar invite for Google Calendar or Apple Calendar.
  6. Click **"Chapters"** (`/clubs`) and open **GDG On-Campus** (`/clubs/org-01`): demonstrate chapter following, verified badge, and past event archives.

### 3. Act III: Organizer Studio & 7-Step Clash Radar Wizard (3:00 – 4:45)
- **Persona:** Switch role to `Organizer Role` via the top simulator.
- **Action:**
  1. Click **"Organizer Studio"** in the top navigation.
  2. Point out draft counts and review lifecycle statistics.
  3. Click **"Propose New Event"** (`/organizer/create`) to enter the 7-Step Wizard:
     - **Step 1:** Title: `"NextGen Quantum Computing Workshop"` | Host: `ACM Student Chapter` | Track: `Technology`.
     - **Step 2:** Fill brief description and target audience (`All Students`).
     - **Step 3:** Select an overlapping time slot (e.g., Nov 15, 14:00 - 17:00).
     - **Step 4 (The Reveal):** Select `Block 34 Mini Audi`.
  4. **Highlight the Zero-Clash Radar:** The system automatically flags a **Hard Conflict** with an existing approved event and explains the exact half-open overlap interval.
  5. **Resolution:** Select an alternate available venue (e.g., `Innovation Lab`) or adjust the time slot. The radar immediately turns green: *"Schedule Clear — No Collisions Detected"*.
  6. Proceed through Steps 5–7 and click **"Submit for Dean Clearance"**.

### 4. Act IV: Dean & Administration Governance Queue (4:45 – 6:15)
- **Persona:** Switch role to `Admin Role`.
- **Action:**
  1. Navigate to **"Admin Portal"** (`/admin/approvals`).
  2. Point out the pending proposal queue.
  3. Expand the proposal to inspect:
     - Verified conflict evidence (zero collisions).
     - Organization charter standing.
  4. Demonstrate structured clearance:
     - Click **"Approve & Publish"** or **"Request Changes"** with mandatory reviewer feedback.
  5. Show that the event instantaneously publishes to the public discovery feed without manual database intervention.

### 5. Act V: Notification Stream & Q&A Conclusion (6:15 – 7:00)
- **Action:**
  1. Click the top **Notification Bell** to show the real-time notification stream (`Confirmed Seat Pass`, `Clearance Granted`).
  2. Recap the 55-test verification suite (`npm test`) and complete production build.
  3. Conclude the demonstration.
