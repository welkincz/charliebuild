---
id: sql-patterns
title: Interview patterns
track: SQL
level: Core
gap: false
summary: The patterns that recur once windows and joins are fluent.
---

## Summary

The notes and the sourced bank keep returning to the same shapes: dedupe, top-N, streaks, sessionization, funnel, retention, and percentages. Learn the shape, then swap the business nouns.

## Key ideas

1. **Nth highest.** DENSE_RANK so ties share a rank, then filter. Avoid a sort-and-limit if the interviewer wants ties handled.
2. **Top-N per group.** ROW_NUMBER partitioned by the group.
3. **Dedupe.** ROW_NUMBER by business key ordered by event time desc, keep rn = 1. State which duplicate wins.
4. **Streaks / islands.** Gap flag plus running sum.
5. **Sessionization.** Same pattern with a time threshold (the TikTok notes use 30 minutes).
6. **Retention.** A start cohort left-joined to a later date on the entity key. Define the cohort before the rate.
7. **Percentage.** Numerator and denominator from the same grain. Watch integer division.
8. **Funnel.** One flag per step per entity, then conditional counts.

## Diagrams and tables

| Pattern | Skeleton |
| --- | --- |
| Dedupe | row_number() over (partition by key order by ts desc) = 1 |
| Island | sum(is_break) over (partition by key order by ts) |
| Rate | 1.0 * num / nullif(den, 0) |

## Interview angles

- Bookstore percentages in the Meta notes: share of authors, share of copies, invitee averages.
- Same-day repeat purchases (sourced Databricks).
- Login streaks (sourced Amazon).

## Pitfalls

- Changing grain in the middle of a rate (orders in the numerator, customers in the denominator) without saying so.
- Using DISTINCT to hide a join fan-out.
- Self-joining a huge event table when a window scan is enough.

## Say this in the interview

This is a gaps-and-islands problem. I flag a new island when the previous row is not the prior day, number the island with a running sum, and aggregate within island. I state the tie rule before I pick ROW_NUMBER or DENSE_RANK.

## Self-check


??? How do you keep the latest row per key?

row_number() over (partition by key order by event_time desc) and keep rn = 1. Say what happens if timestamps tie.
???

??? How is sessionization different from a calendar streak?

The break condition is a time gap, not a missing date. The window pattern is the same.
???
