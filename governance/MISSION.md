# Current Mission

**Mission:** Browser Runtime Extraction
**Status:** APPROVED
**ID:** M-019

## References
- `governance/proposals/ARCH-002_Corrected_Architectural_Assessment.md`
- `governance/proposals/ACP-003_Browser_Runtime_Extraction_Migration_Plan.md`

## Objective
Extract the Browser Runtime infrastructure from the web host (`apps/browser-lab/server.ts`) into a dedicated `packages/browser-runtime` package, transforming `server.ts` into a pure composition root and keeping the runtime transport-agnostic.

## Scope
**In Scope:**
- Initializing `packages/browser-runtime` package.
- Defining contracts (`IBrowserAdapter`).
- Implementing `SessionManager`, `BrowserService`, and `PlaywrightAdapter`.
- Implementing `BrowserRuntime` programmatic façade.
- Implementing transport adapters in `apps/browser-lab/server.ts` to translate HTTP requests into Browser Runtime operations.

**Out of Scope:**
- Changing browser behavior or frontend UI.
- Introducing new runtime features.
- Modifying other domain packages (`coordinator`, `execution-kernel`, etc.).

## Adherence & Compliance Check (IWP & AGENTS.md)
**Date:** 2026-07-20
**Stage:** Passed Stage 3 (Approval Gate) -> Entering Stage 5 (Implementation)
- **Stage 0-2 (Understand & Design):** Completed via `ARCH-002` and `ACP-003`. Responsibilities, architectural bounds, public interfaces (`IBrowserRuntime`), and dependency rules are explicitly documented.
- **Stage 3 (Approval Gate):** Explicit approval obtained from Product Owner for ARCH-002 and ACP-003. Interfaces are frozen.
- **Stage 4 (Implementation Planning):** Atomic tasks documented in `TASKS.md` under Mission 19. Task 1 (Context Update) is completed.
- **Evidence Rule:** All upcoming file modifications trace directly to `ACP-003`.
- **Constraint Checklist:** 
  - [x] No code sprawl.
  - [x] Strict unidirectional dependencies.
  - [x] No `apps/*` dependencies from `packages/*`.

- **Testing Constitution Check:**
  - [x] Testing Strategy (Unit, Integration, E2E, Validation, Metrics) defined in `ACP-003` Section 9, fulfilling Rule 11.
