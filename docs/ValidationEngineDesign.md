# Validation Engine: Technical Design
**Mission:** M-014
**Status:** LOCKED
**Owner:** Validation Team

## 1. Overview
The Validation Engine implements the Validation Protocol (ADR-004) and enforces verification of the AI's output. It compares the reconstructed UI against the original target UI to ensure visual and structural fidelity. By calculating Structural Similarity Index Measure (SSIM), Mean Squared Error (MSE), and performing structural graph matching, it produces a Discrepancy Report if the reconstruction fails to meet the required thresholds.

## 2. Architecture & Components
The Validation Engine will be implemented in a new standalone package: `packages/validation-engine`.

### 2.1 The Validation Orchestrator (`engine.ts`)
- **Input:** Original Observation Graph, Original Screenshot (Base64), Reconstructed Observation Graph, Reconstructed Screenshot (Base64).
- **Logic:** 
  1. Invokes the Structural Diffing algorithm on the graphs.
  2. Invokes the Visual Diffing algorithm on the screenshots.
  3. Synthesizes the results. If thresholds (SSIM > 0.98, MSE < 0.05, bounding box deviations < 2px) are violated, it generates a `DiscrepancyReport`.
- **Output:** A `ValidationResult` object (Pass/Fail + DiscrepancyReport).

### 2.2 Structural Diffing (`structural.ts`)
- **Node Matching:** Traverses both Observation Graphs to map nodes based on tag names and semantic roles.
- **Normalization:** Strips dynamic IDs (e.g., generated React/Vue IDs) and normalizes class names (ignoring hashes) before computing tree edit distance.
- **Bounding Box Checks:** Compares the GeometryNodes of matched structural elements to ensure `x`, `y`, `width`, `height` differences are within the strict 2px tolerance.

### 2.3 Visual Diffing (`visual.ts`)
- Uses pixel-level comparison (e.g., via the `pixelmatch` library or a custom MSE/SSIM implementation) to compare the base64 screenshots.
- Calculates overall MSE and SSIM scores.

## 3. Data Structures

```typescript
export interface Discrepancy {
  type: 'Structural' | 'Visual';
  message: string;
  expectedNodeId?: string;
  actualNodeId?: string;
}

export interface DiscrepancyReport {
  status: 'ValidationFailed' | 'ValidationPassed';
  ssim: number;
  mse: number;
  violations: Discrepancy[];
}
```

## 4. Integration
The `packages/validation-engine` will export the core functions.

In `apps/browser-lab/server.ts`, we will expose an API endpoint:
- `POST /api/validation/evaluate`
This endpoint takes the original and reconstructed data, runs the Validation Engine, and returns the `DiscrepancyReport`. The Coordinator Agent (via its `Mission_complete` tool interception) can then use this data to plan a semantic repair step if validation fails.

## 5. Evidence Records
Every validation run will log an evidence record locally (e.g., in a logs array or file) containing the validation metrics (SSIM, MSE) and the pass/fail status, ensuring the decisions are auditable.
