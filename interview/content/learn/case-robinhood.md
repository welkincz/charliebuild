---
id: case-robinhood
title: Case: brokerage-style data lake
track: System design
level: Stretch
gap: false
summary: A market-data lake: facts, late prints, and a serving aggregate.
---

## Summary

This case is the shape of a retail brokerage lake, written as a generic design. It is not a claim about any employer. The useful tension is event time versus a trading calendar, and an end-of-day book that must reconcile.

## Key ideas

- **Events.** Orders, fills, positions, and market prints. Do not put them in one fact.
- **Grain.** Fills are a transaction fact. Positions are a periodic snapshot, semi-additive.
- **Time.** Event time, and a calendar dimension that knows sessions. A late print corrects a fill. The pipeline must apply the correction, not only append.
- **Lake.** Bronze keeps the raw messages. Silver dedupes on event id. Gold is the daily book.
- **Reconcile.** The snapshot equals the prior snapshot plus fills, with a documented exception queue.
- **Access.** Identifiers stay restricted. Analysts see surrogates and aggregates.

## Diagrams and tables

| Fact | Grain | Additive? |
| --- | --- | --- |
| Fill | One execution | Quantity and notional, yes |
| Position | Account, instrument, date | Semi-additive |

## Interview angles

- Use the modeling and CDC pages. This case is practice, not a sourced prompt.
- The sourced lending-book model is the closer personal-study cousin: snapshot plus transactions.

## Pitfalls

- One fact called activity.
- Ignoring corrections and cancels.
- Publishing a position you cannot tie back to fills.

## Say this in the interview

I split fills and positions. Fills merge on event id so a corrected print replaces the row. The daily position is recomputed for that date from the prior position plus fills, and a break goes to an exception table instead of a silent plug.

## Self-check


??? Why is a position semi-additive?

You can sum across accounts on one date. You cannot sum the same position across dates.
???

??? Where does a corrected trade go?

It updates the fill by event id and forces that date's position to be recomputed.
???
