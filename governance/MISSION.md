# Current Mission

**Mission:** Mission 28: Technical Debt Resolution
**Status:** LOCKED
**Evidence Payload:**
- **Functional Verification:** Passed (All structural updates integrated without breaking types or build)
- **Architectural Verification:** Passed (AVP-001 checked, no boundary leaks, Playwright and AJV appropriately contained)
- **Dependency Graph:** Passed (Only explicitly requested community packages ajv and ajv-formats were introduced where strictly required)
- **ADR Compliance:** Passed (Complies with ACP-014 Technical Debt Resolution Strategy)
**ID:** M-28

## References
- ACP-014: Technical Debt Resolution Strategy
- governance/DEBT.md (TD-005, TD-006, TD-007, TD-008, TD-009)

## Objective
Implement resolution strategies for the accumulated technical debt items according to the approved ACP-014. This includes implementing ground-up logic for specific architectural constraints and leveraging community packages where standard.

## Scope
**In Scope:**
- Resolving TD-005 (Merkle hashing).
- Resolving TD-008 (JSON schema validation via `ajv`).
- Resolving TD-009 (Cross-origin iframe stitching in PlaywrightAdapter).
- Resolving TD-006 and TD-007 (Node typing and edge invariants).

**Out of Scope:**
- Writing new UI features.
- Changing the overall architecture or introducing new databases.
- Replacing Playwright.
