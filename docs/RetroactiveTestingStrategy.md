# Technical Design: Retroactive Testing Strategy
**Mission:** M-015
**Status:** LOCKED
**Owner:** Engineering

## 1. Overview
In accordance with the Engineering Constitution (Section 11: Testing Constitution), this strategy addresses the technical debt (TD-003) where previous packages (`execution-kernel`, `workers`, `coordinator`) were completed without formal testing. This mission will retroactively implement the required unit and integration tests using `vitest` across these packages to ensure compliance and prevent future regressions.

## 2. Testing Strategy
- **Unit Tests:** 
  - `packages/workers`: Test each deterministic worker (`miner.ts`, `tokens.ts`, `layout.ts`) with mock Observation Graph payloads.
  - `packages/execution-kernel`: Test transaction wrapping, locking, and basic execution flow using a mock browser adapter.
  - `packages/coordinator`: Test the tool registry schemas, the adapter interface, and the ReAct loop logic (mocking the LLM provider if necessary).
- **Integration Tests:** 
  - Verify that the `apps/browser-lab` API endpoints correctly invoke the workers and the coordinator.
- **Validation Criteria:** 
  - All retrofitted packages must have passing `vitest` test suites.
  - `npm run test --workspaces` must execute tests across all workspace packages seamlessly.
- **Success Metrics:**
  - 100% of defined critical paths for `workers`, `execution-kernel`, and `coordinator` covered by tests.
  - Zero failing tests in the CI loop.

## 3. Implementation Steps
1. Add `vitest` as a dev dependency to the root and configure workspace testing.
2. Backfill tests in `packages/workers/src/__tests__/`.
3. Backfill tests in `packages/execution-kernel/src/__tests__/`.
4. Backfill tests in `packages/coordinator/src/__tests__/`.
5. Run tests locally and verify all green.
