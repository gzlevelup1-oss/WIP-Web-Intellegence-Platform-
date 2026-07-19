# Observation Graph Specification

**Version:** 1.0.0-Draft  
**Related ADR:** ADR-001  

## 1. Overview
The Observation Graph is the primary, relational representation of the Observation Model. It structures atomic, measured facts into a queryable network of nodes and edges. It translates the raw measurements of executed browser reality into a topological graph that downstream workers and adapters can consume.

## 2. Graph Fundamentals
The Observation Graph is a **Directed Property Graph**. 
- **Nodes** represent distinct physical or logical entities observed in the browser (e.g., a DOM Node, an Accessibility Node, a Network Request).
- **Edges** represent deterministic relationships between these entities (e.g., Parent-Child, Overlaps, Triggers).
- **Properties** represent the atomic observations (e.g., `width`, `backgroundColor`) attached to nodes or edges.

All nodes and edges belong to exactly one `SnapshotID`.

## 3. Node Types
Every node in the graph must have a strict label. The allowed Node Types map to the observation categories defined in the Observation Model.

1. **`DOMNode`**: Represents a structural HTML/XML element or text node.
   - *Properties:* `nodeId`, `tagName`, `nodeType`, `attributes` (map), `classes` (list).
2. **`StyleNode`**: Represents the computed visual properties of a `DOMNode`.
   - *Properties:* `display`, `position`, `backgroundColor`, `color`, `fontFamily`, `opacity`, `margin`, `padding`, etc.
3. **`GeometryNode`**: Represents the physical layout constraints in the viewport.
   - *Properties:* `x`, `y`, `width`, `height`, `scrollX`, `scrollY`, `zIndex`.
4. **`A11yNode`**: Represents a node in the browser's accessibility tree.
   - *Properties:* `role`, `name`, `value`, `disabled`, `expanded`, `focused`.
5. **`InteractiveNode`**: Represents interaction potential.
   - *Properties:* `eventListeners` (list of types: `click`, `hover`, etc.).
6. **`NetworkRequestNode`**: Represents a tracked network request.
   - *Properties:* `url`, `method`, `status`, `mimeType`, `payloadSize`.
7. **`ResourceNode`**: Represents a loaded resource asset (e.g., image, script, font).
   - *Properties:* `url`, `type`, `cached`, `size`.
8. **`TemporalNode`**: Represents an active animation or transition state.
   - *Properties:* `animationName`, `duration`, `playState`, `currentTime`.
9. **`PerformanceNode`**: Represents frame timings or layout shifts for the snapshot.
   - *Properties:* `fps`, `layoutShiftScore`, `domContentLoaded`.
10. **`ValidationNode`**: Represents the outcome of visual or structural diffs.
    - *Properties:* `ssimScore`, `mseScore`, `structuralMatch`.
11. **`SnapshotNode`**: The root node for a given capture.
    - *Properties:* `snapshotId`, `timestamp`, `url`, `viewportWidth`, `viewportHeight`.

## 4. Edge Relationships
Edges connect nodes deterministically. Edges are directional.

1. **Structural Relationships:**
   - `CHILD_OF`: Links a `DOMNode` to its parent `DOMNode`.
   - `HAS_SHADOW_ROOT`: Links a `DOMNode` to its encapsulated Shadow DOM root.
   - `CONTAINS_IFRAME`: Links a `DOMNode` to a separate `SnapshotNode` representing the inner frame.

2. **Attribute Relationships:**
   - `HAS_STYLE`: Links a `DOMNode` to a `StyleNode`.
   - `HAS_GEOMETRY`: Links a `DOMNode` to a `GeometryNode`.
   - `HAS_A11Y`: Links a `DOMNode` to an `A11yNode`.
   - `HAS_INTERACTION`: Links a `DOMNode` to an `InteractiveNode`.

3. **Spatial Relationships (Deterministically Derived):**
   - `OVERLAPS`: Links two `GeometryNodes` that intersect physically.
   - `ABOVE` / `BELOW` / `LEFT_OF` / `RIGHT_OF`: Positional relationships derived from `GeometryNodes`.
   - `CLIPPED_BY`: Links a `GeometryNode` to the ancestor `GeometryNode` that visually hides its overflow.

4. **Resource Relationships:**
   - `INITIATED_REQUEST`: Links a `DOMNode` (like an `<img>` or `<script>`) to a `NetworkRequestNode`.
   - `LOADED_RESOURCE`: Links a `DOMNode` to a `ResourceNode`.

5. **Temporal Relationships:**
   - `HAS_ANIMATION`: Links a `DOMNode` to a `TemporalNode`.

6. **Snapshot Relationships:**
   - `BELONGS_TO`: Links any node to its `SnapshotNode`.
   - `HAS_PERFORMANCE`: Links a `SnapshotNode` to a `PerformanceNode`.
   - `HAS_VALIDATION`: Links a `SnapshotNode` to a `ValidationNode`.

## 5. Serialization Format
To pass the graph between the Runtime, the Coordinator, and Workers, it is serialized as a JSON-compatible adjacency list format. 

```json
{
  "snapshot": {
    "id": "snap-12345",
    "timestamp": 1690000000,
    "url": "https://example.com"
  },
  "nodes": [
    {
      "id": "node-1",
      "type": "DOMNode",
      "properties": { "tagName": "div", "classes": ["container"] }
    },
    {
      "id": "geo-1",
      "type": "GeometryNode",
      "properties": { "x": 0, "y": 0, "width": 1024, "height": 768 }
    }
  ],
  "edges": [
    {
      "source": "node-1",
      "target": "snap-12345",
      "type": "BELONGS_TO"
    },
    {
      "source": "node-1",
      "target": "geo-1",
      "type": "HAS_GEOMETRY"
    }
  ]
}
```

## 6. Stability and Hashing
To enable diffing between snapshots, the graph must support deterministic hashing.
- **Node Hash**: Calculated by hashing the node's sorted properties.
- **Sub-tree Hash**: Calculated by hashing the node's hash combined with the sorted sub-tree hashes of its `CHILD_OF` relations. This allows O(1) comparison of DOM subtrees across snapshots to detect changes.

## 7. Invariants
- A `DOMNode` must have exactly one `HAS_GEOMETRY` edge (even if the geometry is hidden/zero).
- A `DOMNode` must have exactly one `HAS_STYLE` edge.
- AI Hypotheses are strictly forbidden from entering the graph structure.
- Spatial relationships (`OVERLAPS`) are only computed if explicitly requested, as they carry an O(N^2) derivation cost.
