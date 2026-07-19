# Architectural Evaluation: Chrome Extension Runtime via `chrome.debugger`

**Date:** July 19, 2026
**Subject:** Feasibility and Architectural Impact of a Dual Runtime Architecture (Headless + Chrome Extension)

## 1. Executive Summary
The proposal to implement a secondary Browser Runtime using a Chrome Extension and the `chrome.debugger` API is highly viable and extremely powerful. Because WIP's architecture strictly decouples the Execution Kernel and Coordinator from the underlying browser (via `BROWSER_RUNTIME_API.md`), adding a Chrome Extension requires **zero rewrites** to the AI logic, Observation Models, or Deterministic Workers. It acts as an interchangeable backend that unlocks authenticated workflows, bot evasion, and passive observation.

## 2. Impact on Current Specifications

### 2.1. Observation Model & Graph (`OBSERVATION_MODEL.md`, `OBSERVATION_GRAPH.md`)
*   **Impact: NONE.** 
*   **Reasoning:** The `chrome.debugger` API allows the extension to invoke CDP commands like `DOMSnapshot.captureSnapshot` directly. The data payload extracted from the extension will be byte-for-byte identical to the payload extracted via Playwright. The parsing, hashing, and graph serialization pipelines remain 100% unchanged.

### 2.2. Browser Runtime API (`BROWSER_RUNTIME_API.md`)
*   **Impact: MINOR ADDITIONS.**
*   **Reasoning:** The `Capabilities` discovery phase must be expanded to differentiate the runtime type. The Extension Runtime would broadcast a new execution context type (e.g., `IsolationLevel: Shared` vs. Playwright's `IsolationLevel: Ephemeral`).

### 2.3. Execution Kernel (`EXECUTION_KERNEL.md`)
*   **Impact: MAJOR / PARADIGM SHIFT.**
*   **Reasoning:** This is where the architecture must adapt. In a headless environment, `Transaction.abort()` drops the isolated `BrowserContext` to restore state. In an Extension, the agent is operating inside the user's *actual* persistent profile. You cannot nuke cookies or local storage to roll back a transaction, or you will log the user out of their accounts.
*   **Mitigation:** The Kernel must support "Soft Checkpointing" for the Extension Runtime, relying on reverse-navigation (`history.back()`) or simply halting execution upon failure, rather than hard state wipes.

### 2.4. Coordinator Protocol (`COORDINATOR_PROTOCOL.md`)
*   **Impact: FEATURE EXPANSION (Passive Mode).**
*   **Reasoning:** Instead of the Coordinator explicitly issuing `Observation.capture` and `Interaction.click` tools, the Extension can passively stream `Interaction.recorded` events over the protocol as the human user clicks around. The Coordinator transitions from an "Autonomous Driver" to an "Over-the-Shoulder Copilot," processing the Observation Graph in the background.

### 2.5. Validation Engine (`VALIDATION_ENGINE.md`)
*   **Impact: NONE.**
*   **Reasoning:** The Test Harness used for rendering AI-generated output and visual diffing should remain an isolated headless instance. You do not want the Validation Engine repeatedly opening tabs in the user's live browser to take screenshots.

## 3. Technical Constraints of the `chrome.debugger` API
While powerful, utilizing the extension `debugger` API introduces several constraints that must be accounted for in the Adapter implementation:
1.  **The Infobar:** Attaching the debugger immediately displays a persistent "WIP is debugging this browser" warning bar at the top of the user's screen. This shifts page geometry and must be accounted for in geometric calculations.
2.  **Manifest V3 Lifecycles:** MV3 Service Workers are aggressively terminated by the browser after ~30 seconds of inactivity. If the worker dies, the `chrome.debugger` session detaches. The Extension Adapter must implement robust keep-alive polling or auto-reconnect logic.
3.  **Target Exclusivity:** Only one extension can attach a debugger to a tab at a time. If the user has another DevTools extension active, WIP will fail to attach.
4.  **Privileged Pages:** The extension cannot automate or capture graphs of `chrome://` settings pages or the Chrome Web Store.

## 4. Conclusion
The "Dual Runtime" architecture is highly recommended. The headless runtime remains the default for sandboxed, CI/CD, and Validation Engine tasks, while the Chrome Extension runtime handles highly complex, authenticated, or copilot-driven workflows. The current architectural specifications explicitly support this pattern via the decoupled `BROWSER_RUNTIME_API.md` boundary. No specifications need to be rewritten to accommodate this future addition.
