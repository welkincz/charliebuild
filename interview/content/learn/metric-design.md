---
id: metric-design
title: Metric design and event schema
track: Product sense
level: Core
gap: false
summary: The event has to be able to compute the metric.
---

## Summary

A metric you cannot compute from the events is a wish. Design the event with the metric, not after.

## Key ideas

- **Event name and keys.** Who, what, when, and the object id. Use event time and ingest time.
- **Properties.** Only what the metric and a short list of slices need (segment, surface, success flag).
- **Identity.** A stable entity key. Say how anonymous and known ids stitch, without inventing a surveillance design.
- **Version the definition.** If active changes, keep the old column long enough to compare.
- **Quality.** The metric page's checks apply: volume, nulls on the key, and freshness.

## Diagrams and tables

| Metric | Event you need |
| --- | --- |
| Day-7 retention | First-seen date and a later active event, same entity key |
| Funnel | One event per step, or a step property, same attempt id |
| Qualified watch | Start, end, and a threshold you can recompute |

## Interview angles

- Meta notes mention defining metrics for a product scenario. This is the method.
- Sessionization in the TikTok notes is an event-schema problem: you need user id and timestamp, nothing more.

## Pitfalls

- A dashboard filter that has no column behind it.
- Redefining the metric in the BI tool so the warehouse disagrees.
- Logging only after success, then computing a success rate.

## Say this in the interview

I write the metric, then the smallest event that can reproduce it: entity key, event time, and the properties I will slice by. I log failures too if the metric is a rate.

## Self-check


??? What do you log for a funnel?

Each step as an event with a shared attempt id, including the drop-off steps.
???

??? Why store event time and ingest time?

Event time defines the metric. Ingest time explains lateness and backfill.
???
