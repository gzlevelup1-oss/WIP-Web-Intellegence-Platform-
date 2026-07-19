# Browser Laboratory UI/UX Specification

**Status:** DRAFT  
**Mission:** M-009  
**Reference:** Inspired by `nexu-io/open-design` patterns

## 1. Overview
This specification outlines the UI/UX architecture for the Browser Laboratory. Based on research into professional agent-native design tools (like Open Design), the interface will adopt a split-pane layout to balance user interaction (chat/commands) with rich visual feedback (browser viewport and graph inspection).

## 2. Core Layout Architecture
The application will utilize an **App Shell** (`app` class with CSS grid) and a **Split Workspace Shell** (`workspace-shell` pattern) to maximize screen real estate and maintain context.

- **Layout Grid:** A top-level `.app` wrapper managing the main viewport layout, nesting `.workspace-shell`.
- **Split Divider:** A draggable handle (`split-resize-handle` within a `.split-edit-divider`) separating the left and right panes.
- **Left Pane (`split-chat-slot`):** Context, history, command input (`ChatPane`), and artifact strip (`chat-design-artifacts`).
- **Right Pane (`viewer-viewport` / `pane`):** The main stage for rendering the headless browser output and inspecting the Observation Graph (`FileViewer` / `ProjectView` equivalents).

## 3. Detailed Component Specs

### 3.1 Chat & Command Pane (Left)
- **Session Header (`chat-project-header`):** Displays current project/session title (`chat-project-header-title`) with a dropdown to browse history (`chat-history-menu` / `chat-session-switcher`).
- **Log View (`chat-log-wrap`):** A scrolling list of executed commands, browser actions, and AI observations.
- **Empty State (`chat-empty-wrap`):** Polished empty state with quick actions when no commands have been run.
- **Artifact Strip (`chat-design-artifacts`):** A horizontally scrollable row of thumbnails (`chat-design-artifact`) representing recent snapshots or extracted elements.
- **Composer:** The primary input area for the user to type URLs, commands, or queries.

### 3.2 Observation Viewport (Right)
- **Viewer Toolbar (`viewer-toolbar`):**
  - **Left Section (`viewer-toolbar-left`):** Displays metadata (`viewer-meta`) such as file size or resolution.
  - **Actions Section (`viewer-toolbar-actions`):** Contains the primary tools and tabs.
  - **Viewport Toggles:** Switch between device dimensions (`viewer-viewport-menu` / `viewer-viewport-button`).
  - **Zoom Controls:** Zoom in/out or fit-to-screen (`zoom-menu` inside `viewer-action zoom-trigger`).
  - **Tabs (`viewer-tabs`):** Switch views between "Visual Preview", "DOM Inspector", and "Action Logs", using `.viewer-tab` elements (with `.active` states).
- **Stage (`viewer-body`):** Renders the image snapshot or live video stream from the headless browser.
- **Draw & Overlay Tools (`preview-draw-overlay`):** Interactive layer over the snapshot (`preview-draw-text-layer`, `preview-draw-dock`, `preview-draw-toolbar`) to highlight elements, draw bounding boxes, or display computed design tokens on hover.

### 3.3 Inspector Panel (Right - Secondary Tab)
- Displays the serialized **Observation Graph** using a virtualized list (e.g., `react-window`) to handle large DOM trees without crashing.
- Clicking a node in the graph highlights the corresponding bounding box in the Visual Preview, and vice versa.

## 4. Design System & Aesthetics
- **Framework:** React + Tailwind CSS.
- **Theme:** Minimalist, high-contrast dark/light modes. The surrounding UI should recede (using neutral slates and grays) to let the browser content stand out.
- **Icons:** Use clean, stroke-based icon sets (e.g., Lucide React) for all toolbar actions to maintain a lightweight feel.
- **Feedback:** Use subtle tooltips (`od-tooltip`) and active states (`active` class) on all interactive elements.

## 5. Security UX
- Clear visual indicators when the session is "Sandboxed" or executing a network request.
- Warnings when navigating to potentially unsafe or restricted URLs (SSRF mitigation).
