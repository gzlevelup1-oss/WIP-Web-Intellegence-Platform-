Reference: docs/rfc/RFC-001.md
# ADR-003: Session Manager

**Status:** Approved

## Context
The Coordinator Agent explores websites iteratively, requiring state preservation across interactions (cookies, local storage, history).

## Decision
We will implement a **Session Manager** to track, isolate, and control the lifecycle of the Browser Runtime. It will manage memory, handle timeouts, and prevent the agent from rediscovering the same information repeatedly.

## Rationale
- Ensures clean, reproducible test environments.
- Allows the agent to build long-term memory across pages on the same domain.
- Prevents resource leaks from unclosed browser instances.

## Consequences
- Requires stateful infrastructure.
- Limits parallelization for a single linear session, though multiple isolated sessions can be run concurrently.
