# Agensi submission form guide

Use this alongside the New skill form shown in the supplied screenshots.
Status: package preparation; the real demo and final pricing remain pending.

## 1. Skill ZIP Upload

Choose [retail-pos-ui-design.zip](../../marketplace/agensi/dist/retail-pos-ui-design.zip).
It contains the standalone UI skill and two text references. Use this archive,
not a ZIP of the application repository.

Uploading prepares the draft. Wait to submit for review until the real trial and
listing review are complete. Agensi documents that the form saves drafts as you
go; see [Submit on the website](https://www.agensi.io/docs/submit-on-the-website).

## 2. Skill Details

Copy the Name, Summary, and Description sections from the
[listing draft](listing-draft.md). The package frontmatter uses the portable
identifier `retail-pos-ui-design`; set the buyer-facing form name to:

```text
POS Dashboard & Checkout UI Design
```

Logo: upload the [prepared PNG](../../marketplace/agensi/listing-assets/retail-pos-ui-design-logo.png)
in the Skill logo field. It is 1,254 x 1,254 pixels and 1,168,096 bytes, within
the square-image and 5 MB requirements shown in the form. The form's 512 x 512
size is a recommendation. See [logo notes](logo-notes.md).

## 3. See it in action

Use the trial request from the listing draft. The result must come from actually
running the skill in a separate project. The starter conversion table visible
in the screenshot is placeholder content, not evidence about this skill.

The demo result is still pending. Record the full actual result and the checks
performed; include a real screenshot if available. Do not present the current
POS application as a new result produced by the standalone package.

## 4. Compatibility

Draft note:

```text
For coding agents working in an existing React and Tailwind CSS project. Requires local file editing and the project's existing build tools. No specific backend or external service account is required. Browser preview is used for visual verification when available.
```

Add agent-specific tested versions or environments only after the trial. The
platform's general SKILL.md compatibility message does not establish testing of
this particular package on every agent.

## 5. Pricing

The screenshot currently has Free selected. Choose the intended model explicitly
before submission. Price and billing have not been decided in this workspace.

For this self-contained instruction package, a one-time purchase is a reasonable
model to consider; a subscription would require a clearly defined ongoing
benefit. Do not treat a proposed price as an earnings forecast.

## Tags, Categories, Usecases

Use the category, tags, and use cases in the listing draft. Put Frontend & Web
Apps first, then Branding & Design if the current form offers those categories.

## Permissions

Review the detected permissions against the final ZIP. Expected needs:

| Form option | Setting | Reason |
| --- | --- | --- |
| Terminal / Shell | Select | Run the buyer project's build and relevant checks. |
| Read Files | Select | Inspect components, styles, package metadata, and relevant UI contracts. |
| Write Files | Select | Edit frontend components and shared styles. |
| Browser | Select | Inspect rendered desktop/mobile layouts when a preview is available. |
| Network Access | Not required by the skill itself | No remote API calls or external service integration is included. |
| Environment Variables | Not required by the skill itself | No credentials or environment-variable changes are part of the skill. |

Required tools & software:

```text
Existing React and Tailwind CSS project
The project's supported Node.js version and package manager
Browser or preview tool for visual verification
```

Needs access to: no external service account. Leave Other tool empty.

Suggested File Scopes, added one per entry:

```text
src/**
resources/js/**
resources/css/**
app/**
pages/**
components/**
styles/**
package.json
tailwind.config.*
postcss.config.*
vite.config.*
```

These are examples covering common layouts, not permission to edit every listed
directory. The skill follows the buyer's requested scope and actual project
structure. Adjust the declarations if the finished package requires different
access.

Notes:

```text
Reads the relevant frontend source and project configuration, edits UI components and styles, runs existing build/check commands, and uses browser preview for visual verification. Preserves routes, permissions, and checkout calculations. No external account, API key, or remote service is required by the skill itself.
```

## Extra Details and FAQ

Optional FAQ copy:

**Does this include a complete POS application?**
No. It provides design instructions and text references for an agent working in
your frontend project.

**Does it implement payments, barcode scanning, or inventory logic?**
No. Those features remain part of your application. The skill guides interface
work while preserving existing workflows and calculations.

**Must I use the navy and violet palette?**
No. The skill preserves your existing brand. The included palette is a starting
point for new interfaces or an explicitly requested restyle.

**Does it require Laravel?**
No. It targets React and Tailwind interfaces and follows your existing routing
and data conventions.

## Screenshots, video, and documentation

All are optional. Use screenshots of the real trial, with sample data and assets
cleared for publication. Leave video and documentation URLs empty until there
is an accessible, accurate resource to link. A local file path is not a public
documentation URL.

## Before Submit for Review

- Complete the real trial and demo result.
- Reconcile the name, description, compatibility, and permissions with the ZIP.
- Choose price/billing and confirm the included material is yours to distribute.
- Read the desktop/mobile preview and resolve any upload or validation errors.

Track remaining work in the [readiness tracker](README.md).
