# ACP-001: Remediation of Browser Runtime (JSDOM to Playwright)

**Status:** Approved
**Owner:** Execution Kernel Team
**References:** 
- `ADR-002-Browser-Runtime.md`
- `docs/BrowserLaboratoryDesign.md`

## Context
The current backend implementation of the Browser Laboratory (`apps/browser-lab/server.ts`) utilizes `fetch()` and `jsdom` to construct the Observation Graph. As identified in the `implementation_review_m009.md` review, this implementation violates `ADR-002: Browser Runtime` and the architectural design, which mandate a deterministic headless browser execution. 

`jsdom` lacks a rendering engine and therefore cannot calculate the precise visual metrics (bounding boxes, layout shifts, computed CSS) required by downstream algorithms (e.g., Component Miner, Layout Analyzer).

## Proposed Change
We must completely gut the existing `/api/simulator/snapshot` and `/api/simulator/command` endpoints and implement a true headless automation runtime using `playwright`.

### Execution Plan
1. **Dependency Installation:** Add `playwright` to the `apps/browser-lab` dependencies.
2. **Server Architecture Update:**
   - Initialize a persistent or per-request `playwright` Chromium browser instance in `server.ts`.
3. **Snapshot Remediation:**
   - Replace the `fetch` and `jsdom` implementation in `/api/simulator/snapshot` with Playwright's `page.goto()`.
   - Utilize Playwright's `page.evaluate()` to execute an injected script directly inside the browser context. This script will traverse the DOM, calculate exact geometric bounding boxes (`getBoundingClientRect()`), and computed CSS styles.
   - Capture a true visual screenshot using `page.screenshot()`.
4. **Graph Schema Compliance:**
   - Ensure the extracted data rigidly maps to the `Observation Graph` specification, producing accurate `DOMNode`, `GeometryNode`, and `StyleNode` entries (or at least `DOMNode` with attached geometry properties for the MVP).

## Consequences
- Requires downloading Playwright browser binaries during the build/install phase.
- Replaces mock screenshot URLs with real base64-encoded screenshots of the navigated pages.
- Resolves the architectural violation and unblocks Mission 13 (Specialized Workers).
