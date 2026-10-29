import { CampusEvent, Organization, Venue, UserProfile, SavedEvent, Registration, ApprovalAction } from '../types';

export const DEMO_VENUES: Venue[] = [
  {
    id: 'venue-shanti-audi',
    name: 'Shanti Devi Mittal Auditorium (Audi-1)',
    building: 'Block 32',
    location: 'Central Campus',
    capacity: 2500,
    authority: 'Campus Central Estate & Room Allocation Office',
    is_authoritative: true,
    is_active: true
  },
  {
    id: 'venue-block34-audi',
    name: 'Block 34 Mini Auditorium',
    building: 'Block 34',
    location: 'School of Computer Science',
    capacity: 350,
    authority: 'CSE Department Administration',
    is_authoritative: true,
    is_active: true
  },
  {
    id: 'venue-unipolis',
    name: 'UniPolis Open Amphitheatre',
    building: 'UniPolis Ground',
    location: 'North Zone',
    capacity: 8000,
    authority: 'Student Welfare & Sports Authority',
    is_authoritative: true,
    is_active: true
  },
  {
    id: 'venue-innovation-lab',
    name: 'Innovation & Robotics Lab (Room 38-701)',
    building: 'Block 38, 7th Floor',
    location: 'Engineering Complex',
    capacity: 80,
    authority: 'Dean Academic Computing',
    is_authoritative: true,
    is_active: true
  },
  {
    id: 'venue-block28-seminar',
    name: 'Block 28 Seminar Hall B',
    building: 'Block 28',
    location: 'Management Complex',
    capacity: 150,
    authority: 'Estate Management Cell',
    is_authoritative: true,
    is_active: true
  }
];

export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-google-dev',
    name: 'Google Developer Student Clubs (GDSC)',
    slug: 'gdsc-lpu',
    type: 'club',
    description: 'A university-based community group for students interested in Google developer technologies, open-source AI, cloud, and mobile app design.',
    logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80',
    contact_email: 'gdsc@campus.edu',
    lead_name: 'Tanay Tanishk (Student Lead)',
    is_verified: true,
    member_count: 840
  },
  {
    id: 'org-acm',
    name: 'ACM Student Chapter',
    slug: 'acm-student-chapter',
    type: 'society',
    description: 'Premier student computing society hosting competitive coding contests, algorithmic workshops, and research symposiums.',
    logo_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=200&q=80',
    contact_email: 'acm@campus.edu',
    lead_name: 'Ananya Sharma',
    is_verified: true,
    member_count: 620
  },
  {
    id: 'org-cultural-society',
    name: 'Dhriti Arts & Cultural Guild',
    slug: 'dhriti-cultural',
    type: 'society',
    description: 'Official student arts board responsible for campus theatre productions, acoustic nights, folk dance showcases, and literary summits.',
    logo_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80',
    contact_email: 'cultural@campus.edu',
    lead_name: 'Vikramjit Singh',
    is_verified: true,
    member_count: 1200
  },
  {
    id: 'org-robotics-cell',
    name: 'Robotics & Automation Society (RAS)',
    slug: 'robotics-society',
    type: 'cell',
    description: 'Hardware prototyping, autonomous bot challenges, IoT sensors, and national robotics leagues.',
    logo_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
    contact_email: 'robotics@campus.edu',
    lead_name: 'Rohan Mehra',
    is_verified: true,
    member_count: 310
  }
];

export const DEMO_EVENTS: CampusEvent[] = [
  {
    id: 'evt-ai-agentic-2026',
    title: 'Agentic AI & Neural Systems Workshop: Building Autonomous Agents',
    description: 'Hands-on practical bootcamp on modern agentic workflows, MCP tools, tool calling, and local LLM fine-tuning. Bring your laptop configured with Node.js and Python. Recommended for CS & IT undergraduates.',
    category: 'Technology',
    target_audience: 'B.Tech CSE, IT & AI Enthusiasts',
    tags: ['AI', 'Python', 'Hands-on', 'Vite', 'Machine Learning'],
    organization_id: 'org-google-dev',
    venue_id: 'venue-block34-audi',
    start_time: '2026-10-31T14:00:00+05:30',
    end_time: '2026-10-31T17:30:00+05:30',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    capacity: 150,
    registration_method: 'internal',
    registration_deadline: '2026-10-31T11:00:00+05:30',
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    contact_email: 'gdsc@campus.edu',
    status: 'published',
    created_by: 'user-organizer-01',
    views_count: 428,
    created_at: '2026-10-25T10:00:00+05:30',
    updated_at: '2026-10-25T10:00:00+05:30'
  },
  {
    id: 'evt-hack-clash-seeded',
    title: 'Annual Flagship Hackathon 2026: Code the Campus',
    description: '36-hour non-stop hackathon with problem statements from university life, sustainability, smart transit, and student safety. Cash pool prizes and mentor tracks.',
    category: 'Technology',
    target_audience: 'All Students & Coders',
    tags: ['Hackathon', 'Coding', 'Prizes', 'Team Event'],
    organization_id: 'org-acm',
    venue_id: 'venue-block34-audi', // Seeded venue clash with Agentic AI on Block 34 Audi!
    start_time: '2026-10-31T15:00:00+05:30',
    end_time: '2026-10-31T20:00:00+05:30',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    capacity: 200,
    registration_method: 'external',
    registration_url: 'https://hackathon.demo-campus.org/register',
    registration_deadline: '2026-10-30T23:59:00+05:30',
    cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    contact_email: 'acm@campus.edu',
    status: 'pending_review',
    created_by: 'user-organizer-02',
    views_count: 184,
    created_at: '2026-10-28T14:20:00+05:30',
    updated_at: '2026-10-28T14:20:00+05:30'
  },
  {
    id: 'evt-dhriti-acoustic-night',
    title: 'Acoustic Sunset: Unplugged Live Harmonies & Poetry Slam',
    description: 'Unwind your evening with unplugged indie music, beatboxing jams, and student spoken-word poetry under the starlit sky at UniPolis.',
    category: 'Music',
    target_audience: 'All Campus Students',
    tags: ['Music', 'Live Band', 'Open Mic', 'Relaxation'],
    organization_id: 'org-cultural-society',
    venue_id: 'venue-unipolis',
    start_time: '2026-11-01T17:30:00+05:30',
    end_time: '2026-11-01T21:00:00+05:30',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    capacity: 2000,
    registration_method: 'none',
    cover_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    contact_email: 'cultural@campus.edu',
    status: 'published',
    created_by: 'user-organizer-01',
    views_count: 890,
    created_at: '2026-10-24T12:00:00+05:30',
    updated_at: '2026-10-24T12:00:00+05:30'
  },
  {
    id: 'evt-robotics-sumo-challenge',
    title: 'Autonomous Robo-Sumo & Line Follower Championship',
    description: 'Watch custom-built mini combat bots face off inside the designated ring. Microcontroller inspection at 10 AM, matches begin right after.',
    category: 'Workshops',
    target_audience: 'Engineers & Mechatronics Students',
    tags: ['Robotics', 'Hardware', 'Arduino', 'Championship'],
    organization_id: 'org-robotics-cell',
    venue_id: 'venue-innovation-lab',
    start_time: '2026-11-02T10:00:00+05:30',
    end_time: '2026-11-02T16:00:00+05:30',
    timezone: 'Asia/Kolkata',
    cost: '₹50 per team kit',
    capacity: 60,
    registration_method: 'internal',
    registration_deadline: '2026-11-01T18:00:00+05:30',
    cover_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    contact_email: 'robotics@campus.edu',
    status: 'published',
    created_by: 'user-organizer-01',
    views_count: 310,
    created_at: '2026-10-26T09:15:00+05:30',
    updated_at: '2026-10-26T09:15:00+05:30'
  },
  {
    id: 'evt-sports-interhostel-badminton',
    title: 'Inter-Hostel Badminton League: Qualifiers Stage',
    description: 'Hostel champions clash in singles and doubles rounds. Cheer for your block teams. Official sports uniforms required for players.',
    category: 'Sports',
    target_audience: 'Hostel Residents & Badminton players',
    tags: ['Sports', 'Badminton', 'Hostel Cup'],
    organization_id: 'org-cultural-society',
    venue_id: 'venue-shanti-audi',
    start_time: '2026-11-03T18:00:00+05:30',
    end_time: '2026-11-03T21:30:00+05:30',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    capacity: 500,
    registration_method: 'none',
    cover_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    contact_email: 'sports@campus.edu',
    status: 'published',
    created_by: 'user-organizer-01',
    views_count: 512,
    created_at: '2026-10-27T11:00:00+05:30',
    updated_at: '2026-10-27T11:00:00+05:30'
  },
  {
    id: 'evt-draft-cultural-theatre',
    title: 'Spring Street Play Auditions: "Nukkad Natak 2026"',
    description: 'Auditions for the university annual street play team. Scripts provided on spot. Looking for actors, vocalists, and dholak percussionists.',
    category: 'Cultural',
    target_audience: 'Theatre aspirants',
    tags: ['Drama', 'Nukkad Natak', 'Auditions'],
    organization_id: 'org-cultural-society',
    venue_id: 'venue-block28-seminar',
    start_time: '2026-11-04T16:00:00+05:30',
    end_time: '2026-11-04T19:00:00+05:30',
    timezone: 'Asia/Kolkata',
    cost: 'Free',
    capacity: 80,
    registration_method: 'internal',
    cover_image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
    contact_email: 'cultural@campus.edu',
    status: 'draft',
    created_by: 'user-organizer-01',
    views_count: 45,
    created_at: '2026-10-29T15:00:00+05:30',
    updated_at: '2026-10-29T15:00:00+05:30'
  }
];

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'user-student-01',
    email: 'student.tanay@campus.edu',
    full_name: 'Tanay Tanishk (Demo Student)',
    role: 'student',
    campus: 'LPU Main Campus, Phagwara',
    interests: ['Technology', 'Workshops', 'Sports']
  },
  {
    id: 'user-organizer-01',
    email: 'gdsc.lead@campus.edu',
    full_name: 'Tanay (GDSC Lead / Organizer)',
    role: 'organizer',
    campus: 'LPU Main Campus, Phagwara',
    interests: ['Technology', 'Workshops']
  },
  {
    id: 'user-organizer-02',
    email: 'acm.lead@campus.edu',
    full_name: 'Ananya Sharma (ACM Organizer)',
    role: 'organizer',
    campus: 'LPU Main Campus, Phagwara',
    interests: ['Technology', 'Research']
  },
  {
    id: 'user-admin-01',
    email: 'admin.dsw@campus.edu',
    full_name: 'Dr. R. K. Verma (Estate & Student Welfare Admin)',
    role: 'admin',
    campus: 'LPU Main Campus, Phagwara',
    interests: []
  }
];

export const INITIAL_SAVED_EVENTS: SavedEvent[] = [
  {
    id: 'save-1',
    user_id: 'user-student-01',
    event_id: 'evt-ai-agentic-2026',
    created_at: '2026-10-28T18:00:00+05:30'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-1',
    user_id: 'user-student-01',
    event_id: 'evt-ai-agentic-2026',
    status: 'confirmed',
    source: 'platform',
    notes: 'Roll No: 12204592 - Lab Seat Confirmed',
    created_at: '2026-10-28T18:05:00+05:30'
  }
];

export const INITIAL_APPROVALS: ApprovalAction[] = [
  {
    id: 'app-01',
    event_id: 'evt-ai-agentic-2026',
    reviewer_id: 'user-admin-01',
    reviewer_name: 'Dr. R. K. Verma (Admin)',
    decision: 'approved',
    reason: 'Approved. Venue booking confirmed with Block 34 in-charge. All safety protocols verified.',
    created_at: '2026-10-25T11:30:00+05:30'
  }
];
