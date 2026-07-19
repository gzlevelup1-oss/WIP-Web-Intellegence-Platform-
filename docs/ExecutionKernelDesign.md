# Execution Kernel: Technical Design

**Mission:** M-011  
**Status:** Approved  
**Owner:** Execution Kernel Team  

## 1. Overview
The Execution Kernel acts as the operating system for the Platform. It provides a transactional interface to the Browser Runtime, shielding the Coordinator (AI Agent) from transient failures, network instability, and strict execution sequencing.

## 2. Architecture & Components
The Execution Kernel will be implemented as a TypeScript module within `packages/execution-kernel`. It exports a `Kernel` class that wraps the underlying `SessionManager` (Playwright instance in the Browser Laboratory).

### 2.1 Core Modules
1. **Transaction Manager (`transaction.ts`):** Handles the lifecycle of `Transactions` (PENDING, ACTIVE, COMMITTED, ABORTING, ABORTED). Enforces strict serializability.
2. **Scheduler & Retry Engine (`scheduler.ts`):** Wraps actions with exponential backoff for transient failures (e.g., timeouts, stale elements).
3. **Checkpoint Manager (`checkpoint.ts`):** Integrates with the `SessionManager` to capture full state before a transaction begins, enabling "Hard Aborts" via `history.back()` or restoring cookies/storage, and "Soft Aborts" by yielding control back to the Coordinator.
4. **Proxy/Dispatcher (`dispatcher.ts`):** Intercepts Coordinator tool invocations, injects `SessionID` context, and translates them into Browser Runtime RPC commands.

## 3. Data Flow
1. **Tool Invocation:** The Coordinator initiates an action (e.g., `Interaction.click({ selector })`).
2. **Transaction Start:** The `Dispatcher` intercepts the call and requests a lock from the `Transaction Manager`.
3. **Checkpoint Capture:** Once locked, the `Checkpoint Manager` stores the current URL, history index, and critical state.
4. **Execution & Scheduling:** The `Scheduler` attempts the action via the Browser Runtime API. If it fails with a transient error, it retries.
5. **Commit/Abort:**
   - On Success: The Transaction commits, and the result (new Observation Graph) is returned to the Coordinator.
   - On Failure: The `Checkpoint Manager` performs a rollback. The error is returned to the Coordinator.

## 4. Interfaces
### 4.1 IExecutionKernel
```typescript
interface IExecutionKernel {
  beginTransaction(missionId: string, sessionId: string): Promise<Transaction>;
  executeAction(transaction: Transaction, action: BrowserAction): Promise<ActionResult>;
  commitTransaction(transaction: Transaction): Promise<void>;
  abortTransaction(transaction: Transaction, soft?: boolean): Promise<void>;
}
```

## 5. Implementation Plan
- **Step 1:** Initialize the `packages/execution-kernel` NPM package.
- **Step 2:** Implement the `Transaction` and `Scheduler` core classes (Memory-based).
- **Step 3:** Implement the `CheckpointManager` logic (mocking Playwright interactions initially, then wiring them up).
- **Step 4:** Integrate `ExecutionKernel` into `apps/browser-lab/server.ts` to proxy requests to the Playwright engine.

## 6. Open Questions
- How do we serialize Playwright's specific internal session states for a true "hard" checkpoint? Currently, capturing URL and local storage/cookies is sufficient for the prototype.
