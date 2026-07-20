# Technical Debt Governance

This is a governed backlog for technical debt. Instead of using inline comments like `// fix later`, track technical debt here.

## Active Debt

| ID | Reason | Impact | Priority | Owner | Resolution Mission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TD-002 | Structural diffing in Validation Engine currently uses basic bounding box and node count checks rather than a robust Tree Edit Distance (TED) algorithm. | False positives/negatives in structural validation of complex layouts. | High | Validation Team | Future Mission |
| TD-001 | Example: Initial DOM snapshot does not handle Shadow DOM fully. | Reduced accuracy for web components. | Medium | TBD | M-002 |

## Resolved Debt

| ID | Resolution Details | Date |
| :--- | :--- | :--- |
| TD-003 | Retroactively implemented unit tests for workers, execution-kernel, and coordinator using vitest across the monorepo workspace. | 2026-07-20 |
| | | |
