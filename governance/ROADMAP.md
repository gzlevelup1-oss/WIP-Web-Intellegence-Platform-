# Roadmap: Website Intelligence Platform (WIP)

## Phase 1 — Specification
Define the architecture and strictly separate observation from reasoning, and the execution semantics from the physical browser.
*   **Mission 1:** Minimum Viable Governance
*   **Mission 2:** Browser Runtime Contract
*   **Mission 3:** Observation Model Specification
*   **Mission 4:** Observation Graph Specification
*   **Mission 5:** Execution Kernel Specification
*   **Mission 6:** Coordinator Protocol
*   **Mission 7:** Worker Specifications
*   **Mission 8:** Validation Engine Specification

## Phase 2 — Implementation (The Foundation)
Implement the core deterministic capabilities.
*   **Mission 9:** Browser Laboratory Implementation (Playwright/Puppeteer)
*   **Mission 10:** Execution Kernel Implementation
*   **Mission 11:** Observation Store Implementation (Property Graph/Relational DB)

## Phase 3 — The Agent & Orchestration
Introduce the AI reasoning layer. Given a Mission, the agent explores, hypothesizes, understands semantics, reconstructs, and self-evaluates. The agent uses tools; it never manipulates browsers directly.
*   **Mission 12:** Specialized Internal Workers (Component Miner, Design Token Extractor, Layout Analyzer)
*   **Mission 13:** Coordinator Agent Implementation (Gemini 2.5 Flash / Pro)

## Phase 4 — Validation Loop
Original Website → Observation → Model → Reconstruction → Validation → Repair → Repeat. The loop ends when predefined quality thresholds (Pixel-Level MSE/SSIM + Structural diffing) are met.
*   **Mission 14:** Validation Engine Implementation

## Phase 5 — Compliance & Stability
Resolve architectural debt and enforce the Testing Constitution across all previous implementations.
*   **Mission 15:** Retroactive Testing Implementation (Workers, Kernel, Coordinator)
