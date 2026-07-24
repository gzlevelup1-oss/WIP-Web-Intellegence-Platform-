import { EventEmitter } from 'events';
import { BrowserAction, ActionResult } from './types.js';
import { Transaction, TransactionManager, IsolationLevel } from './transaction.js';
import { Scheduler } from './scheduler.js';
import { CheckpointData, ICheckpointAdapter } from './checkpoint.js';
import { Task } from './task.js';
import { ICapabilityAdapter } from './capabilities.js';

export interface ExecutionKernelOptions {
  checkpointAdapter?: ICheckpointAdapter;
  capabilityAdapter?: ICapabilityAdapter;
}

export class UnsupportedCapabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedCapabilityError';
  }
}

export class ExecutionKernel extends EventEmitter {
  private txManager = new TransactionManager();
  private scheduler = new Scheduler();
  private activeCheckpoints: Map<string, CheckpointData> = new Map();
  private checkpointAdapter?: ICheckpointAdapter;
  private capabilityAdapter?: ICapabilityAdapter;
  
  constructor(options?: ExecutionKernelOptions | ICheckpointAdapter) {
    super();
    // Maintain backwards compatibility for older tests
    if (options && 'createCheckpoint' in options) {
      this.checkpointAdapter = options as ICheckpointAdapter;
    } else if (options) {
      const opts = options as ExecutionKernelOptions;
      this.checkpointAdapter = opts.checkpointAdapter;
      this.capabilityAdapter = opts.capabilityAdapter;
    }
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
      if (action.type === 'navigate' && role !== 'admin') {
        return false;
      }
    }
    return true;
  }

  private mapActionToCapability(actionType: string): string {
    switch (actionType) {
      case 'navigate': return 'Navigation';
      case 'click':
      case 'type':
      case 'scroll': return 'Interaction';
      case 'snapshot': return 'Observation';
      case 'evaluate': return 'ScriptExecution';
      default: return actionType;
    }
  }

  public async executeTask(transaction: Transaction, task: Task, actionExecutor: (action: BrowserAction) => Promise<ActionResult>): Promise<ActionResult> {
    if (transaction.status !== 'ACTIVE') {
      return { success: false, error: 'Transaction is not active' };
    }
    
    if (!this.evaluatePolicy(transaction, task)) {
      return { success: false, error: `RBAC Policy Violation: Transaction role '${transaction.role}' cannot execute one or more actions in the task.` };
    }

    // Capability Validation
    if (this.capabilityAdapter) {
      try {
        const capabilitiesMap = await this.capabilityAdapter.getCapabilities(transaction.sessionId);
        for (const action of task.actions) {
          const requiredCap = this.mapActionToCapability(action.type);
          if (!capabilitiesMap[requiredCap]) {
            throw new UnsupportedCapabilityError(`Runtime does not support required capability: ${requiredCap} for action ${action.type}`);
          }
        }
      } catch (err: any) {
        if (err instanceof UnsupportedCapabilityError) {
          return { success: false, error: err.message };
        }
        return { success: false, error: `Failed to validate capabilities: ${err.message}` };
      }
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
        const isSoft = soft || transaction.isolationLevel === 'Shared';
        await this.checkpointAdapter.restoreCheckpoint(transaction.sessionId, checkpoint, { soft: isSoft });
      }
    }
    
    transaction.abort();
    this.activeCheckpoints.delete(transaction.id);
    this.txManager.releaseLock(transaction);
  }
}
