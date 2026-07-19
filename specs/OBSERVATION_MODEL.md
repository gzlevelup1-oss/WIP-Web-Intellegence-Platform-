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

## 4. Observation Identity
Every Observation possesses a globally unique identity that survives storage changes. Conceptually:

```json
{
  "ObservationID": "obs-1234",
  "SnapshotID": "snap-abc",
  "Subject": "node-45",
  "Property": "backgroundColor",
  "Value": "#FFFFFF",
  "Evidence": "window.getComputedStyle",
  "Timestamp": 1690000000,
  "Version": "1.0"
}
```

## 5. Facts vs. Derivations
The model distinguishes between what is directly measured and what is deterministically calculated.
- **Measured Facts:** Directly read from the browser (e.g., `width = 400px`).
- **Deterministic Derivations:** Calculated via algorithms based purely on facts (e.g., "Element A overlaps Element B").
- **AI Hypotheses (FORBIDDEN):** Inferred assumptions (e.g., "This looks like a Card component"). AI hypotheses belong in the Experience Graph or Semantic Model, never here.

## 6. Confidence
In the Observation Model, confidence isn't probabilistic. It is a statement that the fact is reproducible under the same conditions.
- Measurement Confidence = `1.0`
- Deterministic Derivation Confidence = `1.0`
- AI Classification = Not stored here.

## 7. Invariants
The Observation Model enforces the following foundational laws:
1. Every observation belongs to exactly one snapshot.
2. Every snapshot belongs to exactly one timeline.
3. Every timeline belongs to exactly one session.
4. Every observation has at least one evidence source.
5. Observations are immutable after creation.
6. Observations never reference AI hypotheses.
7. Relationships are deterministic.
8. Time is monotonic within a timeline.
9. Snapshots are internally consistent.
10. Evidence is traceable.

## 8. What the Observation Model Must Never Contain (Non-Goals)
The Observation Model must remain a faithful representation of browser-observable reality. It is strictly forbidden to store:
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
