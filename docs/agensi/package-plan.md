# Standalone package plan

Status: standalone source and draft ZIP created. Format and archive checks
passed; see the [validation record](validation.md). The separate-project trial
remains pending before submission.

## Package layout

```text
marketplace/agensi/
  retail-pos-ui-design/
    SKILL.md
    references/
      theme-tokens.md
      retail-components.md
  dist/
    retail-pos-ui-design.zip
```

Only the contents of `retail-pos-ui-design/` belong in the ZIP. Keep the listing,
preparation documents, trial workspace, and trial evidence outside that folder.
The `dist/` archive is ready for a draft upload. Rebuild and validate it after
any changes to the distributable source.

No executable helper is included: the capability is design guidance. Keep the
agent's required instructions and references in text, because Agensi delivers
text files to agents.

## Adapt the existing skill

| Current assumption | Standalone treatment |
| --- | --- |
| TindaHub branding is mandatory | Preserve the buyer's brand; offer the navy/violet/cyan system when no brand exists or it is requested. |
| Earlier Dashdark-style screenshots are available | Describe the intended design in text without requiring prior chat attachments. |
| `resources/css/app.css` and `tailwind.config.js` exist | Inspect the buyer's styling setup and reuse its existing tokens and Tailwind version. |
| `dashboard-card`, `dashboard-link`, and `dashboard-icon` already exist | Explain the component roles; reuse equivalents or define suitable local primitives. |
| A particular sidebar, dashboard, and analytics page exist | Discover the equivalent layout and screens in the buyer's project. |
| Theme choice uses `tindahub.theme.v2` | Preserve the buyer's theme storage and startup behavior. |
| `npm run build` is the project's build command | Use the project's declared build command; name the command in the trial evidence. |
| Laravel routes, shop roles, and transactions are present | Preserve whichever routes, access controls, and data contracts the buyer's app uses. |

Retain the useful retail-specific guidance: scan-friendly monetary totals,
compact inventory tables, truthful metric context, distinct chart units,
reachable checkout actions, contained table overflow, visible status labels,
keyboard support, and reduced-motion behavior.

## File responsibilities

- `SKILL.md`: focused name and description, when to apply it, inspection workflow,
  essential design rules, behavior-preservation boundaries, and links to the two
  references.
- `references/theme-tokens.md`: palette roles and example tokens, readable text
  and focus states, optional light-theme adaptation, and instructions to preserve
  an existing theme rather than overwrite it.
- `references/retail-components.md`: dashboard, chart, table, cart, and checkout
  patterns with representative empty, loading, and error states and mobile
  behavior. Use sample labels rather than invented business claims.

## Verification before submission

1. Validate the skill's YAML frontmatter, name, description, and reference links.
   Completed for this draft; repeat after changing the package.
2. Use a separate React/Tailwind sample app with no TindaHub files or prior chat
   context. Run the demo request from the [listing draft](listing-draft.md) using
   only the package and that sample app.
3. Inspect a desktop and narrow mobile viewport. Verify keyboard focus, control
   labels, totals, contained table scrolling, and reachable checkout actions.
   Verify theme switching if it is part of the trial.
4. Run that app's production build and any existing checks relevant to the
   behavior touched. Record actual output and any remaining limitations in the
   [readiness tracker](README.md).
5. Record the agent, environment, request, generated result, commands, and visual
   evidence. Use those results to finalize the compatibility and demo sections.
6. Inspect the final archive's file list and extract it to check that `SKILL.md`
   and its references resolve. Completed for this draft. Recheck the current
   platform packaging limits if the submission is delayed or the package changes.

## Package contents review

Include only original or appropriately licensed instructions and supporting
text. Review the rights to any excerpts from the project or external design
references before including them.

Exclude application source bundles, credentials, environment files, customer
data, dependency directories, the old installed teal skill, and unrelated skills
under `.agents/skills/`. The package should stand on the selected capability.

Do not copy the email or account screenshots into the distributable. The skill
must not depend on local absolute paths, prior chat history, or installed skills
that a buyer may not have.

Platform references: [packaging](https://www.agensi.io/docs/packaging) and
[submission](https://www.agensi.io/docs/submit-on-the-website).
