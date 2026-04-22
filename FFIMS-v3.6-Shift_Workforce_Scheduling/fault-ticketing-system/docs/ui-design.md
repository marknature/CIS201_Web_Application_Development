# FFIMS Fault Ticketing UI Design

## Design system alignment

- Primary red: `#CC0000` for primary actions, urgent metrics, and critical emphasis
- Dark: `#1A1A1A` for the sidebar, hero surfaces, and module framing
- White: `#FFFFFF` for cards, form surfaces, and data containers
- Supporting colours:
  - Green for success and resolved states
  - Yellow for warning and escalated visibility
  - Blue for informational and in-progress states
- Typography:
  - `Inter`, fallback `Calibri`
  - Page titles: `20px` to `24px`
  - Section headers: `16px` to `18px`
  - Body text: `13px` to `14px`
  - Table text: `12px` to `13px`

## Page layouts

### Dashboard UI

- Dark summary band establishes the page’s highest emphasis level
- Metric cards show total, open, in-progress, resolved, and escalated visibility
- Supporting sections split into status distribution, priority mix, and recent tickets

### Report Fault UI

- Form fields are grouped into logical sections to reduce scanning effort
- Asset selection is paired with live asset context on the right side
- Inline validation and a simplified upload zone reduce reporting friction

### Tickets List UI

- Search and filters sit in a dedicated top card
- Ticket table uses hover states, consistent status chips, and a responsive mobile card layout
- Pagination remains visually separated from the table to keep controls easy to find

### Ticket Details UI

- Header focuses on ticket identity, owner, timestamps, and current state
- Workflow tracker shows current progression without overwhelming the content
- Main column contains ticket context, comments, and activity timeline
- Sidebar isolates assignment, status transitions, resolution notes, and delete confirmation

### Technician Workspace UI

- Queue-focused layout highlights assigned work, unassigned urgent tickets, and escalations
- Supporting table provides a familiar register view for recent updates
- Access is role-aware and remains limited to technicians and admins

## Reusable components

- `ShellLayout`: FFIMS sidebar, top navbar, notification access, role badge
- `PageHeader`: standard page heading block with aligned actions
- `MetricCard`: dashboard KPI card with tone-based emphasis
- `StatusChip`: reusable status and priority pill with colour-coded states
- `TicketTable`: responsive register view for desktop and mobile
- `PaginationBar`: minimal, FFIMS-styled paging control
- `EmptyState` and `LoadingPanel`: consistent fallback states
- Button variants:
  - Primary
  - Secondary
  - Outline
  - Danger
  - Success

## Visual hierarchy

- Level 1: dark hero bands, page titles, and red-highlighted critical figures
- Level 2: white analytics or content cards with strong section titles
- Level 3: chips, filters, helper notes, and timestamps
- Repetition is intentional: cards, chips, and table patterns remain visually stable across all pages

## UX improvements

- Reduced clutter by removing unnecessary nested containers and mixed card treatments
- Increased consistency through shared spacing, corner radius, and surface styling
- Improved readability with stronger separation between overview content and action panels
- Improved responsiveness with a collapsible sidebar, mobile ticket cards, and scroll-safe tables
- Preserved integration readiness by keeping UI data-driven through existing frontend API calls

## FFIMS compliance confirmation

This UI matches the FFIMS design framework through:

- Required FFIMS colour palette
- Inter/Calibri typography stack
- Dark sidebar plus top navbar structure
- Card-based content layout
- 8px-aligned spacing rhythm
- Minimal, professional presentation suitable for academic submission and GitHub collaboration
