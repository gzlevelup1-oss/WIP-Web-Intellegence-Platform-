# ACP-015: Browser Runtime Specification Fulfillment (TD-010)

**Status:** Approved
**Owner:** Architecture
**Date:** 2026-07-23

## 1. Context and Motivation
Per ARCH-003 and TD-010, the current implementation of the Browser Runtime and Observation Graph lacks several key capabilities defined in the original specifications:
- **Missing Node Types:** `InteractiveNode`, `NetworkRequestNode`, `ResourceNode`.
- **Missing Pseudo-Element Extraction:** `::before`, `::after`.
- **Missing Deep Observation Levels:** Levels 5 (Animations) and 6 (Performance).
- **Missing Event Streaming:** `Event.Network.*` and `Event.Mission.*`.

This proposal details the technical approach to implement these missing capabilities to close the specification-implementation gap.

## 2. Technical Design

### 2.1 Pseudo-Element Extraction
- Modify `browser-script.ts` to explicitly check `window.getComputedStyle(el, '::before')` and `window.getComputedStyle(el, '::after')`.
- If a pseudo-element has `content` that is not `'none'` and not normal, generate a synthetic `DOMNode`, `GeometryNode`, and `StyleNode` linked to the parent.

### 2.2 Deep Observation Levels (5 & 6) & Node Types
- **`ResourceNode` (Level 6):** Utilize `window.performance.getEntriesByType('resource')` within `browser-script.ts` to extract loaded assets (images, scripts, fonts) and append them to the graph.
- **`InteractiveNode` (Level 5/DOM):** While native bound event listeners are invisible to standard DOM APIs, we will extract `InteractiveNode` representations by parsing inline `on*` attributes, `tabIndex`, cursor styles, and potentially attaching to Playwright's CDP `Runtime.getEventListeners`.
- **`NetworkRequestNode`:** Intercept network events in `PlaywrightAdapter.ts` using `page.on('request')` and `page.on('response')`. We will buffer these events and inject them into the Observation Graph during snapshot construction.

### 2.3 Event Streaming
- **Network Events:** Emit `Event.Network.RequestSent` and `Event.Network.ResponseReceived` via the `BrowserService` event bus when network events occur in Playwright.
- **Mission Events:** Emit `Event.Mission.StepStarted`, `Event.Mission.StepCompleted`, and `Event.Mission.HypothesisFormed` from the Execution Kernel (`packages/execution-kernel/src/kernel.ts`) and Coordinator Agent (`packages/coordinator/src/agent.ts`) to provide a streamable execution trace.

## 3. Impact Analysis
- **Observation Store:** The types `InteractiveNode`, `NetworkRequestNode`, and `ResourceNode` already exist in `types.ts` but were previously unpopulated. Downstream validation will naturally accept them.
- **Performance:** Adding `getComputedStyle` for pseudo-elements doubles the style calculation overhead per DOM node, but remains fast enough for periodic snapshots.
- **Validation Engine:** Visual diffing relies strictly on `GeometryNode` and `DOMNode`, so Network/Resource nodes will safely be ignored during rendering.

## 4. Required Actions
1. Approve this ACP.
2. Initialize Mission 30 in `MISSION.md` and `TASKS.md` to implement these changes.
3. Update `packages/browser-runtime` (Adapter + Script).
4. Update `packages/execution-kernel` and `packages/coordinator` to emit mission events.
