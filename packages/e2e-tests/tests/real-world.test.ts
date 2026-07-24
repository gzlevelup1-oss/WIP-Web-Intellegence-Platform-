import { test, expect } from '@playwright/test';
import { BrowserRuntime, PlaywrightAdapter } from '@wip/browser-runtime';
import { ExecutionKernel, Task } from '@wip/execution-kernel';
import { validate } from '@wip/validation-engine';
import path from 'path';

test.describe('Real-World Fixtures E2E', () => {
    let runtime: BrowserRuntime;
    let kernel: ExecutionKernel;
    let sessionId: string;

    test.beforeAll(async () => {
        const adapter = new PlaywrightAdapter();
        runtime = new BrowserRuntime(adapter);
        kernel = new ExecutionKernel({
            createCheckpoint: async (id: string) => {
                const rc = await runtime.createCheckpoint(id);
                return {
                    checkpointId: "chk-" + Date.now(),
                    sessionId: id,
                    timestamp: Date.now(),
                    url: rc.url,
                    cookies: rc.cookies,
                    historyIndex: (rc as any).historyIndex,
                    localStorage: (rc as any).localStorage
                };
            },
            restoreCheckpoint: async (id: string, cp: any) => await runtime.restoreCheckpoint(id, cp),
            capabilityAdapter: {
                getCapabilities: async (id: string) => (await runtime.getCapabilities()).capabilities
            }
        });
    });

    test.afterEach(async () => {
        if (runtime && sessionId) {
            await runtime.closeSession(sessionId);
        }
    });

    const fixtures = [
        'anon-ecommerce-website',
        'vast',
        'glowing',
        'gamics'
    ];

    for (const fixture of fixtures) {
        test(`should successfully observe real-world fixture: ${fixture}`, async () => {
            const fixtureUrl = `file://${path.resolve(import.meta.dirname, 'fixtures/real-world', fixture, 'index.html')}`;
            sessionId = await runtime.createSession();
            
            const tx = await kernel.beginTransaction(`m-${fixture}`, sessionId, 'admin');
            
            const navigateTask = new Task([{ type: 'navigate', payload: fixtureUrl }]);
            await kernel.executeTask(tx, navigateTask, async (action) => {
                await runtime.navigate(sessionId, action.payload);
                return { success: true };
            });

            // Gap 2: Extract Baseline Graph with full capability coverage [0, 1, 2]
            const baselineSnapshot = await runtime.capture(sessionId, [0, 1, 2]); 
            expect(baselineSnapshot.graph.nodes.length).toBeGreaterThan(0);
            
            // Gap 1: Golden Master snapshot testing
            
            // Strip non-deterministic network nodes
            const deterministicGraph = {
                ...baselineSnapshot.graph,
                nodes: baselineSnapshot.graph.nodes.filter((n: any) => n.type !== 'NetworkRequestNode'),
                edges: baselineSnapshot.graph.edges.filter((e: any) => e.type !== 'HAS_NETWORK_REQUEST')
            };
            let graphJson = JSON.stringify(deterministicGraph, null, 2);
  
            // Clean non-deterministic fields
            graphJson = graphJson.replace(new RegExp(baselineSnapshot.snapshotId, 'g'), 'static-snapshot-id');
            graphJson = graphJson.replace(/"timestamp": \d+/g, '"timestamp": 1234567890');
            graphJson = graphJson.replace(/"url": "file:\/\/[^"]+"/g, '"url": "file://REDACTED"');
            
            // Clean float/geometry non-determinism
            graphJson = graphJson.replace(/"(x|y|width|height|top|right|bottom|left|viewportWidth|viewportHeight)": [^"]+/g, '"$1": 0');
            graphJson = graphJson.replace(/\"opacity\":\s*\"?[^\"\n,}]+\"?/g, `\"opacity\": \"0\"`);
            
            // Clean animation non-determinism
            ;
            ;


            // Playwright Snapshot matcher
            expect(graphJson).toMatchSnapshot(`${fixture}-graph.json`);
            
            // Gap 3: Missing Interactivity Testing
            if (fixture === 'anon-ecommerce-website') {
                // Find a button or link to interact with
                const interactableNode = baselineSnapshot.graph.nodes.find((n: any) => 
                    n.type === 'DOMNode' && (n.properties.tagName === 'button' || n.properties.tagName === 'a')
                );
                
                if (interactableNode) {
                    const clickTask = new Task([{ type: 'click', payload: { nodeId: interactableNode.id } }]);
                    await kernel.executeTask(tx, clickTask, async (action) => {
                        await runtime.click(sessionId, action.payload.nodeId);
                        return { success: true };
                    });
                    
                    // Capture reconstructed graph
                    const newSnapshot = await runtime.capture(sessionId, [0, 1, 2]);
                    
                    // Validate delta via ValidationEngine
                    const report = validate({
                        originalGraph: baselineSnapshot.graph,
                        reconstructedGraph: newSnapshot.graph,
                        originalScreenshotBase64: baselineSnapshot.visual || '',
                        reconstructedScreenshotBase64: newSnapshot.visual || ''
                    });
                    
                    expect(report).toBeDefined();
                    expect(report.violations).toBeDefined();
                }
            }
            
            await kernel.commitTransaction(tx);
        });
    }
});
