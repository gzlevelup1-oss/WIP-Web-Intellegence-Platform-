# UI/UX Integration Plan
**Status:** DRAFT (Not Ratified)
**Date:** 2026-07-20

## 1. Context
Currently, the `@wip/browser-lab` frontend has several UI shells (Visual, Inspector, Logs, Validation) that are partially wired or completely mocked. The goal is to fully integrate these UI views with the underlying backend architectures (`coordinator`, `workers`, `validation-engine`, `observation-store`).

## 2. In Scope
* **Validation View (Diff Mode):** Replace the hardcoded, animated HTML red boxes with actual visual diff bounding boxes derived from the `@wip/validation-engine`.
* **Chat / Command Interface:** Connect the `ChatPane` to the `@wip/coordinator` and `@wip/workers` so that natural language commands or test scripts are executed against the active session.
* **Observation Inspector (DOM Mode):** Map the rich `ObservationGraph` nodes to an interactive, foldable tree view representing the exact state of the DOM and accessibility tree.
* **Live Updates (Logs & Status):** Enhance the state management to stream continuous log updates and refresh the screenshot smoothly.

## 3. Out of Scope
* Modifying the core Playwright execution container logic.
* Adding new UI panels unrelated to the existing core modules.

## 4. Implementation Steps (Proposed)
1. **API Routes:** Expose new endpoints in `server.ts` to surface data from the coordinator, workers, and validation engines.
2. **React Context (`LabContext`):** Expand state to handle visual diffs (bounding boxes, match percentage) and worker statuses.
3. **UI Component Updates:** Update `FileViewer.tsx` to map over dynamic diff data instead of hardcoded placeholder `<div>` tags.

## 5. Required Approvals
* System Architect / Product Owner must review and approve this plan before implementation begins, conforming to the Engineering Constitution.
