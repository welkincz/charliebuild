---
id: sas-bridge
title: From SAS and warehouse SQL to this stack
track: Orientation
level: Core
gap: false
summary: A generic map from procedural SQL habits to Spark, warehouses, and dimensional models.
---

## Summary

Many bank data jobs still touch legacy SQL and SAS-style procedural jobs. The interview does not need your biography. It needs the translation: a DATA step becomes a DataFrame transform, a PROC SQL join becomes Spark or warehouse SQL, and a slowly changing dimension (缓慢变化维) is the same idea you already know as a history table.

## Key ideas

- **Row by row vs set based.** SAS DATA steps invite row-wise thinking. Interviews want set-based SQL and narrow Spark transforms.
- **Explicit types.** SAS infers more. In Spark and Python, declare types at the boundary so a string date does not become a silent null.
- **Persist vs recompute.** A SAS work table is a scratch file. In Spark, `cache` is a memory choice, not a default. In a warehouse, a table or dynamic table is the scratch pad.
- **Keys.** Surrogate keys and effective dates are the bridge into SCD2 (拉链表).

## Diagrams and tables

| Habit | Modern equivalent | Interview line |
| --- | --- | --- |
| PROC SQL | Warehouse SQL or spark.sql | Same relational result, different shuffle |
| DATA step merge | Join with an explicit key | Many-to-many explodes |
| Retain / lag | Window LAG | Partition and order must be stated |
| Macro loop | Orchestrated task, not a cursor | Idempotent rerun |

## Interview angles

- "How would you move a daily SAS job to Databricks?"
- "Where would grain bugs hide in that rewrite?"

## Pitfalls

- Claiming a one-to-one rewrite. A procedural loop that updates yesterday's row is an SCD2 merge, and it must be idempotent.
- Naming an employer, a team, or a private stack while explaining the bridge.

## Say this in the interview

I translate a procedural job into three set-based steps: land raw files, conform keys and dates, then merge into a dimension with effective dates. I test grain by counting keys before and after the join.

## Self-check


??? What is the usual bug when a DATA-step merge becomes a SQL join?

A many-to-many key match multiplies measures. Check grain with a count of the business key.
???

??? Is cache the same as a SAS work library?

No. Cache pins a Spark plan result in memory or disk and is optional. A work table is just storage.
???
