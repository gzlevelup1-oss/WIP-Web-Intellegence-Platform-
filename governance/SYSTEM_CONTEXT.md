# System Context

**What is WIP?**
Website Intelligence Platform (WIP) is a Web Intelligence Operating System. It executes web applications in a real browser, observes their behavior deterministically, and builds a queryable Observation Graph that AI agents can reason over.

**Why does it exist?**
To separate observation from reasoning. AI models guess layouts and styles poorly. By using a browser as a deterministic instrument, we can provide AI with precise, measured facts instead of relying on hallucinated inferences.

**Current Phase:**
Planning 

**Current Mission:**
Mission 35: Kernel Capability Validation

**Mission Status:**
Draft

**Current Architecture Version:**
v1.0.0

**Locked Interfaces:**
- Browser Runtime API Specification (v1.0.0)
- Browser Runtime Protocol Specification (v1.0.0)
- Observation Model Specification (v1.0.0)
- Observation Graph Specification (v1.0.0)
- Execution Kernel Specification (v1.0.0)
- Coordinator Protocol Specification (v1.0.0)
- Worker Specifications (v1.0.0)
- Validation Engine Specification (v1.0.0)

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
- AFR-002: Specification vs Implementation Discrepancies
- CIR-001: Discrepancy Remediation Impact Analysis

**Active Proposals:**
- ARCH-002: Corrected Architectural Assessment - Browser Runtime Extraction
- ACP-006: Browser Runtime Extraction Migration Plan
- ACP-007: Behavior-Driven E2E Testing Strategy
- ACP-008: E2E Test Maturation & Gap Closing
- ACP-009: Express API Decoupling
- ACP-010: UI/UX Integration Plan
- ACP-011: NIH Custom Logic Replacement
- ACP-012: Governance Synchronization and Discrepancy Reconciliation
- ACP-013: Native Playwright Storage State Integration
- ACP-014: Technical Debt Resolution Strategy (TD-005 - TD-009)
- ACP-018: Soft Checkpointing & State Persistence (TD-013)
- ACP-019: Future Mission Lifecycle Gating Protocol
- ACP-020: Browser Runtime Specification Alignment
- ACP-021: Kernel Capability Validation
- ACP-022: Coordinator Planning Alignment

**Current Constraints:**
- AI Implementor must follow the Engineering Constitution (`AGENTS.md`).
- Ensure `browser-runtime` package extraction maintains strict dependency isolation and architectural invariants (no package depends on apps/*).
- All future development missions and features are strictly gated under ACP-019 and AVP-001 (Proposal -> Verification -> Evidence Payload -> Approval).

**Next Milestone:**
Awaiting next mission assignment.

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
