---
id: sd-template
title: System design template
summary: The four-quadrant page and the checklist, in one place.
---

## Order

1. Clarify the user, the decision, the freshness, and what is out of scope.
2. Estimate events, width, and retention at an order of magnitude.
3. Fill four quadrants.
4. Deepen the one they push on.
5. Close on failure.

## Four quadrants

| Quadrant | Write this |
| --- | --- |
| Schema | Grain, fact type, dimensions, SCD |
| Pipeline | Ingest, bronze/silver/gold or stream, idempotent write, backfill |
| Storage and compute | Format, partition, engine, skew plan |
| Serving | Who reads, freshness, what you will not build |

## Checklist

- What is one row?
- Which measures are additive?
- What happens if the job runs twice?
- What happens to a late event?
- What happens to a delete?
- How does a reader avoid a half-written day?
- Which column do you prune on?
- What is the quality check that blocks publication?
- What is the rebuild path?
- Which identifier never lands in the wide-open table?

## Numbers to recompute

Users × events × bytes × days. Say the assumption. Do not quote a price.
