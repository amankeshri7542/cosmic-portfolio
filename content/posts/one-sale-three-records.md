---
title: "One sale. Three records. One promise."
date: "2026-09-17"
sample: true
excerpt: "An invoice, a stock count and a customer ledger should agree. A visual explanation of the small boundary that keeps them together."
---

# One sale. Three records. One promise.

A customer buys the last bag of cement. The invoice says it is sold. The stock screen says there is still one left. The customer ledger has no record of the purchase.

Each screen looks plausible on its own. Together, they describe three different shops.

This sample essay follows a hypothetical sale through a database transaction. It assumes you know what a database row is; the interesting part is deciding which rows must agree.

## Draw the boundary before writing the query

For this sale, three changes belong together: create the invoice, decrease the available stock and record the customer’s charge. A transaction groups those changes into one unit that can commit or roll back.

Atomicity is the promise that the transaction’s database changes take effect together or not at all. It does not mean the operations happen at the same instant inside the database. They can take several steps. The boundary determines whether their combined result becomes a committed result.

The illustration above places three records inside one boundary. The ticks are a visual shorthand for committing the group, not three independent save buttons.

## The useful question is “what must remain true?”

Start with rules that you can check. An invoice needs a valid customer. A sale of two units must not leave stock below zero. A retry must not create a second invoice for the same operation.

Different rules need different mechanisms. A foreign key can enforce a relationship. A uniqueness constraint can reject a duplicate operation identifier. A conditional update, an appropriate lock or a suitable isolation level can help coordinate competing changes to stock.

A transaction is the boundary around these mechanisms. It does not replace them.

## The last bag is a concurrency problem

Imagine two cashiers both reading “one bag available.” Both decide the sale is valid. Putting each sale inside its own transaction is not enough if the implementation still permits both decisions to succeed.

The check and the change need to cooperate under concurrent access. One approach is an update that decreases stock only when enough remains, followed by checking whether a row was actually updated. Another is to lock the relevant row while deciding. The right choice depends on the database and the rest of the workflow.

The result to protect is concrete: only one cashier should be able to sell that last bag. The other needs an understandable failure, with no half-created invoice left behind.

## Keep the slow world outside

A receipt printer can jam. Email can time out. A payment provider can respond after the customer has closed the tab. Those actions do not automatically roll back with a local database transaction.

Keep the database transaction short. If an external notification must follow a committed sale, an outbox record can be stored alongside the sale. A separate worker reads that record and attempts delivery afterward.

That introduces another responsibility: workers can retry, so the receiving action must tolerate duplicates where possible. “Committed in the database” and “delivered to the customer” deserve separate statuses.

## A small failure drill

Try interrupting a test transaction after each step. Check the invoice, stock and ledger afterward. Then run two competing sales against the last item. Finally, repeat the same sale request with the same operation identifier.

These checks reveal more than a screenshot of the happy path. They ask whether the system keeps its promise when timing becomes inconvenient.

A well-chosen boundary is modest. It protects the facts that must agree and leaves slow, independent work outside. That is often where reliable business software starts.

## Keep exploring

- [PostgreSQL: transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL: transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [When one recipient goes quiet](/blogs/when-a-recipient-goes-offline) — following work beyond the database boundary.
