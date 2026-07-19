Reference: docs/rfc/RFC-001.md
# ADR-004: Validation Protocol

**Status:** Approved

## Context
How do we know if the AI successfully reconstructed a web experience?

## Decision
We will enforce a strict **Validation Loop**. Reconstructed models must be rendered in an isolated test harness and diffed 
against the original website using both Pixel-Level Diffing (MSE/SSIM) and Structural/Layout Diffing.

## Rationale
- Adheres to Architecture Invariant: "Validation is mandatory."
- Removes subjectivity from the evaluation process.
- Provides an automated feedback loop for the agent to repair its own work until thresholds are met.

## Consequences
- Slower end-to-end execution due to render/diff cycles.
- Requires building a generic test harness capable of rendering intermediate models.
