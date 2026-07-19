# Mission Protocol Specification

**Status:** 1.0.0-Draft

## 1. Coordinator Planning
A Mission is the highest-level operational unit for the AI Coordinator. The protocol dictates that every Mission begins with an explicit Planning Phase.
- **Mission Payload:** Contains the `MissionId`, `Objective` (natural language), `Constraints` (e.g., maximum steps, allowed tools), and the `TargetURL`.
- **Pre-flight Checks:** The Coordinator must acknowledge the mission constraints and emit an initial `Plan` object before invoking any execution tools.

## 2. Execution Flow
The Mission execution must follow a strict state machine:
- `PENDING`: Waiting for Coordinator allocation.
- `PLANNING`: Coordinator is formulating the initial step sequence.
- `ACTIVE`: Coordinator is iteratively requesting observations, analyzing data, and executing transactions.
- `VALIDATING`: Coordinator invoked `Mission.complete()`, and the Validation Engine is intercepting to run checks.
- `REPAIRING`: Validation failed; Coordinator is executing a sub-plan to fix layout discrepancies.
- `COMPLETED`: Validation passed.
- `FAILED`: Aborted due to unrecoverable terminal errors or validation exhaustion.

## 3. Checkpoints & State
The Mission Protocol guarantees resumability.
- Every successful Transaction executed during `ACTIVE` generates an implicit Checkpoint via the Execution Kernel.
- If the Coordinator crashes or is pre-empted, a new Coordinator instance can resume the Mission by loading the last `CheckpointId` and the `ExperienceGraph` state.

## 4. Progress Reporting
The Coordinator must emit real-time status updates via structured events:
- `Event.Mission.StepStarted(description)`
- `Event.Mission.StepCompleted(transactionId)`
- `Event.Mission.HypothesisFormed(semanticRole, nodeId)`
These events populate the Developer/User UI to provide transparency into the AI's reasoning process without exposing raw JSON.
