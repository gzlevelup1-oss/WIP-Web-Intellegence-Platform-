# ACP-007: Behavior-Driven E2E Testing Strategy

**Status:** APPROVED
**Author:** AI Implementor
**Date:** 2026-07-21

## 1. Context and Problem Statement
The current testing strategy (`docs/RetroactiveTestingStrategy.md`, Mission M-015) relies heavily on mocked unit tests and retroactive integration testing. Following recent build verification, this strategy has been proven flawed:
- **Quality-Control Omission:** It explicitly omits the `validation-engine`, which is the system's primary mechanism for proving architectural correctness via structural and visual diffing.
- **False Confidence (The Mocking Trap):** Relying on mock browser adapters for the `execution-kernel` fails to prove that the architecture can safely interact with a real browser context (Playwright). Community research strongly confirms that mocking complex browser APIs leads to brittle tests that verify the mock rather than the integration, violating the platform's core philosophy of separating observation from reasoning.
- **Hallucinated Interfaces:** Retroactive testing without a real runtime has led to the creation of tests for hallucinated classes (e.g., `CheckpointManager`), demonstrating that the tests are completely disconnected from the actual implementation.

## 2. Validation & Industry Consensus
Researching established testing paradigms for browser automation systems (e.g., Playwright, Puppeteer) yields a strong consensus across the development community:
- **E2E Over Mocks:** When building systems that interact with the DOM, end-to-end tests against real browsers are strictly preferred. Mocks inevitably drift from actual browser behaviors (like layout shifts, event propagation, and rendering delays).
- **Behavior-Driven Static Fixtures:** To maintain determinism (a core WIP invariant), the industry standard is to serve local, static HTML fixtures rather than relying on live websites. This provides a stable, repeatable environment for the automation framework to operate within.

## 3. Proposed Solution
We propose replacing the retroactive mocking strategy with a Behavior-Driven E2E Testing Strategy:
1. **Deprecate `docs/RetroactiveTestingStrategy.md`**: Phase out unit tests that heavily mock core runtime dependencies (e.g., browser adapters).
2. **Implement Real Playwright Sandboxes**: Introduce E2E test suites that spin up real headless Playwright instances.
3. **Use Static HTML Fixtures**: Serve local, static HTML files to act as deterministic target environments for the tests, ensuring zero network-related flakiness.
4. **Holistic System Validation**: Write tests that validate the entire lifecycle—verifying that the `execution-kernel`, `observation-store`, and `validation-engine` work cohesively in a real browser sandbox to issue DOM operations and extract verifiable visual/structural deltas.

## 4. Impact and Trade-offs
- **Pros:** 
  - **Architectural Alignment:** Directly aligns with the core philosophy by using a real browser as the instrument of truth.
  - **Robustness:** Validates the `validation-engine`, ensuring the platform's quality-control mechanism functions correctly.
  - **Eliminates False Positives:** Removes brittle tests tied to mock implementations and nonexistent classes.
- **Cons:** 
  - **Execution Time:** Test execution will be slower due to the overhead of launching real browser contexts.
  - **Maintenance:** Requires the creation and maintenance of static HTML fixtures to guarantee test determinism.

## 5. Decision
Waiting for User Approval.
