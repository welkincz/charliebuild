---
id: data-quality
title: Data quality
track: Spark & pipelines
level: Stretch
gap: true
summary: Tests, contracts, and what you do when a check fails.
---

> **Gap fill, not from your notes.** Quality shows up as a sentence in the pipeline notes, not as a method. This page fills it.

## Summary

Senior loops ask how you know the table is fit to use. Bank contexts care about this because a wrong number is an operational incident, but that is a general point, not a personal story.

## Key ideas

- **Pyramid.** Unit-test a transform on a fixture. Check schema at the boundary. Check row rules (not null, unique, accepted values, referential integrity). Check aggregates against a control total. Watch anomalies (volume drop, null spike) over time.
- **Contracts.** The producer promises a schema, a grain, and a freshness target. Breaking a contract fails the build or lands the batch in quarantine.
- **Freshness.** A table can be correct and still late. Publish the timestamp you mean: event time versus ingest time.
- **Fail versus quarantine.** Fail the pipeline when gold would be wrong. Quarantine rows when a few bad keys should not block the rest, and count them.
- **Lineage.** You should be able to say which raw files fed a gold number. Catalog tools help. A naming standard helps even without one.
- **Incident.** Stop publishing, name the blast radius, fix forward or roll back the snapshot, then add the check that would have caught it.

## Diagrams and tables

| Check | Catches |
| --- | --- |
| Unique key | Duplicate merge |
| Not null on the key | Broken parse |
| Row count vs source | Dropped partition |
| Freshness | Silent scheduler stall |

## Interview angles

- July 2024 notes: how you test integrity, as a discussion, not a worksheet.
- Microsoft notes: schema validation and data quality checks inside CI/CD.
- dbt tests on the previous page are the concrete Core tool. This page is the policy around them.

## Pitfalls

- A green pipeline that never defined grain, so duplicates look like volume growth.
- Alerting on every metric with no owner.
- Quarantining everything, including a broken key that makes revenue wrong.

## Say this in the interview

I block publication when the primary key is not unique or the control total misses the source by more than the agreed tolerance. Bad individual rows go to a quarantine table with a reason. I alert on freshness separately from correctness. After an incident I add the check to the pipeline, not only to a wiki.

## Self-check


??? What is the difference between freshness and correctness?

Freshness is whether the data arrived on time. Correctness is whether the rows that arrived are valid.
???

??? When do you fail the whole batch?

When publishing it would put a wrong grain, a wrong total, or a broken key in front of users.
???
