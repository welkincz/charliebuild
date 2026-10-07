---
id: compute
title: Compute, scaling, and caching
track: System design
level: Core
gap: false
summary: Scale the bottleneck you named, and cache the read you repeated.
---

## Summary

Compute choices are about the bottleneck: a shuffle, a scan, or a popular read. Caching is a serving tool, not a pipeline identity.

## Key ideas

- **Vertical then horizontal.** A bigger warehouse or executor fixes a single-query scan until skew or shuffle dominates. More workers help a parallel scan, not a single-threaded driver.
- **Isolate workloads.** Batch, interactive, and streaming should not share one cluster without a queue.
- **Cache a serving result.** A hot dashboard aggregate can live in a materialized table or a key-value cache. Cache the gold row, not the raw log.
- **Invalidation.** A cache needs a refresh rule tied to the pipeline's commit. Otherwise you serve yesterday with today's label.
- **Backpressure.** If the stream falls behind, do not unbounded-buffer. Lag is a signal to scale consumers or to shed work you defined as optional.

## Diagrams and tables

| Bottleneck | Scale this |
| --- | --- |
| Scan of a pruned table | Warehouse or executors |
| One hot key | Data layout, not cluster size |
| Repeated gold read | Materialized table or cache |
| Driver | Remove the collect |

## Interview angles

- Petabyte pipeline (sourced): scale partitions and file layout before you scale the cluster.
- Trending dishes: a cache in front of the latest window is reasonable. Say the refresh.

## Pitfalls

- Caching the raw topic.
- Autoscaling a skew job and calling it fixed.
- A cache with no TTL and no pipeline hook.

## Say this in the interview

I would first prune and fix skew. If the remaining scan is CPU bound I add executors or a larger warehouse for the batch window only. The dashboard reads a small gold table refreshed by the same commit, so I am not caching the log.

## Self-check


??? When does adding workers not help?

When one key, the driver, or a global sort is the bottleneck.
???

??? What do you cache?

A small, hot, already-aggregated result, with a refresh tied to the pipeline.
???
