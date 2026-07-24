# Architecture Change Proposal: Browser Runtime Error Model and JSON-RPC Alignment

**ID:** ACP-023
**Status:** Approved
**Author:** AI Implementor
**Date:** 2026-07-24
**Related AFRs:** AFR-004, AFR-005

## 1. Problem Statement
The current implementation of the `browser-runtime` package contains two major structural discrepancies when compared against its governing specifications (`BROWSER_RUNTIME_API.md` and `BrowserRuntime.protocol.md`):
1. **Error Model (AFR-004):** The runtime uses flat, native JavaScript errors instead of the deterministic, hierarchical `RuntimeError` taxonomy required by the spec. This prevents the Coordinator from reliably reacting to specific execution failures (e.g., distinguishing a navigation timeout from a fatal browser crash).
2. **Protocol Format (AFR-005):** The runtime exposes a direct TypeScript interface (`IBrowserRuntime`) rather than the mandated JSON-RPC 2.0 transport layer. This tight coupling prevents the integration of out-of-process execution engines (like the Extension Runtime).

## 2. Proposed Changes
As recommended in AFR-004 and AFR-005 (Option A) and validated against industry standards (W3C WebDriver BiDi, Chrome DevTools Protocol):

1. **Implement Deterministic Error Hierarchy:**
   - Create a base `RuntimeError` class.
   - Implement specific subclasses: `NavigationError`, `NetworkError`, `PermissionError`, `TimeoutError`, `BrowserCrash`, `ObservationError`, and `UnsupportedCapabilityError`.
   - Refactor `PlaywrightAdapter.ts` to map internal Playwright exceptions to these precise errors.

2. **Implement JSON-RPC 2.0 Transport Layer:**
   - Develop a JSON-RPC adapter wrapper that wraps the internal `BrowserRuntime`.
   - Standardize all inbound/outbound messages (Requests, Responses, Errors, Events) to conform strictly to the JSON-RPC 2.0 envelope schema defined in `BrowserRuntime.protocol.md`.

## 3. Impact & Risk
- **Impact:** Significant improvement in the AI Coordinator's ability to self-heal and retry operations deterministically. Enables the upcoming Extension Runtime architecture.
- **Risk:** High refactoring footprint within `browser-runtime`. E2E tests and Coordinator hooks that currently rely on direct object manipulation or flat error parsing will need to be updated to support JSON-RPC responses and the new error hierarchy.

## 4. Alternatives Considered
- **Modify Specs to Match Implementation:** We considered modifying `BROWSER_RUNTIME_API.md` and `BrowserRuntime.protocol.md` to accept flat errors and a direct TypeScript Promise interface. This was **rejected** because it degrades fault-tolerance for the AI Coordinator and permanently blocks out-of-process Extension Runtimes.

## 5. Approval & Evidence
- **Industry Standard Validation:** JSON-RPC over WebSockets with strongly typed error classes is the exact architecture utilized by Chrome DevTools Protocol (CDP) and WebDriver BiDi.
- **Approval Required:** Requires Architecture/User approval to transition to Active implementation status.
