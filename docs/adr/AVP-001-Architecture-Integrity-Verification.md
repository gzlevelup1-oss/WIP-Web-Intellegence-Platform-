# AVP-001: Architecture Integrity Verification Protocol

**Status:** Active
**Owner:** Architecture

## 1. Purpose
This protocol redefines the Definition of Done from "the code works" to "the architecture remains intact." It establishes a mandatory verification phase between Implementation and Mission Lock.

## 2. The Engineering Lifecycle
Missions must flow through this strict sequence:
`Mission` → `Implementation` → `Functional Verification` → `Architectural Verification` → `Evidence` → `Mission Lock`

## 3. Boundary Leak Detection
Implementations must be checked for boundary violations before completion.
Examples of leaks that fail architectural verification:
* Framework types leaking (e.g., Playwright `Page` in Execution Kernel)
* Implementation classes leaking (concrete classes instead of interfaces)
* Private methods leaking
* Transport objects leaking into domain logic
* Database models leaking into UI components
* DOM objects leaking across runtime boundaries

## 4. Architectural Smells
The presence of any of the following requires immediate mitigation or explicit architectural approval:
- [ ] `as any` or `@ts-ignore` casts across package boundaries
- [ ] Friend-package imports (bypassing public API exports)
- [ ] Circular dependencies
- [ ] Duplicate abstractions
- [ ] Internal method access (e.g., `_getInternalContext`)
- [ ] Implementation-specific type exposure
- [ ] Runtime type casting across packages

## 5. Ownership Verification
Every abstraction must answer:
* **Who owns this interface?** (The consumer)
* **Who owns this implementation?** (The provider)
* **Who owns this state?**
* **Who owns this dependency?**
* **Who owns this lifecycle?**

## 6. Stop Work Protocol
If the architecture cannot be preserved during implementation, the AI Implementor MUST:
**STOP**
* DO NOT bypass interfaces.
* DO NOT duplicate logic.
* DO NOT cast around abstractions.
* DO NOT weaken invariants.
**INSTEAD:** Produce an *Architecture Friction Report* and wait for architectural decision.

## 7. New Definition of Done (Mission Complete)
A mission is ONLY complete when the Evidence Payload contains:
- [ ] Functional correctness (UI/Behavior intact)
- [ ] Tests pass
- [ ] Architecture verification passes (AVP-001)
- [ ] ADR compliance passes
- [ ] Boundary verification passes
- [ ] Dependency graph unchanged (unless approved)
- [ ] Evidence captured in Mission Payload


## 8. Repository Fitness Functions
During architectural verification, the following fitness functions must be checked:
- [x] Dependency graph unchanged (unless approved)
- [x] Forbidden imports (e.g. against the Forbidden Dependency Matrix in SYSTEM_CONTEXT)
- [x] Architecture invariants maintained
- [x] Package ownership respected
- [x] Composition root purity (no business logic in composition root)
- [x] Interface ownership (consumer owns interface)
- [x] No framework leakage (e.g., Playwright or DOM types in Execution Kernel)
- [x] Public API boundaries (only interacting via exported interfaces/facades)
