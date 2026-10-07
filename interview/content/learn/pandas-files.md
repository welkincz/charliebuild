---
id: pandas-files
title: pandas and large files
track: Python & DSA
level: Core
gap: false
summary: Chunking, types, and the 100 GB file question.
---

## Summary

The sourced Databricks question is a 100 GB CSV that must not be loaded at once. pandas is fine for a sample and for interview-sized frames. The production answer is: do not use pandas for the full file.

## Key ideas

- **Stream.** Read by chunks (`chunksize`) or, better, use PySpark, DuckDB, or a warehouse COPY. Aggregate per chunk and merge the partials.
- **Types.** Set dtypes. A default object column will blow memory.
- **Push down.** If you only need three columns, pass `usecols`.
- **Partial aggregates.** Counts and sums merge by addition. A global median does not. Say which aggregates are algebraic.
- **Encoding and bad rows.** Decide whether a bad line fails the file or is quarantined.

## Diagrams and tables

| Size | Tool |
| --- | --- |
| Fits in RAM with margin | pandas |
| Larger than RAM, one machine | chunked pandas, DuckDB, or Polars streaming |
| Cluster | Spark, and never a single `collect` of the raw file |

## Interview angles

- 100 GB CSV (sourced).
- Amazon's July 2024 note: read a file and return the most repeated word. If the file is huge, count per chunk and merge counters.

## Pitfalls

- `read_csv` with no chunk size on a file you have not measured.
- Computing a median by concatenating every chunk.
- Holding a Python list of every line "just in case".

## Say this in the interview

I would not load 100 GB into pandas. I would stream chunks, keep a running sum and count if the metric allows it, and write the clean columns to Parquet. If this is a cluster, I use Spark and avoid collect.

## Self-check


??? Which aggregates can you merge across chunks?

Sum, count, min, and max. Mean is sum and count. Median and exact distinct counts need a different structure.
???

??? What is the memory risk of dtype object?

Each cell is a Python object with a large overhead, so the frame is many times the file size.
???
