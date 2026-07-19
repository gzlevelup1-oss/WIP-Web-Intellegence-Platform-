import { BrowserAction, ActionResult } from './types.js';

export class Scheduler {
  public async executeWithRetry(
    actionFn: () => Promise<ActionResult>,
    maxRetries: number = 3,
    baseDelayMs: number = 500
  ): Promise<ActionResult> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const result = await actionFn();
        if (result.success) {
          return result;
        }
        throw new Error(result.error || 'Action failed');
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          return { success: false, error: `Failed after ${maxRetries} attempts. Last error: ${error.message}` };
        }
        await this.delay(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
    return { success: false, error: 'Unknown scheduler error' };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
