# Worker Specifications

**Version:** 1.0.0-Draft  
**Related ADR:** (None, Part of Base Architecture)  

## 1. Overview
The **Coordinator Agent** delegates specific, high-complexity tasks to **Specialized Deterministic Workers**. Passing massive arrays of raw CSS styles and DOM lists directly into the LLM context creates immense noise, latency, and context bloat. To mitigate this, Workers operate deterministically on the Observation Graph, pre-processing and aggregating data into dense, semantic structures that the Coordinator can easily digest.

Workers **do not** use AI. They execute deterministic algorithms.

## 2. Worker Architecture
- **Input:** `SnapshotID` (pointing to a specific point-in-time Observation Graph) and optional target `NodeID`s or bounding constraints.
- **Process:** Graph traversal, filtering, grouping, and geometric computation.
- **Output:** Structured JSON responses containing aggregated facts, which the Coordinator consumes.
- **Execution:** Workers run outside the Browser Runtime but query the Observation Store.

## 3. Specialized Workers

### 3.1. Component Miner
**Purpose:** Identifies and extracts self-contained UI components (e.g., buttons, cards, navbars) based on structural grouping, isolation boundaries, and repeated structural signatures.

**Deterministic Algorithm:**
1. Traverse `DOMNode` tree from `containerNodeId`.
2. For each node, fetch `StyleNode` and `GeometryNode`.
3. Filter out nodes with `area <= 0` or `opacity == 0`.
4. Apply Isolation Heuristic: A node is a Component Root if it has a background color different from its parent, AND its area is less than 50% of the viewport, AND it contains at least one text or interactive child node.
5. Apply Repetition Heuristic: If sibling nodes share the same Sub-tree Hash (from Observation Graph), mark them as repeated components.

**Input Schema:**
```json
{
  "snapshotId": "snap-123",
  "containerNodeId": "node-10"
}
```

**Output Schema:**
```json
{
  "identifiedComponents": [
    {
      "rootNodeId": "node-45",
      "typeHint": "Container",
      "geometry": { "width": 300, "height": 400 },
      "descendantSummary": { "textNodes": 2, "interactiveNodes": 1 }
    }
  ]
}
```

**Acceptance Criteria:**
- Must return in < 500ms for a sub-graph of 1000 nodes.
- Must correctly group siblings with identical Sub-tree Hashes.

### 3.2. Design Token Extractor
**Purpose:** Scans the Observation Graph to derive a global design system (colors, typography, spacing scales).

**Deterministic Algorithm:**
1. Traverse all `StyleNode`s in `snapshotId`.
2. Extract all normalized `color` and `backgroundColor` hex values. Group by frequency. Top 3 are Primary, Secondary, Background.
3. Extract `fontFamily` and `fontSize`. Group into heading/body scales.
4. Calculate standard deviations to merge similar tokens (e.g., #FFFFFF and #FEFEFE).

**Input Schema:** `{"snapshotId": "snap-123"}`

**Output Schema:**
```json
{
  "colors": {
    "primary": "#0055ff",
    "background": "#ffffff"
  },
  "typography": {
    "heading1": { "fontFamily": "Inter", "fontSize": "32px", "weight": "700" }
  }
}
```

**Acceptance Criteria:**
- Must deduplicate RGBA, HSL, and Hex values to a unified Hex string.
- Tokens must only include styles that apply to visible elements.

### 3.3. Layout Analyzer
**Purpose:** Analyzes the geometric relationships between sibling nodes to deduce the intended layout methodology (e.g., Flexbox, Grid, lists).

**Deterministic Algorithm:**
1. Fetch all visible child `GeometryNode`s for `containerNodeId`.
2. Calculate bounding box intersections.
3. If `y` centers align within 2px tolerance, classify as `Row`.
4. If `x` centers align within 2px tolerance, classify as `Column`.
5. Calculate median gap between siblings. If gap variance < 2px, assert `gap: Npx`.

**Input Schema:** `{"snapshotId": "snap-123", "containerNodeId": "node-10"}`

**Output Schema:**
```json
{
  "layoutType": "Row",
  "alignment": "center",
  "gap": 16,
  "children": ["node-11", "node-12"]
}
```

**Acceptance Criteria:**
- Must gracefully handle absolutely positioned outliers.
- Must return `Unknown` if variance is too high.

## 4. Contract with Coordinator
When the Coordinator needs to understand a complex region of the page, it invokes one of the specific worker tools. The exact RPC signatures exposed to the Coordinator are:
- `Worker.extractDesignTokens(snapshotId)`
- `Worker.mineComponents(snapshotId, containerNodeId)`
- `Worker.analyzeLayout(snapshotId, containerNodeId)`

**Example Usage:**
The Coordinator invokes `Worker.mineComponents(snapshotId: "snap-123", containerNodeId: "node-10")`.

The Worker returns a processed JSON summary:
```json
{
  "identifiedComponents": [
    {
      "rootNodeId": "node-45",
      "typeHint": "Container",
      "geometry": { "width": 300, "height": 400 }
    }
  ]
}
```
The Coordinator uses this summary to form hypotheses and avoid loading the entire 400-node DOM subtree into its prompt.
