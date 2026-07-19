import { Page, BrowserContext } from 'playwright';

export interface CheckpointData {
  url: string;
  cookies: any[];
}

export class CheckpointManager {
  public async createCheckpoint(context: BrowserContext, page: Page): Promise<CheckpointData> {
    const url = page.url();
    const cookies = await context.cookies();
    return { url, cookies };
  }

  public async restoreCheckpoint(context: BrowserContext, page: Page, checkpoint: CheckpointData): Promise<void> {
    await context.clearCookies();
    await context.addCookies(checkpoint.cookies);
    // Hard abort implementation
    if (page.url() !== checkpoint.url && checkpoint.url !== 'about:blank') {
      await page.goto(checkpoint.url, { waitUntil: 'networkidle' });
    }
  }
}
