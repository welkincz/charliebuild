---
id: investigation
title: Investigating a metric drop
track: Product sense
level: Stretch
gap: false
summary: A structured way to explain a broken number.
---

## Summary

A metric dropped. The interviewer wants a sequence, not a guess. This shows up as a product-sense follow-up and as an on-call story prompt. Keep the story itself private.

## Key ideas

1. **Confirm.** Same definition, same timezone, same filter. Check freshness. A late pipeline looks like a drop.
2. **Localize.** Split by segment, platform, and country. Find where it moved.
3. **Numerator and denominator.** Which one moved? A denominator bug masquerades as growth.
4. **Timeline.** Line the drop up with deploys, tracking changes, and pipeline runs.
5. **Data versus product.** Did events stop arriving, or did user behavior change? Volume and schema checks answer the first.
6. **Decide.** Revert, backfill, or accept a real behavior change. Say how you would know you were right.

## Diagrams and tables

| Observation | First suspect |
| --- | --- |
| Drop to zero in one hour | Pipeline or tracking |
| Drop in one segment | Release or a source feed |
| Rate down, volume flat | Denominator or definition |

## Interview angles

- Use this on Meta-style product rounds and on behavioral prompts about an incident. The prompt list is on the values page. The narrative stays in your private notes.

## Pitfalls

- Starting with a product theory before you check that the job ran.
- Averaging away a segment that fully broke.
- Declaring victory without a check you can recompute tomorrow.

## Say this in the interview

I first check whether the table is fresh and whether the definition changed. Then I split the drop by segment. If only one pipeline's partition is empty, it is data. If the events are present and the rate moved everywhere, I treat it as a product change and name the guardrail.

## Self-check


??? What looks like a metric drop but is a late job?

A fresh-looking chart with an incomplete latest partition. Check max event time and row counts.
???

??? Why split numerator and denominator?

The rate can fall because the denominator grew or because the numerator shrank. The fix is different.
???
