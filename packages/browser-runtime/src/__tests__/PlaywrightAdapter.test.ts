import { describe, it, expect, afterAll } from 'vitest';
import { PlaywrightAdapter } from '../adapters/PlaywrightAdapter.js';

describe('PlaywrightAdapter Integration', () => {
  let adapter: PlaywrightAdapter;
  let sessionId: string;

  it('launches, navigates, and captures', async () => {
    adapter = new PlaywrightAdapter();
    sessionId = await adapter.createSession();
    expect(sessionId).toBeTruthy();

    const html = '<html><body><h1>Hello World</h1><input type="text" id="test-input" /><button id="btn">Click me</button></body></html>';
    await adapter.navigate(sessionId, `data:text/html;base64,${Buffer.from(html).toString('base64')}`);

    const snap = await adapter.capture(sessionId, [0]);
    expect(snap.graph.nodes.length).toBeGreaterThan(0);
    expect(snap.visual).toContain('data:image/png;base64,');
    expect(snap.hash).toBeTruthy();
    expect(snap.metadata).toBeDefined();

    const metadata = await adapter.getMetadata();
    expect(metadata.platform).toBeTruthy();
    expect(metadata.viewport).toBeDefined();
    expect(metadata.userAgent).toBeTruthy();

    // Find the IDs from the graph
    let inputNodeId = '';
    let btnNodeId = '';
    for (const node of snap.graph.nodes) {
      if (node.type === 'DOMNode' && node.properties.tagName === 'input') inputNodeId = node.id;
      if (node.type === 'DOMNode' && node.properties.tagName === 'button') btnNodeId = node.id;
    }
    expect(inputNodeId).toBeTruthy();
    expect(btnNodeId).toBeTruthy();

    // Verify Interactions
    await adapter.type(sessionId, inputNodeId, 'hello wip');
    await adapter.click(sessionId, btnNodeId);
    await adapter.scroll(sessionId, 100);

    // To verify type actually worked, we can pull the value
    const page = (adapter as any).getSessionPage(sessionId);
    const inputValue = await page.locator(`[data-wip-id="${inputNodeId}"]`).inputValue();
    expect(inputValue).toBe('hello wip');

    await adapter.closeSession(sessionId);
  });
});
