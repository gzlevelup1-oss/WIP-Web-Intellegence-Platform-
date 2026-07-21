import { BrowserAction, ActionResult } from './types.js';
import { Transaction, TransactionManager } from './transaction.js';
import { Scheduler } from './scheduler.js';
import { CheckpointData, ICheckpointAdapter } from './checkpoint.js';
import { Task } from './task.js';

export class ExecutionKernel {
  private txManager = new TransactionManager();
  private scheduler = new Scheduler();
  private activeCheckpoints: Map<string, CheckpointData> = new Map();
  private checkpointAdapter?: ICheckpointAdapter;
  
  constructor(checkpointAdapter?: ICheckpointAdapter) {
    this.checkpointAdapter = checkpointAdapter;
  }

  public async beginTransaction(missionId: string, sessionId: string, role: string = 'user'): Promise<Transaction> {
    const tx = await this.txManager.acquireLock(missionId, sessionId, role);
    
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
    
    return this.scheduler.executeTaskWithRetry(task, actionExecutor);
  }

  public async commitTransaction(transaction: Transaction): Promise<void> {
    transaction.commit();
    this.activeCheckpoints.delete(transaction.id);
    this.txManager.releaseLock(transaction);
  }

  public async abortTransaction(transaction: Transaction, soft: boolean = false): Promise<void> {
    transaction.status = 'ABORTING';
    
    if (!soft && this.checkpointAdapter) {
      const checkpoint = this.activeCheckpoints.get(transaction.id);
      if (checkpoint) {
        await this.checkpointAdapter.restoreCheckpoint(transaction.sessionId, checkpoint);
      }
    }
    
    transaction.abort();
    this.activeCheckpoints.delete(transaction.id);
    this.txManager.releaseLock(transaction);
  }
}
