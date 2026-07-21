# Verification Report: Specs vs Implementation

A comprehensive probe of the `specs/` directory against the actual implementations in `packages/` reveals significant architectural drift and discrepancies. The codebase currently violates multiple architectural invariants defined in the specifications.

## 1. Browser Runtime API (`BROWSER_RUNTIME_API.md` vs `browser-runtime/`)
* **Metadata Completeness:** The spec mandates `RuntimeMetadata` to include `Platform`, `Viewport`, `Locale`, `Timezone`, and `User Agent`. The implementation (`types.ts`) only provides `name`, `version`, and `backend`.
* **Observation Snapshot Schema:** The spec requires Snapshots to include `Hash` and `Metadata`. The implementation omits these.

## 2. Execution Kernel (`EXECUTION_KERNEL.md` vs `execution-kernel/`)
* **Missing Checkpoint State:** The spec requires checkpoints to store `checkpointId`, `sessionId`, `timestamp`, `historyIndex`, `localStorage`, and `snapshotHash`. The implementation (`checkpoint.ts`) only stores `url` and `cookies`.
* **Missing Task Hierarchy:** The spec defines a strict execution model: `Mission -> Transaction -> Task -> Action`. The implementation skips `Task` entirely, mapping `Transaction` directly to `Action` without the required retry tracking grouping.
* **Missing Security Policies:** The spec mandates a strict RBAC/Policy model (e.g., `allowedDomains`, `blockedDomains`, `maxTransactions`). The implementation (`kernel.ts`) lacks any permission validation logic.

## 3. Observation Graph (`OBSERVATION_GRAPH.md` vs `observation-store/`)
* **Loose Typing / Schema Violation:** The spec defines strict enums for node types (e.g., `DOMNode`, `StyleNode`) and edge types (e.g., `CHILD_OF`). The implementation (`types.ts`) loosely types them as `string` and `Record<string, any>`, failing to enforce the mandated JSON schema.

## 4. Validation Engine (`VALIDATION_PROTOCOL.md` vs `validation-engine/`)
* **Threshold Violations:** The protocol mandates a Tree Edit Distance (TED) threshold of `< 5%`. The implementation (`structural.ts`) uses a hardcoded `10%` threshold (`0.1`).
* **Missing Evidence Persistence:** The protocol strictly requires every validation to persist an Evidence Record to `governance/` or `logs/`. The implementation does not persist anything.
* **Missing Accessibility Checks:** The spec requires a "100% match on critical ARIA roles and tab indices", which is entirely absent from the engine's checks.

## 5. Coordinator Protocol (`COORDINATOR_PROTOCOL.md` vs `coordinator/`)
* **Validation Interception Failure:** The spec explicitly states that calling `Mission.complete` *implicitly* triggers the Validation Engine, and if validation fails, the loop is kept active for repairs. The implementation (`agent.ts`) immediately terminates the loop on `Mission_complete`, breaking the Repair Loop invariant.
* **Tool Contract Mismatch:** The spec requires `Observation.capture` to accept string enums (e.g., `["DOM", "A11Y"]`), but the underlying kernel adapter and `browser-runtime` expect an array of numbers (`levels: number[]`).
