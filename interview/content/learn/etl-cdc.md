---
id: etl-cdc
title: ETL, ELT, CDC, and idempotency
track: Spark & pipelines
level: Core
gap: false
summary: Land, transform, and make a rerun safe.
---

## Summary

ETL transforms before the warehouse. ELT loads raw data and transforms in the warehouse or lake. CDC (change data capture) ships row changes instead of full snapshots. The property interviews hunt for is idempotency: run the same batch twice and the table is still correct.

## Key ideas

- **ETL.** Useful when you must mask or drop fields before they land, or when the warehouse should not see raw data.
- **ELT.** Useful when the warehouse engine is the cheap place to transform and you want the raw history. The July 2024 notes ask you to choose.
- **Full snapshot.** Simple, expensive, and easy to reason about. Good for small dimensions.
- **Incremental.** Process only new files or a high-watermark. You need a late-data story.
- **CDC.** Inserts, updates, deletes from a log. MERGE into the target on the primary key. Deletes must be explicit.
- **Idempotent write.** MERGE on a deterministic key, or overwrite a partition that the batch fully owns. A blind append is not idempotent.
- **Backfill.** Re-run a date range without duplicating. Partition overwrite or a merge window makes that possible.
- **Medallion.** Bronze append-only. Silver deduped and typed. Gold at the published grain.

## Diagrams and tables

| Pattern | Second run |
| --- | --- |
| Append | Duplicates |
| Overwrite partition | Replaces that partition |
| MERGE on key | Updates in place |

## Interview angles

- Sourced: a batch pipeline that also picks an SCD type. A petabyte-scale pipeline.
- July 2024 notes: any number of CSV files landing on object storage, and ETL versus ELT.
- Bank postings ask for pipelines and CI/CD, not for a specific CDC product.

## Pitfalls

- A watermark that moves forward before the write succeeds.
- Ignoring deletes in CDC, so the target keeps ghosts.
- Backfill by appending a second copy of January.

## Say this in the interview

I land files in bronze append-only with the file name. Silver MERGEs on the business key so a redelivered file does not double. Gold overwrites the affected date partition. If the source can delete, the feed includes a delete flag and the merge removes or closes that key.

## Self-check


??? What does idempotent mean for a daily job?

Running yesterday's job again leaves the table with one correct copy of yesterday.
???

??? When is ELT the wrong default?

When raw data must not land in the warehouse, or when the transform is a streaming engine rather than SQL.
???
