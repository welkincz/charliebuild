---
id: spark-fundamentals
title: Spark fundamentals
track: Spark & pipelines
level: Core
gap: false
summary: DataFrames, lazy plans, and narrow versus wide transforms.
---

## Summary

Spark is the common compute language on the bank Databricks postings and on the Autodesk posting. Core level is a DataFrame, a lazy plan, and the difference between a narrow transform and a shuffle.

## Key ideas

- **DataFrame.** A distributed table with a schema. Prefer it to an RDD in interviews.
- **Lazy.** Transformations build a plan. An action (`count`, `write`, `collect`) runs it.
- **Narrow (窄依赖).** Map, filter, and a coalesce that only merges partitions. No shuffle.
- **Wide (宽依赖).** `groupBy`, `join`, `repartition`, `distinct`. A shuffle. Stages split here.
- **Job, stage, task.** An action is a job. A shuffle boundary starts a stage. A task is one partition of one stage.
- **Explain.** Read the plan before you guess. Microsoft's notes say to practice this.

## Diagrams and tables

```
action  ->  Job
shuffle ->  Stage boundary
partition of a stage -> Task
```

| Call | Shuffle? |
| --- | --- |
| filter, select, withColumn | No |
| coalesce | No, if you only reduce partitions |
| repartition, join, groupBy | Yes |

## Interview angles

- Sourced: repartition versus coalesce.
- Microsoft notes: job, stage, task, narrow versus wide, broadcast when the side is small.
- Google notes: mutual friends as a join of two friend lists. That is a join, so it is wide unless one side is tiny.

## Pitfalls

- `collect` on a large frame to "just look." That pulls data to the driver.
- A Python UDF on every row when a built-in function exists. UDFs break a lot of optimization.
- Caching every intermediate because the UI looked busy.

## Say this in the interview

Filter and project are narrow, so they pipeline inside a stage. The join is wide, so it shuffles on the key and starts a new stage. I would look at explain before I add a repartition. I only broadcast if the small side fits comfortably on every executor.

## Self-check


??? What is the difference between a job and a stage?

A job is one action. Stages are the pieces of that job split at shuffle boundaries.
???

??? Does coalesce shuffle?

Not when it only combines existing partitions. repartition does shuffle so it can rebalance.
???
