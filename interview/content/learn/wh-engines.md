---
id: wh-engines
title: Redshift, Snowflake, and BigQuery
track: Warehouse & lakehouse
level: Core
gap: false
summary: How to compare engines without reciting a brochure.
---

## Summary

Interviewers rarely want a vendor slogan. They want the knob each engine exposes. Snowflake separates storage, compute, and services. Redshift asks you to think about distribution and sort. BigQuery charges scanned bytes and slots. The product named Snowflake is not a snowflake schema (雪花模型).

## Key ideas

- **Snowflake.** Central storage, virtual warehouses for compute, a services layer for metadata and optimization. Micro-partitions are small immutable files with metadata the optimizer uses for pruning. Clustering keys reorganize data that no longer matches your filters. Streams expose change. Tasks schedule SQL. Snowpipe loads files continuously. Dynamic tables are a declarative refresh.
- **Redshift.** Cluster you size. Dist key, sort key, and workload management matter. A bad dist style (EVEN vs KEY vs ALL) is a common follow-up.
- **BigQuery.** Serverless slots and a scan-based cost model. Partition and cluster to cut bytes scanned. It is not in the Toronto bank postings as a primary stack. Mention it only as a comparison.

## Diagrams and tables

| Engine | You are responsible for |
| --- | --- |
| Snowflake | Warehouse size, clustering, warehouse isolation |
| Redshift | Dist, sort, cluster size, vacuum/analyze habits |
| BigQuery | Partition, cluster, bytes scanned |

## Interview angles

- Three sourced questions: architecture and micro-partitions, SCD2 via streams and MERGE, Snowpipe plus streams plus tasks.
- Those sourced reports are filed under other employers in the report list. They are Snowflake mechanics, not a claim that the Snowflake company asked them in Toronto.
- RBC postings mention Snowflake or Databricks. That is a posting signal, not a question.

## Pitfalls

- Saying micro-partitions are something you configure one row at a time. They are automatic files. Clustering is the lever.
- Leaving a warehouse running because the data is idle. Compute is what you suspend.
- Mixing up Snowpipe (load) and streams (change tracking).

## Say this in the interview

Snowflake stores data once and scales compute separately. Micro-partitions carry min/max metadata so a selective filter can skip files. I would size a warehouse for the load window and suspend it. Streams plus a MERGE task maintain an SCD2 table. Snowpipe is the continuous ingest in front.

## Self-check


??? What does a micro-partition let the optimizer skip?

Files whose metadata shows they cannot match the predicate.
???

??? What is a stream?

A change feed on a table: inserts, updates, and deletes since you last consumed it.
???
