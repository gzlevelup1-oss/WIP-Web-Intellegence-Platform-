# ACP-009: Express API Decoupling

**Status:** APPROVED
**Date:** 2026-07-22
**Author:** AI Implementor

## 1. Context & Motivation
The previous attempts (ACP-003, ACP-005) at backend decoupling and persistent sessions were drafted before the `browser-runtime` package was extracted (ACP-006) and contained outdated assumptions about Playwright living directly in `server.ts`. Those proposals have been archived.

Currently, `apps/browser-lab/server.ts` is still a "God Object" integrating the Express API routes directly inline, although Playwright has been successfully extracted to `@wip/browser-runtime`. We also have mocked Coordinator logic inline in the Express API instead of wiring the actual Coordinator.

To make the Browser Laboratory functionally usable and maintainable, the Express API must be decoupled, and the real Coordinator must be wired to the UI, while strictly respecting the architectural boundaries established by the `@wip/browser-runtime`.

## 2. Proposed Architecture Changes

### A. Express Route Extraction
- Move inline Express routes from `apps/browser-lab/server.ts` into a dedicated `src/backend/routes/` directory (e.g., `simulator.routes.ts`, `coordinator.routes.ts`, `workers.routes.ts`, `validation.routes.ts`).
- `server.ts` will be stripped down to its essence: initializing the Express app, loading Vite middleware, mounting the routers, and starting the listener.

### B. Dependency Injection / Service Locator
- Introduce a mechanism to cleanly pass the `BrowserRuntime`, `ExecutionKernel`, `ObservationStore`, and `Worker` instances into the separated route handlers instead of relying on global variables in `server.ts`.

### C. Real Coordinator Integration
- Replace the mocked AI logic in `/api/simulator/command` with a real `CoordinatorAgent` from `@wip/coordinator`.
- Implement concrete adapters (`IExecutionKernelAdapter`, `IWorkerAdapter`) in the backend integration layer that the Coordinator can use to interact with the real Execution Kernel and Workers.
- After a command finishes executing tools, the API should return the updated state to the UI.

### D. Preserve Browser Runtime Boundaries
- Explicitly respect the `@wip/browser-runtime` package.
- No direct Playwright imports or session lifecycle management will be reintroduced into `apps/browser-lab`. All browser interaction goes through the `BrowserRuntime` façade.

## 3. Scope Boundaries

**In Scope:**
- Extracting Express routers into separate files.
- Wiring the real `@wip/coordinator` `CoordinatorAgent` to the Express UI endpoints.
- Dependency injection mechanism for API routes.
- Implementing concrete adapters for the Coordinator in the backend.

**Out of Scope:**
- Modifying `@wip/browser-runtime`, `@wip/execution-kernel`, or `@wip/coordinator` package internals.
- Direct UI component visual changes (UI Integration is tracked separately).
- Re-introducing Playwright into `apps/browser-lab`.

## 4. Required Approvals
Approved by User/Product Owner. Implementation has been completed and locked.
