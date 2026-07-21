# Atomic Tasks

## Mission 1: Establish Minimum Viable Governed Artifacts
*Status: LOCKED*
- [x] Task 1: Create `AGENTS.md` v1.1.0 with Artifact Governance and Constitution rules.
- [x] Task 2: Create `VISION.md`.
- [x] Task 3: Create `ROADMAP.md`.
- [x] Task 4: Ensure `WIP_PLAN.md` reflects current architecture.
- [x] Task 5: Create `MISSION.md` to track current work state.
- [x] Task 6: Create `TASKS.md` (this file).
- [x] Task 7: Create `docs/adr/ADR-001-Observation-Graph.md`.
- [x] Task 8: Create `docs/adr/ADR-002-Browser-Runtime.md`.
- [x] Task 9: Create `docs/adr/ADR-003-Session-Manager.md`.
- [x] Task 10: Create `docs/adr/ADR-004-Validation-Protocol.md`.
- [x] Task 11: Create `ENGINEERING_LIFECYCLE.md`.
- [x] Task 12: Create `DEBT.md`.
- [x] Task 13: Create `SYSTEM_CONTEXT.md`.
- [x] Task 14: Update `AGENTS.md` to v1.2.0 with AI Contribution Rules.
- [x] Task 15: Version `WIP_PLAN.md`.
- [x] Task 16: Move governance files to `governance/` directory.
- [x] Task 17: Create `MANIFEST.yaml`.
- [x] Task 18: Add Glossary, Document Tiers, and freeze governance.
- [x] Task 19: Create specification placeholders in `specs/`.

## Mission 2: Browser Runtime API Specification
*Status: LOCKED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 2.
- [x] Task 2: Draft initial `specs/BROWSER_RUNTIME_API.md`.
- [x] Task 3: Draft initial `specs/BrowserRuntime.protocol.md`.
- [x] Task 4: Revise `specs/BROWSER_RUNTIME_API.md` (remove Transactions/Checkpoints to Kernel, add Snapshots, Capability Discovery, etc.).
- [x] Task 5: Revise `specs/BrowserRuntime.protocol.md` (remove Checkpoints, Transactions).
- [x] Task 6: Complete Pre-Lock Checklist and mark Mission 2 as Locked.
- [x] Task 7: Prepare for Mission 3 (Observation Model Specification).

## Mission 3: Observation Model Specification
*Status: LOCKED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 3.
- [x] Task 2: Draft `specs/OBSERVATION_MODEL.md` (Core Concepts).
- [x] Task 3: Add Observation Ontology.
- [x] Task 4: Review and prepare spec for locking.

## Mission 4: Observation Graph Specification
*Status: LOCKED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 4.
- [x] Task 2: Define specific node types and properties in `specs/OBSERVATION_GRAPH.md`.
- [x] Task 3: Define specific edge types and relationships.
- [x] Task 4: Draft the JSON/serialization format for the Graph.
- [x] Task 5: Review and prepare spec for locking.

## Mission 5: Execution Kernel Specification
*Status: LOCKED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 5.
- [x] Task 2: Draft `specs/EXECUTION_KERNEL.md` core concepts (transactions, permissions, scheduling).
- [x] Task 3: Define checkpointing and concurrency models.
- [x] Task 4: Review and prepare spec for locking.

## Mission 6: Coordinator Protocol Specification
*Status: LOCKED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 6.
- [x] Task 2: Draft `specs/COORDINATOR_PROTOCOL.md` core concepts (planning loop, structured tools).
- [x] Task 3: Define interaction with Execution Kernel and workers.
- [x] Task 4: Review and prepare spec for locking.

## Mission 7: Worker Specifications
*Status: LOCKED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 7.
- [x] Task 2: Draft `specs/WORKER_SPECIFICATIONS.md` core concepts.
- [x] Task 3: Define Component Miner, Design Token Extractor, and Layout Analyzer algorithms.
- [x] Task 4: Review and prepare spec for locking.

## Mission 8: Validation Engine Specification
*Status: LOCKED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 8.
- [x] Task 2: Draft `specs/VALIDATION_ENGINE.md` core concepts (Visual and Structural Diffing).
- [x] Task 3: Define Feedback Loop and Test Harness requirements.
- [x] Task 4: Review and prepare spec for locking.

## Mission 9: Browser Laboratory Implementation
*Status: COMPLETED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 9.
- [x] Task 2: Draft Technical Design for the Browser Laboratory.
- [x] Task 3: Obtain user approval to lock all prior specifications (Missions 3-8).
- [x] Task 4: Begin implementation of the WIP Interactive Lab UI.
- [x] Task 5: Implement simulated Headless Browser Runtime backend API.
- [x] Task 6: Implement observation graph live capture and processing logic.
- [x] Task 7: Integrate the Coordinator Sandbox (Gemini genai SDK) inside the workbench.
- [x] Task 8: Implement Validation Suite visual diffing prototype.

## Future Missions (Implementation)

## Mission 10: Monorepo Architecture Migration
*Status: COMPLETED*
- [x] Task 1: Update `MANIFEST.yaml` and `MISSION.md` for Mission 10.
- [x] Task 2: Create `apps/browser-lab` and move current implementation.
- [x] Task 3: Update root `package.json` with workspace configuration.
- [x] Task 4: Verify `npm install` and ensure dev servers are working.

## Mission 11: Execution Kernel Implementation
*Status: COMPLETED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 11.
- [x] Task 2: Draft Technical Design for the Execution Kernel (Kernel, Scheduler, Transaction Manager).
- [x] Task 3: Obtain user approval for Technical Design.
- [x] Task 4: Implement Execution Kernel core (Transaction & Scheduling logic).
- [x] Task 5: Integrate Execution Kernel with the Browser Laboratory (Session Manager).
- [x] Task 6: Implement Checkpointing mechanisms for hard and soft aborts.
- [x] Task 7: Implement Request Proxying from Coordinator to Browser Runtime.

## Mission 12: Specialized Deterministic Workers Implementation
*Status: COMPLETED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 12.
- [x] Task 2: Draft Technical Design (`docs/WorkersDesign.md`) for the 3 Specialized Workers.
- [x] Task 3: Obtain user approval for Technical Design.
- [x] Task 4: Initialize `packages/workers` NPM package.
- [x] Task 5: Implement Design Token Extractor.
- [x] Task 6: Implement Component Miner.
- [x] Task 7: Implement Layout Analyzer.
- [x] Task 8: Integrate Workers into `apps/browser-lab/server.ts` via API routes.

## Mission 13: Coordinator Agent Implementation
*Status: COMPLETED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 13.
- [x] Task 2: Draft Technical Design (`docs/CoordinatorDesign.md`) for the Coordinator Agent.
- [x] Task 3: Obtain user approval for Technical Design.
- [x] Task 4: Initialize `packages/coordinator` NPM package.
- [x] Task 5: Implement `CoordinatorAgent` core loop (ReAct pattern).
- [x] Task 6: Implement Tool schemas and handlers mapping to Kernel and Workers.
- [x] Task 7: Integrate Coordinator into `apps/browser-lab` (API and UI).

## Mission 14: Validation Engine Implementation
*Status: LOCKED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 14.
- [x] Task 2: Draft Technical Design (`docs/ValidationEngineDesign.md`).
- [x] Task 3: Obtain user approval for Technical Design.
- [x] Task 4: Initialize `packages/validation-engine`.
- [x] Task 5: Implement Structural Diffing (Graph matching).
- [x] Task 6: Implement Visual Comparison logic.
- [x] Task 7: Integrate Validation Engine into Browser Lab.

## Mission 15: Retroactive Testing Implementation
*Status: LOCKED*
- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 15.
[x] Task 2: Draft Retroactive Testing Strategy (`docs/RetroactiveTestingStrategy.md`).
- [x] Task 3: Obtain user approval for Testing Strategy.
- [x] Task 4: Configure Vitest across the monorepo.
- [x] Task 5: Implement tests for `packages/workers`.
- [x] Task 6: Implement tests for `packages/execution-kernel`.
- [x] Task 7: Implement tests for `packages/coordinator`.

## Mission 16: Observation Store Implementation
*Status: APPROVED*
[x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 16.
[x] Task 2: Draft Technical Design (`docs/ObservationStoreDesign.md`).
- [x] Task 3: Obtain user approval for Technical Design.
- [x] Task 4: Initialize `packages/observation-store` NPM package.
- [x] Task 5: Implement `MemoryObservationStore` and Graph Query interfaces.
- [x] Task 6: Implement unit tests for the Observation Store.
- [x] Task 7: Integrate Observation Store into Browser Lab.

## Mission 17: Validation TED and Shadow DOM
*Status: LOCKED*
- [x] Task 1: Update `MANIFEST.yaml` and `SYSTEM_CONTEXT.md` for Mission 17.
- [x] Task 2: Implement Shadow DOM traversal in `apps/browser-lab/server.ts`.
- [x] Task 3: Implement Tree Edit Distance (TED) in `packages/validation-engine/src/structural.ts`.
- [x] Task 4: Run workspace tests and ensure build succeeds.
- [x] Task 5: Resolve TD-001 and TD-002 in `governance/DEBT.md`.

## Mission 18: Coordinator Validation Loop
*Status: LOCKED*
- [x] Task 1: Update `MANIFEST.yaml` and `SYSTEM_CONTEXT.md` for Mission 18.
- [x] Task 2: Add `Validation_evaluate` tool in `packages/coordinator/src/tools.ts`.
- [x] Task 3: Update `packages/coordinator/src/adapter.ts` with `IValidationAdapter`.
- [x] Task 4: Handle tool in `packages/coordinator/src/agent.ts`.
- [x] Task 5: Run tests.

## Mission 19: Browser Runtime Extraction
*Status: COMPLETED*

- [x] Task 1: Update `MANIFEST.yaml`, `SYSTEM_CONTEXT.md`, and `MISSION.md` for Mission 19.
- [x] Task 2: Initialize `packages/browser-runtime` package (package.json, tsconfig.json).
- [x] Task 3: Extract `IBrowserAdapter` into `packages/browser-runtime/src/contracts/IBrowserAdapter.ts`.
- [x] Task 4: Implement `SessionManager` in `packages/browser-runtime/src/runtime/SessionManager.ts`.
- [x] Task 5: Implement `BrowserService` in `packages/browser-runtime/src/services/BrowserService.ts`.
- [x] Task 6: Implement `PlaywrightAdapter` in `packages/browser-runtime/src/adapters/PlaywrightAdapter.ts`.
- [x] Task 7: Implement `BrowserRuntime` programmatic façade in `packages/browser-runtime/src/runtime/BrowserRuntime.ts`.
- [x] Task 8: Implement transport adapters in `apps/browser-lab/server.ts` and convert it into a composition root.
- [x] Task 9: Validate implementation (UI functions identically, architecture invariants met).
# AFR-002 Remediation Tasks

**Pending Approval of AFR-002 and CIR-001**

## Mission: AFR-002 Architecture Conformance Remediation

- [x] Task 1: (AFR-002.6) **Validation Thresholds**: Update Tree Edit Distance threshold in `packages/validation-engine/src/structural.ts` to `0.05`.
- [x] Task 2: (AFR-002.10) **Tool Contract Mismatch**: Update `server.ts` (`kernelAdapter`) to map `Observation.capture` string array inputs (`['DOM', 'A11Y']`) to the numeric flags expected by `BrowserRuntime`.
- [x] Task 3: (AFR-002.1) **Browser Runtime Metadata**: Update `RuntimeMetadata` and `ObservationSnapshot` interfaces in `packages/browser-runtime/src/contracts/types.ts` to include `Platform`, `Viewport`, `Locale`, `Timezone`, `User Agent`, `Hash`, and `Metadata`. Implement extraction in adapters.
- [x] Task 4: (AFR-002.5) **Observation Graph Schema**: Refactor `packages/observation-store/src/types.ts` to use strict discriminated unions for `GraphNode` and `GraphEdge`, matching the JSON schema in `OBSERVATION_GRAPH.md`. Update all workers/engines to accommodate the strict typing.
- [x] Task 5: (AFR-002.8) **Accessibility Validation**: Implement `accessibilityDiff` logic in `validation-engine` to compare `A11yNode` roles and tab indices, raising discrepancies for mismatches.
- [x] Task 6: (AFR-002.3) **Execution Kernel Hierarchy**: Introduce `Task` class in `packages/execution-kernel`. Refactor `Transaction` to own an array of `Tasks`, and modify `Scheduler` to handle retries at the `Task` level instead of the `Action` level.
- [x] Task 7: (AFR-002.4) **Kernel Security Policies**: Implement RBAC policy evaluation in `kernel.ts` (`beginTransaction`), validating requested domains/capabilities against mission permissions.
- [x] Task 8: (AFR-002.9) **Coordinator Repair Loop**: Refactor `packages/coordinator/src/agent.ts`. On `Mission_complete`, execute the validation adapter. If `ValidationFailed` is thrown, feed the discrepancy report back into the agent loop up to 3 times (Repair Loop invariant).
- [x] Task 9: (AFR-002.2) **Kernel Checkpoints**: Expand `CheckpointData` in `execution-kernel` to include `historyIndex` and `localStorage`. Implement capture and restore of these state vectors in the `browser-runtime` adapter.
- [x] Task 10: (AFR-002.7) **Validation Evidence**: Implement persistence in `validation-engine`. Ensure every `validate` call serializes the discrepancy report and visual diffs to a `logs/evidence/` directory.
