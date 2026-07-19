# Glossary: Frozen Vocabulary

The following terminology is strictly governed. Once defined here, these names **never change**. Preventing terminology drift is invaluable over a long project.

*   **Browser Runtime:** The instrumented, headless browser instance that acts as a deterministic measurement tool for layout, rendering, and interaction.
*   **Session Manager:** The stateful controller that isolates, tracks, and manages the lifecycle and memory of the Browser Runtime across interactions.
*   **Execution Kernel:** The operating system of WIP. It defines execution semantics, owning mission execution, transactions, permissions, scheduling, retries, cancellation, checkpointing, event ordering, concurrency, and execution policies.
*   **Observation Model:** The conceptual definition of what exists in executed reality (facts, not interpretations).
*   **Snapshot:** A complete, internally consistent collection of observations captured under one observation policy.
*   **Timeline:** An ordered series of Snapshots over time.
*   **Observation Graph:** The primary, queryable data structure storing explicit, measured relationships between structural (DOM), visual (CSS/Geometry), semantic, and interactive elements.
*   **Experience Graph:** The higher-level semantic model that represents the user journey, states, and interactive flows over time.
*   **Coordinator:** The primary AI agent (Planner) that executes loops of exploration, forms hypotheses, and controls the deterministic tool suite. It performs semantic reasoning but never deterministic computation.
*   **Worker:** A specialized, lightning-fast deterministic local algorithm designed to execute tasks like mathematical clustering, token extraction, or pattern identification.
*   **Mission:** A focused, scope-protected objective with defined inputs, outputs, and exit criteria that the Coordinator or Implementor must complete.
*   **Task:** An atomic, independently testable unit of implementation work within a Mission.
*   **RFC (Request for Comments):** A document exploring possible solutions, tradeoffs, and recommendations *before* an architectural decision is made.
*   **ADR (Architecture Decision Record):** A document recording a finalized, approved architectural decision.
*   **Invariant:** A law (architectural or repository) that cannot be changed without explicit approval and proposal processes.
*   **Adapter:** A translation layer that compiles the framework-agnostic Observation Graph into a specific output format (e.g., Forge, React, Flutter).
