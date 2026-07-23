# Technical Debt Governance

This is a governed backlog for technical debt. Instead of using inline comments like `// fix later`, track technical debt here.

## Active Debt

| ID | Reason | Impact | Priority | Owner | Resolution Mission |
| :--- | :--- | :--- | :--- | :--- | :--- |


## Resolved Debt

| ID | Resolution Details | Date |
| :--- | :--- | :--- |
| TD-001 | Updated DOM traversal to recursively extract children from Shadow DOM boundaries. | 2026-07-20 |
| TD-002 | Initial resolution via top-down Tree Edit Distance (2026-07-20); subsequently upgraded to JSON Graph Delta Comparison (jsondiffpatch) in Mission 26 per ACP-011 (2026-07-22). | 2026-07-20 |
| TD-004 | Frontend was directly passing the full ObservationGraph JSON to backend API routes, violating the decoupling pattern in ObservationStoreDesign. | 2026-07-20 |
| TD-003 | Retroactively implemented unit tests for workers, execution-kernel, and coordinator using vitest across the monorepo workspace. | 2026-07-20 |
| | | |
