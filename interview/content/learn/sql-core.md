---
id: sql-core
title: Core querying
track: SQL
level: Core
gap: false
summary: Joins, aggregation, NULL, and the order you narrate a query.
---

## Summary

Core SQL in these loops is not syntax trivia. It is joins, GROUP BY, HAVING, NULL, and the habit of stating grain before you write. Window functions (窗口函数) come next. CTEs (公共表表达式) are how you narrate.

## Key ideas

- **Logical order.** FROM and JOIN, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT. SELECT aliases are not available in WHERE.
- **NULL.** `NULL = NULL` is unknown. Use `IS NULL`. Aggregates skip NULL. `COUNT(*)` counts rows. `COUNT(col)` skips NULL.
- **Join grain.** Inner drops non-matches. Left keeps the left grain. A join that multiplies rows is a modeling bug, not a SQL trick.
- **UNION ALL vs UNION.** UNION adds a distinct sort. Use UNION ALL unless you truly need deduped stacks.
- **Filter before you aggregate** when the predicate is about the row, not the group.

## Diagrams and tables

| Need | Use | Not |
| --- | --- | --- |
| Row kept even with no match | LEFT JOIN | INNER JOIN |
| Condition on a group | HAVING | WHERE on an aggregate |
| Unknown missing | IS NULL | = NULL |
| Stack partitions | UNION ALL | UNION |

## Interview angles

- Amazon's July 2024 phone notes: a window, a CTE, and a subquery, including an above-average filter and a CTE for customer totals.
- Meta notes: percentages, joins, and NULL on a bookstore schema.
- Microsoft sourced item: a rolling average that must ignore weekends and gaps.

## Pitfalls

- Filtering a LEFT JOIN's right-side column in WHERE, which turns it into an inner join. Put that predicate in the ON clause or filter after a CTE.
- Dividing integers. Cast before you divide if you need a rate.
- Selecting columns you did not group, on engines that reject it.

## Say this in the interview

I name the grain first: one row per customer per day. I left-join so customers with no orders stay, and I put the order-date predicate in the ON clause. I use COUNT(*) for customers and COUNT(order_id) for orders.

## Self-check


??? Why does a WHERE on a right-table column break a LEFT JOIN?

Non-matches have NULL on the right. The WHERE rejects those NULLs, so the outer rows disappear.
???

??? What is the difference between WHERE and HAVING?

WHERE filters input rows before grouping. HAVING filters groups after aggregates exist.
???
