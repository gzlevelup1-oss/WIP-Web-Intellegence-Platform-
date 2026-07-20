# ARCH-002: Corrected Architectural Assessment - Browser Runtime Extraction
**Status:** APPROVED
**Date:** 2026-07-20
**Author:** Product Owner / System Architect

## 1. Architectural Correction
The current repository is **not** structured as a monolithic web application. It successfully follows a domain-oriented monorepo architecture where core business capabilities are extracted into independent packages.

The architectural concern is not that "the backend is coupled to the web app", but rather that the composition root (`apps/browser-lab/server.ts`) has absorbed infrastructure responsibilities that belong in their own domain package.

## 2. The Coupling in `server.ts`
Currently, `server.ts` couples the following infrastructure concerns to the web host:
* Playwright session management
* Express routing
* API implementations
* Browser lifecycle management
* Adapter implementations (Kernel & Worker bridges)
* Infrastructure wiring

## 3. Proposed Resolution: `packages/browser-runtime`
The remaining opportunity is to extract the **Browser Runtime infrastructure** into its own package. 

Instead of a generic `lab-backend`, we should introduce `packages/browser-runtime`. This package must remain entirely **transport-agnostic** (it should not own HTTP routers or Express logic).

### Domain Responsibilities:
* Browser sessions
* Navigation
* Page lifecycle
* Screenshot capture
* Observation acquisition
* Runtime state

### Infrastructure Responsibilities:
* Playwright adapter (`PlaywrightBrowserAdapter` implementing `IBrowserAdapter`)
* Browser process management
* Dependency injection entry points

### Out of Scope (What it does NOT own):
The `browser-runtime` package must remain focused. It explicitly does **not** own:
* AI orchestration
* Validation policies
* Worker scheduling
* Observation persistence
* Execution planning
These remain the responsibility of their existing respective packages.

### Host Responsibilities (`apps/browser-lab`):
The Browser Lab application becomes a thin host responsible only for:
* Serving the frontend
* Composing infrastructure and exposing transports (e.g., wiring the programmatic API to Express routes)
* Configuring dependency injection
* Starting the HTTP server

The host should never decide browser behavior; it should only wire components together.

## 4. Target Architecture Diagram

```text
                 apps/browser-lab
                 Composition Root
                       |
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
 browser-runtime   coordinator   validation-engine
        |
        |
        v
 Playwright Adapter
```

## 5. Architectural Invariants & Rules
To prevent future regression, we establish the following invariants and rules (which align with ADR-002):

> **Architectural Invariant:** `browser-runtime` owns browser execution capabilities. Application hosts (`apps/*`) may compose these capabilities and expose transports (e.g., HTTP, gRPC) but must not implement browser execution, session management, or adapter logic themselves.

> **Dependency Rule:** `browser-runtime` may depend on `execution-kernel`, `observation-store`, and other domain packages through their public APIs. No package may depend on `apps/*`.

> **Interface Ownership Rule:** Domain packages own their interfaces. Infrastructure packages implement those interfaces. (e.g., `browser-runtime` owns `IBrowserAdapter`, while the Playwright adapter implementation fulfills it).

> **Transport Principle:** Transport Adapters are Hosts. HTTP, CLI, MCP, gRPC, and test harnesses are transport layers that consume `browser-runtime`; they are not part of the runtime itself.

> **Composition Root:** `apps/browser-lab/server.ts` is the application's composition root. Its responsibility is limited to constructing services, configuring dependency injection, composing transports, and starting the application. It contains no business or runtime logic.
