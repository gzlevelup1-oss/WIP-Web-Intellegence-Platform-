# Current Mission
**Mission:** Validation Engine Implementation
**Status:** LOCKED
**ID:** M-014

## References
- `specs/VALIDATION_ENGINE_SPECIFICATION.md` (to be created, or check if it exists as Mission 8)

## Objective
Implement the Validation Engine to compare the original website's Observation Graph against the reconstructed UI. The engine calculates visual and structural discrepancies and generates Discrepancy Reports for the Coordinator Agent to repair.

## Scope
**In Scope:**
- Initializing `packages/validation-engine`.
- Structural Diffing algorithm (comparing DOM trees and styling properties).
- Visual Comparison logic (Pixel-Level MSE/SSIM).
- Integration into the `apps/browser-lab` to evaluate reconstructions.

**Out of Scope:**
- The actual Coordinator repair logic (done in M-013).

## Next Steps
- Draft Technical Design (`docs/ValidationEngineDesign.md`).
- Define specific tasks in `TASKS.md`.
- Get user approval to proceed.
