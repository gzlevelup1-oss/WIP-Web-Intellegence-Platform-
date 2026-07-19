# ADR-001: Observation Graph & Model

**Status:** Approved

## Context
Traditional web extraction tools rely heavily on raw HTML strings and pixel screenshots, asking LLMs to infer the relationships between DOM elements, styles, and layout bounding boxes. This causes hallucinations and inaccuracies.

## Decision
We enforce a strict decoupling of conceptual reality from storage formats by defining an **Observation Model** (the conceptual definition of facts) and implementing it as an **Observation Graph**. The graph will store explicit, measured relationships between structural (DOM), visual (CSS/Geometry), semantic, and interactive elements.

## Rationale
- Decouples observation from reasoning (Model stores facts, never AI hypotheses).
- Allows AI to query deterministic facts rather than guess them.
- Provides a universal format that can be consumed by multiple downstream adapters (e.g., Forge, React, Flutter).
- Separating the conceptual Model from the Graph preserves architectural independence from any specific graph database or storage engine.

## Consequences
- Requires a robust, headless browser runtime to extract accurate metrics.
- Introduces graph traversal algorithms as a dependency.
- Greatly increases reliability of reconstructed models.
