import { TransactionStatus } from './types.js';

export class Transaction {
  public id: string;
  public missionId: string;
  public sessionId: string;
  public status: TransactionStatus;
  public startTime: number;

  constructor(missionId: string, sessionId: string) {
    this.id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.missionId = missionId;
    this.sessionId = sessionId;
    this.status = 'PENDING';
    this.startTime = Date.now();
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

  public async acquireLock(missionId: string, sessionId: string): Promise<Transaction> {
    if (this.activeTransactions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already has an active transaction.`);
    }

    const tx = new Transaction(missionId, sessionId);
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
