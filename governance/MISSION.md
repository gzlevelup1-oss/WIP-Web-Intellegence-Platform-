# Current Mission

**Mission:** Mission 36: Coordinator Planning Alignment (TD-015)
**Status:** Locked
**Evidence Payload:**
- **Functional Verification:** Pending
- **Architectural Verification:** Pending
- **Dependency Graph:** Pending
- **ADR Compliance:** Pending

**ID:** M-36

## References
- ACP-022: Coordinator Planning Alignment
- ADR-002: Browser Runtime
- DEBT.md (TD-015)

## Objective
Enhance the `Coordinator` to dynamically omit unavailable tool sets from its ReAct prompt based on the capabilities returned by the `ExecutionKernel`. This resolves the architectural gap of "throw it at the wall" execution planning and resolves TD-015.

## Future Mission Governance
All future missions and capabilities are gated under ACP-019 (Future Mission Lifecycle Gating Protocol) and AVP-001. No un-gated or ad-hoc missions may proceed without an approved ACP, verified Evidence Payload, and explicit user approval.

## Scope

**In Scope:**
- Expand `IExecutionKernelAdapter` to expose runtime capabilities.
- Dynamically prune the tool payload sent to the Gemini API in `packages/coordinator/src/agent.ts`.
- Append environment capabilities to the LLM system prompt context.
- Add unit tests verifying dynamic capability pruning in the Coordinator.

**Out of Scope:**
- Modifying the actual capability definitions inside `browser-runtime` (completed in M-35).
