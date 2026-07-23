# ACP-018: Soft Checkpointing & State Persistence (TD-013)

**Status:** Approved
**Owner:** Architecture
**Date:** 2026-07-23

## 1. Context and Motivation
Per ARCH-003 and TD-013, the `EXECUTION_KERNEL.md` architecture specifies a rollback capability through the `CheckpointAdapter`. Specifically, it outlines `ExecutionKernel.abortTransaction(transaction, soft = false)`, where a `soft=true` abort should silently revert execution without destroying the session entirely (e.g., reverting to a previous DOM state before a specific click).

Currently, the Execution Kernel only implements hard aborts; `soft` parameter is passed but does not interact correctly with the `CheckpointAdapter` to rewind browser state effectively.

## 2. Technical Design

### 2.1 Extending the CheckpointAdapter
The `ICheckpointAdapter` interface must define how state is actually serialized and restored.
- **Save State:** Capture current HTML, inline styles, and scroll positions.
- **Restore State:** Given a previously saved state object, re-hydrate the browser tab's `document.documentElement.innerHTML` and window scroll positions, effectively "rewinding" the page visually.

### 2.2 Soft Abort in Execution Kernel
Modify `ExecutionKernel.abortTransaction(transaction, soft: boolean)`:
- If `soft = true`, the kernel retrieves the checkpoint captured at `beginTransaction` and invokes `checkpointAdapter.restoreCheckpoint(sessionId, checkpoint)`.
- It sets the transaction state to `REVERTED` instead of closing the browser session context, allowing the Coordinator to try an alternative path.

## 3. Impact Analysis
- **Execution Kernel:** Modifies state handling. Allows non-fatal failure recovery during Coordinator exploration.
- **Playwright Adapter:** May need to implement the actual logic behind `createCheckpoint` and `restoreCheckpoint`.

## 4. Required Actions
1. Approve this ACP.
2. Initialize Mission 33 in `MISSION.md` and `TASKS.md`.
3. Implement DOM state serialization and re-hydration in `packages/execution-kernel/src/checkpoint.ts`.
4. Update `ExecutionKernel` to handle soft rollbacks effectively.
