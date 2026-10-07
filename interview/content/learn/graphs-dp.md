---
id: graphs-dp
title: Graphs and DP basics
track: Python & DSA
level: Stretch
gap: false
summary: The stretch coding that reference loops actually name.
---

## Summary

Graphs and dynamic programming are Stretch. They are thin in bank postings and thick in the Uber, TikTok, and Netflix notes. Learn four ideas well enough to code slowly and correctly.

## Key ideas

- **Grid DP.** Min path sum: each cell is the cell value plus the cheaper of top or left. O(rows * cols).
- **Topo sort.** Course Schedule: edges are prerequisites. Kahn's algorithm (indegree queue) or DFS colors. A cycle means impossible.
- **Sequence DP.** Decode-style strings: ways to reach index i from i-1 and i-2, modulo a prime if the prompt says so.
- **State plus resource.** Jump-with-energy in the TikTok notes is a graph search with state (index, energy), pruned so you do not revisit a worse energy at the same index.
- **Strictly increasing array by only adding.** The greedy fix (lift a[i] to a[i-1]+1) matches the variant that only allows increases. Say that. If decreases were allowed, greedy is not enough.

## Diagrams and tables

| Problem in the notes | Idea |
| --- | --- |
| Min path sum (Uber) | Grid DP |
| Course Schedule (Uber) | Cycle check, topo |
| First missing positive (Netflix) | In-place index hash, O(n) time, O(1) extra |
| Strict increase (TikTok) | Greedy lifts, if only increases are allowed |

## Interview angles

- Uber's notes: min path sum on the screen, course schedule on the final coding round.
- TikTok's notes: CodeSignal-style DP and graphs, plus the three named problems above.
- Netflix's notes: first missing positive under an O(1) extra space constraint.

## Pitfalls

- Recursion without a memo on an overlapping grid.
- Forgetting the cycle case on course schedule.
- Using a set for first missing positive when the prompt demands constant extra memory. A set is the Core answer. The Stretch answer swaps values into index slots.

## Say this in the interview

For course schedule I build indegrees and a queue of nodes with indegree zero. Each time I pop a node I reduce its neighbors. If I visit fewer nodes than the course count, there is a cycle.

## Self-check


??? What does a leftover node mean in Kahn's algorithm?

Its indegree never hit zero, so it sits on a cycle. The schedule is impossible.
???

??? Why is a hash set rejected for first missing positive?

The usual constraint is O(1) extra space. The index-as-hash swap meets that. A set is O(n) extra.
???
