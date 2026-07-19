# Browser Runtime API Specification

**Version:** 1.0.0-Draft  
**Related ADR:** ADR-002  

## 1. Purpose & Separation of Concerns
The **Browser Runtime** exists to provide a deterministic, observable execution layer for web experiences. 

**API vs. Protocol:**
- **The Protocol** (`BrowserRuntime.protocol.md`) defines *how* messages are exchanged.
- **The API** (This document) defines *what* capabilities exist and their behavioral contracts.
They must not overlap. The Coordinator depends on the API capability contracts, not the underlying wire format.

## 2. Principles
These principles are architectural invariants for the runtime:
- **Deterministic:** Given identical inputs, it must produce identical outputs.
- **Observable:** Every layout, style, and interactive shift must be extractable.
- **Stateless API:** The interface itself holds no business logic.
- **Stateful Session:** The runtime preserves necessary browser context during a session.
- **Tool Driven:** Execution is strictly managed via a defined capability tool suite.
- **Framework Agnostic:** The interface must not leak underlying framework specifics.
- **No AI:** The runtime performs zero semantic reasoning or inference.
- **Reproducible:** Timing, viewport, and network conditions must be highly controllable.

## 3. Responsibilities
**The Browser Runtime is responsible for:**
- Launching and terminating browser instances safely.
- Exposing deterministic Interaction primitives (Click, Type, Scroll).
- Fulfilling observation requests (DOM, CSS, Geometry, Screenshots).
- Executing atomic browser actions dispatched by the Kernel.

**The Browser Runtime is NOT responsible for:**
- Semantic reasoning, generating Forge IR, inferring semantics, or validation.
- Mission orchestration, transactions, scheduling, retries, checkpoints, or cancellation policies (these belong to the Execution Kernel).

## 4. Capability Discovery & Runtime Metadata
The Coordinator must not assume all runtimes support all features. Runtimes must expose metadata and capabilities upon initialization.

**Runtime Metadata:**
- `Runtime ID`, `Version`, `Browser Version`, `Protocol Version`
- `Platform`, `Viewport`, `Locale`, `Timezone`, `User Agent`

**Capability Discovery:**
The Coordinator queries supported capabilities (e.g., `Navigation: ✓`, `Accessibility: ✓`, `WebGL: ✗`, `Video: ✓`). Unsupported requests return `UnsupportedCapabilityError`.

## 5. Lifecycle & Event Ordering
Event ordering is strictly defined to ensure a deterministic observation point.

**Event Ordering Sequence:**
`Navigate` → `DOMContentLoaded` → `Fonts Ready` → `Network Idle` → `Animations Stable` → **`Observation Point`**

## 6. Observation Levels & Snapshots
Observations vary in cost. The Coordinator requests specific levels to minimize overhead.

**Observation Levels:**
- **Level 0:** Metadata (URL, Timestamp, Title)
- **Level 1:** DOM (Structural tree)
- **Level 2:** Styles (Computed CSS)
- **Level 3:** Geometry (Bounding Boxes)
- **Level 4:** Accessibility (A11y Tree)
- **Level 5:** Animations (Active transitions)
- **Level 6:** Performance (Metrics, Logs)

**Observation Snapshots:**
Every observation produces an immutable identifier representing a point-in-time state.
`Snapshot` → yields an object containing `Snapshot ID`, `Timestamp`, `Hash`, and `Metadata`. Subsequent components reference the `Snapshot ID` rather than raw browser state.

## 7. Error Model
Errors are hierarchical and deterministic:
- `RuntimeError`
  - `NavigationError`, `NetworkError`, `PermissionError`, `TimeoutError`, `BrowserCrash`, `ObservationError`, `UnsupportedCapabilityError`.

## 8. Security
- **Isolation:** Execution context is securely isolated from the Coordinator. Arbitrary JavaScript (`eval`) is forbidden via external APIs; interactions must use formal capabilities.
- **Permissions:** Defaults to strictly denied.
- **State Leakage:** Sessions are strictly ephemeral.

## 9. Compatibility Guarantees
Future implementations of the Browser Runtime must preserve:
- **Protocol compatibility:** Wire-level JSON-RPC compliance.
- **API compatibility:** Semantic tool contracts (inputs/outputs).
- **Snapshot compatibility:** Identical DOM/CSS serialization hashing mechanisms.
- **Capability negotiation:** Forward-compatible capability flags.
