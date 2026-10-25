---
name: pos-ui-design
description: Design or refine the TindaHub POS project using its dark navy, violet, and cyan dashboard system. Use for this project's dashboard, analytics, checkout, inventory, account, and marketing screens; do not impose this brand on unrelated projects.
---

# POS UI Design

Use the Dashdark-style references supplied by the user as the visual direction. The implemented source of truth is `resources/css/app.css`, `tailwind.config.js`, the shared admin layout/sidebar, and the dashboard and analytics screens. The former teal landing page is no longer the design reference.

## Visual language

- Default to a deep navy canvas (`#080f21`), slightly raised navy cards (`#101a37`), fine blue-gray borders, white primary text, and readable lavender-gray supporting text. Keep the existing Figtree sans-serif typography.
- Use violet for primary actions, active navigation, and the main data series; cyan and electric blue distinguish additional series. Use green, amber, and red for their real semantic meanings. Use soft violet backgrounds for quieter emphasis.
- Prefer semantic Tailwind roles (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`) backed by the shared CSS variables. Existing `indigo-*` utilities map to violet; existing gray utilities map to navy neutrals. Support the intentional light theme through the same tokens.
- Keep dashboard surfaces solid and restrained: 10–12px radii, subtle borders, minimal shadows, 20–24px card padding, and 20–24px section gaps. Reserve gradients for small brand marks, chart fills, or marketing accents.

## Layout and components

- Build the desktop app around a fixed 256px sidebar with a compact brand, navigation search, muted section labels, expandable groups, a slim violet active marker, and a bottom account area. Collapse to a dismissible drawer on mobile; retain Escape, focus management, and an explicitly labeled close control.
- Keep the utility header quiet. Put the page title, short supporting sentence, and contextual action above the content; avoid a separate white title band.
- Metrics use a small tinted icon beside a muted label, a prominent tabular value, and factual supporting context. Avoid large multicolored icon tiles, emoji shortcuts, and invented percentage changes.
- Give the primary report or sales chart most of the width, with secondary summaries beside it. Use violet and cyan chart lines, subtle grid lines, concise legends, and readable themed tooltips. Keep chart axes and monetary/count units accurate.
- Use the shared `dashboard-card`, `dashboard-link`, and `dashboard-icon` classes where appropriate. Tables, checkout, and inventory should remain compact and easy to scan. Primary actions use solid violet with white text; secondary actions use a bordered surface.
- On mobile, stack major panels, allow filters to wrap, keep actions reachable, and contain table scrolling. Avoid page-level horizontal overflow and clipped monetary values.

## Content, behavior, and checks

- Keep TindaHub branding, existing routes, roles, data scope, and transactional behavior. Use real data and honest empty states; reference screenshots supply visual guidance, not product claims or sample figures.
- Preserve readable contrast, visible focus, semantic headings, labels, and keyboard operation. Pair status colors with visible words/icons. Respect reduced motion.
- Inspect the actual page and its shared primitives before editing. Change reusable tokens first, then refine the relevant components. Keep light/dark theme choice in `tindahub.theme.v2`; new sessions default to dark before the first paint.
- Run the existing production build after implementation, plus tests relevant to any changed data behavior. Inspect practical desktop and narrow mobile layouts before delivery. Do not change marketing media or add dependencies solely for visual decoration.
