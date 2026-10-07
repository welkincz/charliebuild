---
id: schemas
title: Schemas and normalization
track: Modeling
level: Core
gap: false
summary: Star, snowflake, and 1NF–3NF without reciting a textbook.
---

## Summary

Normalized models protect writes. Dimensional models protect analytic reads. Interviews ask you to pick, and to show 1NF, 2NF, and 3NF on a small schema. The July 2024 Amazon notes ask all three, plus many-to-many.

## Key ideas

- **1NF.** Each column holds one value. No repeating groups.
- **2NF.** 1NF, and every non-key column depends on the whole primary key, not part of a composite key.
- **3NF.** 2NF, and no non-key column depends on another non-key column.
- **Star (星型模型).** Fact in the center, denormalized dimensions around it. Fewer joins.
- **Snowflake schema (雪花模型).** Dimensions split into sub-dimensions. More normalized, more joins. This is not the Snowflake product.
- **One big table.** Fast for a single known query, painful when a dimension attribute changes.
- **Bridge.** Resolves many-to-many (account to customer, diagnosis to claim) without fanning the fact out blindly.

## Diagrams and tables

| Model | Write anomaly | Analytic join count |
| --- | --- | --- |
| 3NF | Low | Higher |
| Star | Dimension updates are wider | Low |
| One big table | High | None, until the question changes |

## Interview angles

- July 2024 notes: 1NF/2NF/3NF, when to denormalize, many-to-many.
- Meta notes: design a relational schema for an app, including a classroom-style app on one report.
- Bank postings ask for modeling. They do not list these questions. Do not pretend they did.

## Pitfalls

- Calling a snowflake schema and Snowflake the warehouse the same thing.
- Denormalizing a measure that then disagrees across copies.
- Putting a many-to-many pair of foreign keys on the fact and summing twice.

## Say this in the interview

In 3NF I keep customer email off the order line because it depends on customer, not on the line. For analytics I copy the attributes I filter on into a customer dimension and accept a controlled Type 2 update. A customer who shares an account goes through a bridge, and I define the weight so revenue is not double counted.

## Self-check


??? When do you denormalize?

When a read pattern joins the same small dimension constantly and you can maintain the copy. You still name the update rule.
???

??? How do you model many-to-many?

An associative table or a bridge, with a grain of one row per pair, plus a weighting rule if a measure must be allocated.
???
