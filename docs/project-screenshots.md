# Selected project screenshots

Captured from the public project pages on 2026-10-26 using Chromium in light mode, with reduced motion and a device pixel ratio of 1. These are screenshots of the actual interfaces, compressed to WebP at quality 85. The UI shown is a snapshot, not a live embed.

| Asset | Public source | Capture viewport | Content |
| --- | --- | --- | --- |
| `assets/projects/nanail.webp` | https://nanail.charliebuild.com/ | 1440 × 960 | Nail work and fixed booking QR codes |
| `assets/projects/pulse.webp` | https://pulse.charliebuild.com/ | 1440 × 960 | Weekly overview using synthetic bank data |
| `assets/projects/orbit.webp` | https://orbit.charliebuild.com/ | 1440 × 960 | Public relationship map with fictional people |
| `assets/projects/travel.webp` | https://trip.charliebuild.com/ | 960 × 640 | Route overview, scrolled below the trip archive banner |

Refresh a screenshot when its interface changes materially. Keep the fictional-data labels when refreshing Advisor Pulse and Orbit. Do not replace the public Orbit screenshot with a private vault.

The carousel uses native horizontal scrolling and scroll snap. The script adds project selection, arrow and keyboard controls, focus management and position announcements; it never advances automatically. CSS handles the 360 ms fade, subtle depth and hover lift. Reduced motion disables these effects. Without JavaScript, all four project links remain available.

## Verification

Existing suite: `node --test tests/*.mjs`.

Browser suite: `node scripts/check-project-carousel.cjs`, using a development installation of Playwright. `PLAYWRIGHT_MODULE` can point to an existing installation. Set `CHECK_WEBKIT=1` to also run WebKit; install its browser first if needed. The check starts and closes its own local HTTP server.

Screenshots are written to `/tmp/charliebuild-carousel-qa`, or the directory set by `SCREENSHOT_DIR`. Playwright is used only for development, and the portfolio adds no runtime dependency or build step.

## Project order

Advisor Pulse is the featured data engineering project and default slide, followed by Orbit (small personal tool), NaNail (built for someone else, a nail studio), and the archived Nova Scotia travel handbook.
