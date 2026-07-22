import { BrowserAction, ActionResult } from './types.js';
import { Task } from './task.js';
import pRetry from 'p-retry';
import PQueue from 'p-queue';

export class Scheduler {
  private queue = new PQueue({ concurrency: 1 });

  public async executeTaskWithRetry(
    task: Task,
    actionExecutor: (action: BrowserAction) => Promise<ActionResult>,
    maxRetries: number = 3,
    baseDelayMs: number = 500
  ): Promise<ActionResult> {
    return this.queue.add(async () => {
      task.status = 'RUNNING';
      try {
        const result = await pRetry(
          async () => {
            let lastData = null;
            for (const action of task.actions) {
              const res = await actionExecutor(action);
              if (!res.success) {
                throw new Error(res.error || 'Action failed');
              }
              lastData = res.data;
            }
            return { success: true, data: lastData } as ActionResult;
          },
          {
            retries: maxRetries,
            minTimeout: baseDelayMs,
            factor: 2,
            onFailedAttempt: (error) => {
              // Logging could go here
            }
          }
        );
        task.status = 'COMPLETED';
        return result;
      } catch (error: any) {
        task.status = 'FAILED';
        return { success: false, error: `Task failed after ${maxRetries} attempts. Last error: ${error.message}` };
      }
    });
  }
}
