# ACP-008: E2E Test Maturation & Gap Closing

**Status:** APPROVED
**Date:** 2026-07-21
**Author:** AI Implementor / System Architect

## 1. Context & Motivation
During the integration of real-world E2E test fixtures, three critical gaps were identified in our validation strategy:
- **Gap 1: Missing Deterministic Graph Validation.** The current assertions merely check for non-zero node counts, which does not prove determinism. We need Golden Master snapshot testing (hashing the extracted ObservationGraph and comparing it strictly against a frozen JSON fixture).
- **Gap 2: Incomplete Capability Coverage.** Current tests only request base DOM extraction (level [0]). We need to expand this to request visual bounding boxes and accessibility trees to ensure extractors do not fail on complex CSS frameworks.
- **Gap 3: Missing Interactivity Testing.** We merely navigate and capture the real-world sites. We should simulate tasks (e.g., clicking a specific "Add to Cart" button in the ecommerce fixture) and assert the delta via the ValidationEngine.

## 2. Proposed Architecture Changes
### A. Golden Master Snapshot Testing
- Implement strict JSON snapshotting for the `ObservationGraph`.
- Store frozen JSON fixtures for each real-world site and use strict comparison to prove deterministic extraction.

### B. Capability Expansion
- Expand the Playwright parameterized tests to request capability levels beyond base DOM (Visual Bounding Boxes, Accessibility Trees).
- Assert that coordinates, dimensions, and accessibility roles are accurately mapped across complex structures.

### C. Delta Validation & Interactivity
- Introduce interactive simulations on the fixtures (e.g., interacting with the `anon-ecommerce-website`).
- Utilize the `ValidationEngine` to assert structural and visual changes between pre-interaction and post-interaction states.

## 3. Scope Boundaries
**In Scope:**
- Implementing Golden Master snapshot comparisons for existing fixtures.
- Expanding capability extraction levels in E2E tests.
- Adding interactive E2E flows to validate state transitions and delta logic.

**Out of Scope:**
- Implementing new core capabilities in the extraction engine (we are only testing existing ones, though bug fixes during testing are expected).

## 4. Required Approvals
This ACP requires explicit approval from the User / Product Owner before it can be converted into an active Mission (`governance/MISSION.md`) and implemented.
