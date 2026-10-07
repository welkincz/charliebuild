---
id: governance
title: Governance and access
track: Spark & pipelines
level: Stretch
gap: true
summary: Masking, permissions, and retention as design choices.
---

> **Gap fill, not from your notes.** Governance is a known hole in the notes. Tangerine's posting names data governance beside modeling. This page is a concise fill, not a reported interview.

## Summary

Governance questions show up as follow-ups: who can see this column, how long do we keep it, and how do you audit a read. The Tangerine posting pairs data modeling with data governance. Nothing in the notes is a reported governance question, so none is invented here.

## Key ideas

- **Classify.** Name which columns are direct identifiers, quasi-identifiers, and ordinary attributes. Do this in the model, not after the dashboard.
- **Minimize.** Do not copy the raw identifier into gold if the metric does not need it. A surrogate key is the default join key.
- **Mask and tokenize.** Masking hides characters for a role. Tokenization replaces a value with a stable token so joins still work without exposing the raw id. Row access policies limit which rows a role sees.
- **RBAC.** Grant on gold schemas and views, not on bronze buckets full of raw files. Unity Catalog or warehouse roles are the mechanism. The idea is the same.
- **Encryption.** At rest in the platform, in transit on the wire. You rarely design the cipher. You do say who holds keys and that raw buckets are not public.
- **Retention.** Facts, logs, and time travel each have a clock. Deleting a key means a delete path in the pipeline, not only a policy PDF.
- **Audit.** You can answer who queried a sensitive table. That is a platform feature you should know exists.

## Diagrams and tables

| Control | Use |
| --- | --- |
| Drop the column | Gold does not need it |
| Mask | Analysts see a partial value |
| Token | Joins without the raw identifier |
| Row policy | A team sees only its book of records |

## Interview angles

- Pair this with SCD and modeling: a Type 2 history of a sensitive attribute is still sensitive.
- Canadian privacy law is part of the backdrop for bank postings. Do not turn that into a legal lecture or a personal status.

## Pitfalls

- Hashing a value and calling it encryption. A plain hash is reversible with a guess if the input space is small.
- Tokenizing only one side of a join.
- Leaving identifiers in a wide-open bronze path while gold is locked down.

## Say this in the interview

I keep the raw identifier in a restricted bronze or vault table. Gold uses a surrogate. Analysts get a view that masks the remaining sensitive attributes. A row policy limits the book they can see. Retention is a pipeline delete, tested like any other transform.

## Self-check


??? Why is a surrogate key a governance tool?

Facts can join without copying the raw identifier into every table and every extract.
???

??? What is the difference between masking and tokenization?

Masking changes the display. A token is a stable substitute that can still be a join key.
???
