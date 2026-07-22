# ACP-001: Persistent Session & Coordinator Integration
**Status:** ARCHIVED (Replaced by ACP-006)
**Date:** 2026-07-20
**Author:** AI Implementor / System Architect

## 1. Context & Motivation
An analysis of `@wip/browser-lab` (`server.ts`) reveals critical gaps between the frontend API and the underlying intelligence engines. Specifically:
1. **Ephemeral Sessions:** The simulator creates and immediately destroys Playwright contexts upon every request (`/api/simulator/snapshot` and `/api/simulator/command`), discarding the state needed for subsequent actions.
2. **Mocked Coordinator:** The `/api/simulator/command` route bypasses the `@wip/coordinator` entirely, opting for a hardcoded Gemini prompt that simply returns string text without executing tools.
3. **Mocked Adapters:** The `/api/coordinator/start` route passes non-functional mock adapters (`IExecutionKernelAdapter`), preventing real interaction with the browser via the Execution Kernel.

To make the Browser Laboratory functionally usable, the Express API must maintain stateful browser sessions and wire the real Coordinator to the real Execution Kernel.

## 2. Proposed Architecture Changes

### A. Persistent Session Management
- Introduce an in-memory `SessionManager` (or simple `Map` in `server.ts`) to store active Playwright `BrowserContext` and `Page` references mapped to a `sessionId`.
- `/api/simulator/snapshot` will generate a new `sessionId`, create a persistent context, and return the `sessionId` to the client.
- `context.close()` will be deferred to a dedicated `/api/simulator/terminate` endpoint or timed expiration, rather than running at the end of the request.

### B. Real Coordinator Execution
- Refactor `/api/simulator/command` to use the actual `CoordinatorAgent` from `@wip/coordinator`.
- The request must pass the `sessionId` so the server can retrieve the persistent Playwright page.

### C. Live Execution Kernel Adapters
- Implement a concrete `IExecutionKernelAdapter` in `server.ts` that uses the real `ExecutionKernel` to execute actions against the persistent `sessionId`.
- Example: `click(nodeId)` will look up the Playwright selector from the Observation Store and perform `page.click(selector)` via a Kernel transaction.
- After a command finishes executing tools, the API will automatically trigger a new Snapshot (Graph + Screenshot) and return the updated state to the UI.

## 3. Scope Boundaries
**In Scope:**
- Refactoring Express routes in `server.ts` for stateful Playwright sessions.
- Wiring `CoordinatorAgent` to `/api/simulator/command`.
- Implementing real `ExecutionKernel` adapters for the Coordinator.

**Out of Scope:**
- Modifying the internal logic of the Execution Kernel or Coordinator packages.
- Adding complex multi-tab or multi-window session support (single tab per session is sufficient).

## 4. Required Approvals
This ACP requires explicit approval from the User / Product Owner before it can be converted into an active Mission (`governance/MISSION.md`) and implemented.
