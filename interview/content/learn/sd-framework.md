---
id: sd-framework
title: Four quadrants and the checklist
track: System design
level: Core
gap: false
summary: One way to spend a 45-minute design round.
---

## Summary

A design round is a document, not a monologue. Use four quadrants on the page, and walk them in order. The reference section has the printable checklist. This page is the method.

## Key ideas

1. **Clarify (5–8 minutes).** Who reads the data, how fresh, how wrong is too wrong, what is in scope.
2. **Estimate.** Events per day, row width, storage per year, and a peak if the product is spiky. Orders of magnitude only.
3. **Draw four quadrants.**
   - **Schema.** Grain, facts, dimensions, keys.
   - **Pipeline.** Ingest, bronze/silver/gold or stream, idempotency, backfill.
   - **Storage and compute.** Format, partitions, warehouse or cluster, skew.
   - **Serving.** Which table or API, SLA, and what you do not build.
4. **Deepen one quadrant** the interviewer pushes. Do not deepen all four.
5. **Close on failure.** Replay, duplicates, late data, and a quality check.

## Diagrams and tables

| Quadrant | You must leave with |
| --- | --- |
| Schema | One-row grain |
| Pipeline | Idempotent write |
| Storage / compute | Partition or cluster column |
| Serving | Freshness target |

## Interview angles

- Use it on every sourced design: batch SCD pipeline, petabyte pipeline, analytics lake, ride tracking, Microsoft streaming.
- Uber trending dishes and Netflix top-titles fit the same quadrants.
- The checklist in Reference is the same list in prompt form.

## Pitfalls

- Drawing boxes labeled Kafka and Spark with no grain.
- Estimating to three significant figures.
- Spending the whole round on ingest.

## Say this in the interview

I will spend a few minutes on grain and freshness, then sketch schema, pipeline, storage, and serving. I will pick the pipeline quadrant to go deep: how a rerun stays correct. Tell me if you want a different quadrant.

## Self-check


??? What belongs in the schema quadrant?

Grain, fact type, dimensions, and which attributes are SCD2.
???

??? What do you say if you are running out of time?

State idempotency, the partition column, and the freshness target. Offer to deepen one of them.
???
