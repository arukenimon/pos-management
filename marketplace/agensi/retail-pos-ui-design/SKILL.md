---
name: retail-pos-ui-design
description: "Design or refine React and Tailwind interfaces for retail point-of-sale dashboards, checkout, inventory tables, and sales reports. Use for frontend layout, theming, responsive behavior, and accessibility while preserving existing retail workflows. Does not supply stock, barcode, tax, or payment-processing logic."
---

# Retail POS UI Design

Help a retail operator read sales, find products, review the cart, and complete
an existing checkout workflow with clear, consistent controls. Work in the
user's frontend project and keep the requested screens within scope.

## Inspect before changing

Locate the relevant screens, shared layout, theme tokens, component primitives,
and declared build command. Identify the existing route/link conventions,
currency formatting, data shapes, permissions, and checkout handlers that the
interface must preserve. Use the project's established React and Tailwind
patterns; do not assume a particular backend or Tailwind version.

Preserve the user's brand and current light/dark preference behavior. For an
unbranded interface, or when the user requests the included visual direction,
use the navy, violet, and cyan starting system in
[theme-tokens.md](references/theme-tokens.md). Read that reference when adding or
adjusting a theme. It also explains control borders and contrast roles.

Read the relevant sections of
[retail-components.md](references/retail-components.md) for the requested
dashboard, inventory, or checkout work. Reuse existing components before adding
new primitives; update shared tokens when the issue affects several screens.

## Design decisions

- Keep totals, product identity, quantities, and the next action easy to locate.
  Give a sales dashboard's main report more space than secondary summaries.
- Use compact, aligned tables and tabular numerals for amounts. Preserve full
  monetary values and correct currency, quantity, date, and chart-axis units.
- Use restrained surfaces, subtle separators, clear headings, and a consistent
  spacing scale. Keep decorative motion and marketing layouts out of dense
  operator tasks unless they serve the user's requested interaction.
- Keep action hierarchy local: one visually dominant action for the current
  task, clear secondary actions, and visible destructive-action labels.
- Use actual supplied data and distinguish loading, empty, filtered-empty,
  error, and pending-action states. Label fixture data in a demonstration;
  never invent revenue, growth, discounts, or business outcomes.
- Keep mobile actions reachable and contain wide table scrolling within the
  table region. Retain labels, visible focus, meaningful status text, and
  keyboard operation. Use the project's accessible dialog and drawer primitives.
- Respect reduced motion. Add a chart or animation library only when the task
  needs it and the project's existing tools cannot reasonably provide it.

## Preserve retail behavior

Keep routes, access restrictions, shop or tenant scope, form contracts, data
fetching, and server actions intact while changing presentation. Preserve the
existing totals, rounding, discounts, taxes, quantity limits, stock checks,
payment submissions, and receipt semantics. Do not introduce a second source
of truth for financial values.

Handle a request for stock deduction, barcode scanning, tax rules, or payment
integration as separate application behavior work; these features are not
provided by this UI skill. Do not imply that a visual redesign implements them.

## Verify and deliver

Run the project's declared production build after frontend changes. If the task
also changes data behavior, run the checks appropriate to that behavior. Inspect
desktop and narrow mobile layouts, long names and large amounts, focus order,
control labels, and the affected workflow's pending and error states. Check both
themes when changing shared theme behavior.

Use the available browser or preview capability for visual checks. If a build,
browser, or prerequisite is unavailable, say which checks remain unverified.
Report the changed screens and shared components, verification performed, and
any material limitation without claiming results that were not observed.
