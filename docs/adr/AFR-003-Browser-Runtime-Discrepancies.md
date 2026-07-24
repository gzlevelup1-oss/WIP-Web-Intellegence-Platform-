# AFR-003: Browser Runtime Spec vs. Implementation Discrepancies

**Status:** Closed
**Owner:** Architecture
**Date:** 2026-07-24

## 1. Context
An architectural verification probe was executed to compare the `BROWSER_RUNTIME_API.md` and `BrowserRuntime.protocol.md` specifications against their actual realization in `packages/browser-runtime/src/contracts/`.

## 2. Discrepancies

### Discrepancy 1: Runtime Metadata Schema
* **Specification reference:** `BROWSER_RUNTIME_API.md` & `BrowserRuntime.protocol.md` (RuntimeMetadata schema)
* **Implementation reference:** `packages/browser-runtime/src/contracts/types.ts` (`RuntimeMetadata`)
* **Severity:** Medium
* **Classification:** Specification compliance defect
* **Evidence:** The specification mandates `runtimeId`, `browserVersion`, and `protocolVersion`. The implementation provides `name` (instead of `runtimeId`), `backend` (instead of `browserVersion`), and omits `protocolVersion` entirely.

### Discrepancy 2: Capability Discovery Map
* **Specification reference:** `BrowserRuntime.protocol.md` (Section 3.2 Capabilities)
* **Implementation reference:** `packages/browser-runtime/src/contracts/types.ts` (`RuntimeCapabilities`)
* **Severity:** High
* **Classification:** Extensibility defect
* **Evidence:** The specification defines an extensible map of capabilities (`{"Navigation": true, "Accessibility": true, "WebGL": false}`). The implementation hardcodes interaction primitives (`canClick`, `canType`, `canScroll`, `canCapture`), removing the ability to dynamically negotiate high-level capabilities.

### Discrepancy 3: Real-Time Event Streaming
* **Specification reference:** `BrowserRuntime.protocol.md` (Section 6. Event Stream) & `BROWSER_RUNTIME_API.md`
* **Implementation reference:** `packages/browser-runtime/src/contracts/IBrowserRuntime.ts`
* **Severity:** Critical
* **Classification:** Architectural defect (Missing Capability)
* **Evidence:** The specifications state that the runtime must emit real-time events over a WebSocket/SSE connection (e.g., `Event.Network.RequestSent`, `Event.Lifecycle.FontsReady`). The `IBrowserRuntime` interface is entirely Promise-based and exposes no event emitters, observables, or stream subscriptions.

### Discrepancy 4: Observation Snapshot Data Structure
* **Specification reference:** `BrowserRuntime.protocol.md` (Section 5.2)
* **Implementation reference:** `packages/browser-runtime/src/contracts/types.ts` (`ObservationSnapshot`)
* **Severity:** Medium
* **Classification:** Specification Conflict
* **Evidence:** `BrowserRuntime.protocol.md` defines the snapshot output as containing a `data` object with separated trees (`domTree`, `accessibilityTree`, `computedStyles`, `geometry`). The implementation uses a flat `graph: any` property. *Note: The implementation is actually closer to `OBSERVATION_GRAPH.md`, exposing a conflict between the Protocol Spec and the Graph Spec.*
