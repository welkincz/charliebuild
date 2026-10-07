---
id: stream-processing
title: Windows, watermarks, and engines
track: Streaming
level: Stretch
gap: false
summary: Event time, late data, and Flink versus Spark Structured Streaming.
---

## Summary

Once you aggregate a stream you need a clock. Event time is when it happened. Processing time is when you saw it. They diverge. Watermarks are how you stop waiting.

## Key ideas

- **Tumbling window.** Fixed, non-overlapping (every 5 minutes).
- **Sliding window.** Overlapping (5-minute window every 1 minute). The Uber trending note is this shape.
- **Session window.** Gap-based, the streaming cousin of the SQL sessionization pattern.
- **Watermark.** A threshold that says events older than this are late. Late events are dropped, side-output, or they update an allowed lateness window. Say which.
- **Flink.** Record-at-a-time, explicit state, event-time watermarks as a first-class idea. Strong when latency and state are the product.
- **Spark Structured Streaming.** Micro-batches. Easier if the rest of the platform is Spark. Latency is the batch interval. Watermarks exist, but the execution is still batches.
- **Output mode.** Append (only final results), update (changed keys), complete (whole table, only for small aggregations).

## Diagrams and tables

| Engine | Unit | You accept |
| --- | --- | --- |
| Spark SS | Micro-batch | Seconds of latency, Spark ops |
| Flink | Record | An ops model built for state |

## Interview angles

- Sourced ride tracking: locations are event-timed. A late GPS point should update the last-known location, not open a second ride.
- Netflix notes mention Flink state restore as the alternate deep dive if Spark is not the resume's center.

## Pitfalls

- Using processing time for a ranking users will compare across regions.
- A watermark of zero with no late policy, so any delay drops data silently.
- Complete mode on an unbounded key space.

## Say this in the interview

I window by event time. A watermark lets the ranking close five minutes after the window, and late events within that bound update the row. Beyond it I count them and do not rewrite history. I would use Spark Structured Streaming if the team already runs Spark. I would reach for Flink if the state and the latency target are the hard part.

## Self-check


??? What is a watermark?

The engine's notion of how late event time can be before a window is closed.
???

??? When is complete output mode a problem?

When the aggregation key is unbounded, because the sink rewrites the entire result every trigger.
???
