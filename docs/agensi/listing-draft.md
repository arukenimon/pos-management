# Listing draft

Status: proposed copy. Finalize after testing the standalone skill. This document
is submission preparation and does not belong in the buyer's skill ZIP.

## Name

POS Dashboard & Checkout UI Design

Proposed skill identifier: `retail-pos-ui-design`. Availability on Agensi has not
been checked.

## Summary

Design clear retail POS dashboards and checkout interfaces with reusable theme tokens, compact tables, responsive layouts, and accessible controls. Built for React and Tailwind projects.

## Description

Help your coding agent design and refine interfaces for retail point-of-sale
software. The skill focuses on sales dashboards, checkout layouts, inventory
tables, and reporting screens, with shared styles that keep the product
consistent.

It guides the agent through inspecting your existing components, defining or
reusing theme tokens, adapting the relevant screen, and checking responsive and
keyboard behavior. For a new interface without an established brand, the package
provides a navy, violet, and cyan starting palette. Existing project branding
and application behavior take priority.

Use it to improve information hierarchy, cart readability, action placement,
status labels, chart presentation, and mobile layouts. It preserves the existing
routes, permissions, data contracts, and checkout calculations while refining
the interface.

The skill supplies design instructions and text references for an agent working
in your codebase. Application logic for stock deduction, barcode scanning,
payment processing, tax calculation, and offline operation is outside its scope.

## Compatibility note

Proposed target: a coding agent with permission to inspect and edit a React and
Tailwind project and run its existing build command. Laravel/Inertia is the
source project's stack, rather than a required backend for the standalone skill.

Tested agents: none recorded for the standalone version yet. The published
compatibility note must reflect the agents and environments actually verified.

## Categories and tags

Proposed primary category: Frontend & Web Apps.
Proposed secondary category: Branding & Design.

Tags: POS, retail, dashboard, checkout, inventory UI, React, Tailwind CSS,
responsive design, accessibility.

Use cases:

- Make a sales dashboard easier to scan.
- Improve checkout layout and cart readability on desktop and mobile.
- Bring inventory tables and reporting screens into a shared theme.

## See it in action

Candidate request for the trial:

> Refine this React/Tailwind retail dashboard and checkout screen. Reuse the
> existing brand, routes, and data. Make totals easy to scan, keep the main action
> reachable on mobile, and preserve keyboard operation and checkout calculations.

Actual result: pending. Add the complete request and observed result after the
trial, with screenshots and verification details from the generated interface.
Do not publish a hypothetical output as a completed demonstration.

## Limitations and access

- Requires access to the buyer's frontend source files and existing build tools.
- Does not include a complete POS application or a hosted service.
- Does not implement backend retail or payment functionality.
- Screenshots must use sample data and assets cleared for publication.
- Package access is local file inspection/editing and project build
  commands. Reconcile the listing's detected permissions with the finished ZIP.

## Pricing and media

Price and billing: undecided.

Logo: [prepared square PNG](../../marketplace/agensi/listing-assets/retail-pos-ui-design-logo.png).
See [logo notes](logo-notes.md) for the generation prompt and file checks.

Screenshots and video: not prepared. Use a real result from the trial for the
demonstration; screenshots and video are optional listing enhancements.
