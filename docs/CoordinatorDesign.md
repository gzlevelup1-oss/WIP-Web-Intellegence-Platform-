# Coordinator Agent: Technical Design

**Mission:** M-013  
**Status:** APPROVED  
**Owner:** Agent Core Team

## 1. Overview
The Coordinator Agent is the probabilistic reasoning core of the Website Intelligence Platform. Driven by Gemini (or another capable LLM), it is strictly decoupled from the browser runtime. It uses a ReAct (Reason + Act) loop, functioning as a high-level orchestrator that views the world via the Observation Graph, delegates semantic analysis to Workers, and issues interaction commands to the Execution Kernel.

## 2. Architecture & Components
The Coordinator will reside in a new package: `packages/coordinator`.

### 2.1 The Agent Core (`agent.ts`)
- Implements the main `ReAct` loop: `Observe -> Reason -> Act`.
- Maintains the conversation history with the LLM.
- **System Prompt:** Instructs the LLM on its boundaries. It explicitly forbids attempting to generate Playwright scripts or CSS selectors, forcing reliance on NodeIDs from the Observation Graph.

### 2.2 Tool Registry (`tools.ts`)
The Agent will be provided a strict suite of JSON Schema tools:

**Observation Tools:**
- `Observation.capture`: Asks the Kernel for the latest Observation Graph.

**Worker (Delegation) Tools:**
- `Worker.extractDesignTokens`: Queries the Design Token Extractor worker.
- `Worker.mineComponents`: Queries the Component Miner worker for a given sub-tree.
- `Worker.analyzeLayout`: Queries the Layout Analyzer worker.

**Execution Tools:**
- `Interaction.click({ nodeId })`: Dispatches a click via the Kernel.
- `Interaction.type({ nodeId, text })`: Dispatches text input via the Kernel.
- `Navigation.goto({ url })`: Dispatches a top-level navigation via the Kernel.

### 2.3 The Adapter Layer (`adapter.ts`)
Because the `packages/coordinator` shouldn't directly instantiate `ExecutionKernel` (to preserve the network boundary), it will require an adapter interface.
- `IExecutionKernelAdapter`: Interfaces with the Lab's backend to execute commands (which internally route to the Kernel).
- `IWorkerAdapter`: Interfaces with the local Workers.

## 3. Data Flow
1. **Initialize:** `agent.start(objective)`
2. **First Action:** The agent inherently calls `Observation.capture` to get the lay of the land.
3. **Reasoning:** It receives a serialized graph summary. If it's too dense, it calls `Worker.mineComponents` on the body node to get a semantic breakdown.
4. **Action:** Once a target component is identified, it calls `Interaction.click({ nodeId })`.
5. **Evaluation:** The Execution Kernel wraps the click in a transaction, executes it, and returns the result (success/failure). The Agent loops.

## 4. Integration
We will expose an API endpoint in `apps/browser-lab/server.ts` to allow the UI to send a prompt to the Coordinator.
The Coordinator will stream its thoughts and actions back to the frontend using Server-Sent Events (SSE) or simple sequential JSON chunks, allowing the UI to render the agent's reasoning steps in real-time.

