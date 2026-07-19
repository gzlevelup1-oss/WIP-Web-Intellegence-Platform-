# Execution Kernel Specification

**Version:** 1.0.0-Draft  
**Related ADR:** ADR-005  

## 1. Overview
The Execution Kernel acts as the operating system for the Website Intelligence Platform. It sits directly beneath the Coordinator Agent and directly above the Browser Runtime. It decouples the deterministic execution capabilities from the higher-level reasoning logic, handling transaction safety, scheduling, retries, checkpointing, and permissions.

## 2. Core Responsibilities
- **Mission Execution Lifecycle:** The Kernel manages the start, pause, resume, and termination of a Coordinator's mission.
- **Transactions:** Grouping browser actions into atomic, reversible units of work.
- **Concurrency & Event Ordering:** Defining strict causal relationships between events.
- **Scheduling & Retries:** Managing exponential backoff and timeout logic.
- **Checkpointing:** Saving the complete state of an execution to allow replay or rollback.
- **Permissions:** Validating requests against a strict security policy.

## 3. The Execution Model
Execution within the Kernel follows a strict hierarchy:
`Mission` -> `Transaction` -> `Task` -> `Action`

1. **Mission:** The highest-level goal defined by the Coordinator. A Mission owns a Session.
2. **Transaction:** An atomic sequence of Tasks. The Kernel automatically wraps Coordinator tool invocations into Transactions, beginning and committing them seamlessly.
3. **Task:** A logical grouping of Actions, tracked for retry and scheduling purposes.
4. **Action:** A single deterministic request to the Browser Runtime (e.g., `Navigation.open`, `Interaction.click`).

## 4. Transactions and Checkpoints
### 4.1. Transactions
The Kernel enforces transactional safety over the Browser Runtime. Transactions are submitted by the Coordinator as atomic tool invocations. The Kernel internally manages the transaction lifecycle:
- **Begin**: The Kernel captures the initial state and starts tracking changes.
- **Commit**: The Kernel marks the sequence as complete and irreversible if all Tasks succeed.
- **Abort**: If any Task fails (e.g., terminal error or retry exhaustion), the Kernel rolls back to the last Checkpoint before returning control to the Coordinator.

### 4.2. Checkpoints
Since browsers are highly stateful, true rollback requires checkpointing.
- The Kernel automatically captures a Checkpoint (using Session Manager) before any `Transaction.begin()`.
- A Checkpoint captures the DOM Observation Graph root, local storage, cookies, and navigation history.
- If a `Transaction.abort()` is called, the Kernel restores the session to the exact Checkpoint state before returning control to the Coordinator.

## 5. Concurrency and Event Ordering
The Browser Runtime executes one deterministic Action at a time per Session. 
- The Kernel queues concurrent Task requests and serializes them.
- All Actions must have a monotonic sequence number.
- The Kernel blocks further Actions during a navigation transition or animation stabilization phase until the `Observation Point` is reached (as defined in `BROWSER_RUNTIME_API.md`).

## 6. Request Proxying and Context Injection
The Coordinator is unaware of underlying connection details or session identifiers. When the Coordinator invokes a tool (e.g., `Interaction.click(nodeId)`), the Execution Kernel intercepts the request. The Kernel:
1. Validates the request against the current Mission scope and Permissions.
2. Automatically injects the active `SessionID` into the payload.
3. Translates the request into the formal `BrowserRuntime.protocol` JSON-RPC message.
4. Manages the synchronous wait or asynchronous callback for the Transaction Result.

## 7. Permissions and Security
The Kernel acts as a gatekeeper. Before an Action is dispatched to the Browser Runtime, the Kernel checks:
- **Allowlist Policies:** E.g., block all requests to `*.analytics.com`.
- **Capability Checks:** E.g., is `Interaction.type` allowed in the current Mission scope?
- **Timeouts & Quotas:** Does this Mission have enough time/budget to execute this Action?

## 8. Scheduling and Retries
The Kernel handles deterministic failure modes without burdening the Coordinator:
- **Transient Failures (e.g., `TimeoutError`):** Automatically retried up to 3 times with exponential backoff.
- **Terminal Failures (e.g., `BrowserCrashError`):** Propagated immediately to the Coordinator, failing the Transaction.
