# AFR-002: Specification vs Implementation Discrepancies

**Status:** Approved
**Owner:** Architecture

## 1. Purpose
This Architecture Friction Report (AFR) captures the systemic architectural non-conformances identified between the `specs/` directory and the `packages/` implementations. Following the execution of the verification probe, significant drift was identified across multiple subsystems.

## 2. Discrepancies

### Discrepancy 1
* **ID:** AFR-002.1
* **Specification reference:** `BROWSER_RUNTIME_API.md` (RuntimeMetadata schema, Snapshot schema)
* **Implementation reference:** `packages/browser-runtime/src/contracts/types.ts`
* **Severity:** High
* **Classification:** Implementation defect
* **Violated Invariant:** Deterministic execution observable state is incomplete.
* **Evidence:** `RuntimeMetadata` missing `Platform`, `Viewport`, `Locale`, `Timezone`, and `User Agent`. `ObservationSnapshot` missing `Hash` and `Metadata`.
* **Why implementation cannot proceed:** The API does not expose all required metadata and hashing guarantees for the Coordinator to function deterministically.
* **Proposed resolution / Candidate Solutions:** Update `RuntimeMetadata` and `ObservationSnapshot` interfaces in `types.ts` to reflect the specification, and update adapters (e.g., `PlaywrightAdapter`) to supply this data.
* **Status:** Resolved

### Discrepancy 2
* **ID:** AFR-002.2
* **Specification reference:** `EXECUTION_KERNEL.md` (Checkpoint format)
* **Implementation reference:** `packages/execution-kernel/src/checkpoint.ts`
* **Severity:** High
* **Classification:** Implementation defect
* **Violated Invariant:** Stateful Session reversibility.
* **Evidence:** `CheckpointData` only contains `url` and `cookies`, missing `checkpointId`, `sessionId`, `timestamp`, `historyIndex`, `localStorage`, and `snapshotHash`.
* **Why implementation cannot proceed:** Transactions cannot be safely rolled back in their entirety if local storage and history index are not preserved.
* **Proposed resolution / Candidate Solutions:** Expand `CheckpointData` interface and implement capture/restore of local storage and full state in the browser adapter.
* **Status:** Resolved

### Discrepancy 3
* **ID:** AFR-002.3
* **Specification reference:** `EXECUTION_KERNEL.md` (Execution Model: Mission -> Transaction -> Task -> Action)
* **Implementation reference:** `packages/execution-kernel/src/kernel.ts` and `transaction.ts`
* **Severity:** Critical
* **Classification:** Architecture-level defect
* **Violated Invariant:** Strict execution model hierarchy.
* **Evidence:** The `Task` abstraction is missing entirely. `Transaction` maps directly to `Action`.
* **Why implementation cannot proceed:** Retries and scheduling cannot be applied at the logical `Task` grouping level as intended by the design.
* **Proposed resolution / Candidate Solutions:** Introduce `Task` entity in the kernel to group actions and manage retries at the task level rather than at the individual action level.
* **Status:** Resolved

### Discrepancy 4
* **ID:** AFR-002.4
* **Specification reference:** `EXECUTION_KERNEL.md` (Permissions and Security)
* **Implementation reference:** `packages/execution-kernel/src/kernel.ts`
* **Severity:** Critical
* **Classification:** Implementation defect
* **Violated Invariant:** Strict security policy enforcement.
* **Evidence:** No RBAC/policy enforcement logic exists when a transaction is submitted.
* **Why implementation cannot proceed:** The kernel fails its primary responsibility of validating requests against a security policy before execution.
* **Proposed resolution / Candidate Solutions:** Introduce `SecurityPolicy` evaluation in `kernel.beginTransaction` or `kernel.executeAction` based on the active mission's permissions.
* **Status:** Resolved

### Discrepancy 5
* **ID:** AFR-002.5
* **Specification reference:** `OBSERVATION_GRAPH.md` (Node and Edge schemas)
* **Implementation reference:** `packages/observation-store/src/types.ts`
* **Severity:** High
* **Classification:** Implementation defect
* **Violated Invariant:** JSON-schema compliance and deterministic property tracking.
* **Evidence:** Loose typing (`type: string`, `properties: Record<string, any>`) instead of strictly enumerated types (`DOMNode`, `StyleNode`) and structured property schemas.
* **Why implementation cannot proceed:** Loose typing allows invalid graphs to be stored and processed by downstream workers, violating data integrity.
* **Proposed resolution / Candidate Solutions:** Implement exact TypeScript interfaces matching the JSON schema defined in the specification.
* **Status:** Resolved

### Discrepancy 6
* **ID:** AFR-002.6
* **Specification reference:** `VALIDATION_PROTOCOL.md` (Thresholds)
* **Implementation reference:** `packages/validation-engine/src/structural.ts`
* **Severity:** Critical
* **Classification:** Specification compliance defect
* **Violated Invariant:** Binary validation thresholds.
* **Evidence:** Implementation uses a `10%` (`0.1`) threshold for Tree Edit Distance, whereas the specification strictly demands `< 5%`.
* **Why implementation cannot proceed:** The Validation Engine passes lower quality results than the architecture permits.
* **Proposed resolution / Candidate Solutions:** Change threshold in `structural.ts` to `0.05`.
* **Status:** Resolved

### Discrepancy 7
* **ID:** AFR-002.7
* **Specification reference:** `VALIDATION_PROTOCOL.md` (Evidence Requirements)
* **Implementation reference:** `packages/validation-engine/src/engine.ts`
* **Severity:** High
* **Classification:** Implementation defect
* **Violated Invariant:** Validation auditability.
* **Evidence:** The validation engine does not persist any Evidence Records to the disk (`governance/` or `logs/`).
* **Why implementation cannot proceed:** Breaks the architectural rule that the Validation Engine's decisions must be auditable.
* **Proposed resolution / Candidate Solutions:** Inject a logger or storage adapter into the `validate` function to serialize and save the `DiscrepancyReport` along with diff artifacts to `logs/`.
* **Status:** Resolved

### Discrepancy 8
* **ID:** AFR-002.8
* **Specification reference:** `VALIDATION_PROTOCOL.md` (Accessibility Threshold)
* **Implementation reference:** `packages/validation-engine/src/engine.ts`
* **Severity:** High
* **Classification:** Implementation defect
* **Violated Invariant:** Dual-layer verification includes structural, visual, and accessibility.
* **Evidence:** There is no logic comparing ARIA roles and tab indices.
* **Why implementation cannot proceed:** Cannot guarantee accessibility validation.
* **Proposed resolution / Candidate Solutions:** Add an `accessibilityDiff` function that specifically verifies `A11yNode` matches in the graphs.
* **Status:** Resolved

### Discrepancy 9
* **ID:** AFR-002.9
* **Specification reference:** `COORDINATOR_PROTOCOL.md` (Repair Loop)
* **Implementation reference:** `packages/coordinator/src/agent.ts`
* **Severity:** Critical
* **Classification:** Critical architectural defect
* **Violated Invariant:** Coordinator Protocol ReAct Loop.
* **Evidence:** `Mission_complete` terminates the loop immediately without triggering the Validation Engine, preventing the Repair Loop (up to 3 repairs).
* **Why implementation cannot proceed:** The Coordinator bypasses mandatory quality control checks entirely.
* **Proposed resolution / Candidate Solutions:** In `agent.ts`, when `Mission_complete` is called, explicitly call the validation adapter. If it fails, feed the error back into `currentMessage` and keep the loop running.
* **Status:** Resolved

### Discrepancy 10
* **ID:** AFR-002.10
* **Specification reference:** `COORDINATOR_PROTOCOL.md` vs `BROWSER_RUNTIME_API.md` (Observation Levels)
* **Implementation reference:** Coordinator schema vs `packages/browser-runtime/src/contracts/IBrowserRuntime.ts`
* **Severity:** Critical
* **Classification:** Public API contract violation
* **Violated Invariant:** Tool Suite schema compliance.
* **Evidence:** The spec defines levels as string enums (`["DOM", "A11Y"]`), but the browser runtime `capture` method expects `levels: number[]`.
* **Why implementation cannot proceed:** When the Coordinator calls `Observation_capture` with `levels: ["DOM"]`, it will cause a type mismatch / runtime error in the adapter.
* **Proposed resolution / Candidate Solutions:** Update the kernel adapter logic to map string enums from the Coordinator payload to the numeric flags required by the browser runtime, OR update the runtime API to use string enums.
* **Status:** Resolved
