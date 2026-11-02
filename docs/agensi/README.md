# Agensi skill preparation

Status: standalone package prepared for a listing draft. The real trial and
marketplace submission are still pending.
Last reviewed: November 2, 2026.

## Start here

| File | Purpose |
| --- | --- |
| [Listing draft](listing-draft.md) | Proposed buyer-facing name, summary, scope, compatibility, and demo request. |
| [Package plan](package-plan.md) | Files to prepare, repository dependencies to remove, and verification criteria. |
| [Form guide](form-guide.md) | Field-by-field instructions for the supplied New skill form. |
| [Validation record](validation.md) | Completed package checks and remaining behavioral verification. |
| [Logo PNG](../../marketplace/agensi/listing-assets/retail-pos-ui-design-logo.png) | Square navy, violet, and cyan icon for the Skill logo field. |
| [Upload ZIP](../../marketplace/agensi/dist/retail-pos-ui-design.zip) | Draft standalone package for Step 1 of the form. |
| [Current project skill](../skills/pos-ui-design/SKILL.md) | Source guidance used by TindaHub today. |

The working product is **POS Dashboard & Checkout UI Design**, with the proposed
skill identifier `retail-pos-ui-design`. This is a UI design skill for developers
working on retail software. The POS application's inventory, barcode, payment,
and stock-management features are not capabilities supplied by this skill.

The preparation documents live here. The distributable source lives in
`marketplace/agensi/retail-pos-ui-design/`. The existing
project skill remains the source for TindaHub's own interface work.

## Readiness tracker

| Area | Status | Evidence or next action |
| --- | --- | --- |
| Creator profile | Complete in supplied screenshot | Creator Studio shows a completed profile. |
| Payout connection | Complete in supplied screenshot | Creator Studio shows connected payouts. |
| Skill scope | Drafted | UI design for dashboards, checkout, and related retail screens. |
| Standalone instructions | Prepared | Uses buyer-project discovery and package-local references without TindaHub context. |
| Supporting references | Prepared | Theme tokens and retail component patterns included as text. |
| Format validation | Passed | Bundled skill validator passed with an isolated PyYAML dependency. |
| Palette checks | Passed | Checked text pairings, primary text, focus, and control borders for both example themes. |
| Independent project trial | Pending | Run the skill in a separate sample app and record the actual result. |
| Listing | Drafted | Review wording after the trial; price and billing are undecided. |
| Logo | Prepared | Square PNG saved under `marketplace/agensi/listing-assets/`; size and PNG header checked. |
| ZIP | Draft prepared | Three text files, 6,350 bytes; archive integrity and extracted content verified. |
| Submission and review | Not started | Submission is followed by Agensi's scan and review. |

## Work order

1. Upload the prepared ZIP to start a draft and use the [form guide](form-guide.md)
   for the name, summary, description, and permissions.
2. Run the separate-project trial and record the actual result in the demo field.
3. Update the [listing draft](listing-draft.md) to match the demonstrated result.
4. Choose price and billing, settle distribution rights, and review the preview.
5. Submit the finished listing and track Agensi's review result.

## Decisions to settle before submission

- Launch price and billing model.
- Confirmed agent compatibility, based on actual trials.
- Rights to distribute any included code, text, or media. The project README
  states MIT; the package's intended distribution terms still need review.
- Final listing name availability on Agensi.

## Platform references

These links were checked on November 2, 2026. Check them again when preparing the
actual submission, especially if the platform changes its requirements.

- [Creator quickstart](https://www.agensi.io/docs/creator-quickstart)
- [Package your skill](https://www.agensi.io/docs/packaging)
- [Submit on the website](https://www.agensi.io/docs/submit-on-the-website)

Joeri's email provides the invitation and commercial context. The attached
screenshots are evidence of setup status, not approval of a skill package.
