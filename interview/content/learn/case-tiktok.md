---
id: case-tiktok
title: Case: event-scale analytics
track: System design
level: Stretch
gap: false
summary: Sessionization and retention at high event volume.
---

## Summary

The TikTok notes emphasize event-scale SQL: sessionization and retention. The design version is how you compute those metrics without a self-join on the raw log.

## Key ideas

- **Sessionization.** A session breaks when the gap exceeds a threshold (the notes use 30 minutes). The SQL pattern is LAG plus a running sum. At this scale you do it in a distributed engine, partitioned by user.
- **Retention.** A cohort is a set of users with a first event on a day. Day-7 retention is the share who have an event on day 7. Precompute the cohort and the active-day table. Do not join raw clicks to raw clicks.
- **Storage.** Raw events in a partitioned lake. Gold is user-day and cohort-day, which are much smaller.
- **Skew.** A bot user or a huge account. Cap or isolate keys that are not human behavior, and say you are doing it.
- **Privacy.** Identifiers are restricted. Metrics are aggregated. See the governance page.

## Diagrams and tables

| Table | Grain |
| --- | --- |
| Raw event | One action |
| Session | User, session id |
| User-day | User, date |
| Cohort retention | Cohort date, day offset |

## Interview angles

- The notes also name hard DP and graph screens. Those are on the graphs page, not in this design.
- This is a reference loop. The snapshot did not show a Toronto DE req for this company.

## Pitfalls

- A self-join of the click table to find a 30-minute gap.
- Retention defined differently in the dashboard and the experiment.
- A gold table at event grain that is as big as bronze.

## Say this in the interview

I partition events by user and event date. Sessions are a window function inside the user, not a self-join. Retention reads a user-day table. I publish the definition of a session and of an active user next to the metric.

## Self-check


??? Why is a self-join the wrong sessionization?

It is quadratic in spirit and shuffles far more than a partitioned window scan.
???

??? What is the grain of a retention table?

One row per cohort and day offset, with users and retained users as measures.
???
