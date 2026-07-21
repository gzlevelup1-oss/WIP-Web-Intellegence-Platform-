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
The Kernel enforces transactional safety over the Browser Runtime. Transactions are submitted by the Coordinator as atomic tool invocations. The Kernel internally manages the transaction lifecycle with the following states:

- **`PENDING`**: Transaction received, waiting for scheduler lock.
- **`ACTIVE`**: Actions are executing.
- **`COMMITTED`**: All actions succeeded.
- **`ABORTING`**: A failure occurred, rollback is in progress.
- **`ABORTED`**: Rollback complete, error returned to Coordinator.

### 4.2. Checkpoint Format
A checkpoint represents a restorable state.

```json
{
  "checkpointId": "chk-999",
  "sessionId": "sess-123",
  "timestamp": 1690000000,
  "state": {
    "url": "https://example.com/checkout",
    "historyIndex": 2,
    "cookies": [{"name": "session", "value": "xyz"}],
    "localStorage": {"cart": "{...}"},
    "snapshotHash": "sha256-..."
  }
}
```

If a `Transaction.abort()` is called, the Kernel restores the session to the exact Checkpoint state before returning control to the Coordinator.

### 4.3. Soft Checkpointing (Extension Runtime)
When the Kernel interfaces with a Runtime operating under `IsolationLevel: Shared` (e.g., the Chrome Extension Runtime), hard state wipes (clearing cookies, local storage) must not be performed to prevent logging the user out.
- **Soft Abort**: The Kernel relies on reverse-navigation (`history.back()`) or simply halts execution to yield control back to the Coordinator, logging the transaction as a soft abort rather than restoring a complete hard checkpoint.

## 5. Concurrency and Event Ordering
The Kernel enforces Strict Serializability per Session.
- **Mutual Exclusion**: Only one Transaction can be `ACTIVE` per Session at any given time.
- **Queueing**: Concurrent requests block and wait in a FIFO queue.
- **Monotonicity**: All Actions have a monotonic sequence number `seq_num`.
- **Stabilization Lock**: The Kernel blocks all queue processing while the Browser Runtime is unstable (e.g., waiting for `Event.Lifecycle.AnimationsStable`).

## 6. Request Proxying and Context Injection
The Coordinator is unaware of underlying connection details or session identifiers. When the Coordinator invokes a tool (e.g., `Interaction.click(nodeId)`), the Execution Kernel intercepts the request. The Kernel:
1. Validates the request against the current Mission scope and Permissions.
2. Automatically injects the active `SessionID` into the payload.
3. Translates the request into the formal `BrowserRuntime.protocol` JSON-RPC message.
4. Manages the synchronous wait or asynchronous callback for the Transaction Result.

## 7. Permissions and Security
The Kernel applies a strict RBAC/Policy model:
```json
{
  "missionId": "m-001",
  "permissions": {
    "allowedDomains": ["*.example.com"],
    "blockedDomains": ["*.analytics.com"],
    "allowedCapabilities": ["Navigation", "Interaction", "Observation"],
    "maxDurationMs": 300000,
    "maxTransactions": 50
  }
}
```
Any action violating this policy immediately transitions the active Transaction to `ABORTING`.

## 8. Scheduling and Retries
The Kernel handles deterministic failure modes using strict retry semantics:
- **Transient Failures (e.g., `4002 TimeoutError`)**: Retried up to 3 times. 
  - `Delay = base_ms * (2 ^ attempt)`. `base_ms = 500`.
- **Stale Node Errors (e.g., node detached during execution)**: Retried exactly 1 time by forcing a silent internal re-Observation to fetch the new `nodeId`.
- **Terminal Failures (e.g., `5001 BrowserCrashError`)**: Propagated immediately to the Coordinator, failing the Transaction.
