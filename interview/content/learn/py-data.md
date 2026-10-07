---
id: py-data
title: Python for data screens
track: Python & DSA
level: Core
gap: false
summary: Dicts, lists, strings, and business-shaped functions.
---

## Summary

Meta's notes describe Python as lists, dicts, strings, and classes, not contest DP. Amazon's July 2024 notes are the same family: most frequent word, most frequent element, even-number sum, character counts. Write the function, name the complexity, and test the empty input out loud.

## Key ideas

- **Dict for counts.** One pass, O(n) time, O(k) space for k distinct keys.
- **Dedupe then count.** The bookstore review notes want duplicates removed inside each location before the global count.
- **Digits.** Convert to a string or use div/mod. Watch the sign. The odd-digit notes want a non-negative result built only from odd digits.
- **Files.** Do not read a giant file into one string if the question says the file is large. Stream lines.
- **Classes.** Only when the prompt has two operations that share state. Otherwise a function is clearer.

## Diagrams and tables

| Structure | Duplicates? | Order? | Typical use |
| --- | --- | --- | --- |
| list | Yes | Yes | Rows, windows |
| dict | Keys no | Insertion in modern Python | Counts, lookup |
| set | No | No | Membership |

## Interview angles

- Most common comment across stores (Meta notes, several dates, one canonical problem).
- Smallest non-negative number from odd digits (Meta notes).
- Workshops over two consecutive years (Meta notes).
- Average length of lists, and binary search, on a Meta phone note.

## Pitfalls

- Using a list scan inside a loop when a dict would be linear.
- Forgetting that `most frequent` needs a tie rule. The notes say return any.
- Mutating the input list while iterating it.

## Say this in the interview

I count with a dictionary in one pass. If each location must dedupe first, I put a set inside the location and then count the sets. Time is linear in the number of reviews. I state the tie rule.

## Self-check


??? When is a dict the wrong tool?

When you need sorted order of all keys on every insert and n is large. Then a heap or a sort at the end is clearer. Counting is still a dict.
???

??? What is the empty-input result for a frequency function?

State it. Usually None or an empty result, not an exception, unless the prompt says otherwise.
???
