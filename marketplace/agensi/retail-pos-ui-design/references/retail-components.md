# Retail components

Read the section relevant to the task. These are adaptable patterns for existing
retail workflows, not a required screen template.

## Shared shell

Reuse the existing sidebar and header. If designing a new shell, a roughly 16rem
desktop sidebar provides space for grouped retail navigation and a bottom
account area. Highlight the active destination with an accent, readable text,
and the appropriate current-page semantics. Avoid adding a search field with no
working search behavior.

On narrow screens use the project's dismissible navigation drawer. Its trigger
needs a name and expanded state; support Escape, focus management, an explicitly
labeled close control, and focus restoration. Use a focus trap for a modal
drawer and make background content inert while it is open.

Give each page a title, a brief useful context line, and any contextual action.
Filters should wrap without covering the title or pushing the page sideways.

## Dashboard and reports

- Present a metric label, its value, units, and actual comparison context when
  available. Missing comparisons are not zero growth.
- Give the main sales or revenue chart most of the available width. Keep the
  legend, selected date range, and units near the chart.
- Separate revenue from order or unit counts. Label distinct axes if the chart
  requires them; a top-products report must state whether ranking is by units
  or revenue. Preserve the application's date and timezone semantics.
- Theme tooltips, grid lines, and empty states. Supplement graphical meaning
  with a useful textual summary or table; do not invent a visual trend when
  there is no data.
- Keep period filters, refresh, and export actions connected to their existing
  handlers. Decorative controls must not imply an available function.

## Inventory tables

Prioritize product identity, variant or SKU, stock, price, status, and the
relevant action. Use semantic headers and consistently align numbers. Do not
replace operational identifiers with decorative badges.

Keep search and filters labeled. Distinguish an empty catalogue from no matching
filter results and retain a way to clear filters. Preserve pagination and the
server's dataset scope.

Contain horizontal scrolling inside the table wrapper when needed. Keep row
actions identifiable and reachable by keyboard. Provide full product identity
when text is truncated; a hover-only tooltip is insufficient on touch devices.

Use the app's actual stock thresholds. Pair stock colors with words such as Low
or Out of stock. Respect existing permission checks and quantity units.

## Cart and checkout

Keep product identity, variant, quantity, unit price, and line total visible.
Format money with the existing formatter and currency. Reuse existing arithmetic
and server-confirmed totals rather than recalculating them in presentation code.

Use quantity inputs with meaningful labels, valid bounds, and existing handlers.
Support the application's current handling of temporary blank input and invalid
values. Keep increment, decrement, and remove actions distinguishable; scope a
label such as Remove to the associated product for assistive technology.

Place the total, payment-method control, validation messages, and submit action
in a clear reading order. Maintain current pending and duplicate-submit
protection and show server errors without clearing the cart. A payment-method
selector is not itself a payment integration.

On narrow screens, a product/cart tab pattern or stacked layout can work. Keep
cart count and total discoverable. A sticky summary or action must not obscure
the last item, validation messages, focused fields, or the on-screen keyboard;
allow space and account for safe-area insets where relevant.

Preserve barcode inputs, scanner focus behavior, keyboard shortcuts, and receipt
actions already implemented by the app. Changes to scanning or payment behavior
need separate implementation and verification appropriate to those features.

## States and interaction checks

| State | What the operator needs |
| --- | --- |
| Loading | Stable layout and truthful loading indication without fake totals |
| Empty | Clear explanation and an available next action when appropriate |
| Filtered empty | Active filter context and a way to reset the filters |
| Validation error | Field association, readable message, and preserved input |
| Pending checkout | Clear progress, retained cart, and existing submit protection |
| Server error | Readable failure message and the workflow's supported retry path |
| Restricted access | Existing permission behavior and scope remain enforced |

Inspect long product names, many variants, large amounts, empty results, and
pending/error interactions. Test keyboard focus order and every changed control.
At desktop and narrow mobile sizes, check that tables contain their scrolling,
totals remain readable, and fixed elements do not conceal content. If motion is
added, verify the reduced-motion version as well.
