# 📋 Specification vs. Implementation Gaps Report

**Date**: July 23, 2026  
**Type**: Architecture Audit  

After performing a comprehensive sweep across all governing specifications (`specs/*.md`) and cross-referencing them against the active codebase implementations in `packages/`, several significant "capabilities" that are strictly defined in the specs are currently missing from the code.

According to **Rule 1: Architecture Invariants** ("Specifications define capabilities, implementations realize capabilities, and no implementation may become the de facto specification"), these gaps should be recorded as Technical Debt rather than stripping them from the specifications.

---

## 1. Browser Runtime & Observation Graph
*Governing Specs: `OBSERVATION_GRAPH.md`, `BROWSER_RUNTIME_API.md`*

> [!WARNING]
> **Missing Node Types**
> Out of the 7 specified graph nodes, only `DOMNode`, `StyleNode`, `GeometryNode`, and `A11yNode` are extracted.
> - **`InteractiveNode`**: The runtime does not query or extract bound event listeners (e.g., `click`, `hover`).
> - **`NetworkRequestNode`**: Playwright network interceptions (`page.on('request')`) are not feeding into the graph.
> - **`ResourceNode`**: Loaded assets (images, fonts, scripts) are not being tracked.

> [!IMPORTANT]
> **Missing Pseudo-Element Extraction**
> The extraction script (`browser-script.ts`) iterates over `el.children`, making it entirely blind to pseudo-elements (`::before`, `::after`) which are frequently used to render icons and tooltips.

> [!NOTE]
> **Missing Deep Observation Levels**
> Observation Levels 5 (Animations) and 6 (Performance) are documented but not implemented in the extraction logic.

> [!WARNING]
> **Missing Event Streaming (Browser Protocol & Mission Protocol)**
> - **Network Events**: The Runtime Protocol dictates emitting `Event.Network.RequestSent` and `Event.Network.ResponseReceived`, but these are completely absent from the codebase.
> - **Mission Events**: The Mission Protocol mandates emitting `Event.Mission.StepStarted`, `Event.Mission.StepCompleted`, and `Event.Mission.HypothesisFormed` for the UI to consume, but the Execution Kernel / Coordinator currently emit no such events.

---

## 2. Coordinator Protocol
*Governing Spec: `COORDINATOR_PROTOCOL.md`*

> [!WARNING]
> **Missing "Experience Graph"**
> The protocol states that while the Observation Graph stores facts, the Coordinator maintains a parallel **Experience Graph** to store its semantic labels and hypotheses (e.g., mapping `node-45` to `primary-checkout-button`). This data structure does not currently exist in the `@wip/coordinator` package.

> [!NOTE]
> **Passive Observation Mode**
> The "Over-the-Shoulder Copilot" mode (streaming `Event.Interaction.Recorded` events from a Chrome Extension without taking autonomous control) is specified but completely absent from the codebase.

---

## 3. Validation Engine
*Governing Spec: `VALIDATION_ENGINE.md`*

> [!SUCCESS]
> **Resolved: Strict Visual Tolerances**
> Bounding Box Verification (max 2px deviation) and Color Tolerance (DeltaE < 2.0) were fully implemented in the engine.

---

## 4. Execution Kernel
*Governing Spec: `EXECUTION_KERNEL.md`*

> [!SUCCESS]
> **Resolved: Soft Checkpointing & Checkpoint Data**
> The `IsolationLevel` abstraction was added to the Execution Kernel, and `historyIndex` is now fully captured and restored via the Playwright Adapter.

---

### Recommended Next Steps
These gaps represent the difference between the current "MVP Platform" and the fully realized Phase 8 Agentic framework. I recommend adding these as formal entries to `governance/DEBT.md` under a new **"Specification Fulfillment"** category so they can be assigned to future missions.
