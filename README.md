# charliebuild.com

Landing page for charliebuild.com.

- **Stack:** static HTML, CSS and JavaScript, 12 WebP letter assets and four project screenshots. No build step or runtime dependencies.
- **Host:** Cloudflare Pages, project `charliebuild`, connected to this repo.
- **Deploy:** push to `main`. Cloudflare builds and publishes automatically.
- **Local preview:** `python3 -m http.server 8000` then open http://localhost:8000

The title is an interactive index of Charlie's interests. Hover, focus, or tap
any letter to replace it with its generated visual counterpart. The page keeps
plain text as the default, supports reduced-motion preferences, and remains
fully usable if an image or script fails.

Asset concepts and generation constraints are recorded in
[`docs/letter-assets.md`](docs/letter-assets.md).

Selected work uses a manual screenshot carousel with native touch scrolling,
keyboard controls and reduced-motion support. Screenshot provenance and browser
checks are recorded in [`docs/project-screenshots.md`](docs/project-screenshots.md).

The title interaction is informed by
[`bobobo521/boknows-text-image-template`](https://github.com/bobobo521/boknows-text-image-template)
(MIT) and was reimplemented for this site.

## NaNail storefront display

The separate iPad display lives at `nanail.charliebuild.com`, deployed as its
own Worker with `wrangler deploy --config nanail/wrangler.jsonc`. Pushing to
`main` does not update it. See
[`docs/nanail-display.md`](docs/nanail-display.md) for source assets,
operation, and on-site checks.
