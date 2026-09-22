# NaNail storefront display

The public display URL is `https://charliebuild.com/nanail/display/`. This is a
silent, looping page for an iPad facing out through the salon door. The work
photos change while the WeChat booking code stays in one place. The page also
supports portrait and landscape screens and a reduced-motion setting.

## Content and updates

- The original photos and supplied account QR images live in the separate
  local `NaNail` project folder. Keep those originals.
- Optimized copies used by the site live in `nanail/display/assets/`.
- `nanail/display/index.html` controls the photo order, copy, timing, and
  appointment links. There is no automatic social-media feed or CMS.
- The displayed WeChat QR was derived from the supplied QR image. Recheck it
  whenever the account or appointment method changes.
- The current page states no price or promotion. Add an offer only with exact
  price, eligibility, and end date, and remove it when it expires.

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

The QR has been decoded from a local rendered screenshot. That confirms its
pixels are readable by one scanner; it does not establish a reliable scan
distance through the actual glass. A printed QR next to the iPad is a useful
fallback when the screen is off or reflections are strong.
