# Validation Protocol Specification

**Status:** 1.0.0-Draft
**Related ADR:** ADR-004

## 1. Validation Metrics
The protocol requires dual-layer verification for every completed Mission payload:
- **Visual Metric:** Structural Similarity Index Measure (SSIM) and Mean Squared Error (MSE) computed from a headless browser screenshot of the generated artifact compared to the target Snapshot.
- **Structural Metric:** JSON Graph Delta Comparison (`jsondiffpatch`) combined with node normalization, as authorized by ACP-011.

## 2. Thresholds
Validation is strictly binary (Pass/Fail). To pass, the artifact must meet the following criteria:
- **Visual Threshold:** `SSIM > 0.98` and `MSE < 0.05` across all configured viewports.
- **Structural Threshold:** Normalized Delta Discrepancy Ratio < 0.05 (5%) computed over total graph nodes and edges.
- **Accessibility Threshold:** 100% match on critical ARIA roles and tab indices.

## 3. Repair Loop
If a validation run fails, the protocol enforces a Repair Loop:
1. The Validation Engine blocks `Mission.complete()`.
2. A `ValidationFailed` error is raised to the Coordinator, containing a structured `DiscrepancyReport`.
3. The Coordinator enters the `REPAIRING` state, where it must execute actions specifically addressing the report (e.g., "Adjusting margin to fix 12px shift").
4. The loop is capped at `MAX_REPAIRS = 3`. If exhaustion occurs, the Mission enters `FAILED`.

## 4. Evidence Requirements
Every validation execution must persist an Evidence Record to the `governance/` or `logs/` directory.
- An Evidence Record contains: `MissionId`, `Timestamp`, `OriginalSnapshotId`, `GeneratedSnapshotId`, `SSIM_Score`, `MSE_Score`, and the base64 encoded visual diff image.
- This ensures the Validation Engine's decisions are auditable.
