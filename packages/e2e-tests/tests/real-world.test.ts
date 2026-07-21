import { test, expect } from '@playwright/test';
import { BrowserRuntime, PlaywrightAdapter } from '@wip/browser-runtime';
import { ExecutionKernel, Task } from '@wip/execution-kernel';
import path from 'path';

test.describe('Real-World Fixtures E2E', () => {
    let runtime: BrowserRuntime;
    let kernel: ExecutionKernel;
    let sessionId: string;

    test.beforeAll(async () => {
        const adapter = new PlaywrightAdapter();
        runtime = new BrowserRuntime(adapter);
        kernel = new ExecutionKernel(runtime as any);
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

            // Extract Baseline Graph
            const baselineSnapshot = await runtime.capture(sessionId, [0]); // 0 for DOM
            expect(baselineSnapshot.graph.nodes.length).toBeGreaterThan(0);
            
            console.log(`[${fixture}] Extracted ${baselineSnapshot.graph.nodes.length} nodes from observation graph.`);

            await kernel.commitTransaction(tx);
        });
    }
});
