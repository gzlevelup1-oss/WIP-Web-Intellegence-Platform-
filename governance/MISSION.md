# Current Mission

**Mission:** Mission 37: Browser Runtime Error Model and JSON-RPC Alignment
**Status:** Locked
**Evidence Payload:**
- **Functional Verification:** Passed
- **Architectural Verification:** Passed
- **Dependency Graph:** Clean
- **ADR Compliance:** Yes (ACP-023)
**ID:** M-37

## References
- ACP-023: Browser Runtime Error Model and JSON-RPC Alignment
- AFR-004: Browser Runtime API Error Model Discrepancy
- AFR-005: Browser Runtime Protocol JSON-RPC Discrepancy
- ADR-002: Browser Runtime
- specs/BROWSER_RUNTIME_API.md
- specs/BrowserRuntime.protocol.md

## Objective
Implement a deterministic error hierarchy and a JSON-RPC 2.0 transport layer within `browser-runtime`, ensuring strict alignment with the specifications and enabling out-of-process Extension Runtimes.

## Scope
**In Scope:**
- Create `RuntimeError` hierarchy in `packages/browser-runtime/src/runtime/errors.ts`.
- Map Playwright exceptions to `RuntimeError` subclasses in `PlaywrightAdapter.ts`.
- Implement a JSON-RPC 2.0 adapter/wrapper around `BrowserRuntime`.
- Standardize all inbound/outbound messages to conform to JSON-RPC 2.0.

**Out of Scope:**
- Modifying the underlying Extension Runtime implementation (this mission only paves the way).
- Changes to the Coordinator's tool schema generation (handled in M-36).
