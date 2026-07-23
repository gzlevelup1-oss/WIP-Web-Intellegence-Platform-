## Mission 33: Soft Checkpointing & State Persistence (TD-013)
*Status: ACTIVE*
- [x] Task 1: Update `MANIFEST.yaml` for Mission 33.
- [x] Task 2: Extend `CheckpointData` interface in `packages/execution-kernel/src/checkpoint.ts` to hold DOM/Scroll state.
- [x] Task 3: Implement `CheckpointAdapter` to capture/restore DOM state via Playwright evaluated scripts.
- [x] Task 4: Update `ExecutionKernel.abortTransaction` to trigger the adapter correctly on `soft=true`.
- [x] Task 5: Verify via `vitest` tests.
- [x] Task 6: Resolve TD-013 in `DEBT.md`.
- [x] Task 7: Lock Mission 33.
