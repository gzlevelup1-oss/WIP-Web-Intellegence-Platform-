# System Context

**What is WIP?**
Website Intelligence Platform (WIP) is a Web Intelligence Operating System. It executes web applications in a real browser, observes their behavior deterministically, and builds a queryable Observation Graph that AI agents can reason over.

**Why does it exist?**
To separate observation from reasoning. AI models guess layouts and styles poorly. By using a browser as a deterministic instrument, we can provide AI with precise, measured facts instead of relying on hallucinated inferences.

**Current Phase:**
Phase 1 - Specification (Drafting Architecture Protocols)

**Current Mission:**
Mission 3: Observation Model Specification

**Mission Status:**
Design Review Required

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

**Current Constraints:**
- AI Implementor must follow the Engineering Constitution (`AGENTS.md`).
- No implementation code is to be written until specifications and protocols are locked.

**Next Milestone:**
Lock Observation Model Specification
