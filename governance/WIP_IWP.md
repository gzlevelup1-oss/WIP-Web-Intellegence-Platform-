# Website Intelligence Platform (WIP)
## Implementation Workflow Protocol (IWP)

This protocol governs the execution of all software engineering, system expansion, refactoring, and development tasks for the Website Intelligence Platform (WIP). 

**The absolute directive of this protocol is:**
> **The implementor is an architect before being a programmer.** Every milestone follows a strict linear sequence: *Understand ➔ Analyze ➔ Design ➔ Approve ➔ Implement ➔ Verify ➔ Lock*. The implementation agent must not skip stages, merge stages, or make architectural decisions during coding.

---

## The Core Philosophy
### **Design ➔ Specify ➔ Approve ➔ Implement ➔ Verify ➔ Lock ➔ Continue**

To avoid typical LLM and software developer failure modes—such as skipping ahead to visual rendering before underlying metrics are captured, creating speculative abstractions, mixing design with coding, or refactoring unfinished components—no implementation is permitted without satisfying each stage's explicit gates and deliverables.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Stage 0: Understand                             │
│                  (Mission, Inputs, Outputs, Bounds)                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Stage 1: Architectural Analysis                   │
│             (Responsibilities, Dependencies, Interfaces, Risks)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Stage 2: Technical Design                       │
│              (Classes, State Flows, Data Structures, Errors)           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────┼─────────────────────────────────────┐
│                 [Stage 3: DESIGN APPROVAL GATE]                        │
│                     Scope and Contracts Frozen                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Stage 4: Implementation Planning                   │
│                 (Atomic, Independently Testable Tasks)                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Stage 5: Single Task Execution                    │
│                    (Strict Code Separation, No Sprawl)                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Stage 6: Multi-Step Verification                │
│                 (Compile, Lint, Unit & Integration Tests)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────┼─────────────────────────────────────┐
│                  [Stage 7: COMPONENT LOCK GATE]                        │
│                    Code Locked; Future Changes Require Tasks           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Stage 8: Documentation                        │
│                   (APIs, Constraints, Integration Paths)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Stage Protocol

### Stage 0 — Understand the Mission
Before looking at code, the implementor must analyze the user request and answer the following five structural questions:
1. **What is the objective?** (What human value/system capability is being added?)
2. **What are the inputs?** (Data models, schemas, user interactions, or events.)
3. **What are the outputs?** (Expected artifacts, mutated states, API responses.)
4. **What dependencies exist?** (Libraries, helper functions, upstream adapters, environment limits.)
5. **What should NOT be built?** (Explicit scope ceilings to avoid over-engineering.)

### Stage 1 — Architectural Analysis
Create the technical scope boundary without writing executable code.
*   **Deliverable:** A formal *Responsibility Report*.
*   **Contents:**
    *   **Responsibilities:** Bulleted list of exactly what the component is responsible for doing.
    *   **Dependencies:** External packages, libraries, or system-internal adapters.
    *   **Interfaces:** Initial function names, TypeScript signatures, and configuration shapes.
    *   **Risks & Mitigation:** Edge cases (e.g., iframe security blocks, cross-origin restrictions, canvas rendering performance).
    *   **Assumptions:** What pre-conditions must be true for this to work.
    *   **Open Questions:** Ambiguities requiring immediate human resolution.

### Stage 2 — Technical Design
Define the underlying blueprint of the system or component.
*   **Deliverable:** A comprehensive *Technical Design Specification*.
*   **Contents:**
    *   **Folder Structure:** The exact file locations, naming conventions, and modular separations.
    *   **State & Data Flow:** How state travels from component entry points to storage or rendering.
    *   **Error Handling Policies:** Custom exception models, failure recovery modes, and user-facing notifications.
    *   **Validation & Verification Strategy:** How we will mathematically or visually test that the component works as intended.

### Stage 3 — Design Approval Gate (CRITICAL)
A physical barrier between planning and action. Before writing any code, the design must be presented to and approved by the user.
*   **Gate Conditions:**
    *   ✓ Objectives and requirements are perfectly understood.
    *   ✓ Folder structure, module boundaries, and class files are defined.
    *   ✓ TypeScript interfaces and data exchange formats are frozen.
    *   ✓ Functional scope is capped and frozen (no speculative features).

### Stage 4 — Implementation Planning
Break down the approved milestone into a series of atomic, linear, and sequentially logical sub-tasks.
*   **Deliverable:** An *Atomic Task List*.
*   **Rule:** Each task must be independently executable, compileable, and testable.
*   *Example Task List for a Screen Capturer:*
    1.  Setup browser background wrapper.
    2.  Implement high-resolution JPEG viewport encoder.
    3.  Implement localized bounding-box element cropping.
    4.  Expose async event listener hooks for image-ready triggers.

### Stage 5 — Implement One Task (And ONLY One)
Focus all coding attention on the current task.
*   **Rule:** You are strictly forbidden from writing code for, touching, or modifying directories belonging to upstream/downstream components (e.g., do not touch the *Observation Graph* engine while writing the *Browser Launcher*).
*   **No Code Sprawl:** Maintain pristine separation of concerns.

### Stage 6 — Verification
Every finished task must go through rigorous validation before proceeding.
1.  **Compile:** Run `compile_applet` to check for syntax and type errors.
2.  **Lint:** Run `lint_applet` to enforce standard formatting and static analysis rules.
3.  **Functional Testing:** Build targeted verification loops (using simple client-side mock logs or assertion blocks) to prove functional capability.
4.  **Review:** If any step fails, stop. Fix the bug immediately before attempting to write another line of code.

### Stage 7 — Lock the Component
Once a component is fully functional and verified, its state is changed to **LOCKED**.
*   **Rule:** Future changes, refactors, or optimizations to a Locked component are strictly prohibited unless a formal proposal is submitted, approved, and tracked as a new, distinct Implementation Task.
*   This halts the "infinite refactoring loop" and stabilizes WIP's foundational layers.

### Stage 8 — Documentation
Before declaring victory, the component's contract must be explicitly documented.
*   **Deliverable:** Inline and markdown API reference.
*   **Contents:**
    *   Public interfaces, exports, types, and expected call sequences.
    *   Known hardware/browser runtime limitations.
    *   Step-by-step guides for downstream adapters connecting to this module.

### Stage 9 — Continue
Cycle back to Stage 0 for the next task or milestone in the roadmap.

---

## Nine Immutable Rules for Implementors

| Rule # | The Directive | Logical Purpose |
| :---: | :--- | :--- |
| **Rule 1** | **No Architectural Coding** | Never write functional code while in the design or analysis phase. Keep thoughts and actions separate. |
| **Rule 2** | **Single Milestone Execution** | Never attempt to implement or work on two milestones simultaneously. Focus creates quality. |
| **Rule 3** | **Frozen Interfaces** | Never modify an approved, locked interface without first proposing and getting approval for a design update. |
| **Rule 4** | **Authorized Dependencies Only** | Never introduce external npm packages or third-party assets unless explicitly approved in the Design phase. |
| **Rule 5** | **Anti-Optimization** | Never spend effort optimizing for speculative bottlenecks or future load conditions. Implement the simple, elegant path. |
| **Rule 6** | **No Speculative Refactoring** | Never rewrite or refactor code that has not been functionally validated or shown to be broken. |
| **Rule 7** | **Continuous Verification** | Every coding phase must conclude with successful compilation, linting, and functional tests. |
| **Rule 8** | **Zero-Tolerance for Failures** | Never proceed to the next task if the current build, lint, or test is failing. Fix bugs at their origin. |
| **Rule 9** | **No Silent Requirements Drift** | Never adjust or expand the requirements of a task. If a better idea emerges, draft a new proposal first. |

---

## Phase-by-Phase Deliverable Matrix

| Stage | Deliverable Name | Core Artifact Produced |
| :--- | :--- | :--- |
| **Stage 0** | Mission Summary | Markdown scoping statement detailing bounds, goals, and exclusions. |
| **Stage 1** | Responsibility Report | Drafted file paths, interface signatures, and risk assessments. |
| **Stage 2** | Technical Design | Complete architectural model, state schema, and folder hierarchy. |
| **Stage 3** | Frozen Design Contract | Frozen API contracts and signatures, ready for coding. |
| **Stage 4** | Task List | Step-by-step sequential checklist of atomic, testable features. |
| **Stage 5** | Completed Task | Targeted code file additions/updates. |
| **Stage 6** | Test Report | Compilation logs, linting results, and functional verification checks. |
| **Stage 7** | Lock Certificate | Marked as Locked. Code changes are closed for edits. |
| **Stage 8** | API Documentation | Clean Markdown/TSDoc documenting interfaces, constraints, and guides. |

---

## Definition of Done (DoD)

An implementation task or sub-task is officially **DONE** if and only if it satisfies the following seven quality criteria:
1.  **Alignment:** The final code precisely matches the approved, frozen design specification.
2.  **No Type Warnings:** Compilation is 100% green without utilizing broad `any` escape-hatches, type suppressions, or `@ts-ignore` flags.
3.  **Linter Conformity:** No structural warnings, trailing syntax issues, or style violations in the modified files.
4.  **No Code Sprawl:** No unrelated files, configurations, or directories are added, modified, or deleted.
5.  **Clean Interfaces:** Public methods, variables, and exports match the exact signatures specified in the design phase.
6.  **Functional Adequacy:** The feature is validated with direct visual or programmatic proof (e.g. within an interactive R&D laboratory workspace).
7.  **Documentation Completeness:** The API is cleanly documented, outlining assumptions and runtime limits.
