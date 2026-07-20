# ADR-008: Composition Roots

**Status:** Approved
**Owner:** Architecture

## Context
Applications require an entry point to wire together dependencies, instantiate adapters, and bind transport layers. If business logic or domain computation leaks into this layer, the system becomes tightly coupled and hard to test.

## Decision
We formally adopt the Composition Root pattern. A composition root is the only place in the application where concrete implementations are wired together.

## Responsibilities
A composition root MUST handle:
*   Object construction
*   Dependency injection (wiring abstractions to implementations)
*   Transport wiring (e.g., Express routes, HTTP adapters)
*   Application startup and shutdown

## Forbidden Actions
A composition root MUST NOT contain:
*   Business logic
*   Session management
*   Adapter implementations (adapters should be in their respective packages)
*   Domain computation or probabilistic reasoning

## Consequences
- The composition root remains thin and purely structural.
- Packages remain isolated and unaware of their concrete dependencies.
