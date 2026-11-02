# Theme tokens

Use the buyer's established theme and brand first. This palette is an optional
starting point for a new retail interface or an explicitly requested restyle.
Map roles to the existing theme system instead of creating competing tokens.

## Palette roles

| Role | Dark | Light | Use |
| --- | --- | --- | --- |
| Background | `#080f21` | `#f4f6fb` | Main canvas |
| Surface | `#101a37` | `#ffffff` | Cards, tables, cart |
| Foreground | `#f5f7ff` | `#19243b` | Headings, amounts, normal text |
| Muted foreground | `#b4bfd8` | `#526078` | Supporting text and labels |
| Decorative border | `#2b385b` | `#d6deeb` | Surface separators |
| Control border | `#7184ad` | `#64748b` | Input boundaries where needed for recognition |
| Primary | `#7c3aed` | `#7c3aed` | Main action, with white text |
| Primary text | `#ffffff` | `#ffffff` | Text on solid primary actions |
| Accent text | `#c4b5fd` | `#6d28d9` | Active text and links on neutral surfaces |
| Focus | `#c4b5fd` | `#6d28d9` | Visible keyboard focus ring |
| Cyan | `#22d3ee` | `#0e7490` | Secondary chart series and selected emphasis |
| Success text | `#6ee7b7` | `#047857` | Success, accompanied by a label |
| Warning text | `#fcd34d` | `#92400e` | Warning, accompanied by a label |
| Error text | `#fda4af` | `#be123c` | Error, accompanied by a label |

Decorative separators can be subtle. Do not rely on them alone to identify an
interactive field. Pair status colors with text or an icon plus an accessible
name. Chart series also need legends and distinguishable patterns or markers
where color alone would be ambiguous.

## Optional CSS example

This is plain CSS. Adapt the selectors to the app's existing theme mechanism.
If semantic tokens already exist, set their values instead of adding this layer.

```css
[data-retail-theme="dark"] {
  color-scheme: dark;
  --retail-background: #080f21;
  --retail-surface: #101a37;
  --retail-foreground: #f5f7ff;
  --retail-muted: #b4bfd8;
  --retail-border: #2b385b;
  --retail-control-border: #7184ad;
  --retail-primary: #7c3aed;
  --retail-on-primary: #ffffff;
  --retail-accent: #c4b5fd;
  --retail-focus: #c4b5fd;
  --retail-cyan: #22d3ee;
}

[data-retail-theme="light"] {
  color-scheme: light;
  --retail-background: #f4f6fb;
  --retail-surface: #ffffff;
  --retail-foreground: #19243b;
  --retail-muted: #526078;
  --retail-border: #d6deeb;
  --retail-control-border: #64748b;
  --retail-primary: #7c3aed;
  --retail-on-primary: #ffffff;
  --retail-accent: #6d28d9;
  --retail-focus: #6d28d9;
  --retail-cyan: #0e7490;
}
```

Use the installed Tailwind version's existing configuration or CSS-based theme
mapping to expose semantic roles. Do not copy a configuration from a different
Tailwind major version or globally redefine utility colors. Preserve theme
storage, server rendering, startup selection, and first-paint behavior.

## Density and type

- Start with 10-12px surface radii, 20-24px panel padding and panel gaps, and
  8-12px gaps between related controls. Adjust for the task and existing scale.
- Keep body and form typography in the existing readable sans-serif family;
  system fonts are sufficient. Retain readable supporting labels in dense views.
- Use tabular numerals and align amounts consistently. Let product descriptions
  wrap or truncate accessibly without hiding variant, quantity, or total values.
- Reserve strong shadows and gradients for situations that benefit from them.
  A solid surface and clear hierarchy are sufficient for most operator screens.

Check contrast after applying actual opacity, hover, disabled, tooltip, and focus
styles. The nominal palette alone cannot establish an entire screen's
accessibility. Keep focus visible against both the control and its surroundings.
