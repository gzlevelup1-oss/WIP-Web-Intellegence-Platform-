Reference: docs/rfc/RFC-001.md
# ADR-005: Execution Kernel

**Status:** Approved

## Context
The Coordinator Agent communicates with the deterministic tool suite. Previously, the architecture lacked a distinct layer defining execution semantics, leading to potential orchestration drift across different runtimes (e.g., local, remote, mobile). 

## Decision
We will insert an **Execution Kernel** between the Coordinator Protocol and the Browser Runtime. The Execution Kernel acts as the "operating system for WIP." It owns mission execution, transactions, permissions, scheduling, retries, cancellation, checkpointing, event ordering, concurrency, and execution policies. 

## Rationale
- **Stability:** The Coordinator only talks to the Kernel, while the Kernel dispatches to any underlying Runtime (Local, Remote, Android, iOS).
- **Separation of Concerns:** The Browser Runtime remains purely deterministic (Launch, Click, Scroll, DOM, CSS) and knows nothing about "Missions" or "Transactions."
- **Standardization:** Resolves orchestration responsibilities so runtimes don't have to reimplement them.

## Consequences
- Requires building a new architectural layer specifying Kernel semantics (Mission 5).
- Re-scopes the Browser Runtime to be dumber, focusing purely on deterministic browser control and observation.
- Re-scopes the Session Manager (ADR-003) as a subsystem managed by the Kernel.
