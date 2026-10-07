---
id: storage
title: Storage and file formats
track: System design
level: Core
gap: false
summary: Object storage, Parquet, and partitions.
---

## Summary

Almost every design in this path lands in object storage. The choices that matter are format, partition column, and file size.

## Key ideas

- **Object storage.** Cheap, durable, and slow if you open a million tiny files. It is not a database.
- **Parquet.** Columnar, compressed, splittable. The default for analytics. Nested fields are fine. It is immutable: an update is a rewrite plus a table log.
- **Avro or JSON.** Better for row-oriented interchange and schema evolution on the wire. Expensive to scan for analytics.
- **Partition.** A column you almost always filter, usually a date. Too many partition values (a timestamp to the second) create tiny files.
- **Bucketing.** Hashed files for join co-location. Say it only if you will maintain the bucket count.
- **Table format.** Parquet alone does not give you transactions. Delta or Iceberg does. See the lakehouse page.

## Diagrams and tables

| Format | Good for |
| --- | --- |
| JSON | Landing a raw API payload |
| Avro | Row logs with a schema |
| Parquet | Analytic scans |
| Delta / Iceberg | Parquet plus a transaction log |

## Interview angles

- July 2024 notes: CSV files landing, then a real format downstream. Do not serve gold as CSV.
- Microsoft notes list Parquet, Avro, and Delta as the format choice.

## Pitfalls

- Partitioning by a high-cardinality id.
- Rewriting an entire year because one day was late, when the table format could rewrite a day.
- Skipping compression and then blaming the warehouse.

## Say this in the interview

I land the raw payload as it arrived, then write Parquet in silver, partitioned by event date. I keep files large enough that listing is cheap. Updates go through a table format so I am not managing filenames by hand.

## Self-check


??? Why not query JSON in gold?

Scans read whole rows, compression is weaker, and there is no stable table snapshot.
???

??? What partition column do you default to?

A date the queries filter, at day grain unless the volume forces hour.
???
