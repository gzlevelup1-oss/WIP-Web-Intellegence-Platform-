# Current Mission

**Mission:** E2E Test Maturation & Gap Closing
**Status:** LOCKED

**Evidence Payload:**
- **Functional Verification:** `npm run test --workspaces` fully passes (14 tests in `browser-runtime`, 4 tests in `coordinator`, 5 E2E tests via Playwright, 8 tests in `observation-store`, 16 tests in `validation-engine`). E2E `real-world.test.ts` executes and snapshots cleanly.
- **Architectural Verification:** `PlaywrightAdapter.ts` updated correctly handling interactions using `force:true` and proper timeout strategies, stabilizing tests without leaking Playwright `Page` types.
- **Dependency Graph:** Unchanged. Forbidden dependencies verified via `grep`. Playwright is isolated exclusively to `browser-runtime` and `e2e-tests`.
- **ADR Compliance:** AVP-001 checks passed successfully.
**ID:** M-023

## References
- User requirement (July 21)
- `docs/adr/ACP-005-E2E-Test-Maturation.md`

## Objective
Implement Golden Master snapshot testing, expand capability coverage, and validate interactivity in the Real-World E2E Test Fixtures to close existing testing gaps and prove determinism.

## Scope
**In Scope:**
- Golden Master snapshot comparisons for real-world fixtures.
- Expanding capability extraction levels in E2E tests (including visual bounding boxes, accessibility trees).
- Interactive E2E flows to validate state transitions and delta validation.

**Out of Scope:**
- Implementing new core capabilities in the extraction engine (we are only testing existing ones, though bug fixes during testing are expected).

## Phase 1 Tasks
- [x] Task 1: Expand capability coverage in `real-world.test.ts` (levels 0, 1, 2) and assert accurate mappings.
- [x] Task 2: Implement Golden Master snapshot testing for the ObservationGraph, removing non-deterministic fields.
- [x] Task 3: Implement interactive validation (e.g. clicking a button in `anon-ecommerce-website` and diffing graph/visuals).
