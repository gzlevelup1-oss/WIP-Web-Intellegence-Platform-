# Architecture Change Proposal: Coordinator Planning Alignment

**ID:** ACP-022
**Status:** Implemented
**Author:** AI Implementor
**Date:** 2026-07-24

## 1. Problem Statement
Mission 35 (ACP-021) enforced Capability Discovery natively inside the Execution Kernel, gracefully catching unsupported tasks before they block the browser adapters. However, the `Coordinator` is currently entirely agnostic to these underlying limitations when assembling execution plans. It might hallucinate action plans (e.g. attempting to dispatch `Worker_extractDesignTokens` or `Interaction_type`) against environments that fundamentally lack `Interaction` or `Observation` capability. This represents an inefficient "throw it at the wall" interaction model which generates unnecessary kernel-level `UnsupportedCapabilityError` failures that the Coordinator then has to recover from.

## 2. Proposed Changes
- **Expose Capabilities via Adapter**: The `IExecutionKernelAdapter` should be expanded to expose the `getCapabilities(sessionId)` method upstream to the Coordinator.
- **Dynamic Tool Omission/Injection**: The `Coordinator` should query the session's capabilities prior to sending its tool manifest to the Gemini API (`SYSTEM_PROMPT` / `tools` payload).
- **Pruning**: If the `Interaction` capability is missing, the Coordinator should physically omit the `Interaction_click` and `Interaction_type` tools from the ReAct prompt. If `ScriptExecution` is missing, it should omit `Validation_evaluate`. 
- **Context Injection**: The capabilities should be explicitly defined inside the Coordinator's internal prompt context, ensuring it knows *why* certain actions are unavailable, preventing hallucinated retry loops.

## 3. Impact & Risk
- **Risk**: Modifying the Coordinator tools payload dynamically might interfere with existing ReAct prompt structures or tests that assume all tools are present.
- **Mitigation**: Unit tests must be introduced for the Coordinator to verify that omitted capabilities lead to appropriately pruned tool definitions before network dispatch. 

## 4. Alternatives Considered
- **Prompt-Only Approach**: Simply adding a sentence to the prompt like "You do not have click capabilities" while leaving the tool attached. This was rejected because LLMs often attempt to use available tools regardless of soft prompt constraints. Physical omission is deterministic.
- **Kernel-Only Block**: Leaving the logic as it stands post-Mission 35 (Kernel blocks execution, Coordinator learns via error). This was rejected due to latency (round-tripping the LLM for a known-impossible task).

## 5. Approval & Evidence
- **Requires:** User Approval to proceed.
- **Evidence:** Coordinator unit tests verifying dynamic tool pruning based on provided kernel capability payloads.
