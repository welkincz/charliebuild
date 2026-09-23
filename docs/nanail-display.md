# NaNail storefront display

The primary display URL is `https://nanail.charliebuild.com/`. The previous
`https://charliebuild.com/nanail/display/` path remains available as a fallback.
This is a silent, looping page for an iPad facing out through the salon door.
The work photos change while the WeChat booking and Instagram work codes stay
in one place. The page supports portrait and landscape screens and a
reduced-motion setting.

## Content and updates

- The original photos and supplied account QR images live in the separate
  local `NaNail` project folder. Keep those originals.
- Optimized copies used by the site live in `nanail/display/assets/`.
- `nanail/display/index.html` controls the photo order, copy, timing, and
  appointment links. There is no automatic social-media feed or CMS.
- The displayed WeChat and Instagram QRs were derived from the supplied account
  images. Recheck them whenever either account or appointment method changes.
- The current page states no price or promotion. Add an offer only with exact
  price, eligibility, and end date, and remove it when it expires.

## Deployment

- The root portfolio and the NaNail display are separate Cloudflare Workers
  Static Assets services so the new hostname cannot change the portfolio home
  page.
- `nanail/wrangler.jsonc` deploys only `nanail/display/` to the Worker named
  `nanail` and binds the custom domain `nanail.charliebuild.com`.
- Deploy the display from the repository root with
  `wrangler deploy --config nanail/wrangler.jsonc`.
- Push the same commit to `main` so the old fallback path on the main site stays
  in sync.

## Running it on the iPad

1. Open the public URL in Safari. Apple supports adding a site to the Home
   Screen and opening it as a web app: [iPad web app guide](https://support.apple.com/guide/ipad/open-as-web-app-ipad8f1f7a29/ipados).
2. Use [Guided Access](https://support.apple.com/guide/ipad/lock-ipad-to-one-app-ipada16d1374/ipados)
   if the iPad should remain in the display app. Connect reliable power.
3. Set the screen brightness for the actual storefront conditions. Check the
   display from the sidewalk in daylight and at night, then scan the code
   through the glass using the same phone/app a customer would use.
4. Keep the iPad out of direct sun where possible. Apple says iPad is designed
   for ambient temperatures of 0–35°C and may dim or stop charging when too
   hot: [temperature guidance](https://support.apple.com/en-au/118431).

Both QRs have been decoded from local rendered iPad portrait and landscape
screenshots. That confirms their pixels are readable by one scanner; it does
not establish a reliable scan distance through the actual glass. A printed QR
next to the iPad is a useful fallback when the screen is off or reflections are
strong.
