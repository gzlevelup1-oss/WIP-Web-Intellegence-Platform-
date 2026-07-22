# ACP-011: NIH Custom Logic Replacement

**Status:** Approved
**Owner:** Architecture
**Date:** 2026-07-22

## Context
An architectural review revealed "Not Invented Here" (NIH) syndrome across several core packages. The team previously maintained custom, naive implementations for complex domains (Tree Edit Distance, Exponential Backoff, Graph Traversal, ReAct parsing) that are natively solved by robust, battle-tested libraries.

## Decision
We will systematically rip out these fragile custom implementations and replace them with standard NPM packages to reduce technical debt, improve reliability, and adhere more strictly to our ADRs.

- **Observation Store:** Replace custom Array-based `MemoryObservationStore` with `graphology` for robust property graph querying (ADR-001).
- **Validation Engine:** Replace custom Tree Edit Distance (TED) algorithm with `jsondiffpatch` for deep JSON graph comparisons (ADR-004).
- **Execution Kernel:** Replace custom `while` loop exponential backoff with `p-retry` and `p-queue` for deterministic task scheduling (ADR-005).
- **Coordinator:** Replace custom string-parsing ReAct loop with `@google/genai` native tool calling (ADR-006). Vercel AI SDK is explicitly excluded.

## Consequences
- Deletion of hundreds of lines of untested, fragile custom logic.
- Standardized, mathematical adherence to graph querying and scheduling constraints.
- Introduction of new NPM dependencies (`graphology`, `jsondiffpatch`, `p-retry`, `p-queue`).
