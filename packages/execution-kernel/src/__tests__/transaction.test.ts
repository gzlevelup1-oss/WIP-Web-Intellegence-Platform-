import { describe, it, expect } from 'vitest';
import { Transaction, TransactionManager } from '../transaction.js';

describe('Transaction', () => {
  it('should transition states correctly', () => {
    const tx = new Transaction('m1', 's1');
    expect(tx.status).toBe('PENDING');
    
    tx.activate();
    expect(tx.status).toBe('ACTIVE');
    
    tx.commit();
    expect(tx.status).toBe('COMMITTED');
  });

  it('should throw on invalid transitions', () => {
    const tx = new Transaction('m1', 's1');
    expect(() => tx.commit()).toThrow();
  });
});

describe('TransactionManager', () => {
  it('should acquire and release locks per session', async () => {
    const manager = new TransactionManager();
    const tx1 = await manager.acquireLock('m1', 's1');
    expect(tx1.status).toBe('ACTIVE');
    
    await expect(manager.acquireLock('m2', 's1')).rejects.toThrow();
    
    manager.releaseLock(tx1);
    
    const tx2 = await manager.acquireLock('m2', 's1');
    expect(tx2.status).toBe('ACTIVE');
  });
});
