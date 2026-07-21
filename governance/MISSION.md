# Current Mission

**Mission:** Behavior-Driven E2E Testing Strategy Implementation
**Status:** LOCKED
**ID:** M-021

## References
- `docs/adr/ACP-004-Behavior-Driven-E2E-Testing.md`
- `docs/RetroactiveTestingStrategy.md` (Deprecated)

## Objective
Implement a Behavior-Driven E2E Testing Strategy replacing the deprecated retroactive unit testing approach, ensuring the Validation Engine and Execution Kernel are tested against a real Playwright browser instance using static HTML fixtures.

## Scope
**In Scope:**
- Deprecate and remove mocked unit tests in `execution-kernel` and `workers` that violate the architectural philosophy.
- Setup Playwright E2E test suite in the workspace.
- Create static HTML fixtures for deterministic testing.
- Implement E2E tests validating the integration between `execution-kernel`, `observation-store`, and `validation-engine`.

**Out of Scope:**
- Changes to the core architecture or specs outside of testing concerns.
- Testing the React frontend (`apps/browser-lab`).

## Phase 1 Tasks
- [ ] Task 1: Clean up deprecated mocked tests from M-015 in `execution-kernel` and `workers`.
- [ ] Task 2: Configure Playwright for the E2E testing sandbox.
- [ ] Task 3: Create static HTML fixtures.
- [ ] Task 4: Implement E2E test for Execution Kernel and Validation Engine.
