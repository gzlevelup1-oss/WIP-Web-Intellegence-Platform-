import { TransactionStatus } from './types.js';
import { Task } from './task.js';

export class Transaction {
  public id: string;
  public missionId: string;
  public sessionId: string;
  public role: string;
  public status: TransactionStatus;
  public startTime: number;
  public tasks: Task[] = [];

  constructor(missionId: string, sessionId: string, role: string = 'user') {
    this.id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.missionId = missionId;
    this.sessionId = sessionId;
    this.role = role;
    this.status = 'PENDING';
    this.startTime = Date.now();
  }

  public addTask(task: Task) {
    this.tasks.push(task);
  }

  public activate() {
    if (this.status !== 'PENDING') throw new Error(`Cannot activate transaction in state ${this.status}`);
    this.status = 'ACTIVE';
  }

  public commit() {
    if (this.status !== 'ACTIVE') throw new Error(`Cannot commit transaction in state ${this.status}`);
    this.status = 'COMMITTED';
  }

  public abort() {
    this.status = 'ABORTED';
  }
}

export class TransactionManager {
  private activeTransactions: Map<string, Transaction> = new Map();

  public async acquireLock(missionId: string, sessionId: string, role: string = 'user'): Promise<Transaction> {
    if (this.activeTransactions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already has an active transaction.`);
    }
    const tx = new Transaction(missionId, sessionId, role);
    tx.activate();
    this.activeTransactions.set(sessionId, tx);
    return tx;
  }

  public releaseLock(tx: Transaction) {
    if (this.activeTransactions.get(tx.sessionId)?.id === tx.id) {
      this.activeTransactions.delete(tx.sessionId);
    }
  }
}
