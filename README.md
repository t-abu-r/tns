# The National School & College — O/A Level Website

The official website for **The National School & College (Parkview Branch)**, a Cambridge Assessment International Education (CAIE) registered institution in Lahore, Pakistan. Built with the Vision Education System branding.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic, accessible) |
| Styling | Tailwind CSS (CDN) + Custom CSS design system (`css/styles.css`) |
| Scripts | Vanilla JavaScript (no frameworks, no build step) |
| Backend | Supabase (PostgreSQL) for events, announcements & admin auth |
| Forms | Formspree (external form submission endpoint) |
| Icons | Font Awesome 6.5.1 (CDN) |
| Fonts | Google Fonts — Cinzel, Inter, Outfit, Amiri |

## Pages

| File | Description |
|------|-------------|
| `index.html` | Main single-page site — Hero, Leadership, Academics, Campus Life, Contact & FAQ |
| `admissions.html` | Admissions page — Fee structure, scholarship criteria, admissions steps, inquiry form |
| `events.html` | Events & Announcements — upcoming events, notices, office hours |
| `portal.html` | Staff portal — Supabase Auth login, CRUD for events/announcements/settings |

## Directory Structure

```
tns/
├── index.html                 # Main homepage (single-page anchor navigation)
├── admissions.html            # Admissions, fees & scholarship page
├── events.html                # Events & announcements page
├── portal.html                # Staff portal (Supabase auth)
├── assets/
│   ├── logo.jpg               # School crest logo
│   ├── manifest.webmanifest   # PWA manifest
│   └── *.jpeg, *.png          # Faculty portrait images
├── css/
│   └── styles.css             # Complete design system (1400+ lines)
├── js/
│   ├── main.js                # Navbar, carousel, subject grid, FAQ, scroll-reveal
│   ├── form-validation.js     # Admissions inquiry form validation + Formspree
│   ├── prospectus.js          # Prospectus modal + vanilla PDF generator
│   ├── supabase-config.js     # Supabase URL + anon key
│   ├── supabase-init.js       # Public data loader (events, announcements, settings)
│   └── admin.js               # Admin dashboard logic (auth, CRUD)
└── supabase/
    └── schema.sql             # Database schema + RLS policies
```

## Site Sections (index.html)

1. **Navigation** — Sticky glass-effect navbar with desktop links, mobile slide-out drawer, and "Apply Now" CTA button
2. **Hero** — Auto-advancing image carousel (3 slides) with school tagline and admissions CTA
3. **Leadership** — Principal's message and Campus Coordinator profile with portraits
4. **Academics** — Level tabs (Pre-O / O-Level / A-Level) with dynamic subject grid rendered from `subjectsData` in JS, including teacher photos and stream filters
5. **Campus Life** — Feature list + facility card grid (labs, library, computer suite, sports)
6. **Contact & FAQ** — Contact grid, office hours, and accordion FAQ

## Admissions Page (admissions.html)

1. **Hero** — Page hero with links to fee structure and apply form
2. **Fee Structure** — A-Level monthly fee breakdown (admission, security, tuition) with faculty concession
3. **Scholarship Criteria** — Grade-to-point matrix (A*=6 through E=1, total 48) and waiver tiers (40%-100%)
4. **Admissions Steps** — 3-step roadmap: Inquiry → Assessment → Scholarship Confirmation
5. **Prospectus CTA** — Download button triggering the prospectus modal
6. **Inquiry Form** — Full form (student name, parent, email, phone, grade, stream, message) validated client-side and submitted to Formspree

## How Routing Works

- **index.html** uses **anchor-based SPA navigation** (`#home`, `#leadership`, `#academics`, `#campus`, `#contact`). Smooth scrolling is handled by `js/main.js` via `IntersectionObserver` and `scrollIntoView`.
- **admissions.html**, **events.html**, and **portal.html** are **separate HTML pages** with their own full page load.
- Cross-page links use relative paths (e.g., `admissions.html`, `events.html`, `index.html#campus`).

## JavaScript Features

### `js/main.js`
- **Smooth scroll** — Intercepts `#anchor` clicks, smooth-scrolls, and pushes browser history
- **Hero carousel** — 3-slide auto-advancing carousel with dot navigation (7-second interval)
- **Subject grid** — Renders Pre-O, O-Level, and A-Level subjects dynamically from JSON data with teacher photos
- **Stream filtering** — Filter buttons for Pre-Medical, Pre-Engineering, CS & AI, Commerce, Humanities
- **Subject detail modal** — Expandable modal showing subject details, teacher info, and "Ask Counselor" link
- **FAQ accordion** — Toggle-based FAQ with animated expand/collapse
- **Scroll reveal** — `IntersectionObserver`-based fade-in animations for `.reveal` elements
- **Mobile menu** — Slide-out drawer with close-on-outside-click, Escape key, and auto-close on link click
- **Broken image fallback** — Replaces broken faculty images with the school crest SVG

### `js/form-validation.js`
- Real-time field validation for the admissions inquiry form
- Email format, phone format, required field checks
- Character counter for the message textarea
- Success modal on form submission
- Posts to Formspree endpoint

### `js/prospectus.js`
- Prospectus modal open/close logic
- Vanilla PDF generator (client-side, no server needed)
- Downloads a styled PDF with school info, fee structure, and scholarship criteria

### `js/supabase-init.js`
- Fetches events, announcements, and office hours from Supabase on page load
- Falls back to static HTML content if Supabase is unavailable
- Renders dynamic content into `#eventsList`, `#announcementsList`, `#officeHoursGrid`

### `js/admin.js`
- Supabase Auth login/logout for admin dashboard
- CRUD operations for events and announcements
- Settings management (office hours)
- Real-time data updates

## Database Schema (Supabase)

```sql
-- Tables: events, announcements, settings
-- Row Level Security (RLS) policies for public read, admin write
-- Admin auth via Supabase Auth
```

See `supabase/schema.sql` for the full schema definition.

## Design System (`css/styles.css`)

- **Color palette** — Navy (#002147), Gold (#D4AF37), Silver (#E2E8F0)
- **Typography** — Cinzel for headers (serif), Inter for body (sans-serif), Outfit for UI elements, Amiri for Arabic text
- **Components** — Glass-effect navbar, hero carousel, subject cards, fee panels, scholarship tiers, facility cards, contact grid, FAQ accordion, prospectus modal, form fields, buttons (navy, gold, outline variants)
- **Animations** — Scroll reveal (fade-in), pulse button, carousel transitions, mobile drawer slide

## External Services

| Service | Purpose |
|---------|---------|
| [Supabase](https://supabase.com) | Database (events, announcements, settings) + Auth (admin) |
| [Formspree](https://formspree.io) | Admissions inquiry form submission |
| [Unsplash](https://unsplash.com) | Hero and facility images (via CDN URLs) |
| [Google Fonts](https://fonts.googleapis.com) | Web fonts (Cinzel, Inter, Outfit, Amiri) |
| [Font Awesome](https://fontawesome.com) | Icon library |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS framework |

## Getting Started

This is a static site — no build step required. Open `index.html` in a browser or serve with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

## Admin Access

Navigate to `portal.html` and log in with Supabase credentials to manage events, announcements, and office hours settings.

## License

This project is proprietary to The National School & College / Vision Education System.
