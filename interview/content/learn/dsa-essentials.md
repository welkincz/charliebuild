---
id: dsa-essentials
title: DSA essentials for DE
track: Python & DSA
level: Core
gap: false
summary: Hashing, two pointers, intervals, binary search, and a heap.
---

## Summary

You do not need a contest rating for a bank DE screen. You do need the patterns that show up beside SQL: hashing, two pointers, intervals, binary search, and a small heap. Microsoft's notes name the Dutch national flag and merge intervals. Netflix's notes name Meeting Rooms II and First Missing Positive. The sourced Databricks item is binary search plus a verbal round.

## Key ideas

- **Hash map.** Membership and counts in expected O(1) per step. Two-sum is one pass with a map, O(n) time, not O(1).
- **Two pointers.** Sorted arrays, or a read/write pointer for in-place compaction.
- **Intervals.** Sort by start. Merge if the next start is before the current end.
- **Binary search.** On a sorted array, or on the answer (minimum resources). Keep the invariant in a comment.
- **Heap.** Running top-K, or the end-times in a room-scheduling problem.
- **Dutch flag.** Three-way partition with low, mid, and high pointers, one pass, O(n).

## Diagrams and tables

| Pattern | Time | Extra space |
| --- | --- | --- |
| Count with dict | O(n) | O(k) |
| Merge intervals | O(n log n) | O(n) |
| Binary search | O(log n) | O(1) |
| Dutch flag | O(n) | O(1) |

## Interview angles

- Merge intervals is in both the Microsoft notes and the Uber notes. One canonical problem, both companies listed as noted.
- Meeting Rooms II is the heap follow-up: how many overlap, not the merged coverage.
- Binary search is the sourced Databricks prompt.

## Pitfalls

- Calling two-sum O(1). The hash-map solution is O(n) time.
- Binary search with an off-by-one that never moves the bound.
- Sorting intervals by end when the merge proof assumes sort by start.

## Say this in the interview

I sort intervals by start, then walk once, extending the current end when the next start overlaps. That is O(n log n) from the sort. If the question is how many rooms, I keep a min-heap of end times instead of merging.

## Self-check


??? What is the complexity of the hash-map two-sum?

O(n) time and O(n) space. It is not constant time.
???

??? How is Meeting Rooms II different from merge intervals?

Merge builds the union. Rooms II counts the maximum number of overlaps, usually with a heap of end times.
???
