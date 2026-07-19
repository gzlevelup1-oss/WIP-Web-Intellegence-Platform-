# Coordinator Protocol Specification

**Version:** 1.0.0-Draft  
**Related ADR:** (None, Part of Base Architecture)  

## 1. Overview
The **Coordinator Agent** (powered by an LLM, such as Gemini 2.5 Pro) serves as the primary reasoning engine for WIP. While the Browser Runtime and Execution Kernel are strictly deterministic, the Coordinator is probabilistic. The **Coordinator Protocol** defines how this probabilistic reasoning engine interfaces with the deterministic execution system.

## 2. Core Responsibilities
- **Planning:** Deciding the sequence of actions required to fulfill a Mission.
- **Exploration:** Navigating pages and analyzing Observation Graphs to understand the state.
- **Hypothesis Generation:** Asserting semantic meaning over structural facts (e.g., "Node-123 is a primary navigation menu").
- **Delegation:** Assigning specific sub-tasks to Specialized Workers.
- **Repair:** Evaluating discrepancies in the Validation Loop and planning corrective actions.

## 3. The Agent Loop
The Coordinator operates in a strict ReAct (Reason + Act) loop:
1. **Receive Mission:** The Coordinator receives a high-level goal and any existing context.
2. **Observe:** The Coordinator requests a Snapshot from the Kernel, receiving the Observation Graph.
3. **Analyze:** The Coordinator processes the Graph, identifying relevant nodes and forming hypotheses.
4. **Plan/Act:** The Coordinator selects a Tool from its structured suite and dispatches a Transaction to the Kernel.
5. **Evaluate:** The Coordinator observes the result of the Action. If the Action failed (e.g., `TimeoutError`), the Coordinator must adjust its plan.
6. **Complete:** The Coordinator declares the Mission complete and outputs the finalized semantic mappings.

## 4. Structured Tool Suite
The Coordinator does NOT write scripts or interact with Playwright directly. It communicates exclusively via a predefined JSON-schema tool suite.

### 4.1. Execution Tools (Dispatched to Kernel)
```json
{
  "name": "Interaction.click",
  "description": "Click an element by NodeID.",
  "parameters": {
    "type": "object",
    "properties": {
      "nodeId": { "type": "string", "description": "The target NodeID from the Observation Graph" },
      "modifiers": { "type": "array", "items": { "type": "string", "enum": ["shift", "ctrl", "alt"] } }
    },
    "required": ["nodeId"]
  }
}
```
*Other tools: `Navigation.open(url)`, `Navigation.back()`, `Viewport.scroll(distanceY)`, `Interaction.type(nodeId, text)`*

### 4.2. Observation Tools (Dispatched to Kernel)
```json
{
  "name": "Observation.capture",
  "description": "Requests a new Snapshot of the current state.",
  "parameters": {
    "type": "object",
    "properties": {
      "levels": { "type": "array", "items": { "type": "string", "enum": ["DOM", "A11Y", "STYLE", "GEOMETRY"] } }
    },
    "required": ["levels"]
  }
}
```
*Other tools: `Observation.queryGraph(snapshotId, cypherQuery)`*

### 4.3. Delegation Tools (Dispatched to Workers)
```json
{
  "name": "Worker.extractDesignTokens",
  "description": "Dispatches the Design Token worker to extract the global design system.",
  "parameters": {
    "type": "object",
    "properties": {
      "snapshotId": { "type": "string" }
    },
    "required": ["snapshotId"]
  }
}
```
*Other tools: `Worker.mineComponents(snapshotId, containerNodeId)`, `Worker.analyzeLayout(snapshotId, containerNodeId)`*

### 4.4. Mission Tools
- `Mission.complete(resultPayload)`: Marks the mission as successful. The `resultPayload` contains the final reconstructed UI code (e.g., HTML/CSS, React) and the semantic mappings. **Note:** Calling this tool implicitly triggers the Validation Engine. If validation fails, the system intercepts the completion, keeps the mission active, and returns a `ValidationFailed` error containing a Discrepancy Report for the Coordinator to repair.
- `Mission.fail(reason)`: Aborts the mission if the Coordinator determines the goal is impossible.

## 5. Hypothesis and Semantics Management
The Coordinator maintains an **Experience Graph** (separate from the Observation Graph). While the Observation Graph stores facts, the Experience Graph stores the Coordinator's semantic labels and hypotheses.
- The Coordinator maps its hypotheses to immutable `SnapshotID` and `NodeID` references.
- Example: `{"hypothesisId": "h-1", "nodeId": "node-45", "semanticRole": "primary-checkout-button", "confidence": 0.95}`
- If the Observation Graph changes, hypotheses may need to be re-evaluated.

## 6. Interaction with the Execution Kernel
- The Coordinator invokes execution tools individually or in batches. Each invocation is automatically wrapped in a `Transaction` by the Execution Kernel.
- The Coordinator waits synchronously (or asynchronously via callbacks) for the Kernel to return a `TransactionResult`.
- The Coordinator is entirely shielded from transient browser failures (handled via Kernel retries); if the Kernel returns an error, it is a terminal failure that explicitly aborted the transaction, requiring re-planning.

## 7. Invariants
- The Coordinator MUST NOT generate Playwright, Puppeteer, or JavaScript code to be executed in the browser context.
- The Coordinator MUST reference elements by `NodeID`, not by generating CSS selectors or XPath queries, ensuring it relies on the deterministic Observation Graph.
- The Coordinator MUST explicitly handle Kernel transaction aborts.

## 8. Passive Observation Mode (Extension Runtime)
When connected to a runtime that supports passive observation (e.g., the Chrome Extension Runtime), the Coordinator can operate as an "Over-the-Shoulder Copilot":
- Instead of exclusively issuing `Observation.capture` and `Interaction.click` tools autonomously, the Coordinator receives a passive stream of `Event.Interaction.Recorded` events over the protocol as a human user interacts with the page.
- The Coordinator processes these events and the resulting Observation Graph in the background, updating its Experience Graph and hypotheses without taking autonomous control of the cursor.
