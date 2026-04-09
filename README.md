# FFIMS — Shift & Workforce Scheduling Module (v2 — Design Framework Applied)

Next.js 14 web application for Africa University's Fleet and Facilities Unit.
UI rebuilt to spec from **Group P5 UI Design Framework** (Red `#CC0000` · Black `#1A1A1A` · White · Inter).

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Design System (from UI_Design_Framework_FFIMS.pptx)

| Token | Value |
|-------|-------|
| Primary red | `#CC0000` — active nav, CTA buttons, accents |
| Dark / Nav | `#1A1A1A` — sidebar background, headings |
| White / Card | `#FFFFFF` — card surfaces, form fields |
| Background | `#F9FAFB` — page background |
| Success | `#22C55E` — approved, on duty |
| Warning | `#FACC15` — pending, near threshold |
| Error | `#EF4444` — critical, rejected |
| Info | `#3B82F6` — standby, informational |
| Font | Inter — 22px titles / 17px sections / 13-14px body |
| Grid | 8px base — 24px page padding, 16-20px card padding |
| Buttons | 36-40px height · 7px radius · semantic colors |
| Tables | Gray `#F3F4F6` header · 40-48px rows · hover highlight |
| Icons | Lucide outline · 16-20px · gray → red when active |

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | KPI cards with red left accents, compliance panel, driver table |
| `/roster` | Drag-and-drop roster board · Team A/B row groups |
| `/leave` | Approve/reject workflow with history table |
| `/overtime` | OT approvals + fairness ranking algorithm |
| `/drivers` | Driver profile cards with skill chips |
| `/skill-matching` | Cosine similarity AI matcher — click skills to rank drivers |

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx
│   ├── roster/page.tsx
│   ├── leave/page.tsx
│   ├── overtime/page.tsx
│   ├── drivers/page.tsx
│   ├── skill-matching/page.tsx
│   ├── layout.tsx
│   └── globals.css         ← all FFIMS design tokens & utility classes
├── components/
│   ├── ui/index.tsx        ← ShiftChip, KPICard, Card, Avatar, ApproveRejectButtons…
│   └── shared/Sidebar.tsx  ← black nav · red active state
├── lib/
│   ├── data.ts             ← 10 AU drivers + seed roster/leave/OT
│   ├── compliance.ts       ← Zimbabwe Labor Act engine
│   └── skillMatch.ts       ← cosine similarity + OT fairness ranker
├── store/ffims.ts          ← Zustand global state
└── types/index.ts          ← TypeScript interfaces
```
