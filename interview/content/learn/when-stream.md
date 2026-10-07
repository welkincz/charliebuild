---
id: when-stream
title: When to stream
track: Streaming
level: Core
gap: false
summary: Most bank pipelines are batch. Streaming is a choice you justify.
---

## Summary

Streaming is not more senior by default. It is the right tool when a decision is worthless if it waits for tomorrow's batch. Bank postings in this snapshot are mostly batch and warehouse language. Uber and the sourced ride-tracking question are where streaming is the point.

## Key ideas

- **Batch** when the consumer is a report, a daily balance, or a model train that runs on a schedule.
- **Micro-batch** (Spark Structured Streaming) when you want Spark APIs and can tolerate seconds.
- **Streaming** when the consumer acts on each event: fraud hold, live location, a ranking that must move within a minute.
- **Cost of streaming.** Always-on compute, state, and a harder replay story.
- **Hybrid.** Stream the events that need it. Batch the reconciliation. The batch result is the control total.

## Diagrams and tables

| Latency need | Default |
| --- | --- |
| Next morning | Batch |
| A few minutes | Micro-batch |
| Sub-second action | Stream, and say why |

## Interview angles

- Sourced: real-time ride locations, and a Microsoft streaming pipeline.
- Uber notes: a near-real-time trending-dishes dashboard.
- July 2024 Amazon notes discuss batch ETL more than streaming. Do not force streaming into that answer.

## Pitfalls

- Streaming a daily regulatory snapshot because it sounds modern.
- No batch reconciliation beside the stream, so drift is invisible.
- Promising exactly-once before you have named the sink.

## Say this in the interview

I would batch this if the user looks at it tomorrow morning. I would stream it if a late event changes an action in the moment. Either way I keep a batch rebuild so I can recompute a day from raw events.

## Self-check


??? What is the usual cost of choosing streaming?

Always-on compute, state management, and a more careful replay and idempotency story.
???

??? Why keep a batch path?

To recompute history and to check the stream against a control total.
???
