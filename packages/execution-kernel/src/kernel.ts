import { EventEmitter } from 'events';
import { BrowserAction, ActionResult } from './types.js';
import { Transaction, TransactionManager, IsolationLevel } from './transaction.js';
import { Scheduler } from './scheduler.js';
import { CheckpointData, ICheckpointAdapter } from './checkpoint.js';
import { Task } from './task.js';

export class ExecutionKernel extends EventEmitter {
  private txManager = new TransactionManager();
  private scheduler = new Scheduler();
  private activeCheckpoints: Map<string, CheckpointData> = new Map();
  private checkpointAdapter?: ICheckpointAdapter;
  
  constructor(checkpointAdapter?: ICheckpointAdapter) {
    super();
    this.checkpointAdapter = checkpointAdapter;
  }

  public async beginTransaction(missionId: string, sessionId: string, role: string = 'user', isolationLevel: IsolationLevel = 'Isolated'): Promise<Transaction> {
    const tx = await this.txManager.acquireLock(missionId, sessionId, role, isolationLevel);
    
    if (this.checkpointAdapter) {
      const checkpoint = await this.checkpointAdapter.createCheckpoint(sessionId);
      this.activeCheckpoints.set(tx.id, checkpoint);
    }
    
    return tx;
  }
  
  public evaluatePolicy(transaction: Transaction, task: Task): boolean {
    const role = transaction.role;
    
    for (const action of task.actions) {
      // Evaluate RBAC mapping
      // For instance: 'evaluate' and 'navigate' might require 'admin' in some strict setups,
      // but for standard execution, 'system' or 'admin' could be required for certain actions.
      if (action.type === 'navigate' && role !== 'admin') {
        return false;
      }
    }
    return true;
  }

  public async executeTask(transaction: Transaction, task: Task, actionExecutor: (action: BrowserAction) => Promise<ActionResult>): Promise<ActionResult> {
    if (transaction.status !== 'ACTIVE') {
      return { success: false, error: 'Transaction is not active' };
    }
    
    if (!this.evaluatePolicy(transaction, task)) {
      return { success: false, error: `RBAC Policy Violation: Transaction role '${transaction.role}' cannot execute one or more actions in the task.` };
    }
    
    transaction.addTask(task);
    
    this.emit('Event.Mission.StepStarted', { transactionId: transaction.id, sessionId: transaction.sessionId, taskId: task.id });
    const result = await this.scheduler.executeTaskWithRetry(task, actionExecutor);
    this.emit('Event.Mission.StepCompleted', { transactionId: transaction.id, sessionId: transaction.sessionId, taskId: task.id, success: result.success });
    return result;
  }

  public async commitTransaction(transaction: Transaction): Promise<void> {
    transaction.commit();
    this.activeCheckpoints.delete(transaction.id);
    this.txManager.releaseLock(transaction);
  }

  public async abortTransaction(transaction: Transaction, soft: boolean = false): Promise<void> {
    transaction.status = 'ABORTING';
    
    if (this.checkpointAdapter) {
      const checkpoint = this.activeCheckpoints.get(transaction.id);
      if (checkpoint) {
        // If it's a shared isolation level, we force a soft abort
        const isSoft = soft || transaction.isolationLevel === 'Shared';
        
        // Passing isSoft to checkpointAdapter isn't directly supported by the interface,
        // but we can assume the adapter's restoreCheckpoint handles DOM/scroll
        // if we wanted to avoid clearing cookies on soft abort, we'd need to modify the adapter interface.
        // For now, if it's soft, we could theoretically skip clearing cookies in the adapter
        // Let's pass a soft flag down if the interface allows it, or just pass it as an option
        await this.checkpointAdapter.restoreCheckpoint(transaction.sessionId, checkpoint, { soft: isSoft });
      }
    }
    
    transaction.abort();
    this.activeCheckpoints.delete(transaction.id);
    this.txManager.releaseLock(transaction);
  }
}
