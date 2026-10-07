---
id: delivery
title: Delivery semantics
track: Streaming
level: Stretch
gap: true
summary: At-least-once, exactly-once, and what the sink must do.
---

> **Gap fill, not from your notes.** The notes name fault tolerance on one streaming design and do not define delivery semantics. This page fills that gap.

## Summary

Exactly-once is a property of a whole pipeline, not a checkbox on the broker. You get it by combining a replayable log, a checkpoint, and an idempotent or transactional sink.

## Key ideas

- **At-most-once.** Commit the offset before processing. You can lose records. Rarely acceptable for a ledger.
- **At-least-once.** Process, write, then commit. A crash in between retries the record. Duplicates are possible. This is the default you should assume.
- **Exactly-once effect.** The user-visible table does not double-count, even if the log delivers twice. Tools: an idempotent MERGE on an event id, a transactional write that commits with the offset, or engine transactions (Kafka transactions, Flink two-phase commit, Spark Structured Streaming with a supportive sink).
- **Idempotent producer.** Retries do not append the same record twice inside a partition. That is not the same as an exactly-once sink.
- **Ordering.** Per key only. A rebalance can pause a partition. It should not reorder a key if the producer pinned the key.
- **State.** Aggregations (counts, windows) live in state backed by a changelog or checkpoint. If the checkpoint is older than the log retention, you cannot recover.
- **Rebalance.** Consumers join or leave and partitions move. Processing must tolerate a second delivery of the last uncommitted records.

## Diagrams and tables

| Piece | If it is weak |
| --- | --- |
| Log retention shorter than checkpoint | Cannot rebuild state |
| Sink appends blindly | At-least-once becomes duplicates |
| Offset commit before write | At-most-once, silent loss |

## Interview angles

- Use this on the sourced ride-tracking and Microsoft streaming designs when the interviewer asks about duplicates.
- The Uber trending-dishes note needs the same sentence: a retry must not double a dish's count.

## Pitfalls

- Saying Kafka is exactly-once because you set a config, without mentioning the sink.
- Committing offsets in a separate store from the output, with no transaction across them.
- Using a random event id so the merge key changes on retry.

## Say this in the interview

I assume at-least-once delivery. The sink MERGEs on a deterministic event id, so a retry updates the same row. Offsets commit after that write. Window state is checkpointed, and I keep log retention longer than the checkpoint interval. That is an exactly-once effect at the table, not a promise that the network delivered once.

## Self-check


??? Why is the sink part of exactly-once?

The broker can redeliver. Only an idempotent or transactional sink keeps the redelivery from changing the result.
???

??? What is the failure mode if you commit offsets first?

A crash after the commit and before the write drops the record. That is at-most-once.
???
