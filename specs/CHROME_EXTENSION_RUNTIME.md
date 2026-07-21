# Chrome Extension Runtime Specification
**Version:** 1.0.0-Draft  **Related ADR:** (Pending Extension Runtime ADR)

## 1. Overview
The Extension Runtime is an alternative implementation of the Browser Runtime API (`BROWSER_RUNTIME_API.md`) that operates as a Manifest V3 Chrome Extension. It leverages the `chrome.debugger` API to interface directly with the Chrome DevTools Protocol (CDP) from within the user's authenticated browser session.

## 2. Capabilities & Paradigm Shift
This runtime shifts WIP from an "Autonomous Bot" to an "In-Vivo Copilot". It unlocks capabilities that are historically difficult for headless browsers:
- **Authenticated Workflows:** Inherits the user's active session, completely bypassing the need for the Coordinator to handle login screens, 2FA, or captchas.
- **Bot Evasion:** Executes within a genuine human-driven browser, bypassing 99% of anti-bot systems (e.g., Cloudflare, Datadome).
- **Passive Observation:** Can observe and record human interactions to generate Observation Graphs dynamically without taking control of the browser.

## 3. Architecture Constraints
While the underlying CDP payloads (like `DOMSnapshot.captureSnapshot`) are identical to a headless runtime, utilizing the extension `debugger` API introduces several unique constraints that the adapter must handle:

1. **Manifest V3 Lifecycles:** The extension's Service Worker acts as the CDP bridge. Because MV3 aggressively terminates idle service workers (after ~30 seconds of inactivity), the adapter must implement keep-alive polling or robust auto-reconnect logic to maintain the `chrome.debugger` connection.
2. **Infobar Geometry:** Attaching the debugger instantly displays a persistent warning banner ("WIP is debugging this browser") at the top of the viewport. The Extension Runtime must automatically offset geometric calculations (y-coordinates) in the Observation Graph to account for this viewport shift.
3. **Isolation Level (`Shared`):** Unlike headless contexts, the extension runs in the user's primary, persistent profile. Destructive checkpoint rollbacks (wiping cookies or local storage) must not be executed by the Execution Kernel to prevent logging the user out of their actual accounts.
4. **Target Exclusivity:** The runtime cannot attach if another DevTools extension is actively debugging the same tab.
5. **Privileged Pages:** The extension cannot automate or capture observation graphs of `chrome://` URLs, `edge://` URLs, or the Chrome Web Store due to browser security policies.
