# Current Mission

**Mission:** Mission 33: Soft Checkpointing & State Persistence (TD-013)
**Status:** LOCKED
**Evidence Payload:**
- **Functional Verification:** Completed (`vitest` unit tests & `playwright` E2E tests passing)
- **Architectural Verification:** Completed (AVP-001 boundary checks verified)
- **Dependency Graph:** Compliant (zero forbidden cross-package imports)
- **ADR Compliance:** Compliant (ADR-002, ADR-005, ADR-007)

**ID:** M-33

## References
- ACP-018: Soft Checkpointing & State Persistence
- ACP-019: Future Mission Lifecycle Gating
- ARCH-003: Specification vs. Implementation Gaps Report
- EXECUTION_KERNEL.md

## Objective
Implement soft rollback capabilities within the Execution Kernel and Checkpoint Adapter, allowing the Coordinator to non-destructively revert browser state upon transaction failure. This resolves TD-013.

## Future Mission Governance
All future missions and capabilities are gated under ACP-019 (Future Mission Lifecycle Gating Protocol) and AVP-001. No un-gated or ad-hoc missions may proceed without an approved ACP, verified Evidence Payload, and explicit user approval.

## Scope

**In Scope:**
- Update `ICheckpointAdapter` and `CheckpointData` interfaces.
- Implement soft state restoration (DOM HTML, scroll positions) for Playwright.
- Update `ExecutionKernel.abortTransaction(transaction, soft)` to invoke restoration logic when `soft = true`.
- Update `MANIFEST.yaml`, `DEBT.md`, and `TASKS.md`.

**Out of Scope:**
- Full VM snapshotting/memory dumps (too heavy for this iteration).
