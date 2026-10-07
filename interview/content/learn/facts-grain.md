---
id: facts-grain
title: Facts, grain, and fact types
track: Modeling
level: Core
gap: false
summary: Declare the grain before you name a fact table (事实表).
---

## Summary

Every modeling answer starts with grain: what one row means. A fact table (事实表) stores measures at that grain. If you cannot finish the sentence "one row per …", you do not have a model yet.

## Key ideas

- **Grain.** The business key of the fact. Example: one row per order line, not per order, if revenue is at the item.
- **Additive facts.** Sum across any dimension (amount). **Semi-additive** sum across some dimensions but not time (balance). **Non-additive** cannot be summed (ratio, unit price).
- **Transaction fact.** One row per event.
- **Periodic snapshot.** One row per entity per period (day-end balance).
- **Accumulating snapshot.** One row per process, with dates updated as milestones happen (order placed, shipped, delivered).
- **Factless fact.** A row that records that an event happened, with no measure, or a coverage table of what did not happen.

## Diagrams and tables

| Type | Row means | Example |
| --- | --- | --- |
| Transaction | An event | Payment posted |
| Periodic snapshot | State at a period end | End-of-day balance |
| Accumulating | A process with milestones | Order lifecycle |
| Factless | An occurrence | Student attendance |

## Interview angles

- Amazon sourced models: food truck, lending book, vendor to warehouse to customer, vendor payments.
- July 2024 notes: design facts and dimensions, then write revenue per product on your own schema.
- Banks: modeling is on the TD postings and the Tangerine modeling/governance posting. No bank question text is invented here.

## Pitfalls

- Mixing grains in one fact (order header freight plus line revenue) without a bridge or an allocation rule.
- Summing a semi-additive balance across days.
- Starting with table names before grain.

## Say this in the interview

The grain is one row per order line. Quantity and extended amount are additive. The order-level shipping fee does not go on the line unless I allocate it and say so. I can sum amount by product. I cannot sum a daily balance across days.

## Self-check


??? What is grain?

The meaning of one row in the fact, stated as one row per business key.
???

??? Why is an account balance not freely additive?

It is a level, not a flow. Summing it across days double counts. Sum it across accounts on one date.
???
