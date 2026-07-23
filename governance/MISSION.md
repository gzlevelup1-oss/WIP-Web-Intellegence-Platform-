# Current Mission

**Mission:** Mission 33: Soft Checkpointing & State Persistence (TD-013)
**Status:** LOCKED
**Evidence Payload:**
- **Functional Verification:** Pending
- **Architectural Verification:** Pending
- **Dependency Graph:** Pending
- **ADR Compliance:** Pending

**ID:** M-33

## References
- ACP-018: Soft Checkpointing & State Persistence
- ARCH-003: Specification vs. Implementation Gaps Report
- EXECUTION_KERNEL.md

## Objective
Implement soft rollback capabilities within the Execution Kernel and Checkpoint Adapter, allowing the Coordinator to non-destructively revert browser state upon transaction failure. This resolves TD-013.

## Scope

**In Scope:**
- Update `ICheckpointAdapter` and `CheckpointData` interfaces.
- Implement soft state restoration (DOM HTML, scroll positions) for Playwright.
- Update `ExecutionKernel.abortTransaction(transaction, soft)` to invoke restoration logic when `soft = true`.
- Update `MANIFEST.yaml`, `DEBT.md`, and `TASKS.md`.

**Out of Scope:**
- Full VM snapshotting/memory dumps (too heavy for this iteration).
