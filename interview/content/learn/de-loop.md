---
id: de-loop
title: The DE interview loop
track: Orientation
level: Core
gap: false
summary: Meta is the primary loop in the notes. Amazon is second. Banks are a safety net, not the study order.
---

## Summary

A data engineering loop is a sequence of screens that test different skills. In these notes, Meta is the primary loop: 14 dated write-ups of a recruiter, a SQL-plus-Python phone screen, and an onsite that usually includes SQL/ETL, modeling, product sense, and ownership. The write-ups do not all match. One Jun 3 note adds a real-time pipeline. One Aug 26 note says window functions were disallowed. The sourced report file has no Meta timeline, so those write-ups are not asked-at counts. Amazon is second. The July 2024 notes map six rounds, including a leadership-principles round. Use STAR templates only. The Oct 7 2026 Toronto snapshot is a volume note, not this order: Amazon had one early-career DE posting and two BIE roles; Google and Microsoft had no DE-titled openings; the snapshot did not find an open Toronto DE req for Meta. Google, Microsoft, and Uber are reference loops from the notes. Autodesk is live L5 practice from real Toronto openings. TD, RBC, BMO, and Scotiabank/Tangerine stay as a safety group built from posting requirements.

## Key ideas

- **Phone screen.** SQL under time pressure, a short Python task, sometimes a modeling sketch. Meta notes split about 60 minutes between SQL and Python.
- **Modeling round.** Grain, facts (事实表), dimensions (维度表), and trade-offs. Amazon's notes put a full e-commerce model in round 3. One Meta note names a classroom-style product and does not list tables.
- **Pipeline / systems round.** Ingestion, storage format, orchestration, failure, and backfill. One Meta note asks for a real-time pipeline. That is one write-up. Bank postings ask for Spark, Databricks, and CI/CD without listing questions.
- **Behavioral.** STAR prompts only. Amazon's notes name leadership principles in a separate round. Write your own stories locally. This site does not store them.
- **Depth varies by company.** Uber's notes are mostly coding (DP, intervals, graphs) plus one design. Microsoft's notes add Spark internals and pipeline CI/CD. Google's notes, in this set, are one PySpark exercise.

## Diagrams and tables

| Loop piece | Meta (from notes) | Amazon (from notes) | Banks (safety, from postings) |
| --- | --- | --- | --- |
| SQL | Joins, percentages, bookstore schema | Windows, CTEs, subqueries | Every TD modeling posting; RBC SQL |
| Modeling | Relational app schema; classroom product named without tables | Fact/dimension and 1NF–3NF | Called out on TD and Tangerine |
| Pipeline | One note: real-time streaming | ETL vs ELT, large CSV landing | Databricks, Azure, Snowflake on the posting |
| Behavioral | Ownership round | Leadership principles, separate round | Not described in postings |

## Interview angles

- Interviewers score whether you clarify grain and freshness before you write SQL.
- They score whether you can define a metric and a guardrail before you propose a cut.
- Bar-raiser style rounds score judgment, not a second technical solution.

## Pitfalls

- Treating the Oct 7 2026 snapshot as the study order. Meta is primary because the notes document 14 loops, not because a Toronto listing was open.
- Inventing a schema the notes do not contain. A classroom product is named once, without tables.
- Inventing bank interview questions. The bank pages cite posting requirements only.

## Say this in the interview

I separate the screen into SQL fluency, modeling grain, a metric definition, pipeline failure behavior, and a behavioral example I can tell without reading a script. I ask which of those this round is scoring before I dive in.

## Self-check


??? Why is Meta the primary loop if the Toronto snapshot found no open DE req?

The notes have 14 dated write-ups of that loop. The Oct 7 2026 snapshot is a volume note. The sourced report file has no Meta timeline, so those write-ups are not asked-at counts.
???

??? Why is Amazon still second?

The July 2024 notes map six rounds, including leadership principles. The snapshot that day was one early-career DE posting and two BIE roles. That volume does not remove the round map.
???

??? What do the four bank postings share?

SQL, data modeling, Spark or Databricks, and CI/CD. Azure shows up at TD, BMO, and Scotiabank; RBC also lists Snowflake and AWS. Those pages are the safety group.
???
