# ADR-009: Public API Principle

**Status:** Approved
**Owner:** Architecture

## Context
As the monorepo grows, packages may be tempted to import internal implementations, types, or services directly from other packages to bypass the exported interface. This breaks encapsulation, couples internal implementations across package boundaries, and prevents refactoring.

## Decision
We formally adopt the **Public API Principle**:
Packages communicate only through explicitly exported public APIs (typically defined in the package's `index.ts` or a designated `public/` or `contracts/` export).

## Rules
*   Internal folders such as `contracts/`, `internal/`, `adapters/`, `runtime/`, and `services/` must **never** be imported directly from another package unless explicitly designated as public.
*   Cross-package imports must always resolve to the package root (e.g., `import { IBrowserRuntime } from '@wip/browser-runtime'`). Deep imports (e.g., `import { BrowserService } from '@wip/browser-runtime/src/services/BrowserService'`) must not be used.
*   The Composition Root is the only place allowed to wire concrete implementations, and it must still respect package export boundaries where possible.

## Consequences
*   Packages can safely refactor internal file structures without breaking consumers.
*   API surfaces remain intentional and documented.
*   This invariant is verified by the Repository Fitness Functions (AVP-001).
