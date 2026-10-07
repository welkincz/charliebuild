---
id: sql-perf
title: SQL performance
track: SQL
level: Stretch
gap: false
summary: Pruning, join strategy, and how you talk about a slow query.
---

## Summary

L4 needs correct SQL. L5 is asked why it is cheap. You will not get a live EXPLAIN in every bank screen, but you should still narrate pruning, join order, and skew.

## Key ideas

- **Prune first.** Partition filters and selective predicates belong as early as the grain allows. A function on the partition column usually defeats pruning.
- **Project early.** Select the columns you need before a wide join.
- **Join keys.** Match types. A string-to-int cast on the key kills a hash join's cleanliness and can explode skew.
- **Skew.** One key with a huge fan-out makes one worker slow. Split that key or pre-aggregate.
- **Sort and distinct.** UNION, DISTINCT, and ORDER BY without LIMIT are expensive. Say so.
- **Materialize** a reused heavy CTE only if the engine does not inline it and you measured a double scan.

## Diagrams and tables

| Symptom | First check |
| --- | --- |
| Full scan of a partitioned table | Predicate not on the partition column |
| One slow join task | Key skew or an exploding join |
| Spill | Row width, missing projection, or a huge sort |

## Interview angles

- "Optimize this for huge volume" is in the Amazon July 2024 notes.
- Snowflake micro-partition pruning is the sourced architecture question.
- A rolling window that excludes weekends still needs a sargable date filter.

## Pitfalls

- Index advice on a system that has no traditional B-tree (a cloud warehouse). Talk about clustering, sort, and partitions instead.
- Adding a subquery hint you cannot justify.
- Optimizing before stating the correct result.

## Say this in the interview

I would filter the date partition before the join, cast the keys to the same type, and pre-aggregate the large side to the join grain. If one key dominates, I isolate it. I would confirm with the scan statistics, not with a feeling.

## Self-check


??? Why is wrapping a partition column in a function risky?

The engine often cannot prune partitions if the column is hidden inside a function.
???

??? What do you check when one join task is much slower?

Skew on the join key, or a many-to-many fan-out. Look at task duration and rows out.
???
