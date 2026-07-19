# Browser Laboratory: Technical Design

**Mission:** M-009  
**Status:** DRAFT (Pending Architecture Review)  
**Owner:** Execution Kernel / UI Team  

## 1. Overview
The Browser Laboratory is the interactive workbench that fulfills Phase 1 and 2 of the WIP implementation. It serves as the primary developer tool for observing the headless browser execution, taking snapshots, and interacting with the Observation Graph. It provides a real-time window into the Browser Runtime capabilities without invoking full Coordinator-driven AI reasoning.

## 2. Architecture & Components
The Browser Laboratory follows the separation of concerns defined in the Architecture Invariants:
- **UI Layer (Frontend):** A React/Vite SPA utilizing Tailwind CSS and `shadcn/ui` (if required) to display the Workbench.
- **Server Layer (Backend API):** An Express.js layer providing REST/WebSocket endpoints that map directly to the `Browser Runtime API`.
- **Headless Browser Engine:** Playwright or Puppeteer running server-side, isolated within the Session Manager.

### 2.1 Core UI Components
1. **Workbench Dashboard:** The main layout. Contains the URL input, viewport selection, and Session controls.
2. **Observation Viewport:** Renders the headless browser's visual output (Screenshot or Live Video Stream) along with an overlay for bounding boxes and extracted design tokens.
3. **Inspector Panel:** Displays the constructed `Observation Graph` in a tree or JSON format, allowing users to drill down into node properties (Computed Styles, Layout Metrics, Text Nodes).
4. **Action Log / Capabilities Panel:** Lists recent Browser Runtime API executions (e.g., `navigate`, `click`, `snapshot`).

## 3. Data Flow
1. **User Action:** The user inputs a URL and clicks "Navigate".
2. **API Call:** The UI sends a `POST /api/sessions/current/navigate` request with the URL.
3. **Browser Runtime:** The server-side Execution Kernel forwards the request to the active Session Manager, which instructs the headless browser to load the page.
4. **Observation Generation:** Once idle, the Browser Runtime generates an `Observation Snapshot` (Visual Screenshot + DOM serialization).
5. **Graph Construction:** The backend transforms the DOM serialization into the `Observation Graph` schema.
6. **UI Update:** The UI polls or receives a WebSocket event, fetching the new Screenshot and Observation Graph to update the Viewport and Inspector.

## 4. Interfaces and API Endpoints

### 4.1 Session Management
- `POST /api/sessions`: Create a new browser session.
- `DELETE /api/sessions/:id`: Terminate a session.

### 4.2 Browser Control
- `POST /api/browser/navigate`: `{ url: string, viewport: { width, height } }`
- `POST /api/browser/interact`: `{ action: "click" | "type", targetId: string, value?: string }`

### 4.3 Observation
- `GET /api/browser/snapshot`: Returns the visual representation (image/png).
- `GET /api/browser/graph`: Returns the structured `Observation Graph` (application/json).

## 5. Implementation Plan
- **Step 1:** Scaffold the Express Backend and establish a headless browser lifecycle using Playwright.
- **Step 2:** Implement the `snapshot` and `graph` serialization mechanisms according to Missions 3 & 4.
- **Step 3:** Build the React UI (Workbench Dashboard, URL input, Viewport).
- **Step 4:** Integrate the Inspector Panel to parse and display the `Observation Graph`.

## 6. Validating Requirements
- Must not implement Coordinator reasoning (AI decisions).
- Must adhere strictly to the Observation Graph format.
- Visuals must exactly match the headless output (no mock rendering).

## 7. Security & Sandboxing
- **SSRF Mitigation:** Because the Express server running the headless browser accepts arbitrary URLs, it is highly susceptible to Server-Side Request Forgery (SSRF).
- **Network Isolation:** The Session Manager must enforce strict network boundaries. The headless browser must not be able to resolve or navigate to internal network addresses (e.g., `localhost`, `127.0.0.1`, `169.254.169.254`, or private subnets like `10.0.0.0/8`).
- **Input Validation:** All URL inputs must be strictly validated on the server side to ensure they belong to allowed schemes (e.g., `http:`, `https:`) and are structurally valid before being passed to the browser engine.

## 8. Open Questions / Deferred Decisions
- *WebSocket Validation:* Based on industry standards for remote browser viewers (e.g., Browserless, Playwright Server), WebSockets are the required approach for the live viewport to stream low-latency CDP events and screen updates. Polling will only be used for discrete Observation Graph retrieval.
- *Graph Complexity:* To optimize the UI rendering of the Observation Graph (which may contain >10,000 nodes), the UI MUST utilize DOM Virtualization/Windowing libraries (e.g., `react-window` or `react-virtuoso`) to prevent the React application from crashing or stalling.
