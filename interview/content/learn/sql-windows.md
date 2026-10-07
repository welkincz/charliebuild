---
id: sql-windows
title: Window functions and CTEs
track: SQL
level: Core
gap: false
summary: Frames, partitions, and readable multi-step queries.
---

## Summary

A window function (窗口函数) computes a value per row without collapsing the row. That is the whole difference from GROUP BY. CTEs (公共表表达式) give each step a name so an interviewer can follow you.

## Key ideas

- **PARTITION BY** resets the window. **ORDER BY** makes LEAD, LAG, and running sums defined.
- **Frame.** Default for many engines with ORDER BY is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. For a true last-N-rows average, write `ROWS BETWEEN`.
- **Ranking.** ROW_NUMBER is unique. RANK skips after ties. DENSE_RANK does not skip.
- **Gaps and islands.** LAG to flag a break, then a running SUM of the flag as the island id.
- **CTE vs subquery.** Prefer a CTE when you would otherwise nest more than one level. The optimizer usually inlines both.

## Diagrams and tables

| Function | Returns | Collapse? |
| --- | --- | --- |
| SUM() OVER () | Value on each row | No |
| SUM() GROUP BY | One row per group | Yes |
| ROW_NUMBER | 1..n per partition | No |
| LAG / LEAD | Neighbor row | No |

## Interview angles

- Consecutive activity streaks (sourced Amazon).
- 7-day average excluding weekends (sourced Microsoft).
- Sessionization with a 30-minute gap (TikTok notes).
- Top customer per segment: ROW_NUMBER then filter rn = 1.

## Pitfalls

- `ROWS` vs `RANGE`. RANGE with duplicates includes all peers with the same order key.
- Forgetting PARTITION BY, so the rank is global.
- Putting a window in WHERE. Filter it in an outer query.

## Say this in the interview

I partition by the entity and order by time. I use LAG to see the previous timestamp, flag a new group when the gap is too large, and turn that flag into an id with a running sum. I filter the rank in an outer query, not in the same SELECT.

## Self-check


??? Does SUM() OVER collapse rows?

No. The aggregate is attached to every row in the frame. GROUP BY is what collapses.
???

??? When do you need ROWS instead of the default frame?

When you want a fixed number of preceding rows, not every peer that shares the same ORDER BY value.
???
