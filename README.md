# charliebuild.com

Landing page for charliebuild.com.

- **Stack:** one static `index.html`. No build step, no dependencies.
- **Host:** Cloudflare Pages, project `charliebuild`, connected to this repo.
- **Deploy:** push to `main`. Cloudflare builds and publishes automatically.
- **Local preview:** `python3 -m http.server 8000` then open http://localhost:8000
