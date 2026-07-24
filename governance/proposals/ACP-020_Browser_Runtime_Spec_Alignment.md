# Architecture Change Proposal: Browser Runtime Specification Alignment

**ID:** ACP-020
**Status:** Implemented
**Author:** AI Implementor
**Date:** 2024-07-24

## 1. Problem Statement
Discrepancies existed between `BrowserRuntime.protocol.md`, `BROWSER_RUNTIME_API.md`, `IBrowserRuntime.ts`, and `PlaywrightAdapter.ts` which violated the architectural source-of-truth defined in `OBSERVATION_GRAPH.md`.

## 2. Proposed Changes
- **Metadata Alignment:** Standardized `RuntimeMetadata` to use `{ runtimeId, browserVersion, protocolVersion, platform, viewport, locale, timezone, userAgent }`.
- **Capabilities Alignment:** Standardized `RuntimeCapabilities` to use `{ capabilities: Record<string, boolean> }` rather than hardcoded booleans.
- **Event Streaming Implementation:** Added `on`, `off` and explicit event emission (e.g. `Event.Network.RequestSent`) to `IBrowserRuntime.ts` and `BrowserRuntime.ts`. 
- **Graph Standardization:** Updated `BrowserRuntime.protocol.md` and tests to enforce the unified `ObservationGraph` structure (relational `nodes` and `edges`) instead of fragmented trees.

## 3. Impact & Risk
- **Risk:** Breaks existing snapshots in `e2e-tests`. 
- **Mitigation:** E2E snapshots updated and validated successfully. 

## 4. Alternatives Considered
- Keep the fragmented tree in the Protocol Spec, and unify in the Execution Kernel. Rejected because it violated the `OBSERVATION_GRAPH.md` canonical structure invariant.

## 5. Approval & Evidence
- Tests successfully pass across workspaces.
- AVP-001 checks successfully pass. 
