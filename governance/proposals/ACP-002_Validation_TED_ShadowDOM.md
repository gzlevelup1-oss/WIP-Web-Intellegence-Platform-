# ACP-002: Validation TED and Shadow DOM
**Status:** APPROVED
**Author:** AI Implementor
**Date:** 2026-07-20

## 1. Context and Problem Statement
Currently, the system suffers from two notable forms of technical debt that reduce the reliability and accuracy of the Observation and Validation models:
- **TD-001 (Shadow DOM Visibility):** The initial `ObservationGraph` capture logic in `apps/browser-lab/server.ts` uses `document.documentElement` traversal but does not pierce `ShadowRoot` boundaries. This results in an incomplete Observation Graph when standard Web Components or shadow DOM encapsulated elements are present.
- **TD-002 (Validation Engine Structural Diffing):** The current `structuralDiff` function in `packages/validation-engine` relies on basic node count comparisons and bounding box differences. This naive approach produces false positives/negatives for complex layouts because it does not properly evaluate structural tree transformations.

## 2. Proposed Solution (Proposal A)
We propose addressing both issues concurrently to drastically improve the reliability of the validation loop.

### 2.1 Piercing the Shadow DOM (Addressing TD-001)
Update the graph extraction script (`traverse` function inside `server.ts`) to explicitly check for the presence of a `shadowRoot` property on every DOM element. If a `shadowRoot` exists, the traversal should treat the `shadowRoot` as an additional container of children. 
- **Implementation:** Enhance the Playwright `page.evaluate` DOM extraction script to recursively traverse `el.shadowRoot.children` alongside `el.children`.

### 2.2 Tree Edit Distance (TED) Algorithm (Addressing TD-002)
Replace the naive `structuralDiff` logic with a fast Tree Edit Distance (TED) algorithm (e.g., an adapted Zhang-Shasha or a simplified top-down structural matcher).
- **Implementation:** Map the `ObservationGraph` back into a tree structure inside memory (using the `CHILD_OF` edges), then compute the insertion, deletion, and substitution costs between the original and reconstructed trees.
- Since standard TED is $O(N^4)$ for general trees, we will implement a simplified Top-Down constrained TED or use DOM-specific heuristics (matching by tags and text content) to keep validation performance under 500ms for standard pages.

## 3. Impact and Trade-offs
- **Pros:** 
  - Substantially higher accuracy for Web Component based sites.
  - Structural diffing will actually identify *where* a tree diverged, rather than just returning "node count mismatch".
- **Cons:** 
  - Extracting Shadow DOM increases the size of the `ObservationGraph`, which may impact memory usage.
  - TED algorithms are computationally heavier than simple node counting.

## 4. Required Changes
- Modify `apps/browser-lab/server.ts` (DOM traversal logic).
- Modify `packages/validation-engine/src/structural.ts` (Implement TED diffing).

## 5. Decision
Waiting for User Approval.
