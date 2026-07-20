# ADR-007: Execution Kernel and Playwright Decoupling

**Status:** Approved
**Related:** ADR-002, ADR-005, ACP-003

## Context
During the initial implementation of the Execution Kernel (ADR-005), a boundary violation occurred: the Execution Kernel (`@wip/execution-kernel`) directly depended on `playwright` types (`BrowserContext`, `Page`) to implement its CheckpointManager. Additionally, the composition root (`apps/browser-lab/server.ts`) bypassed the abstraction layer by casting the adapter to `any` to extract internal Playwright context (`_getInternalContext`).

This violated:
1. **Dependency Inversion:** Execution Kernel should not depend on concrete implementation details like Playwright.
2. **Encapsulation:** The Browser Runtime abstraction was leaked and bypassed.
3. **Ownership:** Playwright concepts belong exclusively to `@wip/browser-runtime` (ADR-002).

## Decision
1. **Remove Playwright Dependency:** We removed all references to `playwright` from `@wip/execution-kernel`.
2. **Introduce Checkpoint Abstraction:** We created an `ICheckpointAdapter` interface within the Execution Kernel to handle checkpoint operations (`createCheckpoint`, `restoreCheckpoint`).
3. **Augment Browser Runtime:** `IBrowserRuntime` and its adapters (e.g., `PlaywrightAdapter`) implement the checkpointing capabilities and map them to underlying browser actions.
4. **Clean Composition Root:** The composition root now wires the `ExecutionKernel` to use the `IBrowserRuntime` for checkpoint operations without any internal casting.

## Rationale
- Restores the dependency direction: `ExecutionKernel` -> `ICheckpointAdapter` <- `BrowserRuntime` -> `Playwright`.
- Playwright is fully isolated within `@wip/browser-runtime`.
- Prevents architectural drift and ensures the Execution Kernel focuses strictly on execution semantics rather than browser automation specifics.

## Consequences
- The public `IBrowserRuntime` interface now exposes `createCheckpoint` and `restoreCheckpoint`.
- **Deferred Decision (Future ADR):** Review whether checkpoint management should remain part of the `IBrowserRuntime` public façade or become an internal capability exposed solely through `ICheckpointAdapter`. While treating checkpoints as a snapshot of browser state is valid, an alternative is keeping checkpoint operations behind the dedicated `ICheckpointAdapter` abstraction to make the public API smaller and more focused. This will be revisited if experience shows it should be refined.
