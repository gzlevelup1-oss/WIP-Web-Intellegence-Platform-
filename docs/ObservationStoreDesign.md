# Technical Design: Observation Store Implementation
**Mission:** M-016
**Status:** APPROVED
**Owner:** Engineering

## 1. Overview
In accordance with Phase 2 of the Roadmap, this mission implements the Observation Store. The Observation Store is responsible for persistently or in-memory managing Observation Graphs captured from the Browser Runtime. It decouples the conceptual graph from the physical storage and allows the AI Coordinator to query deterministic facts.

## 2. Architecture
The `packages/observation-store` will provide a robust repository for managing snapshots of the Observation Graph.

- **Package:** `packages/observation-store`
- **Interfaces:**
  - `IObservationStore`: Defines `saveSnapshot(snapshotId, graph)`, `getSnapshot(snapshotId)`, `queryNodes(snapshotId, predicate)`.
- **Implementation:**
  - `MemoryObservationStore`: An in-memory implementation for rapid testing and interactive lab usage.
  - (Deferred) `SQLiteObservationStore`: A persistent relational backing for the property graph.
- **Graph Structure:** Utilizes the node and edge definitions established in Mission 4 (`specs/OBSERVATION_GRAPH.md`).

## 3. Integration
The `apps/browser-lab` and `packages/coordinator` will be updated to interact with the `ObservationStore` instead of holding raw references to transient graphs.

## 4. Testing Strategy
- Unit tests using Vitest to verify graph storage, retrieval, and querying functions.

## 5. Scope
**In Scope:**
- Initializing `packages/observation-store`.
- Implementing the `MemoryObservationStore`.
- Unit tests for the store.
- Integrating the store into the Browser Lab context.

**Out of Scope:**
- Persistent relational database (SQLite/PostgreSQL) implementations (deferred to future if needed).
