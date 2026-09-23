# NaNail storefront display

The display URL is `https://nanail.charliebuild.com/`. That is the only
supported address. The old `https://charliebuild.com/nanail/display/` path still
resolves because Cloudflare Pages publishes the whole repository, but it is not
maintained — treat it as leftover, not a fallback. The offline service worker
does not work there either: it precaches absolute paths that only exist on the
subdomain, so on the old path it simply fails to install and the page runs
without caching.

This is a silent, looping page for an iPad facing out through the salon door,
mounted on the inside face of the glass. The work photos change while the WeChat
booking and Instagram work codes stay in one place. The page supports portrait
and landscape screens and a reduced-motion setting.

## Content and updates

- The original photos and supplied account QR images live in the separate
  local `NaNail` project folder. Keep those originals.
- Optimized copies used by the site live in `nanail/display/assets/`.
- `nanail/display/index.html` controls the photo order, copy, timing, and
  appointment links. There is no automatic social-media feed or CMS.
- Six work photos rotate on a 5.5-second hold. A passer-by gets a few seconds of
  attention at most, so the loop is short on purpose.
- The WeChat QR is the supplied account image, untouched. Do not regenerate it:
  it is a version-5 code carrying a high error-correction level so the WeChat
  logo can sit in the middle, and WeChat's scanner keys off the `u.wechat.com`
  domain. Recheck it whenever the account or appointment method changes.
- The Instagram QR is a plain black-and-white code generated from
  `https://nanail.charliebuild.com/ig`. It deliberately is not the Instagram
  gradient nametag code — the low-contrast gradient scans worse through glass
  with glare on it.
- The current page states no price or promotion. `index.html` has a commented-out
  `.booking-facts` line with the layout slot already reserved for opening hours
  and a price floor. Fill it in only with exact numbers, and remove them when
  they stop being true — a stale price is worse than no price.

## QR sizes

Scan distance is roughly ten times the printed width of the code, and every iPad
is about 132pt per inch. That makes the sizes a deliberate choice, not a
styling detail:

| | portrait | landscape |
|---|---|---|
| WeChat | 295pt ≈ 5.7cm | 271pt ≈ 5.2cm |
| Instagram | 205pt ≈ 3.9cm | 189pt ≈ 3.6cm |

`tests/nanail-display-smoke.mjs` pins a floor under both so a later layout
change cannot quietly shrink them back.

The Instagram handle is set at roughly 24px rather than caption size, because
"walk past, remember the name, look it up at home" happens more often than
someone stopping to scan.

## Offline behaviour

The shop has no fixed wifi and runs off a phone hotspot, so
`nanail/display/sw.js` precaches the page and every asset.

- The page itself is fetched network-first with a 3.5s timeout, so a manual
  refresh picks up new content whenever the hotspot is up.
- Images are served cache-first, so hotspot data is only spent when the cache
  version changes.
- **After changing anything in `display/`, bump `VERSION` in `sw.js`.** Otherwise
  the iPad keeps showing cached copies of the old assets.

With a version bump, one manual refresh on the iPad is enough: the page reloads,
the new service worker installs, takes over, and triggers a single automatic
reload. There is no periodic auto-refresh — it would spend hotspot data for no
reason on a page that changes a few times a year.

## Deployment

- The root portfolio and the NaNail display are separate Cloudflare Workers
  services so the new hostname cannot change the portfolio home page.
- `nanail/wrangler.jsonc` deploys `nanail/display/` plus a small Worker
  (`nanail/src/index.js`) to the Worker named `nanail` and binds the custom
  domain `nanail.charliebuild.com`.
- Requests that match a static file are still served straight from the asset
  layer and never reach the Worker. The script only handles `/ig` and `/scans`.
- Deploy the display from the repository root with
  `wrangler deploy --config nanail/wrangler.jsonc`. This is what updates the
  iPad's URL; pushing to `main` does not.
- Pushing to `main` separately rebuilds charliebuild.com on Cloudflare Pages,
  which publishes the repository as-is. That is where the leftover
  `/nanail/display/` copy comes from.
- `compatibility_date` is pinned to a date the locally installed wrangler
  supports, so `wrangler dev` works. Raising it past the local wrangler's
  supported date breaks local dev with a confusing runtime error.

## Counting scans

`/ig` records a scan and then 302s to the Instagram profile, so the door display
can be told apart from every other way someone finds the account. The KV
namespace is already created and bound as `SCANS` in `nanail/wrangler.jsonc`.
`/scans` returns the rolling total, today's count, and a per-day breakdown as
JSON.

Each scan writes its own key (`scan:ig:<local date>:<random>`) rather than
incrementing a counter. This is not an accident. KV reads are eventually
consistent and cached at the edge for up to a minute, so a read-modify-write
counter silently collapses every scan inside that window into one increment —
which is exactly the shape of storefront traffic, where a few people walk past
together. Measured: two back-to-back scans recorded as one under the counter
design, and twenty concurrent scans recorded as twenty under this one.

Reading the summary lists the keys instead of reading one value. That costs a
handful of KV list calls per query, which is fine for something checked
occasionally.

Keys expire after 400 days, so the total is a rolling figure rather than a
lifetime one. `SCAN_TTL` in `nanail/src/index.js` controls that.

`TIMEZONE` in the same file decides where a day starts. It is set to
`America/Toronto`; change it if the shop is elsewhere, or the daily buckets will
roll over in the middle of the business day.

`/scans` is public. The numbers are not sensitive, but anyone with the URL can
read them.

The WeChat QR is intentionally not routed through `/ig`-style counting. Sending
it through a non-WeChat domain first would change the in-app add-friend flow,
which is a bigger risk than the data is worth.

## Running it on the iPad

1. Open the public URL in Safari. Apple supports adding a site to the Home
   Screen and opening it as a web app: [iPad web app guide](https://support.apple.com/guide/ipad/open-as-web-app-ipad8f1f7a29/ipados).
2. Use [Guided Access](https://support.apple.com/guide/ipad/lock-ipad-to-one-app-ipada16d1374/ipados)
   if the iPad should remain in the display app. Connect reliable power.
3. **Turn off Night Shift, True Tone and Auto-Brightness.** All three shift the
   screen warm or dim, and on a nail salon display that means the pink and
   pearl work photos show the wrong colour. Set brightness high and fixed.
4. Set the screen brightness for the actual storefront conditions. Check the
   display from the sidewalk in daylight and at night, then scan the code
   through the glass using the same phone/app a customer would use.
5. Keep the iPad out of direct sun where possible. Apple says iPad is designed
   for ambient temperatures of 0–35°C and may dim or stop charging when too
   hot: [temperature guidance](https://support.apple.com/en-au/118431).

The whole layout drifts by 4px over a 15-minute cycle. It is not a visual
effect — it stops the masthead and the booking panel from burning their static
pixels into one spot. It stays on even under reduced-motion for that reason.

Both QRs have been decoded from local rendered iPad portrait and landscape
screenshots. That confirms their pixels are readable by one scanner; it does
not establish a reliable scan distance through the actual glass. A printed QR
next to the iPad is a useful fallback when the screen is off or reflections are
strong.
