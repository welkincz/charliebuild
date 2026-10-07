---
id: case-netflix
title: Case: title popularity pipeline
track: System design
level: Stretch
gap: false
summary: From play events to a top-titles aggregate.
---

## Summary

The Netflix notes describe a coding round and a design round around a large media pipeline, including a top-titles style problem and a Spark deep dive. This page is the design, not a transcript.

## Key ideas

- **Event.** A play start or a qualified watch. Define qualified before you rank.
- **Grain of gold.** Title, country, and window. A raw play is not the gold row.
- **Path.** Log to object storage, then a Spark job that dedupes event ids and aggregates. A streaming top-10 is only needed if the product shows it live.
- **Skew.** A hit title is a hot key. Pre-aggregate per partition, then combine, or salt if a single title dominates a join.
- **Features.** If the follow-up is recommendations, keep a feature pipeline separate from the analytic aggregate. Training/serving skew means the feature definition must match online and offline.
- **OOM.** Tie the deep dive back to the Spark internals page: skew, wide rows, collect.

## Diagrams and tables

```
plays -> bronze (event id) -> silver deduped plays -> gold title-window counts
```

## Interview angles

- Netflix notes: first missing positive, meeting rooms, Spark OOM, and a top-titles style reverse-engineering prompt.
- This is a reference loop, not a Toronto volume target.

## Pitfalls

- Ranking on raw starts when the business meant qualified watches.
- A global sort of every play to find a top 10.
- One pipeline that both serves the chart and trains a model with a different definition of a watch.

## Say this in the interview

I define a qualified watch, dedupe plays by event id, and aggregate to title and window in Spark. Top-N is a small aggregate, not a sort of the raw log. If one title skews a join I pre-aggregate first. I would only stream this if the chart is live.

## Self-check


??? Why is top-N not a full sort of the log?

You can aggregate counts first. The sort is over titles, which is small.
???

??? What is training/serving skew?

The offline feature and the online feature are computed differently, so the model sees a different input in production.
???
