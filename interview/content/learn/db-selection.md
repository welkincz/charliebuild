---
id: db-selection
title: Choosing a database
track: System design
level: Core
gap: false
summary: OLTP, warehouse, lake, and search solve different jobs.
---

## Summary

Picking a database is matching the access pattern. Interviews go badly when every box is the same engine.

## Key ideas

- **OLTP (row store).** Point reads and small transactions: place an order, update a payment. Normalized. Not the analytics scan.
- **Warehouse.** Columnar SQL over large scans and joins. The gold star usually lives here or in a lakehouse table SQL can see.
- **Lake files.** Cheap history and Spark jobs. Not a low-latency API.
- **Key-value or wide column.** A current-state lookup by key: latest location, latest feature. The sourced ride design needs this more than it needs another warehouse table.
- **Search.** Text and flexible filters. Rare in these DE loops unless the product is search.
- **Stream log.** Not a database. It is the inbox.

## Diagrams and tables

| Access | Store |
| --- | --- |
| Point update, transaction | OLTP |
| Scan and join | Warehouse or lakehouse |
| Latest value by id | Key-value |
| Replayable history | Log plus lake |

## Interview angles

- July 2024 notes separate the operational e-commerce model from the analytic queries on it.
- Ride tracking (sourced) needs a current-state store and a history store. One table does both badly.

## Pitfalls

- Running analytic scans on the OLTP primary.
- Using the warehouse as the low-latency location API.
- A lake folder as the system of record for payments without a transaction log.

## Say this in the interview

Orders stay in an OLTP store. CDC or a batch extract feeds the lake. The warehouse serves aggregates. If I need the latest location by id at low latency, that is a key-value row updated by the stream, with the full history in the lake for replay.

## Self-check


??? Why not scan the OLTP database for the dashboard?

Large scans compete with transactions and the schema is normalized for writes, not for the analytic grain.
???

??? What store holds latest-by-key?

A key-value or similar point-lookup store, fed by the stream.
???
