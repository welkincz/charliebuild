# NaNail Storefront Display V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Instagram scanning, an original animated booking mascot, nail-safe typography, and the `nanail.charliebuild.com` public entry point.

**Architecture:** Keep the display as one dependency-free HTML page. Store both QR images and the generated mascot in `nanail/display/assets`; use scene-level CSS variables for photo crop and copy-safe placement; use CSS-only motion for reliable offline-friendly looping. Route the new Cloudflare custom hostname to the existing display while retaining the old path.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js smoke tests, GPT image generation, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-22-nanail-display-v2.md`

## Global Constraints

- Do not cover fingers or nails with scene copy.
- WeChat remains the primary appointment CTA.
- Instagram QR must decode to the supplied `@nanail_studio_a` profile.
- The mascot must be original, have no text, and respect reduced motion.
- Preserve the existing continuous loop and dependency-free build.

---

### Task 1: Contract smoke test

**Files:**
- Create: `tests/nanail-display-smoke.mjs`
- Test: `tests/nanail-display-smoke.mjs`

**Interfaces:**
- Consumes: `nanail/display/index.html` and its local assets.
- Produces: a zero-dependency Node test that validates the public display contract.

- [x] Write assertions for the canonical hostname, two QR actions, mascot, safe-copy markers, alt text, and asset existence.
- [x] Run `node tests/nanail-display-smoke.mjs` and confirm it fails because V2 markup is absent.
- [x] Keep the test unchanged while implementing Tasks 2-4, except to narrow one selector that also matched CSS declarations.

### Task 2: QR and mascot assets

**Files:**
- Create: `nanail/display/assets/instagram-qr.png`
- Create: `nanail/display/assets/booking-mascot.png`

**Interfaces:**
- Consumes: `/Users/charlieg/Coding_project/NaNail/Instagram.jpg` and `/Users/charlieg/Coding_project/NaNail/微信头像.JPG`.
- Produces: a scan-safe QR asset and transparent original mascot cutout.

- [x] Crop the supplied Instagram QR with a white quiet zone and verify its decoded URL locally.
- [x] Generate an original pastel nail-polish mascot from the avatar's mood using the built-in image model.
- [x] Inspect alpha, dimensions, silhouette, and legibility at the intended small size.

### Task 3: Booking and scene layout

**Files:**
- Modify: `nanail/display/index.html`
- Test: `tests/nanail-display-smoke.mjs`

**Interfaces:**
- Consumes: the two new assets.
- Produces: dual QR layout, animated booking mascot, and scene-specific copy-safe placement.

- [x] Add semantic WeChat and Instagram cards with distinct labels and scan-sized images.
- [x] Add the mascot and two-beat speech bubble without obstructing either QR.
- [x] Add scene-specific copy placement and gradients that keep text off nails and fingers.
- [x] Add responsive portrait, landscape, phone, and reduced-motion rules.
- [x] Run the smoke test until it passes.

### Task 4: Browser and QR verification

**Files:**
- Modify if needed: `nanail/display/index.html`
- Test: rendered screenshots and QR decode results.

**Interfaces:**
- Consumes: local static display.
- Produces: verified 834x1194, 1194x834, and 390x844 renders.

- [x] Render all target viewports and each scene.
- [x] Inspect booking layout and text/finger separation.
- [x] Decode both QR codes from rendered captures.
- [x] Check console errors and reduced motion.

### Task 5: Cloudflare hostname and release

**Files:**
- Modify only if required by the chosen hostname routing: static redirect or Pages Function configuration.
- Modify: `docs/nanail-display.md`

**Interfaces:**
- Consumes: existing GitHub-to-Cloudflare Pages deployment.
- Produces: `https://nanail.charliebuild.com/` serving the display.

- [ ] Add the custom hostname using the authenticated Cloudflare workflow.
- [ ] Route the hostname root to the display without changing the main `charliebuild.com` home page.
- [ ] Commit and push the verified V2 changes.
- [ ] Wait for deployment and verify HTTP, HTML, asset hashes, QR scans, and canonical URL in production.
