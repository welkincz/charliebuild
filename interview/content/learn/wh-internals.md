---
id: wh-internals
title: Warehouse internals
track: Warehouse & lakehouse
level: Core
gap: false
summary: Columnar storage, MPP, and why analytic queries look the way they do.
---

## Summary

A cloud warehouse (数仓) stores columns, not rows, and spreads data across workers (MPP). That is why `SELECT col` is cheap and `SELECT *` is not, and why a predicate on a sorted or clustered column skips data.

## Key ideas

- **Columnar.** Compression and scans touch only the columns in the query. Wide rows hurt when you carry unused columns through a join.
- **MPP.** Each worker scans its slices and then shuffles for joins and aggregates that are not co-located.
- **Distribution / sort.** Redshift-style dist keys co-locate join partners. Sort keys order data for range filters. A bad dist key creates skew.
- **Partitions.** A directory or micro-partition skipped is work you never pay for.
- **Materialized views.** Precompute an expensive aggregate. You must know the refresh cost.

## Diagrams and tables

| Choice | Helps | Hurts when |
| --- | --- | --- |
| Dist / cluster on join key | Less shuffle | The key is skewed |
| Sort / cluster on filter column | Pruning | You filter on something else |
| Materialized view | Repeated dashboard | Refresh is as heavy as the query |

## Interview angles

- Sourced Snowflake architecture question: storage, compute, services, micro-partitions.
- Microsoft notes: partition pruning and clustering as the query-layer follow-up.

## Pitfalls

- Choosing a high-cardinality timestamp as the only distribution key and then joining on a different key.
- Assuming an index hint from OLTP applies unchanged.
- Ignoring skew because the average partition looks fine.

## Say this in the interview

I cluster or sort on the column we filter, usually a date, and I distribute a large join on the join key if the engine asks me to choose. I keep the fact narrow. I would rather prune micro-partitions than scan and filter.

## Self-check


??? Why is columnar layout good for scans?

The engine reads only the referenced columns, and similar values compress well.
???

??? What goes wrong with a skewed distribution key?

One worker holds most of the rows, so the job runs at the speed of that worker.
???
