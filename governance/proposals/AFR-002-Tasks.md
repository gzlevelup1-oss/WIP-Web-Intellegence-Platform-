# AFR-002 Remediation Tasks

**Pending Approval of AFR-002 and CIR-001**

## Mission: AFR-002 Architecture Conformance Remediation

- [ ] Task 1: (AFR-002.6) **Validation Thresholds**: Update Tree Edit Distance threshold in `packages/validation-engine/src/structural.ts` to `0.05`.
- [ ] Task 2: (AFR-002.10) **Tool Contract Mismatch**: Update `server.ts` (`kernelAdapter`) to map `Observation.capture` string array inputs (`['DOM', 'A11Y']`) to the numeric flags expected by `BrowserRuntime`.
- [ ] Task 3: (AFR-002.1) **Browser Runtime Metadata**: Update `RuntimeMetadata` and `ObservationSnapshot` interfaces in `packages/browser-runtime/src/contracts/types.ts` to include `Platform`, `Viewport`, `Locale`, `Timezone`, `User Agent`, `Hash`, and `Metadata`. Implement extraction in adapters.
- [ ] Task 4: (AFR-002.5) **Observation Graph Schema**: Refactor `packages/observation-store/src/types.ts` to use strict discriminated unions for `GraphNode` and `GraphEdge`, matching the JSON schema in `OBSERVATION_GRAPH.md`. Update all workers/engines to accommodate the strict typing.
- [ ] Task 5: (AFR-002.8) **Accessibility Validation**: Implement `accessibilityDiff` logic in `validation-engine` to compare `A11yNode` roles and tab indices, raising discrepancies for mismatches.
- [ ] Task 6: (AFR-002.3) **Execution Kernel Hierarchy**: Introduce `Task` class in `packages/execution-kernel`. Refactor `Transaction` to own an array of `Tasks`, and modify `Scheduler` to handle retries at the `Task` level instead of the `Action` level.
- [ ] Task 7: (AFR-002.4) **Kernel Security Policies**: Implement RBAC policy evaluation in `kernel.ts` (`beginTransaction`), validating requested domains/capabilities against mission permissions.
- [ ] Task 8: (AFR-002.9) **Coordinator Repair Loop**: Refactor `packages/coordinator/src/agent.ts`. On `Mission_complete`, execute the validation adapter. If `ValidationFailed` is thrown, feed the discrepancy report back into the agent loop up to 3 times (Repair Loop invariant).
- [ ] Task 9: (AFR-002.2) **Kernel Checkpoints**: Expand `CheckpointData` in `execution-kernel` to include `historyIndex` and `localStorage`. Implement capture and restore of these state vectors in the `browser-runtime` adapter.
- [ ] Task 10: (AFR-002.7) **Validation Evidence**: Implement persistence in `validation-engine`. Ensure every `validate` call serializes the discrepancy report and visual diffs to a `logs/evidence/` directory.
