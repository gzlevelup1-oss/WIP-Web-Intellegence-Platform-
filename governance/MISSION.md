# Current Mission
**Mission:** Coordinator Validation Loop
**Status:** LOCKED
**ID:** M-018

## References
- `docs/adr/ACP-002-Coordinator-Validation-Loop.md`
- `governance/ROADMAP.md` (Phase 4)

## Objective
Connect the Validation Engine to the Coordinator Protocol so the Agent can self-evaluate reconstruction quality.

## Scope
**In Scope:**
- Adding `Validation_evaluate` tool to `packages/coordinator/src/tools.ts`.
- Updating `IWorkerAdapter` or adding `IValidationAdapter` in `packages/coordinator/src/adapter.ts`.
- Handling the tool call in `packages/coordinator/src/agent.ts`.

**Out of Scope:**
- Changes to the Validation Engine internals.
