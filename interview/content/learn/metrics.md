---
id: metrics
title: Metrics fundamentals
track: Product sense
level: Core
gap: false
summary: Define the metric before you move it.
---

## Summary

Product-sense rounds in the Meta notes ask how data changes a decision. Bank BI-adjacent work is the same muscle: a metric with a grain, a window, and a decision.

## Key ideas

- **Name, grain, and window.** Daily active accounts is not a sentence until you define active and the timezone.
- **Numerator and denominator.** A rate needs both grains stated.
- **Leading versus lagging.** A lagging metric (losses, churn) confirms. A leading metric (setup completion) moves sooner and lies more often.
- **Guardrail.** The metric you refuse to harm while you move the target (complaint rate, latency, reconciliation breaks).
- **Counter-metric.** If you only reward volume, quality drops. Pick one counter-metric out loud.

## Diagrams and tables

| Piece | Example |
| --- | --- |
| Metric | Share of new accounts with a funded balance on day 7 |
| Grain | One account |
| Guardrail | Fraud loss rate on those accounts |

## Interview angles

- Meta notes: retention for a game, and how you would tell if a feature worked.
- Do not reuse a fabricated personal story. Use a generic product.

## Pitfalls

- A vanity count that always goes up (cumulative signups).
- Two teams with two definitions of active.
- A rate whose denominator quietly changed.

## Say this in the interview

I define the metric as a ratio at a grain, name the window and the timezone, and pair it with a guardrail. I write the SQL grain before I debate whether the number is good.

## Self-check


??? What makes a metric decision-ready?

A definition someone else can recompute, a grain, a window, and a decision it would change.
???

??? What is a guardrail metric?

A metric you monitor so the target cannot be gamed by harming something else.
???
