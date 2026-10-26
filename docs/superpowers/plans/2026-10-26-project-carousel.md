# Project Screenshot Carousel Implementation Plan

> **For agentic workers:** Implement inline with superpowers:executing-plans. The user approved the layout and motion in chat on 2026-10-26.

**Goal:** Make four projects understandable at a glance, with NaNail first and real product screenshots.

**Architecture:** Preserve the static site and existing small tools. Add a progressively enhanced native scroll-snap carousel, separate CSS and a small browser script. No runtime dependencies.

**Tech Stack:** HTML, CSS, browser JavaScript; Playwright for browser verification only.

**Spec:** Approved conversation: NaNail, Advisor Pulse, Orbit, Nova Scotia; real screenshots, purpose and Open project link; visible project navigation; swipe/arrows; slide and fade, active depth, hover lift; no automatic rotation; reduced motion.

## Global Constraints
- Start from origin/main to preserve Advisor Pulse and the mortgage utility.
- Keep fictional banking and relationship data explicitly labeled.
- Screenshots show public pages only; preserve NaNail originals and separate deployment.
- Keep navigation and project links usable without JavaScript.
- Use approximately 360 ms transitions and disable nonessential motion with reduced motion.

## Review Focus
- Mobile scroll must not cause document overflow or prevent vertical page scrolling.
- Offscreen project links must not trap keyboard navigation.
- Fast selections and resize must keep the screenshot, current project and controls consistent.
- Reduced motion must disable animation while preserving every control.
- Missing JavaScript must leave screenshots and all project links reachable.

### Task 1: Screenshots and carousel
- [x] Capture and inspect all four public screenshots; optimize to WebP and record capture dates.
- [x] Add a browser regression check for selection, boundary controls, keyboard, swipes, resize, reduced motion and no-JavaScript access; run it against the existing site to observe the missing carousel.
- [x] Build the markup, CSS and native scrolling behavior; preserve other sections.
- [x] Run the browser checks and existing test suite, inspect desktop/mobile/light/dark screenshots and repair any issues.
- [x] Review the final diff and record verification; leave the feature ready to review without publishing production.

## Verification record

- Baseline: all three existing tests passed on origin/main.
- Browser regression first failed because the existing site had no carousel.
- Final Chromium and WebKit runs passed project selection, boundary buttons, keyboard, rapid input, resize, light/dark screenshots, reduced motion, no-JavaScript links and fragment/back navigation. Chromium also passed a native touch-swipe check.
- All three existing tests passed after implementation; JavaScript syntax and git diff whitespace checks passed.
- A separate reviewer confirmed a WebKit fragment-navigation issue; the regression failed, a hashchange handler fixed it, and both the final suite and focused reviewer recheck passed.
- Inspected desktop and mobile screenshots. Four WebP source screenshots total 220,254 bytes.
- Local preview: http://127.0.0.1:8016/#projects-heading. Production has not been changed.

## Approved ordering revision

User revision: Advisor Pulse is the lead project, Orbit is a small tool, NaNail was built for someone else, and Nova Scotia travel comes last. Updated slides, visible navigation, descriptions and browser expectations to match.
