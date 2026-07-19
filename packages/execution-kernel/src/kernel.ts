import { BrowserAction, ActionResult } from './types.js';
import { Transaction, TransactionManager } from './transaction.js';
import { Scheduler } from './scheduler.js';
import { CheckpointManager, CheckpointData } from './checkpoint.js';
import { BrowserContext, Page } from 'playwright';

export class ExecutionKernel {
  private txManager = new TransactionManager();
  private scheduler = new Scheduler();
  private checkpointManager = new CheckpointManager();
  private activeCheckpoints: Map<string, CheckpointData> = new Map();

  private contexts: Map<string, { context: BrowserContext; page: Page }> = new Map();

  public registerSession(sessionId: string, context: BrowserContext, page: Page) {
    this.contexts.set(sessionId, { context, page });
  }

  public async beginTransaction(missionId: string, sessionId: string): Promise<Transaction> {
    const tx = await this.txManager.acquireLock(missionId, sessionId);
    
    const sessionArgs = this.contexts.get(sessionId);
    if (sessionArgs) {
      const checkpoint = await this.checkpointManager.createCheckpoint(sessionArgs.context, sessionArgs.page);
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
    
    if (!soft) {
      const sessionArgs = this.contexts.get(transaction.sessionId);
      const checkpoint = this.activeCheckpoints.get(transaction.id);
      if (sessionArgs && checkpoint) {
        await this.checkpointManager.restoreCheckpoint(sessionArgs.context, sessionArgs.page, checkpoint);
      }
    }
    
    transaction.abort();
    this.activeCheckpoints.delete(transaction.id);
    this.txManager.releaseLock(transaction);
  }
}
