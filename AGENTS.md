# POS project guidance

For UI and UX work in this repository, read and apply
[`docs/skills/pos-ui-design/SKILL.md`](docs/skills/pos-ui-design/SKILL.md).
It defines this project's current dark navy, violet, and cyan design system and
supersedes the older teal POS skill installed outside this repository.

Keep the existing Laravel/Inertia routes, shop roles, and transaction behavior.
Use shared theme tokens and components so dashboard, checkout, inventory, and
account screens remain consistent. Validate frontend changes with `npm run build`;
run relevant PHP tests when changing data behavior.
