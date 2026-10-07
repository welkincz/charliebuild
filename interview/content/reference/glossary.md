---
id: glossary
title: Glossary
summary: English terms with the Chinese wording from the notes, where it helps you map back.
---

## Terms

| English | In the notes | Means |
| --- | --- | --- |
| Fact table | 事实表 | Measures at a declared grain |
| Dimension | 维度表 | Descriptive context |
| Grain | 粒度 | What one row means |
| Slowly changing dimension | 缓慢变化维 | How an attribute keeps history |
| Zipper / history table | 拉链表 | Type 2 rows with open and close dates |
| Window function | 窗口函数 | A per-row computation that does not collapse |
| CTE | 公共表表达式 | A named subquery |
| Star schema | 星型模型 | Fact plus denormalized dimensions |
| Snowflake schema | 雪花模型 | Normalized dimensions. Not the product |
| Warehouse | 数仓 | Columnar analytic store |
| Data lake | 数据湖 | Files in object storage |
| Narrow dependency | 窄依赖 | No shuffle |
| Wide dependency | 宽依赖 | Shuffle |
| Medallion | bronze / silver / gold | Raw, conformed, published |

Core is the L4 bar. Stretch is the L5 bar.
