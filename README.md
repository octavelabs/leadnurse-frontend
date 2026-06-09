# Lead Nurse — Frontend

React + Vite frontend for the Lead Nurse healthcare LMS and workforce management platform.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Features](#features)
- [Roles & Access](#roles--access)
- [Public Routes (no login required)](#public-routes-no-login-required)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Markdown | react-markdown + remark-gfm |

---

## Prerequisites

- **Node.js** v18 or higher — [download](https://nodejs.org)
- **npm** v9 or higher (comes with Node)
- The **backend API** running — see [leadnurse-backend](https://github.com/octavelabs/leadnurse-backend)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/octavelabs/leadnurse-frontend.git
cd leadnurse-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL — see [Environment Variables](#environment-variables).

### 4. Start the development server

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

> Make sure the backend is running first (`npm run dev` in the backend directory).

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

In production, point this to your deployed backend:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Running the App

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Building for Production

```bash
npm run build
```

This outputs a static site to the `dist/` folder. Deploy it to any static host:

- [Vercel](https://vercel.com) — connect the GitHub repo, set `VITE_API_URL`, done
- [Netlify](https://netlify.com) — same process
- [Render](https://render.com) — create a Static Site service

**Important:** If deploying to Vercel/Netlify, add a redirect rule so React Router works:
- Vercel: create `vercel.json`:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
  ```
- Netlify: create `public/_redirects`:
  ```
  /* /index.html 200
  ```

---

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                   # Axios API modules (one file per domain)
│   │   ├── axios.js           # Axios instance with base URL + auth interceptor
│   │   ├── authApi.js
│   │   ├── courseApi.js
│   │   ├── lessonApi.js
│   │   ├── chapterApi.js      # Chapters + chapter quiz API calls
│   │   ├── assessmentApi.js
│   │   ├── enrollmentApi.js
│   │   ├── progressApi.js
│   │   ├── certificateApi.js
│   │   ├── shiftApi.js
│   │   ├── attendanceApi.js
│   │   ├── payrollApi.js
│   │   ├── complianceApi.js
│   │   ├── facilityApi.js
│   │   ├── workerApi.js
│   │   ├── referenceApi.js
│   │   ├── documentApi.js
│   │   ├── timesheetSignoffApi.js
│   │   └── notificationApi.js
│   │
│   ├── components/
│   │   ├── common/            # Shared UI components (Button, Input, Modal, Badge…)
│   │   ├── dashboard/         # Dashboard-specific components (StatsCard, ProgressBar…)
│   │   ├── layout/            # App shell (Layout, Navbar, Sidebar)
│   │   └── workforce/         # Workforce-specific badges (ComplianceBadge, AttendanceBadge…)
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state (user, login, logout, isAdmin)
│   │
│   ├── pages/
│   │   ├── auth/              # Login, Register
│   │   ├── employee/          # LMS pages (Dashboard, Courses, Lesson viewer, Assessment…)
│   │   ├── worker/            # Workforce employee pages (Shifts, Attendance, Compliance…)
│   │   ├── admin/             # Admin LMS pages (Course management, Lesson builder…)
│   │   │   └── workforce/     # Admin workforce pages (Shifts, Workers, Payroll, Compliance…)
│   │   ├── ProfilePage.jsx    # Shared profile page (both roles)
│   │   ├── ReferencePage.jsx  # Public referee form (/references/:token)
│   │   └── TimesheetSignoffPage.jsx  # Public sign-off form (/timesheet-signoff/:token)
│   │
│   ├── utils/
│   │   └── certificateGenerator.js
│   │
│   ├── App.jsx                # Route definitions
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind base styles
│
├── .env.example               # Template — copy to .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Features

### Learning Management System (LMS)

- **Course catalogue** — browse and enrol in published courses
- **Slide-based lessons** — PowerPoint-style viewer with 5 slide types:
  - **Title** — full-colour heading slide
  - **Content** — heading + body text
  - **Key Points** — numbered bullet list
  - **Image** — image with caption
  - **Quote** — pull quote with attribution
- **Chapter organisation** — courses are structured into chapters, each containing multiple slides
- **Chapter quizzes** — 2–5 question quiz after each chapter with instant feedback and correct answer reveal
- **Final assessment** — scored quiz at the end of each course (configurable pass score)
- **Certificates** — auto-generated on passing the final assessment
- **Progress tracking** — per-slide completion tracked, resume from where you left off

### Workforce Management

- **Shift management** — create, fill, and manage healthcare shifts
- **Self-service shift applications** — employees browse available shifts and apply; admin confirms or declines
- **Attendance** — check-in/check-out times, hours worked, overtime
- **Timesheet sign-off** — third-party supervisor confirms a shift via a secure public link (no account needed); includes star rating and feedback
- **Payroll reports** — generate payroll for date ranges with regular/overtime breakdown
- **Compliance monitoring** — track DBS, NMC PIN, Right to Work, Care Certificate and more; workers upload documents, admin reviews
- **Facilities** — manage healthcare locations

### Onboarding & HR

- **Employee references** — admin adds referees, generates secure form link, referee fills in structured reference (ratings + open text + declaration) with no account required
- **Signable documents** — admin uploads contracts/policy docs, assigns to employees; employees review and sign with typed-name confirmation
- **Worker profiles** — photo upload, location, healthcare roles, compliance overview, reference history

### Admin Tools

- **Workforce dashboard** — key metrics: workers, shifts, compliance alerts, reference pipeline
- **Worker records** — searchable/filterable directory with compliance badge and location
- **Worker detail** — full profile, compliance docs, references, shift history

---

## Roles & Access

The app has two roles, both using the same login page. After login, users are routed to their respective dashboards.

| Role | Default Route | Sidebar |
|---|---|---|
| `EMPLOYEE` | `/dashboard` | Learning + Workforce (employee view) |
| `ADMIN` | `/admin/dashboard` | LMS management + Workforce management |

Role is assigned in the database. The seed script creates one `ADMIN` account. All self-registered accounts default to `EMPLOYEE`.

---

## Public Routes (no login required)

Two pages are intentionally public — they are accessed via secure token links sent externally:

| Route | Description |
|---|---|
| `/references/:token` | Employment reference form for referees |
| `/timesheet-signoff/:token` | Timesheet confirmation page for supervisors |

These pages work without any account or session. The token in the URL identifies the request and expires after a set period (14 days for references, 7 days for timesheets).

---

## Default Accounts

After running the backend seed (`node prisma/seed.js`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@leadnurse.com` | `Admin@123` |

To add 50 test employees: `node prisma/seedTestUsers.js` (password: `Password@123` for all).
