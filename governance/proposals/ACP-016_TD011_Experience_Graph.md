# ACP-016: Coordinator Experience Graph & Passive Mode (TD-011)

**Status:** Approved
**Owner:** Architecture
**Date:** 2026-07-23

## 1. Context and Motivation
Per ARCH-003 and TD-011, the Coordinator Protocol specifies an **Experience Graph** used to store semantic labels and hypotheses (e.g., mapping `node-45` to `primary-checkout-button`), separate from the deterministic Observation Graph. Furthermore, the specification details a **Passive Observation Mode** for extension runtimes where the Coordinator receives `Event.Interaction.Recorded` events. Currently, both the Experience Graph data structure and the Passive Observation Mode are unimplemented in the `@wip/coordinator` package.

## 2. Technical Design

### 2.1 Experience Graph
- Implement an `ExperienceGraph` class in `packages/coordinator/src/experience-graph.ts`.
- The graph will store a list of Hypotheses. Each Hypothesis includes:
  - `hypothesisId`: string
  - `snapshotId`: string
  - `nodeId`: string
  - `semanticRole`: string
  - `confidence`: number
- Add methods: `addHypothesis`, `getHypothesesForNode`, `resolveExperience`.

### 2.2 Passive Observation Mode (Copilot)
- Implement `CoordinatorAgent.enablePassiveMode(handler?: (event: any) => void)`.
- The Coordinator will listen for an incoming stream of `Event.Interaction.Recorded` events from the runtime/kernel.
- Upon receiving a recorded interaction, the Coordinator processes it in the background and may update the Experience Graph (e.g. automatically hypothesizing that a clicked node has an interactive semantic role).
- It will emit `Event.Coordinator.HypothesisFormed` whenever the Experience Graph is updated.

### 2.3 Agent State Expansion
- Expose the `experienceGraph` instance on `CoordinatorAgent`.
- Include the `ExperienceGraph` state in the system instructions passed to the ReAct loop, allowing the Gemini model to utilize past hypotheses when planning.

## 3. Impact Analysis
- **Coordinator Package:** Minor expansion to internal state handling; adds a dedicated storage module for hypotheses.
- **Protocol:** Enforces the separation of reasoning (Experience) from facts (Observation), closing the architectural gap.

## 4. Required Actions
1. Approve this ACP.
2. Initialize Mission 31 in `MISSION.md` and `TASKS.md`.
3. Implement `ExperienceGraph` and `Passive Observation Mode` in `packages/coordinator/src/agent.ts`.
