# Specialized Deterministic Workers: Technical Design

**Mission:** M-012  
**Status:** APPROVED  
**Owner:** Execution Kernel Team / Workers Team

## 1. Overview
The Specialized Workers are deterministic algorithms that run against the Observation Graph (the abstract representation of the browser state). They aggregate, filter, and extract semantic meaning, dramatically reducing the token payload required by the Coordinator AI.

## 2. Architecture & Components
The workers will be implemented in a new standalone package: `packages/workers`. This package will consume the Observation Graph schema definitions.

### 2.1 Component Miner (`miner.ts`)
- **Input:** The full JSON Observation Graph and a `containerNodeId`.
- **Logic:**
  1. Traverses the graph from `containerNodeId` downwards via `CHILD_OF` edges.
  2. For each node, retrieves its `GeometryNode` and `StyleNode`.
  3. **Isolation Heuristic:** Identifies container boundaries by checking for background color changes relative to parents, and verifying it contains text or interactive children.
  4. **Repetition Heuristic:** Identifies lists or grids by grouping siblings that share similar structural shapes and child counts.
- **Output:** An array of identified high-level UI components with type hints (e.g., `Card`, `ListItem`).

### 2.2 Design Token Extractor (`tokens.ts`)
- **Input:** The full JSON Observation Graph.
- **Logic:**
  1. Iterates over all `StyleNode` entities.
  2. Extracts and normalizes colors (RGB/RGBA to Hex).
  3. Uses a frequency map to count occurrences. The most frequent non-transparent colors are nominated as primary/background/secondary.
  4. Extracts `fontFamily` and `fontSize`, sorting them to define the typography scale.
- **Output:** A JSON object defining the design system (Colors, Typography).

### 2.3 Layout Analyzer (`layout.ts`)
- **Input:** The full JSON Observation Graph and a `containerNodeId`.
- **Logic:**
  1. Fetches all direct child nodes of `containerNodeId`.
  2. Evaluates `GeometryNode` intersection and alignment (center `x` or `y` coordinates).
  3. Determines if the container is primarily a `Row` (horizontal alignment), `Column` (vertical alignment), or `Grid`.
  4. Calculates median gaps between siblings.
- **Output:** A semantic layout description.

## 3. Data Structures
We will define internal TypeScript interfaces representing the graph to ensure strict typing when traversing:
```typescript
interface GraphNode {
  id: string;
  type: string;
  properties: any;
}
interface GraphEdge {
  source: string;
  target: string;
  type: string;
}
interface ObservationGraph {
  snapshot: any;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

## 4. Integration
The `packages/workers` module will export the 3 functions.
In `apps/browser-lab/server.ts`, we will expose API endpoints:
- `POST /api/workers/tokens`
- `POST /api/workers/mine`
- `POST /api/workers/layout`
These endpoints will take a `sessionId` or a raw graph payload, run the requested worker, and return the semantic result to the lab UI.

## 5. Open Questions
- Should the workers rely solely on the serialized JSON graph, or should they have access to Playwright for live geometric queries?
  - *Decision:* Per the architecture invariants, Workers MUST operate purely on the Observation Graph. They do not touch the browser.

