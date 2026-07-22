# Current Mission

**Mission:** NIH Custom Logic Replacement
**Status:** LOCKED
**Evidence Payload:**
- **Functional Verification:** Complete
- **Architectural Verification:** Complete
- **Dependency Graph:** Complete
- **ADR Compliance:** Complete

**ID:** M-026

## References
- `governance/proposals/ACP-011_NIH_Refactoring.md`
- `governance/DEBT.md`

## Objective
To replace naive, custom-built logic implementations with robust standard libraries (`graphology`, `jsondiffpatch`, `p-retry`, `p-queue`, and native `@google/genai` function calling), removing technical debt and conforming strictly to existing Architectural Decision Records (ADRs).

## Scope
**In Scope:**
- Re-architecting `MemoryObservationStore` to use `graphology`.
- Replacing TED in `validation-engine` with `jsondiffpatch`.
- Replacing the retry/scheduling loop in `execution-kernel` with `p-retry` and `p-queue`.
- Refactoring `coordinator` to utilize `@google/genai` tool schemas instead of raw string parsing.

**Out of Scope:**
- Replacing existing UI/UX elements.
- Defining new backend capabilities outside the current architecture constraints.
