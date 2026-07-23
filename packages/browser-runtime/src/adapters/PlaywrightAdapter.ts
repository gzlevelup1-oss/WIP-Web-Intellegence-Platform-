import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { IBrowserAdapter } from '../contracts/IBrowserAdapter.js';
import { RuntimeMetadata, RuntimeCapabilities, ObservationSnapshot, RuntimeCheckpoint } from '../contracts/types.js';
import { BrowserLaunchError, SessionNotFoundError, NavigationTimeoutError, BrowserExecutionError } from '../runtime/errors.js';
import { evaluateSnapshot } from './browser-script.js';

interface PlaywrightSession {
  context: BrowserContext;
  page: Page;
}

export class PlaywrightAdapter implements IBrowserAdapter {
  private browser: Browser | null = null;
  private sessions: Map<string, PlaywrightSession> = new Map();
  private onBrowserCrash?: () => void;

  public async getMetadata(): Promise<RuntimeMetadata> {
    return {
      name: 'Playwright',
      version: '1.61.1',
      backend: 'chromium',
      platform: process.platform,
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: 'Playwright/Chromium'
    };
  }

  public async getCapabilities(): Promise<RuntimeCapabilities> {
    return {
      canClick: true,
      canType: true,
      canScroll: true,
      canCapture: true
    };
  }

  private async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      try {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        this.browser.on('disconnected', () => {
          this.browser = null;
          if (this.onBrowserCrash) this.onBrowserCrash();
        });
      } catch (err: any) {
        throw new BrowserLaunchError(`Failed to launch browser: ${err.message}`);
      }
    }
    return this.browser;
  }

  public async createSession(): Promise<string> {
    const browser = await this.ensureBrowser();
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      this.sessions.set(sessionId, { context, page });
      return sessionId;
    } catch (err: any) {
      throw new BrowserLaunchError(`Failed to create session context: ${err.message}`);
    }
  }

  public async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      await session.page.close().catch(() => {});
      await session.context.close().catch(() => {});
    }
  }

  public setCrashHandler(handler: () => void): void {
    this.onBrowserCrash = handler;
  }

  private getSessionPage(sessionId: string): Page {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new SessionNotFoundError(`Session ${sessionId} not found in PlaywrightAdapter.`);
    }
    return session.page;
  }

  public async navigate(sessionId: string, url: string): Promise<void> {
    const page = this.getSessionPage(sessionId);
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    } catch (err: any) {
      if (err.message.includes('timeout')) {
        throw new NavigationTimeoutError(`Timeout navigating to ${url}`);
      }
      throw new BrowserExecutionError(`Failed to navigate: ${err.message}`);
    }
  }

  public async capture(sessionId: string, levels: (number | string)[]): Promise<ObservationSnapshot> {
    const page = this.getSessionPage(sessionId);
    try {
      const snapshotId = `snap-${Date.now()}`;
      const url = page.url();
      
      const graphResult = await page.evaluate(
        `(${evaluateSnapshot})({ snapshotId: "${snapshotId}", url: "${url}", levels: ${JSON.stringify(levels)} })`
      );

      const screenshotBuffer = await page.screenshot({ type: 'png' });
      const visual = 'data:image/png;base64,' + screenshotBuffer.toString('base64');

      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(JSON.stringify(graphResult)).digest('hex');

      return {
        snapshotId,
        url,
        timestamp: Date.now(),
        graph: graphResult,
        visual,
        hash,
        metadata: {
          levels,
          capturedAt: new Date().toISOString()
        }
      };
    } catch (err: any) {
      throw new BrowserExecutionError(`Failed to capture snapshot: ${err.message}`);
    }
  }

  public async click(sessionId: string, nodeId: string, modifiers?: string[]): Promise<void> {
    const page = this.getSessionPage(sessionId);
    try {
      const locator = page.locator(`[data-wip-id="${nodeId}"]`).first();
      await locator.click({ modifiers: modifiers as Array<"Alt" | "Control" | "Meta" | "Shift"> | undefined, force: true, timeout: 5000 });
    } catch (err: any) {
      throw new BrowserExecutionError(`Click failed: ${err.message}`);
    }
  }

  public async type(sessionId: string, nodeId: string, text: string, delay?: number): Promise<void> {
    const page = this.getSessionPage(sessionId);
    try {
      const locator = page.locator(`[data-wip-id="${nodeId}"]`).first();
      await locator.pressSequentially(text, { delay, timeout: 5000 });
    } catch (err: any) {
      throw new BrowserExecutionError(`Type failed: ${err.message}`);
    }
  }

  
  public async createCheckpoint(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const url = session.page.url();
    const state = await session.context.storageState();
    
    return { checkpointId: `cp-${Date.now()}`, sessionId, timestamp: Date.now(), url, cookies: state.cookies, origins: state.origins, historyIndex: 0 };
  }

  public async restoreCheckpoint(sessionId: string, checkpoint: any): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    await session.context.clearCookies();
    if (checkpoint.cookies && checkpoint.cookies.length > 0) {
      await session.context.addCookies(checkpoint.cookies);
    }
    
    if (session.page.url() !== checkpoint.url && checkpoint.url !== 'about:blank') {
      await session.page.goto(checkpoint.url, { waitUntil: 'networkidle' });
    }
    
    if (checkpoint.origins) {
      try {
        const currentOrigin = new URL(session.page.url()).origin;
        const originState = checkpoint.origins.find((o: any) => o.origin === currentOrigin);
        if (originState && originState.localStorage) {
          await session.page.evaluate((lsArray) => {
            window.localStorage.clear();
            for (const item of lsArray) {
              window.localStorage.setItem(item.name, item.value);
            }
          }, originState.localStorage).catch(() => {});
        }
      } catch (err) {
        // ignore invalid URL errors
      }
    } else if (checkpoint.localStorage) {
      // Backwards compatibility
      await session.page.evaluate((ls) => {
        window.localStorage.clear();
        for (const [key, value] of Object.entries(ls)) {
          window.localStorage.setItem(key, value as string);
        }
      }, checkpoint.localStorage).catch(() => {});
    }
  }

  public async scroll(sessionId: string, distanceY: number, behavior?: string): Promise<void> {
    const page = this.getSessionPage(sessionId);
    try {
      await page.mouse.wheel(0, distanceY);
    } catch (err: any) {
      throw new BrowserExecutionError(`Scroll failed: ${err.message}`);
    }
  }

  }
