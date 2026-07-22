# Technical Debt Governance

This is a governed backlog for technical debt. Instead of using inline comments like `// fix later`, track technical debt here.

## Active Debt

| ID | Reason | Impact | Priority | Owner | Resolution Mission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TD-005 | Observation Graph Merkle-tree hashing missing (uses naive full JSON hash instead of Node/Subtree hashing). | Breaks O(1) subtree comparison capabilities and performance. | High | Architecture | TBD |
| TD-006 | Node Types mismatch (AccessibilityNode instead of A11yNode) and missing `attributes` map in DOMNode extraction. | Fails specification schema; loses semantic DOM context. | High | Architecture | TBD |
| TD-007 | DOMNode HAS_GEOMETRY and HAS_STYLE edges are conditional, breaking strict structural invariants. | Corrupts downstream graph traversals expecting mandatory layout data. | High | Architecture | TBD |
| TD-008 | MemoryObservationStore lacks JSON Schema validation before saving snapshots. | Allows malformed graph structures to pollute storage. | Medium | Architecture | TBD |


## Resolved Debt

| ID | Resolution Details | Date |
| :--- | :--- | :--- |
| TD-001 | Updated DOM traversal to recursively extract children from Shadow DOM boundaries. | 2026-07-20 |
| TD-002 | Replaced naive node counting with constrained Top-Down Tree Edit Distance algorithm. | 2026-07-20 |
| TD-004 | Frontend was directly passing the full ObservationGraph JSON to backend API routes, violating the decoupling pattern in ObservationStoreDesign. | 2026-07-20 |
| TD-003 | Retroactively implemented unit tests for workers, execution-kernel, and coordinator using vitest across the monorepo workspace. | 2026-07-20 |
| | | |
