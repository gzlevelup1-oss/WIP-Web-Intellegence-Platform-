# ACP-004: Coordinator Validation Loop
**Status:** APPROVED
**Author:** AI Implementor
**Date:** 2026-07-20

## 1. Context and Problem Statement
Phase 4 of the WIP Roadmap defines the Validation Loop: "Original Website → Observation → Model → Reconstruction → Validation → Repair → Repeat." Currently, the Validation Engine exists and provides Structural and Visual diffing, and the Coordinator Agent can observe and interact with the page, but the two are not connected. The Coordinator Agent lacks the tools to invoke the validation loop, evaluate the reconstructed output against the original, and perform repairs based on the discrepancies.

## 2. Proposed Solution
Introduce the Validation Engine into the Coordinator Protocol.
1. Add a `Validation_evaluate` tool to `CoordinatorToolDeclarations` (in `packages/coordinator/src/tools.ts`).
2. Update the `IWorkerAdapter` (or introduce a new `IValidationAdapter`) in `packages/coordinator/src/adapter.ts` to allow the Coordinator to trigger the validation logic.
3. The `Validation_evaluate` tool will return the list of structural and visual violations directly to the Coordinator, allowing it to reason about the delta and issue subsequent repair commands or mark the objective as complete.

## 3. Impact and Trade-offs
- **Pros:** Closes the loop described in Phase 4 of the Roadmap. Empowers the Agent to be self-correcting rather than relying entirely on one-shot extraction.
- **Cons:** Increases the context size handled by the Agent, as violation reports could be large.

## 4. Decision
Waiting for User Approval.
