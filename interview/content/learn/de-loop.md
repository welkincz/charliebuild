---
id: de-loop
title: The DE interview loop
track: Orientation
level: Core
gap: false
summary: What a data engineering loop actually scores, and how bank screens differ from the Amazon benchmark.
---

## Summary

A data engineering loop is a sequence of screens that test different skills. Toronto bank postings cluster on SQL, dimensional modeling, Spark or Databricks, and CI/CD. The notes' most complete loop map is Amazon's July 2024 six-round outline, which is the mock benchmark even though Toronto has few DE openings. Reference loops (Meta, Microsoft, Uber, Netflix, TikTok, Google) show what else shows up once you leave the banks.

## Key ideas

- **Phone screen.** SQL under time pressure, a short Python task, sometimes a modeling sketch.
- **Modeling round.** Grain, facts (事实表), dimensions (维度表), and trade-offs. Amazon's notes put a full e-commerce model in round 3.
- **Pipeline / systems round.** Ingestion, storage format, orchestration, failure, and backfill. Banks ask this through Spark, Databricks, and CI/CD requirements on the posting.
- **Behavioral.** STAR prompts only. Write your own stories locally. This site does not store them.
- **Depth varies by company.** Meta screens in the notes are 60 minutes of SQL plus Python. Uber's notes are mostly coding (DP, intervals, graphs) plus one design. Microsoft's notes add Spark internals and pipeline CI/CD.

## Diagrams and tables

| Loop piece | Banks (from postings) | Amazon (from notes) | Meta (from notes) |
| --- | --- | --- | --- |
| SQL | Every TD modeling posting; RBC SQL | Windows, CTEs, subqueries | Joins, percentages, bookstore schema |
| Modeling | Called out on TD and Tangerine | Fact/dimension and 1NF–3NF | Relational app schema |
| Spark / warehouse | Databricks, Azure, Snowflake | ETL vs ELT, large CSV landing | Less central on the reported screens |
| Behavioral | Not described in postings | Leadership principles, separate round | Ownership round |

## Interview angles

- Interviewers score whether you clarify grain and freshness before you write SQL.
- They score whether you can narrate a pipeline: land, clean, model, serve, and how a rerun behaves.
- Bar-raiser style rounds score judgment, not a second technical solution.

## Pitfalls

- Treating every company like a LeetCode contest. Bank postings do not describe CodeSignal-style DP screens.
- Treating the Amazon loop as a Toronto volume ranking. It is the benchmark because the notes document it, not because Toronto listings are full of it.
- Inventing bank interview questions. The bank pages cite posting requirements only.

## Say this in the interview

I separate the screen into SQL fluency, modeling grain, pipeline failure behavior, and a behavioral example I can tell without reading a script. I ask which of those this round is scoring before I dive in.

## Self-check


??? Why is Amazon the mock benchmark if Toronto volume is low?

The July 2024 notes map six rounds with concrete prompt types. Bank postings do not include reported questions, so the standardized loop is the one you can rehearse end to end.
???

??? What do the four bank postings share?

SQL, data modeling, Spark or Databricks, and CI/CD. Azure shows up at TD, BMO, and Scotiabank; RBC also lists Snowflake and AWS.
???
