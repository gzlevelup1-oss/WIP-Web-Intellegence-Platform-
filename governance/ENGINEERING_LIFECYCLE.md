# Engineering Lifecycle

This document defines how WIP evolves from an idea into released functionality.

## Proposed Lifecycle

```
Idea
  ↓
Research
  ↓
RFC
  ↓
Discussion
  ↓
Approval
  ↓
Architecture
  ↓
ADR
  ↓
Mission
  ↓
Tasks
  ↓
Implementation
  ↓
Verification
  ↓
Acceptance
  ↓
Lock
  ↓
Release
```

Every feature follows this pipeline.

## Request for Comments (RFC)

Before architectural decisions are made (ADR), an RFC documents possible solutions.

**Flow:** Idea → RFC → Discussion → Approval → ADR → Mission → Implementation

**Example:**
*   **RFC-001:** Should WIP use Playwright or Puppeteer? (Explores options and tradeoffs)
*   **ADR-002:** Browser Runtime (Documents the final decision, e.g., Playwright)

This separation keeps architectural history clean: RFCs explore possibilities, ADRs document final decisions.

## Stable vs Experimental

Not every feature should be governed equally.

*   **Core / Stable:** Features like Observation Graph, Session Manager, Validation. Once approved, these are **LOCKED** and strictly governed by interface freezes.
*   **Experimental:** Features like Canvas Analyzer, Animation Detector, AI Summarizer. These can evolve rapidly without strict interface governance until they are promoted to Stable.

## Success Metrics

Each phase of the project requires measurable exit criteria.

**Example: Phase 1 Exit Criteria**
- [ ] Browser launches reliably.
- [ ] Navigation succeeds on supported sites.
- [ ] Screenshot capture passes tests.
- [ ] DOM extraction is deterministic.
- [ ] Cross-platform tests pass.

**Example: Phase 2 Exit Criteria**
- [ ] Observation snapshots are immutable.
- [ ] Geometry accuracy within defined tolerance.
- [ ] Accessibility extraction validated.
- [ ] CSS capture complete for supported properties.

Without measurable completion criteria, phases tend to expand indefinitely.
