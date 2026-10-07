---
id: lakehouse
title: Lakehouse table formats
track: Warehouse & lakehouse
level: Core
gap: false
summary: Delta, Iceberg, and Hudi as logs on files.
---

## Summary

A lakehouse puts warehouse features on files in object storage (数据湖 plus a table log). The log is the product. Delta, Iceberg, and Hudi disagree on the log's shape, not on the idea.

## Key ideas

- **Delta.** A JSON/checkpoint transaction log of which Parquet files are in the table. ACID within the table. Time travel reads an older snapshot. OPTIMIZE compacts small files. Deletes are file rewrites plus log entries.
- **Iceberg.** A metadata tree (manifests) that plans scans. Hidden partitioning. Snapshot isolation. Often chosen when several engines must share one table.
- **Hudi.** Copy-on-write or merge-on-read. Strong on upsert-heavy ingestion.
- **Medallion.** Bronze is raw, silver is conformed, gold is the star. The names are a contract about who can break what.

## Diagrams and tables

| Format | Remember |
| --- | --- |
| Delta | Transaction log, time travel, OPTIMIZE |
| Iceberg | Manifests, hidden partitions, multi-engine |
| Hudi | Copy-on-write vs merge-on-read upserts |

## Interview angles

- Sourced: a highly available analytics data lake (Databricks report).
- Microsoft notes mention Delta beside Parquet and Avro as a format choice.
- Bank postings say Databricks, which in practice means Delta. Still do not invent the question text.

## Pitfalls

- Treating the log as optional. Without it you have a folder of Parquet, not a table.
- Time travel as a backup strategy. It is a short window, not disaster recovery.
- Gold tables that analysts rebuild from bronze because silver was skipped and grain was never defined.

## Say this in the interview

I land raw files in bronze with the source filename and ingest time. Silver applies types, keys, and dedupe. Gold is the star at a declared grain. Delta's log gives me a snapshot and a way to roll a bad commit back inside the retention window. I compact small files so the next scan is not metadata-bound.

## Self-check


??? What does the Delta log store?

The ordered commits that add and remove files, so a reader sees one snapshot.
???

??? When do you prefer Iceberg?

When more than one engine must read and write the same table and you want manifest-level planning.
???
