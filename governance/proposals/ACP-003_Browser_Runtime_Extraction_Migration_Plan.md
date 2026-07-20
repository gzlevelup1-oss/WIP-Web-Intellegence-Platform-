# ACP-003: Browser Runtime Extraction Migration Plan
**Status:** APPROVED
**Date:** 2026-07-20
**Author:** AI Implementor / System Architect

## 1. Context & Motivation
Following the approval of [ARCH-002: Corrected Architectural Assessment - Browser Runtime Extraction](./ARCH-002_Corrected_Architectural_Assessment.md), this document details the step-by-step migration plan to extract the Browser Runtime infrastructure from the web host (`apps/browser-lab/server.ts`) into a dedicated `packages/browser-runtime` package.

## 2. Non-Goals
This migration will not:
- Change browser behavior.
- Change API contracts.
- Change the React UI.
- Introduce new runtime features.
- Refactor Coordinator.
- Refactor Execution Kernel.

## 3. Current State Inventory (`apps/browser-lab/server.ts`)
Currently, `server.ts` performs the following infrastructure tasks that must be migrated:
- Imports and manages the `Browser` and Playwright context lifecycles (`getBrowser()`, `context.newPage()`, etc.).
- Evaluates scripts within the page (e.g., extracting the Observation Graph).
- Invokes actions against the `ExecutionKernel`.
- Defines mock adapters (`IExecutionKernelAdapter`, `IWorkerAdapter`).
- Wires the HTTP routes `/api/simulator/snapshot`, `/api/simulator/command`, `/api/workers/*`, `/api/coordinator/*`, and `/api/validation/*`.

## 4. Target Architecture & Dependencies

### Package Dependency Diagram (Import Graph)
To ensure strict unidirectional data flow, the dependency graph must adhere to the following structure. 
*(Note: This diagram shows what packages **import** each other, not where they live on the file system. All packages remain in the root `/packages/` directory.)*

```text
[apps/browser-lab]
 │
 ├── imports ──> [packages/browser-runtime] (The new package)
 │                 ├── (optionally depends on) ──> [packages/execution-kernel]
 │                 ├── depends on ──> [packages/observation-store]
 │                 └── depends on ──> [playwright] (external npm module)
 │
 ├── imports ──> [packages/coordinator]
 ├── imports ──> [packages/validation-engine]
 └── imports ──> [packages/workers]
```
*Crucial Invariant: No package in `packages/*` may import from `apps/*`.*

### The Target Package: `packages/browser-runtime`
We will create a new monorepo package with the following structure:

```text
packages/browser-runtime/
├── package.json
├── tsconfig.json
└── src/
    ├── contracts/
    │   └── IBrowserAdapter.ts      // Interface ownership rule
    ├── runtime/
    │   ├── BrowserRuntime.ts       // The core programmatic entry point (façade)
    │   └── SessionManager.ts       // Maps sessionId to active browser states
    ├── services/
    │   └── BrowserService.ts       // Domain logic for browser sessions and captures
    └── adapters/
        └── PlaywrightAdapter.ts    // Implements IBrowserAdapter
```

### Explicit Public API
The `browser-runtime` package will expose the following programmatic façade. The host (`server.ts`) will ONLY interact with this API, never with internal adapters.

```typescript
export interface IBrowserRuntime {
    getMetadata(): Promise<RuntimeMetadata>;
    getCapabilities(): Promise<RuntimeCapabilities>;
    createSession(): Promise<string>;
    closeSession(sessionId: string): Promise<void>;
    navigate(sessionId: string, url: string): Promise<void>;
    capture(sessionId: string, levels: number[]): Promise<ObservationSnapshot>;
    click(sessionId: string, nodeId: string, modifiers?: string[]): Promise<void>;
    type(sessionId: string, nodeId: string, text: string, delay?: number): Promise<void>;
    scroll(sessionId: string, distanceY: number, behavior?: string): Promise<void>;
}
```

## 5. Migration Steps

### Step 0: Dependency Analysis
Inventory everything `server.ts` currently imports and classify them to prevent accidental coupling:
- **Move**: Playwright
- **Keep/Inject**: `coordinator`, `execution-kernel`, `validation-engine`, `observation-store`, `workers`
- **Replace/Remove**: Inline mock adapters

### Step 1: Initialize the Package
- Create the folder structure under `packages/browser-runtime`.
- Define `package.json` (exporting the main entry point) and `tsconfig.json`.
- Add dependencies (`playwright` strictly for the adapter). Do not add `express`.

### Step 2: Define Contracts & Core Logic
- Extract the `IBrowserAdapter` interface into `contracts/`.
- Implement `SessionManager`. Its responsibility is strictly limited to owning the session registry, lifecycle, lookup, and cleanup.
- Implement `BrowserService`. Its responsibility is to handle screenshots, navigation, and interaction primitives (e.g., click, type, scroll).
- Implement `PlaywrightAdapter` to fulfill `IBrowserAdapter`, encapsulating all Playwright-specific logic.
- Implement `BrowserRuntime` as a high-level public façade exposing methods like `getMetadata()`, `createSession()`, `navigate()`, `capture()`, `click()`, `type()`. Internally, it composes `SessionManager`, `BrowserService`, and the `Adapter`.

### Step 3: Implement Transport Adapters in the Host
- Inside `apps/browser-lab`, implement transport adapters that translate HTTP requests into `Browser Runtime` operations.
- Refactor `apps/browser-lab/server.ts` to be the pure Composition Root: it will instantiate `PlaywrightAdapter`, pass it to `BrowserRuntime`, attach the transport adapters to Express, and start the server.

### Step 4: Implementation Validation
- Run type checks across all packages (`npm run lint`).
- Ensure the React UI can still request snapshots and issue commands without any regression in behavior.

### Step 5: Architecture Validation
Verify the following architectural invariants are upheld:
- No Playwright imports remain inside `apps/browser-lab`.
- No package imports anything from `apps/*`.
- `browser-runtime` exports only public APIs (the façade and contracts).
- All adapters implement explicit interfaces.
- The Composition Root (`server.ts`) performs only object construction and transport wiring.

## 6. Definition of Done
- [ ] `Browser Runtime` contains all browser execution logic.
- [ ] Playwright is referenced only by adapter implementations.
- [ ] `BrowserRuntime` exposes a stable programmatic API.
- [ ] Composition Root contains no business logic.
- [ ] Existing APIs continue functioning identically.
- [ ] Browser Lab UI requires no changes.
- [ ] Architectural invariants pass validation.

## 7. Rollback Criteria
If any of the following occur during migration, the migration must be aborted, the branch discarded, and the findings documented for a revised ACP:
- The React UI loses core functionality (e.g., cannot take snapshots) and cannot be fixed within a reasonable timebox.
- Existing tests fail and the root cause requires a major architectural compromise to fix.
- `server.ts` cannot be fully decoupled without introducing circular dependencies between packages.

## 8. Success Metrics
- **LOC Reduction**: Lines of code in `apps/browser-lab/server.ts` reduced significantly (target > 50% reduction in logic).
- **Zero Playwright Imports**: `apps/browser-lab` has 0 imports of `playwright`.
- **Absolute Encapsulation**: 100% of browser lifecycle management is encapsulated in `packages/browser-runtime`.
- **Zero Frontend Impact**: 0 changes required to `apps/browser-lab/src` (the React frontend UI).

## 9. Testing Strategy (Constitutional Requirement)
Per the Engineering Constitution (`AGENTS.md` - Rule 11), the following testing strategy validates this architectural extraction:

**Unit Tests (`packages/browser-runtime`):**
- Verify `SessionManager` correctly registers, looks up, and cleans up isolated session IDs (Unit).
- Verify `BrowserService` correctly dispatches capture, navigation, and execution intents to the adapter (Unit).
- Verify `BrowserRuntime` (the façade) properly orchestrates the internal services without leaking implementation details (Unit).

**Integration Tests:**
- Verify `PlaywrightAdapter` works against a real headless Chromium instance, effectively launching, interacting, and capturing snapshots without leaking Playwright instances (Integration).
- Verify the Composition Root in `apps/browser-lab` can correctly instantiate and wire the HTTP routes to the extracted runtime.

**End-to-End Tests (if applicable):**
- Verify that the `apps/browser-lab` UI can successfully drive a session through its REST API, confirming zero functional drift after extraction.

**Validation Criteria:**
- 100% of the Public API methods in `IBrowserRuntime` are successfully exercised via the transport routes.
- The monorepo `npm run test` executes successfully across the newly created package.

**Success Metrics:**
- Test coverage for `SessionManager` and `BrowserRuntime` core orchestration logic meets or exceeds 80%.
- E2E UI behavior parity is 100% maintained.

## 10. Error Handling Policies
Per `ENGINEERING_LIFECYCLE.md` Stage 2 requirements, the `browser-runtime` package will enforce the following error handling semantics:

**Custom Exception Models:**
- `BrowserLaunchError`: Thrown when the underlying Playwright instance fails to start.
- `SessionNotFoundError`: Thrown when a request references a `sessionId` not present in `SessionManager`.
- `NavigationTimeoutError`: Thrown when a page fails to reach the requested URL within the allowed time limit.
- `BrowserExecutionError`: Thrown when an interaction (click, type, evaluate) fails within the browser context.

**Failure Recovery Modes:**
- **Mid-Session Crashes:** The `PlaywrightAdapter` will listen for unexpected browser/page disconnections. If a crash occurs, it will notify `SessionManager` to immediately evict the `sessionId` and release associated memory to prevent zombie processes.
- **Zombie Processes:** `SessionManager` will enforce a TTL/cleanup mechanism for idle sessions to ensure orphaned Playwright processes are explicitly terminated.

**User-Facing Notifications (Transport Layer Mapping):**
The transport adapters in `apps/browser-lab` must catch these specific custom exceptions and map them to appropriate HTTP status codes to prevent leaking infrastructure details to the frontend:
- `SessionNotFoundError` -> HTTP 404 (Not Found)
- `NavigationTimeoutError` -> HTTP 504 (Gateway Timeout)
- `BrowserExecutionError` -> HTTP 400 (Bad Request)
- `BrowserLaunchError` -> HTTP 500 (Internal Server Error)
