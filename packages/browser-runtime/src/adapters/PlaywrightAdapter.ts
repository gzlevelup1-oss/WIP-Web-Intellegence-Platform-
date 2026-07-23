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
  private networkEventHandler?: (sessionId: string, eventName: string, eventData: any) => void;
  private bufferedRequests: Map<string, any[]> = new Map();

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
      this.bufferedRequests.set(sessionId, []);
      
      page.on('request', (request) => {
        const reqData = {
          id: `req-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          timestamp: Date.now()
        };
        this.bufferedRequests.get(sessionId)?.push(reqData);
        if (this.networkEventHandler) {
          this.networkEventHandler(sessionId, 'Event.Network.RequestSent', reqData);
        }
      });
      
      page.on('response', (response) => {
        if (this.networkEventHandler) {
          this.networkEventHandler(sessionId, 'Event.Network.ResponseReceived', {
            url: response.url(),
            status: response.status(),
            timestamp: Date.now()
          });
        }
      });
      return sessionId;
    } catch (err: any) {
      throw new BrowserLaunchError(`Failed to create session context: ${err.message}`);
    }
  }

  public async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.bufferedRequests.delete(sessionId);
      await session.page.close().catch(() => {});
      await session.context.close().catch(() => {});
    }
  }

  public onNetworkEvent(handler: (sessionId: string, eventName: string, eventData: any) => void): void {
    this.networkEventHandler = handler;
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
      
            const graphResult: { snapshot: any, nodes: any[], edges: any[] } = {
        snapshot: { id: snapshotId, timestamp: Date.now(), url },
        nodes: [],
        edges: []
      };

      graphResult.nodes.push({
        id: snapshotId,
        type: 'SnapshotNode',
        properties: { url, viewportWidth: page.viewportSize()?.width || 0, viewportHeight: page.viewportSize()?.height || 0 }
      });

      const traverseFrame = async (frame: import('playwright').Frame, parentIframeWipId: string | null, offsetX: number, offsetY: number) => {
        try {
          const frameGraph = await frame.evaluate(
            `(${evaluateSnapshot})({ snapshotId: "${snapshotId}", url: "${frame.url()}", levels: ${JSON.stringify(levels)} })`
          ) as any;
          
          let rootNodeId = null;
          
          // filter out the SnapshotNode and BELONGS_TO edges to it, since we already have one
          for (const node of frameGraph.nodes) {
            if (node.type === 'SnapshotNode') continue;
            
            if (node.type === 'DOMNode' && node.properties.tagName === 'html') {
              rootNodeId = node.id;
            }
            
            if (node.type === 'GeometryNode') {
              node.properties.x += offsetX;
              node.properties.y += offsetY;
              if (node.properties.top !== undefined) node.properties.top += offsetY;
              if (node.properties.bottom !== undefined) node.properties.bottom += offsetY;
              if (node.properties.left !== undefined) node.properties.left += offsetX;
              if (node.properties.right !== undefined) node.properties.right += offsetX;
            }
            graphResult.nodes.push(node);
          }
          
          for (const edge of frameGraph.edges) {
            graphResult.edges.push(edge);
          }
          
          if (parentIframeWipId && rootNodeId) {
            graphResult.edges.push({ source: parentIframeWipId, target: rootNodeId, type: 'CONTAINS_IFRAME' });
          }
          
          const childFrames = frame.childFrames();
          for (const child of childFrames) {
            let childOffsetX = offsetX;
            let childOffsetY = offsetY;
            let iframeWipId = null;
            try {
              const frameElement = await child.frameElement();
              if (frameElement) {
                const box = await frameElement.boundingBox();
                if (box) {
                  childOffsetX += box.x;
                  childOffsetY += box.y;
                }
                iframeWipId = await frameElement.getAttribute('data-wip-id');
              }
            } catch(e) {}
            await traverseFrame(child, iframeWipId, childOffsetX, childOffsetY);
          }
        } catch (e) {
          // Frame might be detached or inaccessible
        }
      };

      await traverseFrame(page.mainFrame(), null, 0, 0);

      
      // Inject NetworkRequestNodes
      const requests = this.bufferedRequests.get(sessionId) || [];
      requests.forEach((req) => {
        const reqNodeId = 'network-' + Date.now() + '-' + Math.random().toString(36).substring(2,7);
        graphResult.nodes.push({
          id: reqNodeId,
          type: 'NetworkRequestNode',
          properties: {
            url: req.url,
            method: req.method,
            resourceType: req.resourceType
          }
        });
        graphResult.edges.push({ source: snapshotId, target: reqNodeId, type: 'HAS_NETWORK_REQUEST' });
      });
      // Clear buffer after capture
      this.bufferedRequests.set(sessionId, []);

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
    
    const historyIndex = await session.page.evaluate(() => window.history.length).catch(() => 0);
    const domState = await session.page.evaluate(() => {
      return {
        html: document.documentElement.innerHTML,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
    }).catch(() => ({ html: undefined, scrollX: 0, scrollY: 0 }));
    
    return { 
      checkpointId: `cp-${Date.now()}`, 
      sessionId, 
      timestamp: Date.now(), 
      url, 
      cookies: state.cookies, 
      origins: state.origins, 
      historyIndex,
      domHtml: domState.html,
      scrollX: domState.scrollX,
      scrollY: domState.scrollY
    };
  }

  public async restoreCheckpoint(sessionId: string, checkpoint: any, options?: { soft?: boolean }): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (!options?.soft) {
      await session.context.clearCookies();
      if (checkpoint.cookies && checkpoint.cookies.length > 0) {
        await session.context.addCookies(checkpoint.cookies);
      }
    }
    
    if (checkpoint.historyIndex !== undefined) {
      const currentHistoryIndex = await session.page.evaluate(() => window.history.length).catch(() => 0);
      const delta = checkpoint.historyIndex - currentHistoryIndex;
      if (delta !== 0) {
        await session.page.evaluate((d) => window.history.go(d), delta).catch(() => {});
        await session.page.waitForLoadState('networkidle').catch(() => {});
      }
    }
    
    if (session.page.url() !== checkpoint.url && checkpoint.url !== 'about:blank') {
      await session.page.goto(checkpoint.url, { waitUntil: 'networkidle' });
    }
    
    if (!options?.soft && checkpoint.origins) {
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
    } else if (!options?.soft && checkpoint.localStorage) {
      // Backwards compatibility
      await session.page.evaluate((ls) => {
        window.localStorage.clear();
        for (const [key, value] of Object.entries(ls)) {
          window.localStorage.setItem(key, value as string);
        }
      }, checkpoint.localStorage).catch(() => {});
    }
    
    if (checkpoint.domHtml !== undefined) {
      await session.page.evaluate(({ html, sx, sy }) => {
        document.documentElement.innerHTML = html;
        window.scrollTo(sx, sy);
      }, { html: checkpoint.domHtml, sx: checkpoint.scrollX || 0, sy: checkpoint.scrollY || 0 }).catch(() => {});
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
