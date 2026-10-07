---
id: snowflake-databricks
title: Snowflake and Databricks depth
track: Warehouse & lakehouse
level: Stretch
gap: true
summary: Platform details the notes only sketch.
---

> **Gap fill, not from your notes.** The notes compare engines and table formats. They do not walk these platform features. This page is a concise, original fill.

## Summary

RBC postings name Snowflake or Databricks. TD, BMO, and Scotiabank postings name Databricks. Autodesk names both Snowflake and the Databricks-adjacent stack (Spark, dbt). The sourced questions cover micro-partitions, streams, tasks, and Snowpipe. The rest of the platform depth was thin, so this page fills it.

## Key ideas

- **Snowflake clustering.** Automatic micro-partitions are not the same as a clustering key. Add a key when filters no longer prune. Reclustering spends compute.
- **Warehouses.** A warehouse is a compute cluster, not storage. Multi-cluster warehouses absorb concurrent dashboards. Size up for a slow scan only after pruning is fixed.
- **Dynamic tables.** You declare the query and a lag target. The service refreshes. Good when the transform is SQL and the freshness target is clear.
- **Databricks Unity Catalog.** One place for permissions, lineage, and catalogs across workspaces. Say it when the question is governance, not Spark syntax.
- **Photon.** A vectorized engine for SQL workloads. It does not fix a skew join by itself.
- **Liquid clustering.** Replaces a rigid partition plus Z-order choice on Delta tables that keep changing filter patterns. Z-order still appears in older notes and blogs.
- **DLT (Delta Live Tables).** Declared pipelines with expectations (data quality rules) between bronze and gold. It is orchestration plus quality, not a second storage format.

## Diagrams and tables

| Feature | Belongs to | You mention it for |
| --- | --- | --- |
| Streams + MERGE | Snowflake | SCD2 and incremental loads |
| Snowpipe | Snowflake | File arrival ingest |
| Liquid clustering | Delta / Databricks | Filter columns that change |
| Expectations | DLT | Fail or quarantine bad rows |
| Unity Catalog | Databricks | Permissions and lineage |

## Interview angles

- Sourced Snowpipe, streams, and tasks: give a real use case. A clean one is: Snowpipe lands files, a stream captures the new rows, a task MERGEs them into the dimension.
- Do not claim a bank asked about liquid clustering. Postings do not say that.

## Pitfalls

- Turning on a larger warehouse to hide a missing filter.
- Using DLT and also hand-writing a conflicting DAG that loads the same table.
- Treating Unity Catalog as a transformation tool. It governs. DLT and jobs transform.

## Say this in the interview

Files land in a stage and Snowpipe loads them. A stream on that table feeds a task that MERGEs into the modeled table, matched on the business key so a rerun is safe. On Databricks I would use a declared pipeline with expectations on the silver table, liquid clustering on the date we filter, and Unity Catalog for who can read gold.

## Self-check


??? How is a Snowflake warehouse different from storage?

Storage is the tables. The warehouse is the compute you can suspend, resize, or isolate.
???

??? What is liquid clustering for?

Keeping Delta data laid out for current filter columns without a fixed partition scheme you must keep rewriting.
???
