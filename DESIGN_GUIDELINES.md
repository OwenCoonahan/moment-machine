# Moment Machine — Design Guidelines

## Design Philosophy
**Clean. Minimal. Professional. Not "AI-generated".**

Think: Linear, Vercel Dashboard, Stripe, Notion

---

## Colors

### Primary Palette
```css
--background: #ffffff;
--foreground: #09090b;
--muted: #71717a;
--muted-foreground: #a1a1aa;
--border: #e4e4e7;
--input: #e4e4e7;
--ring: #18181b;
```

### Accent (use sparingly)
```css
--accent: #18181b;        /* Primary actions */
--accent-success: #22c55e; /* Success states */
--accent-warning: #f59e0b; /* Warnings */
--accent-error: #ef4444;   /* Errors */
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-family: 'Geist Mono', 'SF Mono', 'Fira Code', monospace; /* for code/stats */
```

### Scale
- **Display:** 36px / font-semibold
- **H1:** 24px / font-semibold
- **H2:** 18px / font-medium
- **H3:** 14px / font-medium
- **Body:** 14px / font-normal
- **Small:** 12px / font-normal
- **Micro:** 10px / font-medium uppercase tracking-wide

---

## Spacing

Use 4px base unit:
- `4px` — tight spacing
- `8px` — default gap
- `12px` — comfortable
- `16px` — sections
- `24px` — major sections
- `32px` — page sections

---

## Components

### Cards
```css
.card {
  background: white;
  border: 1px solid #e4e4e7;
  border-radius: 8px; /* or 12px for larger cards */
  padding: 16px;
}
```

### Buttons
```css
/* Primary */
.btn-primary {
  background: #18181b;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

/* Secondary */
.btn-secondary {
  background: #f4f4f5;
  color: #18181b;
  border: 1px solid #e4e4e7;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: #71717a;
}
```

### Inputs
```css
.input {
  background: #fafafa;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #18181b;
  box-shadow: 0 0 0 2px rgba(24,24,27,0.1);
}
```

### Stats Display
```css
.stat {
  padding: 12px 16px;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #71717a;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  font-family: monospace;
}
```

---

## Layout

### Dashboard Structure
```
┌─────────────────────────────────────────────────┐
│ Header (h-14, border-bottom)                    │
│ ┌─────────────┬─────────────────────────────┐  │
│ │ Logo        │              Status/Actions │  │
│ └─────────────┴─────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Tabs (optional)                                 │
├─────────────────────────────────────────────────┤
│ ┌───────────────┬───────────────────────────┐  │
│ │ Left Panel    │ Main Content Area         │  │
│ │ (w-80/320px)  │ (flex-1)                  │  │
│ │               │                           │  │
│ │ • Brand Setup │ • Stats Grid              │  │
│ │ • Settings    │ • Content Grid            │  │
│ │ • Actions     │ • Preview                 │  │
│ │               │                           │  │
│ └───────────────┴───────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Sidebar Width
- Desktop: 320px fixed
- Tablet: 280px
- Mobile: Full width (stacked)

---

## Content Grid

### For High-Quality Content
```css
.content-grid-quality {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
  gap: 16px;
}

.content-card {
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
}

.content-card-image {
  aspect-ratio: 1;
  background: #f4f4f5;
}

.content-card-body {
  padding: 12px;
}
```

### For Nuke Mode
```css
.content-grid-nuke {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 4px;
}

.content-thumbnail {
  aspect-ratio: 1;
  background: #f4f4f5;
  border-radius: 4px;
}
```

---

## Animations

Keep it subtle:
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Use sparingly */
transition: all 0.15s ease;
```

---

## Do's and Don'ts

### ✅ DO
- Use plenty of white space
- Keep text concise
- Show real content (images, not icons)
- Use subtle shadows if needed: `shadow-sm`
- Maintain consistent border radius (6px or 8px)
- Use monospace for numbers/stats

### ❌ DON'T
- Use gradients
- Use heavy drop shadows
- Use bright/neon colors
- Use rounded-full on large elements
- Use too many different border radiuses
- Use icons where text would be clearer

---

## Reference Screenshots

Look at:
- linear.app — Task cards, sidebar layout
- vercel.com/dashboard — Stats, project cards
- stripe.com/dashboard — Information density, clarity
- cal.com — Form layouts, clean scheduling UI

---

## Component Library

Using **shadcn/ui** with these components:
- Button
- Input
- Card
- Tabs
- Badge
- Dialog
- Dropdown Menu
- Label
- Separator
- Skeleton (loading states)

Install command:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card tabs badge
```
