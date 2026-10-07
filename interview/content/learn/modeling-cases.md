---
id: modeling-cases
title: Modeling method and cases
track: Modeling
level: Core
gap: false
summary: A repeatable way to answer an open modeling prompt.
---

## Summary

Open modeling prompts in the sourced bank are businesses, not schemas: a food truck, a lending book, retail from vendor to customer, a vendor payment system. The method is the same every time.

## Key ideas

1. **Users and decisions.** What question must the model answer tomorrow?
2. **Grain.** One sentence. Confirm it.
3. **Facts and measures.** Which are additive?
4. **Dimensions.** What do they filter and slice?
5. **Change.** Which attributes need SCD2?
6. **Many-to-many and late data.** Name them before the interviewer does.
7. **One query.** Write the revenue or balance query on your own keys to prove the grain.

## Diagrams and tables

| Case | A defensible grain |
| --- | --- |
| Food truck | One row per ticket line per truck per day |
| Lending book | Periodic snapshot: one row per facility per day, plus a transaction fact |
| Vendor to customer | Purchase-order line, inventory movement, shipment line, as separate facts |
| Vendor payment | One row per payment allocation to an invoice |

## Interview angles

- All four sourced Amazon modeling prompts use this method.
- July 2024 e-commerce list: customer, product, order, order item, shipment, payment.
- Uber notes: an OLTP-shaped design shows up beside the trending-dishes pipeline. Keep OLTP entities separate from the analytic star.

## Pitfalls

- One giant fact for inventory, orders, and payments.
- A daily balance fact with no transaction fact, so you cannot explain a number.
- Skipping the SCD question on vendor or customer attributes.

## Say this in the interview

I would model the lending book as two facts. Transactions are one row per cash event. The book snapshot is one row per facility per day, with balances that are semi-additive. Customer risk band is SCD2. I can reconcile the snapshot to the transactions.

## Self-check


??? Why two facts for a lending book?

Events and levels have different grains. You cannot rebuild a daily balance from a single summed row, and you should not store the balance only as a flow.
???

??? What do you write at the end of a modeling round?

One SQL query on your schema that answers the interviewer's metric, to prove the joins.
???
