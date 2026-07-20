# Current Mission

**Mission:** Browser Runtime Extraction
**Status:** COMPLETED
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
**Stage:** Passed Stage 5 (Implementation) -> Stage 6 (Verify) -> Stage 7 (Locked)
- **Validation Criteria Met:**
  - 100% of the Public API methods in `IBrowserRuntime` are successfully exercised via the transport routes.
  - The monorepo `npm run test` executes successfully across the newly created package.
  - UI behavior parity is 100% maintained.
  - Test coverage for `SessionManager` and `BrowserRuntime` core orchestration logic meets or exceeds 80%.
  - Zero imports of Playwright exist inside `apps/browser-lab`.
