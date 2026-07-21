# Current Mission

**Mission:** Real-World E2E Test Fixtures Integration
**Status:** LOCKED
**ID:** M-022

## References
- User requirement (July 21)
- `docs/adr/ACP-004-Behavior-Driven-E2E-Testing.md`

## Objective
Integrate real-world open source HTML repositories as static fixtures in the E2E test suite to ensure the system is battle-tested against large-scale, complex DOM structures.

## Scope
**In Scope:**
- Clone specified open-source HTML repositories (anon-ecommerce-website, vast, glowing, gamics).
- Integrate them into `packages/e2e-tests/tests/fixtures/real-world`.
- Implement parameterized Playwright E2E tests to load these complex fixtures and extract their Observation Graphs, validating that the extraction process works without crashing.

**Out of Scope:**
- Architectural changes to the core system.
- Modifying the external repository contents (except for required paths/linking fixes if necessary for local file:// loading, though we should ideally just test as-is).

## Phase 1 Tasks
- [ ] Task 1: Copy cloned repositories into the E2E fixtures directory.
- [ ] Task 2: Create parameterized E2E tests iterating over the index.html of each real-world fixture.
- [ ] Task 3: Verify Observation Graph extraction on these large fixtures.
