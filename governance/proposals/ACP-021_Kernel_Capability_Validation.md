# Architecture Change Proposal: Kernel Capability Validation

**ID:** ACP-021
**Status:** Implemented
**Author:** AI Implementor
**Date:** 2026-07-24

## 1. Problem Statement
`ADR-002` section 4 (Capability Discovery) mandates that the Coordinator/Kernel query supported capabilities before attempting execution, as the Coordinator must not assume all runtimes support all features. Currently, the `ExecutionKernel` issues actions like Navigation or Accessibility without querying `getCapabilities()` from the `IBrowserRuntime`, technically violating the architectural invariant.

## 2. Proposed Changes
- **Execution Kernel Capability Check**: Update the `ExecutionKernel` to call `getCapabilities()` on the `IBrowserRuntime` (or have the capabilities passed in during initialization) before executing any `Task` actions.
- **Fail Fast Execution**: If a `Task` requires a capability (e.g. `Navigation` for `navigate` action, `Interaction` for `click`/`type` action) that is not present in the runtime capabilities map (`capabilities: Record<string, boolean>`), the Kernel must fail the task explicitly with an `UnsupportedCapabilityError`.
- **Align Coordinator Planning**: (Optional/Follow-up) The `Coordinator` should factor in runtime capabilities during task planning to avoid proposing impossible actions.

## 3. Impact & Risk
- **Risk:** Existing tests or tasks might fail if capability checks are overly strict or if the `PlaywrightAdapter` is not returning the correct capabilities.
- **Mitigation:** Ensure `MockAdapter` and `PlaywrightAdapter` return the expected capabilities. E2E tests should be re-run after implementation to ensure the capabilities returned support the test fixtures.

## 4. Alternatives Considered
- Ignoring capability checks at the Kernel level and letting the Browser Runtime fail natively. This violates the fail-fast principle and forces the runtime to handle capability logic, whereas the Kernel is responsible for orchestration and policy enforcement.

## 5. Approval & Evidence
- **Requires:** User Approval to proceed.
- **Evidence:** Vitest and E2E tests validating the capability gate blocking unsupported tasks.
