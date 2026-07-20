import fs from 'fs';

let content = fs.readFileSync('apps/browser-lab/server.ts', 'utf-8');

const additionalRoutes = `
  app.get('/api/simulator/metadata', async (req, res) => {
    try {
      const metadata = await browserRuntime.getMetadata();
      const capabilities = await browserRuntime.getCapabilities();
      res.json({ success: true, metadata, capabilities });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/simulator/click', async (req, res) => {
    try {
      const { sessionId, nodeId, modifiers } = req.body;
      if (!sessionId || !nodeId) return res.status(400).json({ error: 'sessionId and nodeId are required' });
      await browserRuntime.click(sessionId, nodeId, modifiers);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/simulator/type', async (req, res) => {
    try {
      const { sessionId, nodeId, text, delay } = req.body;
      if (!sessionId || !nodeId || !text) return res.status(400).json({ error: 'sessionId, nodeId, and text are required' });
      await browserRuntime.type(sessionId, nodeId, text, delay);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/simulator/scroll', async (req, res) => {
    try {
      const { sessionId, distanceY, behavior } = req.body;
      if (!sessionId || distanceY === undefined) return res.status(400).json({ error: 'sessionId and distanceY are required' });
      await browserRuntime.scroll(sessionId, distanceY, behavior);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/simulator/command'`;

content = content.replace("app.post('/api/simulator/command'", additionalRoutes);

// Fix the IExecutionKernelAdapter mock implementation to use browserRuntime
content = content.replace(
  `        click: async (nodeId: string) => {
          return { status: 'mock_clicked', nodeId };
        },
        type: async (nodeId: string, text: string) => {
          return { status: 'mock_typed', nodeId, text };
        },`,
  `        click: async (nodeId: string) => {
          await browserRuntime.click(sessionId, nodeId);
          return { status: 'clicked', nodeId };
        },
        type: async (nodeId: string, text: string) => {
          await browserRuntime.type(sessionId, nodeId, text);
          return { status: 'typed', nodeId, text };
        },`
);

content = content.replace(
  `        goto: async (url: string) => {
          return { status: 'mock_navigated', url };
        }`,
  `        goto: async (url: string) => {
          await browserRuntime.navigate(sessionId, url);
          return { status: 'navigated', url };
        }`
);

content = content.replace(
  `        captureObservation: async () => {
          return { status: 'mock_captured', snapshotId: 'snap-123' };
        },`,
  `        captureObservation: async () => {
          const snapshot = await browserRuntime.capture(sessionId, [1]);
          await observationStore.saveSnapshot(snapshot.snapshotId, snapshot.graph as any);
          return { status: 'captured', snapshotId: snapshot.snapshotId };
        },`
);

fs.writeFileSync('apps/browser-lab/server.ts', content);
console.log('patched');
