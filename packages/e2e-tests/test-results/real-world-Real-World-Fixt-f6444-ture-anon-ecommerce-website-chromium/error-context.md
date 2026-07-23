# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: real-world.test.ts >> Real-World Fixtures E2E >> should successfully observe real-world fixture: anon-ecommerce-website
- Location: tests/real-world.test.ts:46:9

# Error details

```
BrowserLaunchError: Failed to launch browser: browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```

# Test source

```ts
  1   | import { chromium } from 'playwright';
  2   | import { BrowserLaunchError, SessionNotFoundError, NavigationTimeoutError, BrowserExecutionError } from '../runtime/errors.js';
  3   | import { evaluateSnapshot } from './browser-script.js';
  4   | export class PlaywrightAdapter {
  5   |     browser = null;
  6   |     sessions = new Map();
  7   |     onBrowserCrash;
  8   |     async getMetadata() {
  9   |         return {
  10  |             name: 'Playwright',
  11  |             version: '1.61.1',
  12  |             backend: 'chromium',
  13  |             platform: process.platform,
  14  |             viewport: { width: 1280, height: 720 },
  15  |             locale: 'en-US',
  16  |             timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  17  |             userAgent: 'Playwright/Chromium'
  18  |         };
  19  |     }
  20  |     async getCapabilities() {
  21  |         return {
  22  |             canClick: true,
  23  |             canType: true,
  24  |             canScroll: true,
  25  |             canCapture: true
  26  |         };
  27  |     }
  28  |     async ensureBrowser() {
  29  |         if (!this.browser) {
  30  |             try {
  31  |                 this.browser = await chromium.launch({
  32  |                     headless: true,
  33  |                     args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  34  |                 });
  35  |                 this.browser.on('disconnected', () => {
  36  |                     this.browser = null;
  37  |                     if (this.onBrowserCrash)
  38  |                         this.onBrowserCrash();
  39  |                 });
  40  |             }
  41  |             catch (err) {
> 42  |                 throw new BrowserLaunchError(`Failed to launch browser: ${err.message}`);
      |                       ^ BrowserLaunchError: Failed to launch browser: browserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
  43  |             }
  44  |         }
  45  |         return this.browser;
  46  |     }
  47  |     async createSession() {
  48  |         const browser = await this.ensureBrowser();
  49  |         const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  50  |         try {
  51  |             const context = await browser.newContext();
  52  |             const page = await context.newPage();
  53  |             this.sessions.set(sessionId, { context, page });
  54  |             return sessionId;
  55  |         }
  56  |         catch (err) {
  57  |             throw new BrowserLaunchError(`Failed to create session context: ${err.message}`);
  58  |         }
  59  |     }
  60  |     async closeSession(sessionId) {
  61  |         const session = this.sessions.get(sessionId);
  62  |         if (session) {
  63  |             this.sessions.delete(sessionId);
  64  |             await session.page.close().catch(() => { });
  65  |             await session.context.close().catch(() => { });
  66  |         }
  67  |     }
  68  |     setCrashHandler(handler) {
  69  |         this.onBrowserCrash = handler;
  70  |     }
  71  |     getSessionPage(sessionId) {
  72  |         const session = this.sessions.get(sessionId);
  73  |         if (!session) {
  74  |             throw new SessionNotFoundError(`Session ${sessionId} not found in PlaywrightAdapter.`);
  75  |         }
  76  |         return session.page;
  77  |     }
  78  |     async navigate(sessionId, url) {
  79  |         const page = this.getSessionPage(sessionId);
  80  |         try {
  81  |             await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  82  |         }
  83  |         catch (err) {
  84  |             if (err.message.includes('timeout')) {
  85  |                 throw new NavigationTimeoutError(`Timeout navigating to ${url}`);
  86  |             }
  87  |             throw new BrowserExecutionError(`Failed to navigate: ${err.message}`);
  88  |         }
  89  |     }
  90  |     async capture(sessionId, levels) {
  91  |         const page = this.getSessionPage(sessionId);
  92  |         try {
  93  |             const snapshotId = `snap-${Date.now()}`;
  94  |             const url = page.url();
  95  |             const graphResult = {
  96  |                 snapshot: { id: snapshotId, timestamp: Date.now(), url },
  97  |                 nodes: [],
  98  |                 edges: []
  99  |             };
  100 |             graphResult.nodes.push({
  101 |                 id: snapshotId,
  102 |                 type: 'SnapshotNode',
  103 |                 properties: { url, viewportWidth: page.viewportSize()?.width || 0, viewportHeight: page.viewportSize()?.height || 0 }
  104 |             });
  105 |             const traverseFrame = async (frame, parentIframeWipId, offsetX, offsetY) => {
  106 |                 try {
  107 |                     const frameGraph = await frame.evaluate(`(${evaluateSnapshot})({ snapshotId: "${snapshotId}", url: "${frame.url()}", levels: ${JSON.stringify(levels)} })`);
  108 |                     let rootNodeId = null;
  109 |                     // filter out the SnapshotNode and BELONGS_TO edges to it, since we already have one
  110 |                     for (const node of frameGraph.nodes) {
  111 |                         if (node.type === 'SnapshotNode')
  112 |                             continue;
  113 |                         if (node.type === 'DOMNode' && node.properties.tagName === 'html') {
  114 |                             rootNodeId = node.id;
  115 |                         }
  116 |                         if (node.type === 'GeometryNode') {
  117 |                             node.properties.x += offsetX;
  118 |                             node.properties.y += offsetY;
  119 |                             if (node.properties.top !== undefined)
  120 |                                 node.properties.top += offsetY;
  121 |                             if (node.properties.bottom !== undefined)
  122 |                                 node.properties.bottom += offsetY;
  123 |                             if (node.properties.left !== undefined)
  124 |                                 node.properties.left += offsetX;
  125 |                             if (node.properties.right !== undefined)
  126 |                                 node.properties.right += offsetX;
  127 |                         }
  128 |                         graphResult.nodes.push(node);
  129 |                     }
  130 |                     for (const edge of frameGraph.edges) {
  131 |                         graphResult.edges.push(edge);
  132 |                     }
  133 |                     if (parentIframeWipId && rootNodeId) {
  134 |                         graphResult.edges.push({ source: parentIframeWipId, target: rootNodeId, type: 'CONTAINS_IFRAME' });
  135 |                     }
  136 |                     const childFrames = frame.childFrames();
  137 |                     for (const child of childFrames) {
  138 |                         let childOffsetX = offsetX;
  139 |                         let childOffsetY = offsetY;
  140 |                         let iframeWipId = null;
  141 |                         try {
  142 |                             const frameElement = await child.frameElement();
```