---
id: case-uber
title: Case: trending dishes
track: System design
level: Stretch
gap: false
summary: A near-real-time ranking from the Uber notes.
---

## Summary

The Uber notes ask for a backend that shows trending dishes in a city in near real time. It is a small streaming design, not a ride-hailing clone.

## Key ideas

- **Event.** An order line: city, dish, event time.
- **Definition.** Trending means a sliding window count or rate, divided by a baseline if you want lift rather than raw volume. Say which.
- **Pipeline.** A log keyed by city (or dish, if you accept cross-city reorder). A stream job keeps the window. A key-value row serves the current top list per city.
- **Late orders.** A watermark and an allowed lateness. A late event updates the window or is counted as late.
- **Exactly-once effect.** MERGE or stateful update on (city, dish, window). A retry must not double the order.
- **Batch.** A nightly recompute from raw orders for the source of truth.

## Diagrams and tables

```
order lines -> log -> windowed counts -> top-N per city cache
                 \-> lake, for the nightly recompute
```

## Interview angles

- The coding rounds around this design are min path sum, intervals, and course schedule. They are separate practice items.
- Ride tracking (sourced, Databricks) is a different real-time problem: latest location, not a ranking.

## Pitfalls

- A full table scan every minute to draw the chart.
- Trending defined as all-time volume, which just lists popular dishes.
- No replay path when the window state is wrong.

## Say this in the interview

I key orders into a log, compute a sliding-window count per city and dish, and serve the top list from a small key-value row refreshed by the job. Late events inside the watermark update the count. A nightly batch rebuilds the same metric from raw orders so I can correct drift.

## Self-check


??? Why key by city?

The query is per city, and you want order within the partition that feeds that city's state. Watch for a huge city becoming a hot key.
???

??? What makes a retry safe?

The update is keyed by order id or by a deterministic (city, dish, window) state, not by a blind increment with no identity.
???
