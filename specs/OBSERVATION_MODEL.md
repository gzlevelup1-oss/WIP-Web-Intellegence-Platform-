# Observation Model Specification

**Version:** 1.0.0-Draft  
**Related ADR:** ADR-001  

## 1. Philosophy
An Observation Model defines **facts, not interpretations**. Every observation recorded by WIP must correspond to something that can be deterministically measured or derived according to an approved algorithm. The Observation Model **never** stores opinions, hypotheses, or AI reasoning. Those belong to higher architectural layers.

## 2. The Ontology
The Observation Model follows a strict hierarchy of concepts representing executed reality. WIP never models raw HTML; it models executed reality.

1. **Reality:** The live browser executing a website (DOM, CSS, Layout, Accessibility, Time, User interaction).
2. **Observation:** An atomic, deterministically measured fact about Reality (e.g., "Button width = 124px").
3. **Evidence:** The raw data source or API call that proves the Observation (e.g., `getBoundingClientRect()`).
4. **Relationship:** A measured connection between observations (e.g., "contains", "overlaps").
5. **Snapshot:** A complete, internally consistent collection of observations captured under one observation policy.
6. **Timeline:** An ordered series of Snapshots over time.
7. **Session:** A bounded execution that owns a Timeline, Metadata, Cookies, and Storage.
8. **Mission:** The highest-level execution context. A Mission references Sessions.

*Hierarchy: Mission → Session → Timeline → Snapshot → Observation → Evidence.*

## 3. Observation Categories
Every Observation must be explicitly classified into one of the following categories:

- **Structural:** DOM nodes, Shadow DOM boundaries, iframes.
- **Visual:** Computed CSS properties, visibility, opacity, fonts, colors.
- **Geometric:** Bounding boxes, coordinates, scroll offsets.
- **Temporal:** Animation frames, transition states.
- **Interactive:** Event listeners attached, focus states, hoverable areas.
- **Accessibility:** A11y tree roles, names, values, aria attributes.
- **Resource:** Loaded images, fonts, scripts.
- **Performance:** Frame timings, layout shifts.
- **Network:** Outbound requests, status codes, payload sizes.
- **Semantic (Deterministically Derived):** Tags inherently carrying meaning (e.g., `<nav>`, `<button>`). Note: this only refers to structurally evident semantics, not AI inferences.

## 4. Observation Identity & Evidence Schema
Every Observation possesses a globally unique identity that survives storage changes. The schema for an observation explicitly links it to its evidence.

```json
{
  "type": "object",
  "properties": {
    "ObservationID": { "type": "string", "pattern": "^obs-[a-f0-9]{8}$" },
    "SnapshotID": { "type": "string", "pattern": "^snap-[a-f0-9]{8}$" },
    "Subject": { "type": "string", "description": "The unique NodeID this observation describes" },
    "Property": { "type": "string", "enum": ["backgroundColor", "bounds", "role", "isVisible"] },
    "Value": { "type": ["string", "number", "boolean", "object"] },
    "Evidence": {
      "type": "object",
      "properties": {
        "source": { "type": "string", "enum": ["CDP", "DOM_API", "A11Y_TREE"] },
        "method": { "type": "string", "example": "DOMSnapshot.captureSnapshot" },
        "timestamp": { "type": "number", "description": "High-resolution monotonic time" }
      },
      "required": ["source", "method", "timestamp"]
    },
    "Confidence": { "type": "number", "enum": [1.0], "description": "Must be exactly 1.0. Probabilistic data is forbidden." },
    "Version": { "type": "string" }
  },
  "required": ["ObservationID", "SnapshotID", "Subject", "Property", "Value", "Evidence", "Confidence"]
}
```

## 5. Facts vs. Derivations
The model distinguishes between what is directly measured and what is deterministically calculated.
- **Measured Facts:** Directly read from the browser (e.g., `width = 400px`).
- **Deterministic Derivations:** Calculated via algorithms based purely on facts (e.g., "Element A overlaps Element B").
- **AI Hypotheses (FORBIDDEN):** Inferred assumptions (e.g., "This looks like a Card component"). AI hypotheses belong in the Experience Graph or Semantic Model, never here.

## 6. Confidence
In the Observation Model, confidence isn't probabilistic. It is a statement that the fact is reproducible under the same conditions.
- **Measurement Confidence = 1.0**: Raw data extracted via CDP.
- **Deterministic Derivation Confidence = 1.0**: Calculated via exact geometric or layout algorithms.
- **AI Classification = Not Allowed**: Any value `< 1.0` or requiring probabilistic inference MUST be stored in the semantic layer, never the Observation Graph.

## 7. Invariants
The Observation Model enforces the following foundational laws, which are validated before persistence:
1. **Uniqueness:** Every observation belongs to exactly one snapshot.
2. **Hierarchy:** Every snapshot belongs to exactly one timeline. Every timeline belongs to exactly one session.
3. **Traceability:** Every observation has at least one evidence source conforming to the Evidence schema.
4. **Immutability:** Observations are immutable after creation.
5. **No AI Bleed:** Observations never reference AI hypotheses.
6. **Determinism:** Relationships are deterministic.
7. **Monotonicity:** Time is monotonic within a timeline.
8. **Consistency:** Snapshots are internally consistent (e.g., bounding boxes cannot be larger than the viewport).
9. **Confidence:** Confidence is always exactly `1.0`.

## 8. What the Observation Model Must Never Contain (Non-Goals)
The Observation Model must remain a faithful representation of browser-observable reality. It must not store:
- Component inference.
- Design pattern detection.
- UI classification.
- Business logic assumptions.
- User intent.
- Accessibility recommendations (only facts/violations).
- Code generation or Forge IR.
- AI prompts.
- LLM reasoning or scratchpads.

## 9. Architectural Layers (Decoupling)
To ensure long-term flexibility, WIP consistently distinguishes:
- **Observation Model:** Defines what exists (this document).
- **Observation Graph:** One specific representation of the model connecting relationships.
- **Observation Store:** The persistence layer (e.g., Property Graph DB, Relational DB).
- **Query Engine:** How downstream consumers (Coordinator, Workers) retrieve information.
