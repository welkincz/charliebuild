---
id: scd
title: Dimensions and SCD types
track: Modeling
level: Core
gap: false
summary: Slowly changing dimensions (缓慢变化维), especially Type 2.
---

## Summary

A dimension (维度表) is the descriptive context of a fact: customer, product, store. Attributes change. A slowly changing dimension (缓慢变化维, SCD) is the rule for that change. Type 2 is the one interviews spend time on. The history table is often called a zipper table (拉链表): each version has an open and close date.

## Key ideas

- **Type 0.** Keep the original. No updates.
- **Type 1.** Overwrite. History is gone.
- **Type 2.** New row per version. Effective start, effective end, and a current flag. Facts point at the surrogate key of the version that was true at event time, unless the question asks for current attributes.
- **Type 3.** A previous-value column. Only one step of history.
- **Type 4.** History in a separate mini-dimension or history table.
- **Type 6.** A hybrid: current attributes overwritten on all versions, plus a Type 2 version for point-in-time. Use it only if you can explain both access paths.
- **Late-arriving dimension.** Insert a stub row so the fact's foreign key resolves, then update the attributes when the dimension record shows up.

## Diagrams and tables

| Type | History | Typical use |
| --- | --- | --- |
| 0 | Original only | Date of birth |
| 1 | None | Correct a typo |
| 2 | Full versions | Plan tier, address, risk band |
| 3 | One previous | Previous region column |

## Interview angles

- Sourced: SCD2 with Snowflake streams and MERGE.
- Amazon vendor-payment model asks which SCD types you choose.
- Microsoft notes: effective and expiration dates on Type 2.

## Pitfalls

- Closing the previous row and inserting the new one in two statements that can both retry. The merge must be idempotent.
- Joining facts to the current dimension row when the question asked for the attribute at event time.
- Using the natural key as the only key, so Type 2 versions collide.

## Say this in the interview

I use a surrogate key per version. When an attribute we track changes, I set the old row's end date and current flag, then insert a new row with a new surrogate and an open end. The fact stores the surrogate that was current when the event happened. A rerun matches on natural key plus effective start so it does not insert twice.

## Self-check


??? What does a fact store for a Type 2 customer?

The surrogate key of the version valid at the event, if you need point-in-time attributes.
???

??? What is Type 1 for?

Corrections where history does not matter. You overwrite the column.
???
