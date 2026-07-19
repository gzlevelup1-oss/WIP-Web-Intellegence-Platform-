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

**Algorithms/Heuristics:**
- **Boundary Detection:** Looks for structural nodes with significant padding/margins, distinct background colors compared to their parents, and contained text/interactive nodes.
- **Visual Isolation:** Computes empty space around a node to declare it a standalone block.
- **Output:** A list of candidate component root `NodeID`s, their bounding boxes, and a summary of their descendant types (e.g., "Contains 1 Icon, 1 Text Node").

### 3.2. Design Token Extractor
**Purpose:** Scans the Observation Graph to derive a global design system (colors, typography, spacing scales).

**Algorithms/Heuristics:**
- **Color Aggregation:** Traverses all `StyleNode`s, extracting `backgroundColor`, `color`, `borderColor`. It groups hex/rgb values, counts frequencies, and outputs a canonical palette (e.g., Primary, Secondary, Background).
- **Typography Scales:** Extracts `fontFamily`, `fontSize`, `fontWeight`, sorting them into heading/body scales based on frequency and pixel size.
- **Output:** A JSON dictionary representing the derived `theme` object.

### 3.3. Layout Analyzer
**Purpose:** Analyzes the geometric relationships between sibling nodes to deduce the intended layout methodology (e.g., Flexbox, Grid, lists) when actual CSS might be obfuscated or implemented using legacy techniques (like absolute positioning).

**Algorithms/Heuristics:**
- **Alignment Detection:** Groups sibling `GeometryNode`s by common `x` or `y` coordinates. 
- **Spacing Consistency:** Measures the gaps between grouped siblings. If the gap variance is near zero, it asserts a `gap` property.
- **Output:** Generates a topological layout tree (e.g., "Row containing 3 Cards, equally spaced with 16px gap").

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
