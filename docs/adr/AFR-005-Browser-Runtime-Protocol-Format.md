# AFR-005: Browser Runtime Protocol JSON-RPC Discrepancy

**Status:** Review
**Owner:** Architecture
**Date:** 2026-07-24

## 1. Context
During the alignment review of `packages/browser-runtime` against `specs/BrowserRuntime.protocol.md`, a structural discrepancy regarding the message transport format was identified.

## 2. Violated Invariant
The `BrowserRuntime.protocol.md` Specification defines the runtime protocol as a "Message-based RPC (JSON-RPC 2.0 compatible)" system. It specifies standard JSON-RPC 2.0 envelopes for `Request`, `Response`, `Error`, and `Event`, and maps capability invocations to specific JSON-RPC method strings (e.g., `Navigation.open`, `Observation.capture`) with numeric JSON-RPC error codes (e.g., `-32601`, `4001`).

## 3. Why implementation cannot proceed
The `packages/browser-runtime` package currently implements a direct TypeScript class/interface (`IBrowserRuntime` / `BrowserRuntime`), which is designed for in-process method invocation via Promises. There is no JSON-RPC translation layer, transport mechanism (e.g., WebSocket, standard IO), or support for the standardized JSON-RPC error codes defined in the specification.

## 4. Candidate Solutions
- **Option A:** Implement a JSON-RPC transport adapter wrapper around `BrowserRuntime` (e.g., a `JsonRpcServer` and `JsonRpcClient`) that conforms exactly to the method names and error codes defined in `BrowserRuntime.protocol.md`.
- **Option B:** Deprecate the strict JSON-RPC protocol requirement in `BrowserRuntime.protocol.md` in favor of a direct TypeScript interface definition, acknowledging that the Browser Runtime is currently compiled into the same Node.js process as the Execution Kernel and Coordinator.

## 5. Architectural Tradeoffs
- **Option A** fulfills the original architectural vision of a completely decoupled, language-agnostic Browser Runtime that can run as a standalone process (which is crucial for the Extension Runtime). However, it adds significant serialization/deserialization overhead and complexity to the current Node.js monorepo setup.
- **Option B** aligns with the current implementation and simplifies the architecture for a single-process headless model, but sacrifices the ability to easily separate the runtime across network boundaries or communicate with non-Node.js runtimes.

## 6. Recommendation
**Option A.** The specification explicitly mandates a dual runtime architecture (Headless vs. Extension). Without a standardized message-passing protocol like JSON-RPC, integrating an out-of-process Extension Runtime (running inside a user's local browser) will be impossible. We must implement the JSON-RPC adapter layer.

## 7. Industry Validation & Research
- **Chrome DevTools Protocol (CDP):** The de facto standard for modern browser automation (powering Puppeteer and Chromium Playwright) uses exactly this architecture: JSON-RPC 2.0 over WebSockets.
- **WebDriver BiDi:** The next-generation W3C browser automation standard explicitly adopts JSON-RPC over WebSockets to support bi-directional communication (unlike the older HTTP-based WebDriver standard).
- **Conclusion:** Option A perfectly mirrors the architecture of CDP and WebDriver BiDi. Because our specification requires real-time event streaming (`Event.Network.RequestSent`) and support for an out-of-process Extension Runtime, JSON-RPC 2.0 is the proven, industry-standard mechanism to achieve this decoupled, bi-directional architecture.
