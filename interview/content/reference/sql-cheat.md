---
id: sql-cheat
title: SQL cheat sheet
summary: The patterns worth re-reading the morning of a screen.
---

## Grain first

Say one row per entity before you write. Then:

## Skeletons

```sql
-- latest row
SELECT * FROM (
  SELECT t.*, ROW_NUMBER() OVER (PARTITION BY key ORDER BY ts DESC) AS rn
  FROM t
) x WHERE rn = 1;

-- island / session id
-- flag a break with LAG, then SUM(flag) OVER (PARTITION BY key ORDER BY ts)

-- rate
SELECT 1.0 * SUM(CASE WHEN flag THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) FROM t;
```

## Reminders

| Mistake | Fix |
| --- | --- |
| WHERE on the outer side of a LEFT JOIN | Move it to ON |
| = NULL | IS NULL |
| Window in WHERE | Wrap it |
| UNION by habit | UNION ALL |
| Integer division | Multiply by 1.0 |

## Complexity you can say

A window is a sort inside the partition. A self-join on events is the thing sessionization should avoid.
