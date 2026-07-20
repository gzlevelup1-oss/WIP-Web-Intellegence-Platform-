# ARCH-001: Analysis of Web/Backend Coupling
**Status:** DRAFT (Research Note)
**Date:** 2026-07-20
**Author:** AI Implementor / System Architect

## 1. The Core Question
**"Why is the backend coupled to the web app (`apps/browser-lab`)? Should it be a separate package or a standalone backend?"**

This is an excellent architectural observation. Currently, `apps/browser-lab/server.ts` is acting as a monolithic full-stack host. It couples the React frontend delivery (Vite) tightly with complex Playwright session management, Execution Kernel adapters, and AI Coordinator logic.

## 2. Architectural Analysis

### The Case for Decoupling (Why the current setup is flawed)
1. **Domain Violation:** The React UI (`browser-lab`) should not own the Playwright execution context or the API routing logic. The UI is merely a *consumer* of the sandbox.
2. **Reusability:** If we ever want to trigger the Coordinator from a CLI tool, a CI/CD pipeline, or a different application entirely, we cannot do so if the backend is trapped inside the `browser-lab` web package.
3. **Separation of Concerns:** Adapters (`IExecutionKernelAdapter`) and session maps belong to the integration/infrastructure domain, not the presentation domain.

### The Environmental Constraint (AI Studio Runtime)
While extracting the backend into a completely separate microservice (e.g., `apps/backend` running on port 3001 and `apps/frontend` running on port 3000) is standard in some environments, **our specific cloud container restricts external access exclusively to Port 3000.**

If we spin up two independent node servers, the UI on port 3000 will not be able to fetch data from the API on port 3001.

## 3. The Proposed Architectural Solution: "Logical Decoupling via Packages"

We can achieve total domain isolation while respecting the single-port infrastructure constraint by using a **Core API Package** approach.

### Step 1: Extract a new package (`packages/api-server` or `packages/lab-backend`)
We create a completely independent package in the monorepo workspace.
This package will contain:
- `SessionManager.ts` (Playwright lifecycles)
- `adapters/` (Kernel & Worker bridges)
- `routes/` (Express API endpoints for `/api/simulator`, `/api/coordinator`)
- It will export an Express Router or a programmatic API: `export function createLabApiRouter() { ... }`

### Step 2: `apps/browser-lab` becomes a "Dumb Host"
The `server.ts` inside `apps/browser-lab` is stripped of all intelligence. Its *only* job is to listen on Port 3000, attach the frontend (Vite), and attach the backend package:

```typescript
// apps/browser-lab/server.ts (Hypothetical Future State)
import express from 'express';
import { createLabApiRouter } from '@wip/lab-backend'; // The new decoupled package
import { createViteServer } from './vite-setup';

const app = express();

// 1. Mount the completely decoupled backend domain
app.use('/api', createLabApiRouter()); 

// 2. Mount the UI delivery
app.use(await createViteServer());

app.listen(3000);
```

## 4. Conclusion & Recommendation
**You are entirely correct.** The logic *should* be a separate package. 

Instead of building all the decoupled folders (`adapters/`, `routes/`, `services/`) inside `apps/browser-lab/src/backend/` as proposed in ACP-002, **we should create a dedicated package (e.g., `packages/lab-backend`)**. 

This gives us the best of both worlds:
- Perfect architectural boundaries (the backend is a separate NPM package).
- Complete reusability (other apps can import the backend API).
- Seamless deployment (a single Node process on Port 3000 consumes both the UI and the Backend packages).

*Pending User/Product Owner feedback: If you agree with this assessment, I will update ACP-002 to reflect extracting the backend into a brand new package (`@wip/lab-backend`) rather than just creating folders inside the web app.*
