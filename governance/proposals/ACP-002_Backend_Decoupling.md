# ACP-002: Backend Decoupling & Persistent Session Implementation
**Status:** DRAFT (Pending Approval)
**Date:** 2026-07-20
**Author:** AI Implementor / System Architect

## 1. Context & Motivation
As identified by the System Architect, `apps/browser-lab/server.ts` is rapidly growing into a "God Object." Currently, it handles:
- Express server & Vite middleware initialization
- Playwright browser lifecycles
- `ExecutionKernel`, `ObservationStore`, and `Worker` instantiations
- Inline API route definitions
- Mock Coordinator logic

Implementing persistent sessions and real Coordinator adapters directly inside `server.ts` would severely compromise maintainability and violate the Single Responsibility Principle. We must architecturally decouple the backend before adding stateful intelligence.

## 2. Proposed Architecture (Separation of Concerns)

We will introduce a `backend/` (or `server/`) directory within `apps/browser-lab/` to compartmentalize responsibilities:

### A. Core Services
- **`SessionManager.ts`**: Owns the Playwright Browser lifecycle. Maps `sessionId` -> `{ context, page }`. Handles graceful termination of orphaned sessions.
- **`ServiceLocator.ts`** (or Dependency Container): Centralizes instantiation of `ExecutionKernel`, `ObservationStore`, and Workers, ensuring singleton instances are passed cleanly to routes/adapters.

### B. Adapters (Integration Layer)
- **`adapters/KernelAdapter.ts`**: Implements `IExecutionKernelAdapter`. Bridges the Coordinator's tool calls to the `ExecutionKernel`, utilizing the `SessionManager` to find the correct active page.
- **`adapters/WorkerAdapter.ts`**: Implements `IWorkerAdapter`. Bridges the Coordinator to the UI/Layout workers.

### C. Domain Routers (API Layer)
- **`routes/simulator.routes.ts`**: Handles `/api/simulator/snapshot` and `/api/simulator/command`.
- **`routes/coordinator.routes.ts`**: Handles `/api/coordinator/*`.
- **`routes/workers.routes.ts`**: Handles `/api/workers/*`.
- **`routes/validation.routes.ts`**: Handles `/api/validation/*`.

### D. Entry Point
- **`server.ts`**: Stripped down to its essence. It will only initialize the Express app, load the Vite middleware, mount the routers (e.g., `app.use('/api/simulator', simulatorRouter)`), and start the listener.

## 3. Definition of Done (DoD)

This proposal combines the Persistent Session intent (from ACP-001) with the Backend Decoupling requirement. The implementation is only considered "Done" when it passes these gates:

1. **Architectural Purity Gate**:
   - `server.ts` contains NO business logic, Playwright instances, or AI prompting.
   - Routers, Adapters, and Session logic are fully extracted into isolated, typed modules.
2. **Session Persistence Gate**:
   - The browser context is NOT closed immediately after a snapshot.
   - Subsequent requests (like commands) targeting the same `sessionId` execute within the exact same DOM state.
3. **Integration Gate**:
   - The `/api/simulator/command` route explicitly instantiates and calls the real `@wip/coordinator` `CoordinatorAgent`.
   - The `KernelAdapter` successfully maps a Coordinator tool call (e.g., `click(nodeId)`) down to a real Playwright interaction.
4. **End-to-End Execution Gate**:
   - A user can enter a URL in the UI, receive a snapshot, and issue a natural language command (e.g., "Click the login button").
   - The UI successfully displays the updated snapshot reflecting the AI's action.
5. **Quality Gate**:
   - The repository passes all TypeScript type checks (`npm run lint`).
   - The build process succeeds (`npm run build`).

## 4. Required Approvals
This combined architectural refactoring and integration plan requires explicit approval from the User / Product Owner before it becomes the active Mission.
