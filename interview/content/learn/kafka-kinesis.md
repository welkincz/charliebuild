---
id: kafka-kinesis
title: Kafka and Kinesis
track: Streaming
level: Core
gap: false
summary: Logs, partitions, and consumer groups.
---

## Summary

Kafka is the log most of these designs mean. Kinesis is the AWS-managed cousin. Autodesk's posting names Kafka. The ride-tracking and trending-dishes designs need a log even when the posting does not.

## Key ideas

- **Topic and partition.** A topic is the stream. A partition is the ordered, append-only shard. Order is guaranteed inside a partition, not across the topic.
- **Key.** Choose the key so related events stay ordered (device id, account id) and so one key does not own the partition.
- **Consumer group.** Each partition is read by one consumer in the group. Adding consumers beyond the partition count does not add parallelism.
- **Offset.** The consumer's position. Committing an offset is how you say the records were handled.
- **Retention.** The log keeps data for a time or a size, independent of whether you consumed it. That is what makes replay possible.
- **Kinesis.** Shards instead of partitions, sequence numbers instead of offsets. Same design conversation.

## Diagrams and tables

| Concept | Kafka | Kinesis |
| --- | --- | --- |
| Shard | Partition | Shard |
| Position | Offset | Sequence number |
| Order | Per partition | Per shard |

## Interview angles

- Uber trending dishes: a log in front of a sliding window.
- Sourced ride tracking: a stream of locations keyed by ride or driver.
- Do not invent a bank Kafka question. Autodesk lists Kafka on the posting only.

## Pitfalls

- Keying by a constant, so one partition does all the work.
- Assuming global order.
- Committing the offset before the sink write succeeds.

## Say this in the interview

I key location events by ride id so one ride stays ordered on one partition. I set the partition count for the parallel consumers I actually need. The consumer writes the sink, then commits the offset. I can replay a day because the log retains the raw events.

## Self-check


??? Where does Kafka guarantee order?

Inside a single partition, for a given key if producers are well behaved.
???

??? Why doesn't a 50th consumer speed up a 32-partition topic?

A partition has one consumer in the group. Extra consumers sit idle.
???
