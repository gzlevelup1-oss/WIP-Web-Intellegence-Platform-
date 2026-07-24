# Technical Debt Governance

This is a governed backlog for technical debt. Instead of using inline comments like `// fix later`, track technical debt here.

## Active Debt

| ID | Reason | Impact | Priority | Owner | Resolution Mission |
| :--- | :--- | :--- | :--- | :--- | :--- |

| TD-013 | Specification Fulfillment: Missing soft checkpointing. Resolved via ACP-018 in Mission 33 by capturing and restoring raw DOM HTML and scroll positions during soft aborts. | 2026-07-23 |
| TD-012 | Specification Fulfillment: Missing visual thresholds and mask capabilities. Resolved via ACP-017 in Mission 32 by applying GeometryNode-based pixel masking and adaptive thresholding. | 2026-07-23 |
| TD-011 | Specification Fulfillment: Missing Experience Graph and Passive Mode. Resolved via ACP-016 in Mission 31 by adding ExperienceGraph storage and streaming support for Event.Interaction.Recorded. | 2026-07-23 |
| TD-010 | Specification Fulfillment: Missing Browser Runtime nodes/events. (See `governance/proposals/ARCH-003_Specification_Implementation_Gaps.md` for full elaborative details) | Breaks extraction precision and streaming. | High | Architecture | Mission 30 |

## Resolved Debt

| ID | Resolution Details | Date |
| :--- | :--- | :--- |
| TD-014 | Resolved via ACP-021 in Mission 35 by integrating capability checks natively into the Execution Kernel to fulfill ADR-002 section 4. | 2026-07-24 |
| TD-011 | Resolved via ACP-016 in Mission 31 by adding ExperienceGraph storage and streaming support for Event.Interaction.Recorded. | 2026-07-23 |
| TD-012 (Partial) | Missing visual thresholds and mask capabilities resolved via ACP-017 in Mission 32 by applying GeometryNode-based pixel masking and adaptive thresholding. | 2026-07-23 |
| TD-013 (Partial) | Missing soft checkpointing resolved via ACP-018 in Mission 33 by capturing and restoring raw DOM HTML and scroll positions during soft aborts. | 2026-07-23 |
| TD-001 | Updated DOM traversal to recursively extract children from Shadow DOM boundaries. | 2026-07-20 |
| TD-002 | Initial resolution via top-down Tree Edit Distance (2026-07-20); subsequently upgraded to JSON Graph Delta Comparison (jsondiffpatch) in Mission 26 per ACP-011 (2026-07-22). | 2026-07-20 |
| TD-004 | Frontend was directly passing the full ObservationGraph JSON to backend API routes, violating the decoupling pattern in ObservationStoreDesign. | 2026-07-20 |
| TD-003 | Retroactively implemented unit tests for workers, execution-kernel, and coordinator using vitest across the monorepo workspace. | 2026-07-20 |
| TD-015 | Specification Fulfillment: Coordinator is agnostic to runtime capabilities and does not dynamically prune impossible tools. | Can lead to high latency AI retry loops against impossible execution boundaries. | Medium | Architecture | TBD |
