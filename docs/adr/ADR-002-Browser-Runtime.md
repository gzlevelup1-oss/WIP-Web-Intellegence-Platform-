Reference: docs/rfc/RFC-001.md
# ADR-002: Browser Runtime

**Status:** Approved

## Context
The AI agent needs to understand the state of a live webpage, but LLMs cannot run websites or compute CSS cascades.

## Decision
We will treat a headless browser (e.g., Puppeteer/Playwright) as a deterministic instrument. The **Browser Runtime** will expose a rigid set of capabilities (Navigation, Viewport, Interaction, Observation) and nothing else.

## Rationale
- The browser is the ground truth for layout and rendering.
- Encapsulating the browser behind explicit tool boundaries prevents the AI from becoming overwhelmed by low-level browser APIs.
- Adheres to the Architecture Invariant: "Browser is deterministic."

## Consequences
- We must maintain an abstraction layer over the raw browser automation framework.
- The AI must exclusively use the provided tool suite.
