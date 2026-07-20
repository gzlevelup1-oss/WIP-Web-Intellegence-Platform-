# System Context

**What is WIP?**
Website Intelligence Platform (WIP) is a Web Intelligence Operating System. It executes web applications in a real browser, observes their behavior deterministically, and builds a queryable Observation Graph that AI agents can reason over.

**Why does it exist?**
To separate observation from reasoning. AI models guess layouts and styles poorly. By using a browser as a deterministic instrument, we can provide AI with precise, measured facts instead of relying on hallucinated inferences.

**Current Phase:**
Implementation 

**Current Mission:**
Mission 19: Browser Runtime Extraction

**Mission Status:**
APPROVED

**Current Architecture Version:**
v1.0.0

**Locked Interfaces:**
- Browser Runtime API Specification (v1.0.0)
- Browser Runtime Protocol Specification (v1.0.0)

**Active ADRs:**
- ADR-001: Observation Graph & Model
- ADR-002: Browser Runtime
- ADR-003: Session Manager
- ADR-004: Validation Protocol
- ADR-005: Execution Kernel
- ADR-006: Monorepo Architecture
- ADR-007: Execution Kernel and Playwright Decoupling
- ADR-008: Composition Roots
- ADR-009: Public API Principle
- AVP-001: Architecture Integrity Verification Protocol
- AFR-001: Architecture Friction Report Protocol
- ARCH-002: Corrected Architectural Assessment - Browser Runtime Extraction
- ACP-003: Browser Runtime Extraction Migration Plan

**Current Constraints:**
- AI Implementor must follow the Engineering Constitution (`AGENTS.md`).
- Ensure `browser-runtime` package extraction maintains strict dependency isolation and architectural invariants (no package depends on apps/*).

**Next Milestone:**
Complete extraction of `packages/browser-runtime` according to ACP-003.

**System Boundaries & Ownership:**
*   **Browser Runtime** owns Playwright, Browser lifecycle, Browser sessions, Browser checkpoints.
*   **Coordinator** owns probabilistic reasoning.
*   **Execution Kernel** owns deterministic execution.
*   **Validation Engine** owns validation policies.
*   **Observation Store** owns persisted observations.

**Forbidden Dependency Matrix:**
*   `execution-kernel` -> `playwright` (Forbidden)
*   `validation-engine` -> `browser-runtime` (Forbidden)
*   `workers` -> `react` (Forbidden)
*   `packages/*` -> `apps/*` (Forbidden)
