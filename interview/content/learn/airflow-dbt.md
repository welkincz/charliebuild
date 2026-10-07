---
id: airflow-dbt
title: Airflow and dbt
track: Spark & pipelines
level: Stretch
gap: true
summary: Orchestration and SQL transforms.
---

> **Gap fill, not from your notes.** The notes mention orchestration and CI/CD, not Airflow intervals or dbt incremental models. This page is a concise fill.

## Summary

Autodesk's posting names Airflow and dbt. RBC's postings stress CI/CD. Microsoft's notes call pipeline CI/CD a standard topic. The mechanics below were not in the notes.

## Key ideas

- **Airflow schedules a graph.** A DAG is tasks and dependencies. The data interval is the window the run is responsible for, not the wall clock when it starts. A daily run that starts just after midnight often owns yesterday.
- **Catchup and backfill.** Catchup runs missed intervals. A backfill is you asking for a range. Both are safe only if each task is idempotent for its interval.
- **Retries.** Retry a transient failure. Do not retry a task that already appended half its output unless the write is idempotent.
- **Sensors.** They wait for a file or partition. A deferrable sensor sleeps without holding a worker.
- **The DAG is not the transform.** Business logic lives in Spark, SQL, or dbt. The DAG calls it.
- **dbt models.** A model is a SELECT. `ref` builds the graph. Sources describe raw tables.
- **Incremental.** Append, or merge, or delete+insert on a predicate. Pick merge when late rows update existing keys. Snapshots implement SCD2 on a source table.
- **Tests.** unique, not null, and relationships are the minimum. A failed test should stop gold from publishing.
- **CI.** Compile the project, run the tests on a fixture or a slim slice, then deploy. Schema drift fails the build.

## Diagrams and tables

| Tool | Owns | Does not own |
| --- | --- | --- |
| Airflow | When and in what order | The SQL itself |
| dbt | SQL models, tests, docs | Cluster sizing |
| Databricks Jobs | Spark tasks on the platform | A full company scheduler, unless you choose that |

## Interview angles

- Use this page when an Autodesk-style or CI/CD follow-up appears. Do not present it as a reported question.
- Tie idempotency back to the ETL page. Orchestration cannot fix a blind append.

## Pitfalls

- Encoding business rules as Python inside the DAG file.
- An incremental model with no unique key and no predicate, which scans the whole table and still duplicates.
- Catchup enabled on a non-idempotent DAG.

## Say this in the interview

Airflow triggers the interval. The task runs a dbt model that merges on the order key for that date window, so a retry replaces the same rows. A not-null and unique test gates the gold exposure. I backfill by replaying intervals, not by appending the range again.

## Self-check


??? What is a data interval?

The logical time window a DAG run is responsible for, which is often not the same as the start timestamp.
???

??? What does a dbt snapshot give you?

A Type 2 history of a source table, with validity timestamps, if you configure the strategy and unique key.
???
