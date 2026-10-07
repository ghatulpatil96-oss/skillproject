# UI/UX Design Document

## Workfinder — Job Search Dashboard

| Field | Detail |
|---|---|
| **Document Version** | v1.0 |
| **Design Type** | Desktop web application — job discovery & application dashboard |
| **Status** | For Review |
| **Reference** | `original-e6a67e261327094f96810703ddd09d08.png` |
| **Related Docs** | `PRD-skillbridge.md` (this layout serves as the design reference for the SkillBridge job feed) |

---

## 1. Design Overview

The screen is a **three-panel job discovery dashboard** following the classic *master–detail* pattern with a persistent navigation rail:

1. **Left Sidebar** — brand mark, primary navigation, secondary links, and user account chip pinned to the bottom.
2. **Center Content Column** — the "master": search bar, filter bar with result count, and a scrollable list of job cards. The selected card is visually highlighted.
3. **Right Detail Panel** — the "detail": the full context of the selected job (company identity, role, location, description, worker reviews) with primary/secondary actions anchored at the bottom.

### 1.1 Design Principles
- **Content-first minimalism** — generous white space, no decorative chrome; the job list is the hero.
- **One active selection** — exactly one job card is in a "selected" state at any time; its detail always fills the right panel. The user never loses the list context.
- **Calm, professional palette** — near-monochrome UI with a single confident blue accent used only for interactive/selected states.
- **Scannable density** — every job card repeats the same 4-column internal grid (logo → title/company → location → salary), so the eye can scan vertically.

---

## 2. Layout & Grid

### 2.1 Overall Composition
```
┌────────────────────────────────────────────────────────────────────┐
│  Page background: light gray (#F0F2F5-ish), canvas floats on top   │
│  ┌──────────┬───────────────────────────────┬───────────────────┐  │
│  │ Sidebar  │  Job List (center, scrollable)│  Detail Panel     │  │
│  │ ~260px   │  fluid / ~55% of width        │  ~380–420px fixed │  │
│  └──────────┴───────────────────────────────┴───────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```
- The app canvas is a **large rounded-corner container (radius ≈ 16–24px)** floating on a gray page background with a soft, wide ambient shadow — a "card as app" presentation.
- Sidebar and detail panel have white backgrounds; the center column has a very light gray tint (#FAFBFC) to visually separate list from panels.
- A thin vertical divider (1px, ~#ECEDF0) separates sidebar from content.

### 2.2 Column Behavior
| Region | Width | Behavior |
|---|---|---|
| Sidebar | ~260px fixed | Fixed; full height; own scroll if needed |
| Job list | Fluid (~55%) | Independently scrollable; search + filters sticky at top |
| Detail panel | ~380–420px fixed | Independently scrollable; actions pinned at bottom |

---

## 3. Color System

### 3.1 Palette
| Token | Value (approx.) | Usage |
|---|---|---|
| `accent/blue` | **#1A73E8 / #2563EB** | Selected card border, active nav indicator, result-count badge, primary "Apply now" button, "Read more" and "By Your Specialty" links |
| `text/primary` | **#1B1D21** (near-black) | Job titles, company names, prices, section headings |
| `text/secondary` | **#6B7280** (mid gray) | Company subtitles, "Location", "Yearly" labels, body copy |
| `text/tertiary` | **#9CA3AF** | Placeholder text, inactive icons, dividers' labels |
| `bg/canvas` | **#FFFFFF** | Sidebar, detail panel, cards |
| `bg/list` | **#FAFBFC** | Center column background |
| `bg/page` | **#F0F2F5** | Outer page background |
| `bg/logo-tile` | **#F3F4F6** | Rounded square behind company logos |
| `border/default` | **#ECEDF0** | Card borders, dividers |
| `btn/dark` | **#2E3440-ish charcoal** | Secondary "Notify me" button |
| `badge/blue` | **#1A73E8** | Result count chip ("284") |

### 3.2 Accent Usage Rules
- Blue is reserved for **state, not decoration**: the selected job, the active nav item, the primary CTA, and interactive text links.
- Everything else stays grayscale — this creates instant visual focus on what's clickable and what's selected.
- Selection is communicated by **two redundant cues**: a 2px blue border on the card *and* the blue-filled actions in the detail panel.

---

## 4. Typography

| Role | Spec (approx.) | Notes |
|---|---|---|
| Brand / screen title | 20–24px, ExtraBold, letter-spaced small caps ("WORKFINDER") | Centered over the list column with a subtle line-art city illustration behind it |
| Meta line under brand | 12px, Regular, gray | "9,054, 934 jobs posted in 2019" |
| Job title | 15–16px, SemiBold, near-black | Primary scan target in each card |
| Company name | 13px, Regular, gray | Under title |
| Location / salary value | 14–15px, Medium | Location in column 3; salary in column 4 |
| Location / salary label | 12px, Regular, gray | "Location" / "Yearly" beneath values |
| Section headings (right panel) | 15–16px, SemiBold | "Description", "Workers Reviews" |
| Body copy | 13px, Regular, gray, line-height ≈ 1.6 | Truncated with "Read more" link |
| Nav items | 14px, Medium | Active item in blue, with 3px blue bar on the left edge |

A single geometric/neutral sans (Inter, SF Pro, or similar) is used throughout; hierarchy is achieved with **weight and color only — no font-family changes, no serif accents**.

---

## 5. Component Breakdown

### 5.1 Left Sidebar (`w: ~260px`)
Vertical stack, top to bottom:
1. **Brand mark** — small bold "W" logo, top-left with generous padding (~40px).
2. **Primary nav group** (icon + label rows, 44px row height):
   - Home, **Search Jobs (active)** — active state = blue text + 3px blue vertical bar flush to the sidebar's right edge.
3. **Sub-nav group** (indented, no icons): Favorite Companies, **By Your Specialty** (active sub-item, blue), High Salaries.
4. **Secondary nav group** (icon + label): Top Companies, Post Job, Report Us.
5. **Utility buttons row** — two square outlined buttons (~56px, radius 12px): bookmark/save and settings, side by side.
6. **User chip** (pinned bottom) — rounded card with avatar, name ("Matt Frost"), role ("Designer"), and a vertical ⋮ overflow menu.

### 5.2 Header / Hero (center column top)
- Centered screen title **"WORKFINDER"** in bold caps with letter spacing.
- Small gray stats line beneath.
- Faint, grayscale **line-art city skyline illustration** behind the header — decorative only, ~10% opacity, adds character without distracting.
- **Search bar** below: full-width white pill/rounded rectangle (radius ~10px), light border, magnifier icon left, query text ("Designer, USA"), and an **"Advanced Search" dropdown** on the right end.

### 5.3 Filter Bar
A single row directly under search:
- **Result count badge** — blue rounded-square chip ("284"), white bold text.
- Three dropdown filters: **Choose Category**, **Choose Location**, **Choose Salary** — each a label + chevron, evenly distributed across the row.
- No visible buttons (filters auto-apply); the badge updates the result count live.

### 5.4 Job Card (repeating list item)
- **Container:** white card, radius ~12px, 1px light border, subtle shadow; ~24px vertical gap between cards; ~24px internal padding.
- **Internal 4-column grid:**

| Col 1 | Col 2 | Col 3 | Col 4 |
|---|---|---|---|
| Company logo in a 48px rounded-square light-gray tile | Title (bold) + company name (gray) | Location (medium) + "Location" label (gray) | Salary range (medium) + "Yearly" label (gray) |

- **Selected state:** 2px blue border, slightly elevated shadow. Only one card selected at a time; selection drives the right panel.
- **Hover state (implied):** light border darkening + cursor pointer.
- Click anywhere on the card → selects the job and updates the detail panel (no page navigation).

### 5.5 Right Detail Panel (`w: ~380–420px`)
Top to bottom:
1. **Company identity block** — large 72–80px rounded-square logo tile, centered; company name ("Apple", bold, 22px); company type ("Technology Company", gray, small). All centered.
2. **Role block (left-aligned)** — job title ("Product Designer", SemiBold), location beneath in gray, and a **blue bookmark/save icon button** at the top-right corner of this block.
3. **Description section** — heading + 13px gray body copy clamped to ~6 lines, ending in a blue **"Read more"** link that expands inline.
4. **Workers Reviews section** — heading row with left/right carousel arrows (‹ ›). Review card: white, rounded, light border; reviewer avatar, name (SemiBold), role (small gray), and a 2–3 line quote in gray. Carousel implies multiple reviews horizontally.
5. **Action row (anchored bottom):**
   - **"Apply now"** — primary button: blue fill, white text, radius ~10px, ~48px tall, ~50% width.
   - **"Notify me"** — secondary button: dark charcoal fill, white text, same dimensions, ~45% width.

---

## 6. Interaction & States

| Element | Interaction |
|---|---|
| Job card | Click → select (blue border) + detail panel updates; hover → border/shadow lift |
| "Read more" | Expands truncated description inline |
| Reviews arrows | Horizontally paginate review cards (carousel) |
| Bookmark icon | Toggles saved state (fills blue when saved) |
| Search bar | Enter triggers search; "Advanced Search" opens extended filter panel |
| Filters/dropdowns | Update list + result-count badge reactively |
| "Apply now" | Opens application flow (modal or panel transition) |
| "Notify me" | Toggles job alert for this role/company; button state changes to subscribed |
| Nav items | Active route highlighted with blue text + left bar indicator |

**Empty/edge states to design:** zero results (illustration + "clear filters" CTA), loading skeletons for cards and detail panel, unselected default state (auto-select first card on load, as implied by the design).

---

## 7. Spacing, Radius & Elevation Tokens

| Token | Value |
|---|---|
| Base spacing unit | 8px scale: 4 / 8 / 12 / 16 / 24 / 32 / 40 |
| Card radius | 12px |
| Button radius | 10px |
| Logo tile radius | 12px |
| App canvas radius | 16–24px |
| Card shadow (rest) | `0 1px 3px rgba(0,0,0,0.06)` |
| Card shadow (selected/hover) | `0 4px 16px rgba(0,0,0,0.08)` |
| App canvas shadow | `0 24px 64px rgba(0,0,0,0.12)` |
| Icon sizes | 16px (nav), 20px (search), 24px (logos/controls) |

---

## 8. Responsive Behavior

| Breakpoint | Adaptation |
|---|---|
| **≥1280px** | Full three-panel layout as designed |
| **1024–1279px** | Sidebar collapses to icon-only rail (~72px); detail panel stays |
| **768–1023px (tablet)** | Two-panel: list + detail; nav moves to top bar with hamburger |
| **<768px (mobile)** | Single panel: list view; tapping a card slides the detail panel in over the list (with back button); filters collapse into a bottom sheet |

---

## 9. Accessibility Notes

- **Contrast:** gray secondary text (#6B7280 on white) passes AA for 13px+ text; avoid lighter grays for body copy.
- **Selection semantics:** job list should be a listbox pattern — arrow-key navigation between cards, Enter to select; selected card gets `aria-selected`.
- The blue "selected" border must not be the *only* cue — pair with the detail panel update and, ideally, a subtle background tint for color-blind users.
- Bookmark/save buttons need `aria-pressed` state; carousel arrows need accessible names.
- Focus rings: 2px blue outline with 2px offset on all interactive elements (matches accent color).

---

## 10. Design → SkillBridge Mapping

This design is the visual reference for the **SkillBridge job feed (PRD F5)**. Recommended adaptations:

| Workfinder element | SkillBridge adaptation |
|---|---|
| Salary column | **Match score** ("78% match") + salary range |
| Job card meta | Add verified-skill chips (e.g., `React 82 ✓`) on the card |
| Workers Reviews carousel | **Company reviews + verified student placement outcomes** |
| "Notify me" | Same — job alerts |
| Advanced Search | Filters for verified score thresholds, Job-Ready badge, grad year |
| Sidebar "By Your Specialty" | "By Your Roadmap" — jobs matching the student's active roadmap/target role |

The restrained monochrome-plus-blue system transfers directly; the key addition is a **green "verified" tint/chip** for skill scorecards, used sparingly so the blue remains the sole state color.

---

## 11. Handoff Assets Checklist

- [ ] Figma file: components (card, filter, nav item, buttons), variants (default/selected/hover), auto-layout
- [ ] Design tokens export (colors, spacing, radii, shadows, type scale) as JSON
- [ ] Empty / loading / error state artboards
- [ ] Icon set (24px grid, 1.5px stroke, outline style)
- [ ] Logo tile placeholders + favicon spec
