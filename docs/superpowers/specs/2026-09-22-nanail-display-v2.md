# NaNail Storefront Display V2 Spec

## Goal

Turn the existing iPad storefront loop into a more complete appointment ad at `https://nanail.charliebuild.com/`.

## Requirements

- Keep the nail work as the visual priority on every slideshow scene.
- Position scene copy in image-specific safe areas so it does not cover fingers or nails.
- Keep WeChat as the primary appointment action and add a clearly labeled, machine-readable Instagram QR for `@nanail_studio_a`.
- Add a small original animated mascot to the appointment area, visually derived from the uploaded avatar's pastel nail-studio mood without reproducing a recognizable copyrighted character.
- Use a generated raster mascot asset and CSS motion that loops smoothly and respects `prefers-reduced-motion`.
- Preserve the existing single-page, dependency-free implementation and continuous iPad loop.
- Support iPad portrait and landscape, plus a narrow phone fallback.
- Publish through Cloudflare Workers Static Assets and make `nanail.charliebuild.com` the canonical public URL without changing the root portfolio Worker.
- Keep the previous `/nanail/display/` path usable as a fallback.

## Verification

- Automated smoke test confirms both QR actions, mascot markup, canonical URL, accessible labels, and source assets.
- Both QR codes decode from the final rendered page.
- Screenshots at 834x1194, 1194x834, and 390x844 show no cropped booking content and no text over the main nail/finger area.
- Reduced-motion mode disables nonessential movement.
- Production HTML and critical asset hashes match the committed files.
- `https://nanail.charliebuild.com/` resolves and serves the display.
