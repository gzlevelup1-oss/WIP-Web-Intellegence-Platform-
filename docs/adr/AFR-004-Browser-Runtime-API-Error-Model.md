# AFR-004: Browser Runtime API Error Model Discrepancy

**Status:** Review
**Owner:** Architecture
**Date:** 2026-07-24

## 1. Context
During the alignment review of `packages/browser-runtime` against `specs/BROWSER_RUNTIME_API.md`, a significant discrepancy was identified regarding the Error Model.

## 2. Violated Invariant
The `BROWSER_RUNTIME_API.md` Specification (Section 7) requires errors to be hierarchical and deterministic, deriving from a base `RuntimeError` with specific subclasses: `NavigationError`, `NetworkError`, `PermissionError`, `TimeoutError`, `BrowserCrash`, `ObservationError`, and `UnsupportedCapabilityError`.

## 3. Why implementation cannot proceed
The current implementation in `packages/browser-runtime/src/runtime/errors.ts` uses ad-hoc, flat errors that derive directly from the native `Error` class: `BrowserLaunchError`, `SessionNotFoundError`, `NavigationTimeoutError`, and `BrowserExecutionError`.
This prevents the Execution Kernel and Coordinator from deterministically handling specific failures (e.g., distinguishing an observation failure from a browser crash).

## 4. Candidate Solutions
- **Option A:** Rewrite `packages/browser-runtime/src/runtime/errors.ts` to fully implement the `RuntimeError` hierarchy defined in the specification, and update `PlaywrightAdapter.ts` to map Playwright exceptions to these deterministic errors.
- **Option B:** Update `BROWSER_RUNTIME_API.md` to reflect the currently implemented, simpler error model.

## 5. Architectural Tradeoffs
- **Option A** preserves the strict architectural requirement for deterministic execution and robust error handling by the Coordinator, but requires refactoring the runtime and adapter layers.
- **Option B** is faster but weakens the system's fault tolerance, as downstream consumers will rely on string matching to distinguish between different types of execution failures.

## 6. Recommendation
**Option A.** The original specification for deterministic errors is necessary for the AI Coordinator to reliably recover from failures. We should update the codebase to match the specification.

## 7. Industry Validation & Research
- **W3C WebDriver & WebDriver BiDi:** Define strict error codes (e.g., `no such element`, `element not interactable`, `timeout`) mapped to specific JSON payloads, ensuring clients can programmatically switch on error types without parsing string messages.
- **Playwright/Puppeteer:** Provide specific error subclasses (e.g., `playwright.errors.TimeoutError`) that allow developers and test runners to implement deterministic retry logic.
- **Conclusion:** Option A strongly aligns with industry standards. For an autonomous AI Coordinator to reliably recover from failures, it must rely on strongly-typed error hierarchies (e.g., retrying on a `TimeoutError`, but aborting on a `BrowserCrash`) rather than brittle regex parsing of error messages.
