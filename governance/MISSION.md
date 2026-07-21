# Current Mission

**Mission:** AFR-002 Architecture Conformance Remediation
**Status:** ACTIVE
**ID:** M-020

## References
- `docs/adr/AFR-002-Implementation-Discrepancies.md`
- `docs/adr/CIR-001-Discrepancy-Remediation-Impact.md`

## Objective
Remediate the systemic architectural non-conformances identified between the `specs/` directory and the `packages/` implementations, ensuring the system regains full compliance with the WAKE protocol invariants.

## Scope
**In Scope:**
- Updating `ValidationEngine` threshold values and evidence persistence.
- Refactoring `BrowserRuntime` adapters for correct string array translation and exhaustive metadata.
- Adjusting `ObservationStore` schema for strict discriminated unions.
- Introducing the `Task` hierarchy into `ExecutionKernel`.
- Enforcing RBAC policies in `ExecutionKernel`.
- Rectifying `CoordinatorAgent` to include the mandatory validation loop.

**Out of Scope:**
- Feature enhancements outside of specification bounds.
- UI redesign or web client layout changes.
- Altering core specification schemas without a new AFR/RFC.

## Phase 1 Tasks (Current Focus)
- [ ] Task 1: (AFR-002.6) Validation Thresholds
- [ ] Task 2: (AFR-002.10) Tool Contract Mismatch
