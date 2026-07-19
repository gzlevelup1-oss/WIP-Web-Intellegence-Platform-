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
To pass the graph between the Runtime, the Coordinator, and Workers, it is serialized as a JSON-compatible adjacency list format conforming to this strict JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["snapshot", "nodes", "edges"],
  "properties": {
    "snapshot": {
      "type": "object",
      "required": ["id", "timestamp", "url"],
      "properties": {
        "id": { "type": "string" },
        "timestamp": { "type": "number" },
        "url": { "type": "string", "format": "uri" }
      }
    },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "properties"],
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["DOMNode", "StyleNode", "GeometryNode", "A11yNode", "InteractiveNode", "NetworkRequestNode", "ResourceNode", "TemporalNode", "PerformanceNode", "ValidationNode", "SnapshotNode"] },
          "properties": { "type": "object", "additionalProperties": true }
        }
      }
    },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["source", "target", "type"],
        "properties": {
          "source": { "type": "string" },
          "target": { "type": "string" },
          "type": { "type": "string" }
        }
      }
    }
  }
}
```

Example payload:
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
To enable high-performance structural diffing between snapshots, the graph utilizes Merkle-tree style deterministic hashing.

### 6.1 Node Hash Algorithm
1. Extract all key-value pairs from `properties`.
2. Filter out transient properties (e.g., scroll position if ignoring scroll, random generated IDs if normalization rules apply).
3. Sort keys alphabetically.
4. Serialize to a compact JSON string: `{"a":1,"b":"text"}`.
5. Compute `SHA-256(Type + ":" + SerializedProperties)`.

### 6.2 Sub-tree Hash Algorithm
To calculate the structural signature of a DOM subtree:
1. Let `H_node` be the Node Hash of the `DOMNode`.
2. Find all child `DOMNode`s via `CHILD_OF` edges.
3. Recursively calculate the Sub-tree Hash for each child.
4. Concatenate the child hashes in DOM order: `ChildHashes = Hash_C1 + Hash_C2 + ...`
5. Compute `SubTreeHash = SHA-256(H_node + ChildHashes)`.

This enables O(1) comparison: if `SubTreeHash(A) == SubTreeHash(B)`, the entire DOM sub-tree, including styles and geometry, is identical.

## 7. Invariants
- A `DOMNode` must have exactly one `HAS_GEOMETRY` edge (even if the geometry is hidden/zero).
- A `DOMNode` must have exactly one `HAS_STYLE` edge.
- AI Hypotheses are strictly forbidden from entering the graph structure.
- Spatial relationships (`OVERLAPS`) are only computed if explicitly requested, as they carry an O(N^2) derivation cost.
