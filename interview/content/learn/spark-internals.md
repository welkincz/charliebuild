---
id: spark-internals
title: Spark internals and tuning
track: Spark & pipelines
level: Stretch
gap: true
summary: Shuffle, joins, skew, and OOM.
---

> **Gap fill, not from your notes.** The notes name job/stage/task, broadcast, skew, and OOM, but they do not explain Catalyst, AQE, or join choice. This page fills that gap.

## Summary

Databricks, Microsoft, and the Netflix notes all push past the DataFrame API. The sourced questions stop at repartition versus coalesce and a large cross join. Internals are the Stretch follow-up.

## Key ideas

- **Catalyst** turns the DataFrame into a logical plan, optimizes it (predicate pushdown, projection pruning, constant folding), picks a physical plan, and generates code.
- **AQE** (adaptive query execution) can change the plan after a stage finishes: coalesce tiny shuffle partitions, split a skew key, or switch a join to broadcast if the true size is small.
- **Join choice.** Broadcast hash join when one side is small enough to ship to every executor. Sort-merge join is the default for two large sides. Shuffle hash join is the middle case on some versions.
- **Skew.** One key, one slow task. Fixes: salt the hot key and the matching side, filter the hot key into its own join, or let AQE split it. Pre-aggregate before the join when the grain allows.
- **Cross join.** The sourced question: it is a cartesian product. On large data it explodes shuffle and memory. You almost never want it. A missed join key silently becomes one.
- **OOM.** Driver OOM often means `collect` or a broadcast that was not small. Executor OOM means wide rows, skew, or not enough spill headroom. The Netflix notes ask for this triage.
- **Files.** Target large-enough Parquet files (on the order of a hundred megabytes, not a thousand tiny files). Compact after streaming writes.
- **Cache** only a frame reused by several actions, and unpersist it. Cache does not fix a bad join.

## Diagrams and tables

| Symptom | Likely cause | First move |
| --- | --- | --- |
| One task hours longer | Skew | Salt, filter, or AQE skew join |
| Driver OOM | collect or huge broadcast | Remove collect, check broadcast size |
| Thousands of files | Over-partitioned write | coalesce before write, then compact |
| Spill storms | Wide rows or a big sort | Project columns, repartition sanely |

## Interview angles

- Sourced cross join and repartition/coalesce.
- Microsoft notes: broadcast, Spark UI, skew.
- Netflix notes: OOM triage on a Spark deep dive. No step-by-step dump from that file is copied here.

## Pitfalls

- Broadcasting a fact table.
- Salting only one side of the join.
- Raising executor memory before looking at skew. Memory hides the symptom once.

## Say this in the interview

I open the SQL tab and find the long stage. If one task dominates, I treat it as skew: confirm the hot key, then salt both sides or isolate that key. If the driver died, I look for collect or a broadcast. I do not cross join large inputs. I write fewer, wider files than I have cores if the output would otherwise be tiny.

## Self-check


??? When is a broadcast join unsafe?

When the small side is not actually small. It is copied to every executor and can OOM the executors or the driver.
???

??? What does AQE change that a static explain cannot show?

Partition counts, skew splits, and sometimes the join strategy, using sizes measured at runtime.
???
