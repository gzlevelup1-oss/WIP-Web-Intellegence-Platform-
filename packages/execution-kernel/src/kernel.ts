import { BrowserAction, ActionResult } from './types.js';
import { Transaction, TransactionManager } from './transaction.js';
import { Scheduler } from './scheduler.js';
import { CheckpointData, ICheckpointAdapter } from './checkpoint.js';

export class ExecutionKernel {
  private txManager = new TransactionManager();
  private scheduler = new Scheduler();
  private activeCheckpoints: Map<string, CheckpointData> = new Map();
  private checkpointAdapter?: ICheckpointAdapter;
  
  constructor(checkpointAdapter?: ICheckpointAdapter) {
    this.checkpointAdapter = checkpointAdapter;
  }

  public async beginTransaction(missionId: string, sessionId: string): Promise<Transaction> {
    const tx = await this.txManager.acquireLock(missionId, sessionId);
    
    if (this.checkpointAdapter) {
      const checkpoint = await this.checkpointAdapter.createCheckpoint(sessionId);
      this.activeCheckpoints.set(tx.id, checkpoint);
    }
    
    return tx;
  }

  public async executeAction(transaction: Transaction, actionFn: () => Promise<ActionResult>): Promise<ActionResult> {
    if (transaction.status !== 'ACTIVE') {
      return { success: false, error: 'Transaction is not active' };
    }
    
    return this.scheduler.executeWithRetry(actionFn);
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
