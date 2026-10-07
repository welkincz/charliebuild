---
id: estimation
title: Estimation
track: System design
level: Core
gap: false
summary: Orders of magnitude you can recompute in the room.
---

## Summary

Estimates show you know what drives cost and parallelism. They are not a memory test. Round to powers of ten and name the assumption.

## Key ideas

- **Events.** Users times actions per day. 10 million users times 20 events is 200 million events per day.
- **Size.** Events times row width. 200 million times 1 KB is about 200 GB raw per day, before compression. Columnar compression of 3–10x is a reasonable spoken range for logs if you say it is a range.
- **Storage horizon.** Daily size times retention days. Multiply by replicas only if you, not the cloud service, keep the copies.
- **Peak.** Multiply the average by a peak factor you state (often 2–10 for consumer apps). Batch windows can ignore intra-day peak.
- **Partitions.** Enough to parallelize, not so many that files are tiny. Tie this back to file sizing.
- **Freshness versus volume.** A daily 200 GB batch is a different design from a 200 GB stream with a one-minute watermark.

## Diagrams and tables

| Input | Example you can say |
| --- | --- |
| 1e8 events/day, 500 B | ~50 GB/day raw |
| Keep 400 days | ~20 TB raw before compression |
| Peak 5x | Size ingest for the peak, storage for the average |

## Interview angles

- Petabyte-scale sourced design: say what would have to be true to reach a petabyte (retention, width, or event rate).
- TikTok-style volume in the notes is a reason to avoid self-joins, not a reason to invent a second product.

## Pitfalls

- A petabyte claim with no retention and no event rate behind it.
- Forgetting that aggregates are tiny even when raw data is not. Size the raw and the gold separately.
- Quoting a price. This page is about bytes and time.

## Say this in the interview

I will assume 50 million events a day at about 1 KB, so about 50 GB raw per day. At a year of retention that is on the order of 20 TB raw before compression. Gold aggregates are far smaller. I would partition by day. If those assumptions are off by 10x I still have the same shape, and I would resize compute.

## Self-check


??? What two numbers do you need before a storage estimate?

Event rate and row width, plus how long you keep them.
???

??? Why estimate gold separately?

Aggregates at a declared grain are usually orders of magnitude smaller than the raw log.
???
