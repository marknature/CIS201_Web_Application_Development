# FFIMS — Shift & Workforce Scheduling Module

A production-grade Next.js 14 web application for Africa University's Fleet and Facilities Unit.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Drag & Drop | @dnd-kit/core |
| Icons | Lucide React |
| Date utils | date-fns |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

## Module Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | KPI summary, compliance overview, driver status today |
| `/roster` | Drag-and-drop weekly roster board with conflict detection |
| `/leave` | Leave request approval workflow |
| `/overtime` | OT approval + fairness ranking (seniority + recent OT hours) |
| `/drivers` | Driver profiles, skill tags, license classes |
| `/skill-matching` | AI cosine similarity matcher — select skills to rank drivers |

## Key Features

- **5-in/5-out rotation** — Team A (active) and Team B (rest) clearly separated on the roster board
- **Compliance engine** — enforces Zimbabwe Labor Act: 45h weekly max, 11h rest periods, leave conflicts
- **Drag-and-drop** — swap shifts between drivers; hard-blocked on leave conflicts
- **OT fairness algorithm** — ranks drivers by fewest recent OT hours, then highest seniority
- **Cosine similarity skill matching** — select required skills, instantly ranks all drivers by match score
- **Zustand store** — all state (roster, leave, OT) shared across pages in real time

## File Structure

```
src/
├── app/
│   ├── dashboard/page.tsx       # KPI dashboard
│   ├── roster/page.tsx          # Drag-and-drop roster board
│   ├── leave/page.tsx           # Leave management
│   ├── overtime/page.tsx        # Overtime management
│   ├── drivers/page.tsx         # Driver profiles
│   ├── skill-matching/page.tsx  # AI skill matcher
│   ├── layout.tsx               # Root layout + sidebar
│   └── globals.css
├── components/
│   ├── ui/index.tsx             # ShiftBadge, KPICard, Card, LeaveStatusBadge…
│   └── shared/Sidebar.tsx       # Navigation sidebar
├── lib/
│   ├── data.ts                  # Seed data (10 drivers, roster, leave, OT)
│   ├── compliance.ts            # Labor Act compliance engine
│   └── skillMatch.ts            # Cosine similarity + OT fairness ranker
├── store/
│   └── ffims.ts                 # Zustand global store
└── types/
    └── index.ts                 # All TypeScript interfaces
```

## Backend Integration (Next Steps)

Replace the seed data in `src/lib/data.ts` with real API calls:

```ts
// src/lib/api.ts — example
export async function fetchRoster(weekId: string): Promise<WeekRoster> {
  const res = await fetch(`/api/roster/${weekId}`);
  return res.json();
}
```

Connect Socket.io for real-time standby notifications:

```ts
// In a layout or provider component
import { io } from "socket.io-client";
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
socket.on("shift-update", (data) => store.updateShift(...));
```
