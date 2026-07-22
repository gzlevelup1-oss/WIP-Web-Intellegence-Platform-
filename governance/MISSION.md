# Current Mission

**Mission:** UI/UX Integration
**Status:** LOCKED
**Evidence Payload:**
- **Functional Verification:** `npm run build --workspaces` fully passes. The `LabContext` was updated to hold rich state. The `ObservationInspector` now computes and renders tree depth. The `FileViewer` correctly displays dynamic discrepancies based on `validationResult`.
- **Architectural Verification:** AVP-001 checks passed successfully. Frontend changes did not violate `@wip/*` package isolation. It consumes data purely over the `/api/*` Express endpoints. No backend types were leaked directly into the frontend build.
- **Dependency Graph:** Unchanged. Forbidden dependencies verified.
- **ADR Compliance:** AVP-001 checks passed successfully.
**ID:** M-025

## References
- `governance/proposals/ACP-007_UI_UX_Integration.md`

## Objective
To fully integrate the `@wip/browser-lab` frontend UI views (Visual, Inspector, Logs, Validation) with the newly decoupled backend APIs, replacing mocked state with actual data from the Observation Graph, Validation Engine, and Coordinator.

## Scope
**In Scope:**
- Replace mocked visual diffs in Validation View.
- Connect `ChatPane` to Coordinator API for real command execution.
- Implement real `ObservationGraph` rendering in `ObservationInspector` (DOM Mode).
- Update `LabContext` to hold real graph, diff, and log state.

**Out of Scope:**
- Backend API restructuring (already completed in M-024).
- Creating new backend capabilities or agents.

## Phase 1 Tasks
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md` and `TASKS.md`.
- [x] Task 2: Update `LabContext.tsx` state to include rich graph types, diff results, and API integration logic.
- [x] Task 3: Update `ChatPane.tsx` to send commands to `/api/simulator/command` and handle responses/logs.
- [x] Task 4: Update `ObservationInspector.tsx` to render the actual DOM nodes from the `ObservationGraph`.
- [x] Task 5: Update `FileViewer.tsx` to show dynamic bounding boxes in 'diff' mode based on validation results.
- [x] Task 6: Validate build (`npm run build`).
- [x] Task 7: Execute AVP-001 Architecture Verification and lock the mission.
