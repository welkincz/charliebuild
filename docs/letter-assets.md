# Charlie Build letter assets

The 12 title assets were generated individually with OpenAI's built-in image
generation tool, inspected as transparent PNGs, cropped to their alpha bounds,
given a safe margin, resized to a maximum edge of 640 px, and exported as WebP
at quality 84. Together the deployed WebP files weigh 650,280 bytes.

The references are deliberately transformative: they use themes Charlie likes
without copying character likenesses, logos, house sigils, named props, card
art, or other franchise-specific artwork.

## Shared prompt frame

> Use case: stylized-concept. Asset type: interactive portfolio title letter,
> transparent web cutout. Create one original visual asset representing the
> exact specified character for the title "Charlie Build". Use a genuinely
> transparent alpha background with no surrounding scene. Keep the whole
> silhouette visible, centred on a square canvas with generous safe margins,
> balanced beside large black typography, and readable at 96 px. Include no
> words, logos, watermark, unrelated characters, rectangular backing plate, or
> cropped edges. Build the letter from the subject rather than applying a
> texture to a generic font.

## Per-position prompts

| Position | File | Interest | Character-specific request |
|---:|---|---|---|
| 0 | `00-c-portal.webp` | Rick and Morty | An uppercase C formed by an unstable acid-green dimensional portal ring with oxidized laboratory hardware, graphite cabling, and one tiny amber indicator. No character likenesses or show-specific props. |
| 1 | `01-h-fortress.webp` | Game of Thrones | A lowercase h built as a compact dynastic-fantasy fortress: a tall iron-and-stone tower, lower arched bridge, frost on one side, and restrained dragon-forged seams on the other. No sigils, throne replicas, or characters. |
| 2 | `02-a-shrine.webp` | Zelda | A lowercase a formed from a moss-covered forest shrine whose counter is an open glowing doorway, with one amber puzzle relic and a small leaf sprout. No franchise logo, exact emblem, or named character. |
| 3 | `03-r-cards.webp` | Balatro | A lowercase r assembled from overlapping off-register playing cards, a curved poker-chip edge, and a halftone bend, using wine red, faded cobalt, bone paper, and black ink. No copied joker artwork or game logo. |
| 4 | `04-l-python.webp` | Python | A lowercase l made from a blue-and-gold python in a mostly vertical pose, with a short tail foot and a few abstract indented code tabs. No Python logo or readable code. |
| 5 | `05-i-sql.webp` | SQL | A lowercase i whose stem is four stacked frosted-glass relational rows and whose dot is a separate brass primary-key token. No database cylinder, words, or numbers. |
| 6 | `06-e-scanner.webp` | Rick and Morty | A lowercase e formed by a teal dimensional coil around a hand-built scanner, with acid-green energy drawing the loop and crossbar. Related to the C, but not another circular portal. |
| 7 | `07-b-cards.webp` | Balatro | An uppercase B constructed from stacked screen-printed cards and two bold poker-chip crescents, with worn paper, halftone, and chromatic misregistration. No copied card art or readable values. |
| 8 | `08-u-relic.webp` | Zelda | A lowercase u built from two mossy stone uprights joined by a rounded carved channel, holding a suspended sky-blue crystal and one amber mechanism. No exact emblem or environmental scene. |
| 9 | `09-i-python.webp` | Python | A lowercase i made from stepped blue, yellow, and off-white paper blocks that mimic indentation, topped by a small curled python loop. Graphic rather than photorealistic; no logo or readable code. |
| 10 | `10-l-sword.webp` | Game of Thrones | A lowercase l shaped as an upright dragon-forged longsword, with the guard and turned leather strap forming its foot, frost etching on one edge, and an ember seam in the fuller. No famous sword replica or sigil. |
| 11 | `11-d-sql.webp` | SQL | A lowercase d made from a frosted-glass relational join ring and a tall steel-blue key column, connected by two brass nodes and subtle etched rows. No database brand imagery or text. |

The original generated PNGs remain in Codex's generated-image storage; the
website references only the optimized WebP files under `assets/letters/`.
