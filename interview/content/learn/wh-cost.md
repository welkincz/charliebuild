---
id: wh-cost
title: Warehouse and storage cost
track: Warehouse & lakehouse
level: Stretch
gap: false
summary: The levers that change a bill without changing the answer.
---

## Summary

Cost questions are Stretch. They are how an L5 shows they have run a pipeline, not a request for a quote. No pay figures belong on this page.

## Key ideas

- **Compute time.** Suspend warehouses. Isolate interactive dashboards from batch loads so a load does not resize everyone's cluster.
- **Bytes touched.** Partition, cluster, and project fewer columns. A `SELECT *` join is a cost bug.
- **Small files.** Too many files means too much listing and task overhead. Compact.
- **Retention.** Time travel and fail-safe or recycle bins are not free. Set them on purpose.
- **Shuffle and spill.** A skew join burns compute you could have avoided with a pre-aggregate.
- **Serving copies.** A materialized gold table can be cheaper than twenty tools scanning silver.

## Diagrams and tables

| Lever | You turn it when |
| --- | --- |
| Warehouse suspend | The batch window is over |
| Clustering | Pruning stopped matching the filters |
| Compaction | File counts climb after streaming ingest |
| Shorter time travel | You do not need deep rollback |

## Interview angles

- Follow-up on any petabyte-style design (sourced Amazon) and on the data-lake design (sourced Databricks).
- Autodesk and bank postings do not list cost as a question. Use this only as a follow-up you can volunteer.

## Pitfalls

- Quoting a price from memory. Talk about which knob moves, not a number you cannot defend.
- Shrinking retention below the rollback window the business asked for.
- Caching everything because cache sounds fast.

## Say this in the interview

I would separate the batch warehouse from the analyst warehouse, filter partitions before joins, and compact the streaming table nightly. I would shorten time travel only after I know the rollback need. I judge success by bytes scanned and job minutes, not by a guessed price.

## Self-check


??? Why isolate a load warehouse from a dashboard warehouse?

A large batch resize or a long scan then cannot stall interactive queries, and you can suspend the load warehouse afterward.
???

??? How do small files cost money?

Listing, scheduling, and opening files can dominate the actual read.
???
