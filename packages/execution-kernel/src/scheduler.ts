import { BrowserAction, ActionResult } from './types.js';
import { Task } from './task.js';

export class Scheduler {
  public async executeTaskWithRetry(
    task: Task,
    actionExecutor: (action: BrowserAction) => Promise<ActionResult>,
    maxRetries: number = 3,
    baseDelayMs: number = 500
  ): Promise<ActionResult> {
    let attempt = 0;
    while (attempt < maxRetries) {
      task.status = 'RUNNING';
      let taskSuccess = true;
      let lastError = '';
      let lastData = null;

      for (const action of task.actions) {
        try {
          const result = await actionExecutor(action);
          if (!result.success) {
            taskSuccess = false;
            lastError = result.error || 'Action failed';
            break;
          }
          lastData = result.data;
        } catch (error: any) {
          taskSuccess = false;
          lastError = error.message;
          break;
        }
      }

      if (taskSuccess) {
        task.status = 'COMPLETED';
        return { success: true, data: lastData };
      }

      attempt++;
      if (attempt >= maxRetries) {
        task.status = 'FAILED';
        return { success: false, error: `Task failed after ${maxRetries} attempts. Last error: ${lastError}` };
      }
      
      // Rollback or Reset could go here, but for now we just delay and retry the whole task
      await this.delay(baseDelayMs * Math.pow(2, attempt - 1));
    }
    task.status = 'FAILED';
    return { success: false, error: 'Unknown scheduler error' };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
