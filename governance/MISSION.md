# Current Mission
**Mission:** Retroactive Testing Implementation
**Status:** LOCKED
**ID:** M-015

## References
- `AGENTS.md` (Section 11: Testing Constitution)
- `docs/RetroactiveTestingStrategy.md`
- `governance/DEBT.md` (TD-003)

## Objective
Address the violation of the Testing Constitution by backfilling unit and integration tests for the `workers`, `execution-kernel`, and `coordinator` packages. Ensure all core components have a determinable, tested state.

## Scope
**In Scope:**
- Configuring `vitest` for all workspace packages.
- Writing unit tests for `packages/workers`.
- Writing unit tests for `packages/execution-kernel`.
- Writing unit tests for `packages/coordinator`.

**Out of Scope:**
- End-to-end (E2E) browser testing (Playwright tests against real browsers are deferred).
- Changes to existing architectural behavior.

## Next Steps
- Obtain user approval for the Retroactive Testing Strategy (`docs/RetroactiveTestingStrategy.md`) and Mission 15 definition.
