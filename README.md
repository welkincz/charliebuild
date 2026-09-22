# charliebuild.com

Landing page for charliebuild.com.

- **Stack:** one static `index.html` plus 12 compressed WebP letter assets. No build step or runtime dependencies.
- **Host:** Cloudflare Pages, project `charliebuild`, connected to this repo.
- **Deploy:** push to `main`. Cloudflare builds and publishes automatically.
- **Local preview:** `python3 -m http.server 8000` then open http://localhost:8000

The title is an interactive index of Charlie's interests. Hover, focus, or tap
any letter to replace it with its generated visual counterpart. The page keeps
plain text as the default, supports reduced-motion preferences, and remains
fully usable if an image or script fails.

Asset concepts and generation constraints are recorded in
[`docs/letter-assets.md`](docs/letter-assets.md).

The title interaction is informed by
[`bobobo521/boknows-text-image-template`](https://github.com/bobobo521/boknows-text-image-template)
(MIT) and was reimplemented for this site.

## NaNail storefront display

The separate iPad display lives at `/nanail/display/`. See
[`docs/nanail-display.md`](docs/nanail-display.md) for source assets,
operation, and on-site checks.
