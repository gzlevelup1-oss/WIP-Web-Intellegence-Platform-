# M-04 (Observation Graph Specification) Adherence Report

Based on a review of the current implementation (`packages/observation-store` and `packages/browser-runtime`), here is the adherence report for Mission 4:

### 1. Hashing Algorithms (Section 6)
**Status: Non-Compliant**
- The specification dictates a Merkle-tree style deterministic hashing for O(1) subtree comparison (Node Hash and Sub-tree Hash based on sorted properties).
- **Current State:** Completely missing. `PlaywrightAdapter.ts` (line 117) instead computes a naive, single SHA-256 hash over the entire stringified JSON payload. 

### 2. Node Types & Extraction (Section 3)
**Status: Defective**
- **Type Name Mismatch:** The specification defines `A11yNode`. However, the extraction script (`packages/browser-runtime/src/adapters/browser-script.ts`) incorrectly serializes these nodes as `type: 'AccessibilityNode'`.
- **Missing Properties:** The `DOMNode` spec requires an `attributes` map. The current extraction logic ignores all DOM attributes (such as `id`, `src`, `href`, `data-*`), capturing only `tagName`, `nodeType`, `classes`, `depth`, and `text`.

### 3. Graph Invariants (Section 7)
**Status: Non-Compliant**
- The specification mandates absolute invariants: *"A `DOMNode` must have exactly one `HAS_GEOMETRY` edge... A `DOMNode` must have exactly one `HAS_STYLE` edge."*
- **Current State:** In `browser-script.ts`, `GeometryNode` and `StyleNode` extractions are wrapped in a conditional check (`if (levels.includes(1))`). If a snapshot is taken without level 1, the mandatory nodes and edges are omitted, breaking the invariant.

### 4. JSON Schema Validation (Section 5)
**Status: Non-Compliant**
- The specification provides a strict JSON Schema that all serializations must conform to.
- **Current State:** `MemoryObservationStore` (`store.ts`) accepts and saves graph objects blindly without executing any schema validation checks against the spec.
