---
title: "When one recipient goes quiet"
date: "2026-09-16"
sample: true
excerpt: "A message can reach two people while a third is offline. Following the branches reveals why delivery needs more than a single sent flag."
---

# When one recipient goes quiet

Send one message to three people. Two are connected. The third has stepped into a lift and lost reception.

Should everyone wait?

This sample essay explores independent delivery paths using a hypothetical messaging system. The moving dots in the illustration follow the two available branches. The quiet branch still has work waiting for it.

## “Sent” hides several different events

A client can hand a message to a server without the server storing it. A server can store it without delivering it. A device can receive it without its owner reading it.

Those distinctions matter when something fails. If the interface says “sent” before durable storage, a server crash can erase a message the sender thought was safe. If “delivered” really means “queued,” the interface is promising more than the system knows.

Use statuses that correspond to evidence. Accepted, stored, dispatched, acknowledged and read are different events. A small product might not expose all of them, but its implementation should know which one it is recording.

## Follow the branches separately

Once a message has been accepted, track the work needed for each recipient. Recipient A can acknowledge it while B remains offline and C receives it a moment later.

An independent path means B’s temporary failure does not have to block A and C. It does not mean delivery has no dependencies: all three may still share storage, a queue or a network service. A failure in that shared infrastructure can affect every branch.

The important change is in the unit of progress. Instead of asking only whether the whole message was sent, ask what is known about each intended delivery.

## Retries create a second problem

Suppose a device receives a message and sends an acknowledgement. The connection drops before the server sees that acknowledgement. From the server’s perspective, delivery is uncertain. Trying again is reasonable.

Now the device might receive the same message twice.

A stable message identifier lets the receiver recognise that repetition. Depending on the operation, it can ignore the duplicate, return the earlier result or update an existing record. Deduplication needs a defined scope and retention period; remembering every identifier forever is not always practical.

Retries also need pacing. Backoff with jitter can prevent many disconnected clients from retrying in lockstep. A bounded retry policy or a separate failure queue gives persistent failures somewhere visible to go.

## Ordering is a separate promise

Independent delivery can improve isolation, but it complicates ordering. If message two takes a faster path than message one, it may arrive first.

Decide where order matters. A chat conversation might need an ordering key within that conversation. A notification feed may tolerate out-of-order arrival. Trying to enforce one global order across unrelated work often adds coordination without improving the user’s experience.

The useful design question is specific: which messages must this recipient observe in sequence, and what should happen when an earlier one is delayed?

## Make uncertainty visible

The sketch below lets you take B offline and send a sample message. A and C can finish while B waits. It runs locally and illustrates the states; it does not contact a messaging service.

In a real system, an acknowledgement, retry count and last-attempt timestamp are more useful than an optimistic animation. They give both the interface and the operator something honest to report.

A good delivery system keeps moving where it can, remembers what remains and avoids confusing an attempt with a result.

## Keep exploring

- [AWS Builders’ Library: timeouts, retries and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [Microservices patterns: transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html)
- [One sale. Three records. One promise.](/blogs/one-sale-three-records) — where durable work begins.
