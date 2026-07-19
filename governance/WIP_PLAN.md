# Website Intelligence Platform (WIP)
## System Architecture & R&D Blueprint
**Version:** 1.0.0

---

### 1. Executive Summary & Philosophy

The **Website Intelligence Platform (WIP)** represents a fundamental paradigm shift in web understanding, extraction, and reconstruction. Traditional attempts at automated website replication or analysis suffer from a critical flaw: **they rely on large language models (LLMs) to speculate about layout, geometry, typography, and styling** from raw HTML code or visual screenshot pixels. LLMs excel at semantic understanding, reasoning, and synthesis, but are notoriously poor at spatial math, CSS cascading evaluation, and layout geometry.

WIP resolves this by implementing a strict **separation of observation from reasoning**. 

```
Coordinator Agent (Gemini Semantic Reasoning & Planning)
       │
Protocol
       │
Execution Kernel (Scheduling, Transactions, Policy)
       │
Browser Runtime API (Deterministic Measurements)
       │
Reality (Browser Executing Website)
```

The system enforces a strict decoupling of conceptual reality from storage formats by utilizing the **Observation Model**.

```
Observation Model (Conceptual Definition of Facts)
       │
Observation Graph (Relationship Representation)
       │
Observation Store (Persistence)
```

By wrapping a real browser runtime in a suite of **deterministic instruments**, we turn web inspection into a precise physical science. The AI agent never speculates on computed styles, bounding boxes, or font metrics; it asks the instrumentation layer to measure them, constructs a queryable graph of relationships, and applies reasoning *on top* of verified, empirical facts.

---

### 2. The Browser Laboratory & Runtime

The laboratory acts as the execution container. It runs a headless browser instance, exposing low-level APIs that measure the actual layout and state of a webpage exactly as rendered by a layout engine (Chromium/Webkit).

#### Deterministic Runtime Capabilities
*   **Navigation Controller:** State-safe execution of browser transitions (redirects, history navigation, dynamic loads, and route changes).
*   **DOM Observer:** Access to the active Document Object Model (DOM), shadow roots, and dynamic nodes.
*   **CSS Evaluator:** Evaluation of active style sheets, media query evaluations, and inheritance structures.
*   **Layout Engine Inspector:** Direct calculation of the CSS Box Model (content, padding, border, margin) and relative coordinates.
*   **Font Resolver:** Identification of active font faces, loading state, fallback fonts, and loaded font weight profiles.
*   **Accessibility (A11y) Engine:** Extraction of the browser’s internal Accessibility Tree (Roles, Names, States, and Values).
*   **Animation Tracker:** Capture of CSS transitions, keyframes, and Web Animation API active states.
*   **Network Sniffer:** Passive and active capturing of requests, responses, resource sizes, MIME types, and lazy-loaded assets.
*   **Media Capture Platform:** High-speed frame capture, element-specific screenshots, and viewport recording.
*   **Performance Metrics Analyzer:** Frame rate calculation, layout-shift indicators (CLS), and timing markers.
*   **Event Listener Mapper:** Binding and tracking of interactive nodes with attached event handlers.

---

### 3. The Observation Model

The **Observation Model** defines the formal structure of "measurements" of the browser state and packages them into immutable, structured observations.

#### The anatomy of a single observation event:

```typescript
export interface ViewportState {
  width: number;
  height: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ComputedStyles {
  display: string;
  position: string;
  backgroundColor: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  boxSizing: string;
  margin: string;
  padding: string;
  borderWidth: string;
  borderColor: string;
  borderRadius: string;
  opacity: string;
  zIndex: string;
  boxShadow: string;
  [key: string]: string; // For any other required css computed values
}

export interface AccessibilityNode {
  role: string;
  name: string;
  description: string;
  value?: string;
  disabled: boolean;
  expanded?: boolean;
  focused: boolean;
}

export interface DOMSnapshotNode {
  nodeId: string;
  tagName: string;
  nodeType: number;
  attributes: Record<string, string>;
  classes: string[];
  textContent?: string;
  isShadowRoot: boolean;
  parentId?: string;
  childrenIds: string[];
}

export interface ObservationSnapshot {
  timestamp: number; // ISO Epoch
  url: string;
  viewport: ViewportState;
  dom: Record<string, DOMSnapshotNode>;
  geometry: Record<string, BoundingBox>; // Keyed by nodeId
  styles: Record<string, ComputedStyles>; // Keyed by nodeId
  accessibility: Record<string, AccessibilityNode>; // Keyed by nodeId
  screenshotPath: string; // Reference to high-resolution visual capture
}
```

---

### 4. The Observation Graph

The system enforces a strict decoupling of conceptual reality from storage formats:

```
Observation Model (Conceptual Definition of Facts)
        │
        ▼
Observation Graph (Relationship Representation)
        │
        ▼
Observation Store (Persistence - e.g., Relational, Document, Property Graph)
        │
        ▼
Query Engine (Data Retrieval for Coordinator/Workers)
```

The **Observation Model** defines the fundamental ontology of what exists in executed reality (Snapshots, Timelines, Sessions, Observations) without locking the architecture into a specific database schema. The **Observation Graph** is the primary representation built from this model, linking structured knowledge. Instead of storing unstructured raw files or code strings, WIP compiles observations into this relational graph. This graph models the webpage as a tree of interconnected entities. Each node represents a structural, visual, or semantic block, and each edge represents a defined relationship (e.g., Parent-Child, Overlaps, Grouped-With, Inherits-Styles).

```
┌────────────────────────────────────────────────────────┐
│                      Graph Node                        │
├────────────────────────────────────────────────────────┤
│  ID: "node_104"                                        │
│  Semantics: [Heading, PrimaryHeroTitle]                │
│  DOM: <h1 class="text-4xl text-slate-900">...</h1>     │
│  Geometry: {x: 40, y: 120, w: 600, h: 48}              │
│  Styles: {fontSize: "36px", color: "rgb(15, 23, 42)"}  │
│  Accessibility: {role: "heading", level: 1}           │
└──────────────────────────┬─────────────────────────────┘
                           │
             Edge Type: "CHILD_OF" or "OVERLAPS"
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                      Graph Node                        │
├────────────────────────────────────────────────────────┤
│  ID: "node_103" (Hero Section Container)               │
│  Semantics: [Section, HeroSection]                    │
│  Geometry: {x: 0, y: 100, w: 1280, h: 400}             │
└────────────────────────────────────────────────────────┘
```

#### TypeScript Graph Model

```typescript
export enum EdgeType {
  CHILD_OF = "CHILD_OF",
  OVERLAPS = "OVERLAPS",
  VISUALLY_CONTAINED_BY = "VISUALLY_CONTAINED_BY",
  INHERITS_STYLE_FROM = "INHERITS_STYLE_FROM",
  LINKED_TO = "LINKED_TO",          // E.g., label linked to input
  SIMILAR_TO = "SIMILAR_TO"         // Structural component twins
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: EdgeType;
  metadata?: Record<string, any>;
}

export interface GraphNode {
  id: string;
  domNodeId: string;
  tagName: string;
  attributes: Record<string, string>;
  geometry: BoundingBox;
  computedStyles: ComputedStyles;
  accessibility: AccessibilityNode;
  
  // Semantic classifications added by workers/agents
  semanticClass?: string;          // E.g., "PrimaryButton", "HeroSection"
  componentClusterId?: string;     // E.g., "cluster_card_type_a"
  isInteractive: boolean;
  eventListeners: string[];        // E.g., ["click", "mouseenter"]
}

export interface ObservationGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  rootNodeId: string;
}
```

---

### 5. The Coordinator Agent & Execution Kernel

The Coordinator Agent (powered by **Gemini 2.5 Flash / Pro**) sits atop the system. It is a **Planner** that executes loops of exploration, forms hypotheses about webpage structures, and controls the deterministic tool suite.

However, the Coordinator does not talk to the Browser Runtime directly. It communicates through the **Execution Kernel**. The Kernel defines the operating semantics (mission execution, transactions, permissions, scheduling, retries, cancellation, checkpointing, and event ordering).

```
                  ┌──────────────────────┐
                  │  Coordinator Agent   │
                  │  (Gemini Brain)      │
                  └──────────┬───────────┘
                             │
     Calls Tools via Structured Tool Definition (JSON Schema)
                             │
                  ┌──────────▼───────────┐
                  │   Execution Kernel   │
                  │ (Transactions, Sync) │
                  └──────────┬───────────┘
                             │
           Protocol Messages (BrowserRuntime.protocol)
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ Navigation Tools  │ │ Interaction Tools │ │ Observation Tools │
│ • open(url)       │ │ • click(id)       │ │ • captureDOM()    │
│ • wait(ms)        │ │ • scroll(y)       │ │ • captureStyles() │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

#### Deterministic Tool Suite Specifications

The agent is equipped with a clean, programmatic boundary. Below are the functional declarations for these tools:

```typescript
export interface NavigationToolbox {
  open(url: string): Promise<{ status: number; redirected: boolean }>;
  back(): Promise<void>;
  forward(): Promise<void>;
  reload(): Promise<void>;
  wait(ms: number): Promise<void>;
}

export interface ViewportToolbox {
  resize(width: number, height: number): Promise<void>;
  scroll(distanceY: number): Promise<void>;
  scrollTo(elementId: string): Promise<void>;
}

export interface InteractionToolbox {
  click(elementId: string): Promise<void>;
  hover(elementId: string): Promise<void>;
  focus(elementId: string): Promise<void>;
  type(elementId: string, text: string): Promise<void>;
  pressKey(key: string): Promise<void>;
}

export interface ObservationToolbox {
  captureDOM(): Promise<Record<string, DOMSnapshotNode>>;
  captureCSS(): Promise<Record<string, ComputedStyles>>;
  captureGeometry(): Promise<Record<string, BoundingBox>>;
  captureAccessibility(): Promise<Record<string, AccessibilityNode>>;
  captureScreenshot(): Promise<{ base64Image: string; path: string }>;
}
```

---

### 6. Specialized Deterministic Workers

Rather than passing massive arrays of raw CSS styles and DOM lists directly into the LLM context (which creates immense noise, latency, and context bloat), WIP uses **Specialized Deterministic Workers**. 

These are lightning-fast local algorithms designed to execute mathematical clustering, token extraction, and pattern identification. The output of these workers is clean, aggregated data passed directly into the Coordinator Agent.

```
                        ┌─────────────────────────────────┐
                        │   Observation Graph (Raw)       │
                        └───────────────┬─────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
┌─────────────────────────┐┌─────────────────────────┐┌─────────────────────────┐
│  Component Miner        ││  Design Token Extractor ││  Layout Spacing Worker  │
│  Clusters nodes based    ││  Aggregates font-sizes, ││  Measures negative      │
│  on structural/style    ││  colors, backgrounds,   ││  spaces, grid margins,  │
│  similarity algorithms  ││  into neat variables    ││  and padding alignment  │
└────────────┬────────────┘└────────────┬────────────┘└────────────┬────────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        │
                                        ▼
                        ┌─────────────────────────────────┐
                        │  Processed Structured Insights  │
                        │  (Optimized Context for Gemini) │
                        └─────────────────────────────────┘
```

#### Worker Specification & Algorithms

1.  **Component Miner (Clustering Engine):**
    *   *Algorithm:* Computes tree-distance metrics (Tree Edit Distance) combined with Style Vector Cosine Similarity.
    *   *Result:* Groups elements (like 48 product cards in a list) into a single logical "Component Class" with an extracted variation matrix.
2.  **Design Token Extractor (The Tokenizer):**
    *   *Algorithm:* Parses the global CSS properties, calculates frequency distributions, clusters adjacent color codes using Delta-E (CIE76) color difference formulas, and generates the active color and type palette.
    *   *Result:* Outputs standard Figma-style design tokens (`--color-primary`, `--font-display`, `--spacing-md`).
3.  **Layout & Grid Analyzer:**
    *   *Algorithm:* Analyzes overlapping bounding boxes, relative distances, flex directions, and alignment configurations.
    *   *Result:* Detects grid structures (CSS Grid/Flexbox alignments) and measures consistent spacing rules.

---

### 7. The Visual Validation & Repair Loop (The Laboratory Core)

The ultimate proof of correctness is **visual and behavioral equivalence**. WIP uses a strict visual feedback loop that renders the reconstructed web components in an isolated test harness and compares the visual and layout output against the original website.

```
       ┌────────────────────────┐         ┌────────────────────────┐
       │   Original Webpage     │         │ Reconstructed Component│
       └───────────┬────────────┘         └───────────┬────────────┘
                   │                                  │
                   ▼                                  ▼
             Take Snapshot                      Take Snapshot
                   │                                  │
                   └────────────────┬─────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │ Visual & Layout Diff  │
                        └───────────┬───────────┘
                                    │
                         Is Match? ─┼───────────────┐
                                    │               │
                                   No              Yes
                                    │               │
                                    ▼               ▼
                        ┌───────────────────────┐ ┌─────────┐
                        │ Compute Error Delta   │ │ Export  │
                        │ (Pixel & CSS Diff)    │ │ Ready   │
                        └───────────┬───────────┘ └─────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  Agent Repair Loop    │
                        │  (Targeted Edits)     │
                        └───────────────────────┘
```

#### The Visual Diff Engine
*   **Pixel-Level Diffing:** Utilizing standard canvas/image byte buffers to calculate Mean Squared Error (MSE) and structural similarity indexes (SSIM).
*   **Structural-Level Diffing:** Comparing the computed styles and layout coordinates of the reconstructed components with the original nodes inside the Observation Graph. This guarantees that elements are not only visually correct, but structured correctly under the hood (e.g., using proper semantic containers instead of absolute positioning hacks).

---

### 8. Downstream Adapters Architecture

The primary power of the WIP output (the **Observation Graph + Semantic Graph**) is its framework-agnostic representation. Because it represents structural and visual intents instead of code, we can easily write translation layers (Adapters) to compile the graph into multiple output formats:

*   **Forge Adapter:** Translates semantic components, layouts, and states into the editable Forge structural representation.
*   **React + Tailwind Adapter:** Generates production-ready, clean React functional components split modularly, styled purely with utility classes, utilizing robust TypeScript structures.
*   **Flutter Adapter:** Compiles layout grids, text boxes, and assets into Flutter standard widget trees.
*   **HTML/CSS Vanilla Adapter:** Produces static, hyper-optimized index files and standard CSS files.
*   **Accessibility Analyzer:** Processes the extracted A11y tree and highlights violations, missing labels, incorrect keyboard traversal paths, and contrast ratio issues.

---

### 9. Immediate Prototyping Roadmap (WIP Lab R&D Setup)

For the next implementation phase, we will prototype this framework inside our application workspace. The architecture of the interactive workbench will be divided into:

```
                            ┌───────────────────────────────────┐
                            │      WIP Interactive Lab UI       │
                            └─────────────────┬─────────────────┘
                                              │
             ┌────────────────────────────────┼────────────────────────────────┐
             ▼                                ▼                                ▼
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│     Observation Lab     │      │   Graph Playground      │      │     Validation Suite    │
│  • Live URL Input       │      │  • Visualized Graph     │      │  • Visual Diffing Canvas│
│  • Viewport Inspector   │      │    Nodes & Edits        │      │  • Computed Error Delta │
│  • Real-time Snapshot   │      │  • Semantic Labels      │      │  • Live Reconstruction  │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

#### Core Prototyping Milestones
1.  **Phase 1 & 2 Prototype (Lab Simulator):** Build a simulated/interactive webpage runner inside our workbench that takes real website structures, measures them, and exports full JSON snapshots.
2.  **Phase 3 Observation Graph Compiler:** Implement the relational node-linking algorithms, converting DOM layouts into fully queryable relational graphs.
3.  **Phase 4 Coordinator Sandbox:** Setup the Gemini interaction hooks (using the `@google/genai` TypeScript SDK) loaded with system instructions that enable tool execution planning and semantic labeling.
4.  **Phase 5 Semantic Repair Pipeline:** Build the visual comparison suite showing the "Original" vs. "Reconstructed" side-by-side with interactive pixel diffs and structural metrics.

---

### 10. Verification of the Blueprint

This plan outlines a highly deterministic, scientifically robust platform. It eliminates LLM layout hallucination by grounding reasoning on precise physical browser metrics. The resulting platform delivers production-grade website reconstruction and semantic understanding.
