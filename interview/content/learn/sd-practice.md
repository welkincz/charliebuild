---
id: sd-practice
title: Design practice
track: System design
level: Core
gap: false
summary: How to rehearse the sourced design prompts.
---

## Summary

The sourced design prompts are the ones you should time. Everything else is a drill. Forty-five minutes, one page, four quadrants.

## Key ideas

- **Batch plus SCD (sourced Amazon).** Land, merge a Type 2 dimension, overwrite or merge the fact, and say how backfill works.
- **Petabyte pipeline (sourced Amazon).** Estimate first. Then file layout, incremental processing, and skew. Do not start with a product logo.
- **Analytics lake with availability (sourced Databricks).** Bronze to gold, a second reader path or a replicated serving table, and what happens when a write fails mid-commit. Table formats give you a snapshot so readers do not see a half write.
- **Ride locations (sourced Databricks).** Log, current-state store, history in the lake, watermark, key by ride.
- **Streaming pipeline (sourced Microsoft).** Same as above with their freshness target. Ask for it.
- After each timed run, write one sentence on the rubric: grain, idempotency, and the follow-up you missed.

## Diagrams and tables

| Prompt | Deepen this quadrant |
| --- | --- |
| Batch SCD | Schema and MERGE |
| Petabyte | Storage layout and incremental |
| Lake HA | Commit and reader snapshot |
| Ride tracking | Serving plus watermark |

## Interview angles

- These five are Reported+sourced. The company page links to them.
- Trending dishes and top titles are Reported from the notes, for extra reps.

## Pitfalls

- Repeating the same Kafka-Spark-Snowflake diagram for every prompt.
- Skipping the availability part of the lake question.
- No number at all on the petabyte prompt.

## Say this in the interview

I set a 45-minute timer, write the grain in the first five minutes, and force myself to finish all four quadrants before I polish. I practice the sourced five before any extra case.

## Self-check


??? Which designs count as asked at?

Only the sourced five: batch SCD, petabyte pipeline, analytics lake, ride tracking, and the Microsoft streaming pipeline.
???

??? What is a good failure sentence?

A rerun overwrites the date partition or merges on the event id, and readers see the previous snapshot until the commit finishes.
???
