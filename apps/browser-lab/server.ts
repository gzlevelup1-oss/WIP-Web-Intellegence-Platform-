import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ExecutionKernel, Task, BrowserAction } from '@wip/execution-kernel';
import { DesignTokenExtractor, ComponentMiner, LayoutAnalyzer } from '@wip/workers';
import { CoordinatorAgent, IExecutionKernelAdapter, IWorkerAdapter } from '@wip/coordinator';
import { MemoryObservationStore } from '@wip/observation-store';
import { BrowserRuntime, PlaywrightAdapter } from '@wip/browser-runtime';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browserAdapter = new PlaywrightAdapter();
const browserRuntime = new BrowserRuntime(browserAdapter);

const kernel = new ExecutionKernel({
  createCheckpoint: async (sessionId: string) => {
    return await browserRuntime.createCheckpoint(sessionId);
  },
  restoreCheckpoint: async (sessionId: string, checkpoint: any) => {
    await browserRuntime.restoreCheckpoint(sessionId, checkpoint);
  }
});
const tokenExtractor = new DesignTokenExtractor();
const componentMiner = new ComponentMiner();
const layoutAnalyzer = new LayoutAnalyzer();
const observationStore = new MemoryObservationStore();

async function createServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(express.json({ limit: '50mb' }));

  // API Route: Simulator Snapshot
  app.post('/api/simulator/snapshot', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      const logs = [`Navigating to ${url}...`];

      const sessionId = await browserRuntime.createSession();
      // Decoupled Kernel using ICheckpointAdapter

      const transaction = await kernel.beginTransaction('M-011', sessionId, 'admin');
      
      const result = await kernel.executeTask(transaction, new Task([{ type: 'evaluate' }]), async () => {
        try {
          await browserRuntime.navigate(sessionId, url);
          logs.push('Page loaded successfully via Kernel.');

          const captureResult = await browserRuntime.capture(sessionId, []);
          
          logs.push(`Snapshot extracted. Found ${captureResult.graph.nodes.length} nodes and ${captureResult.graph.edges.length} edges.`);
          
          await observationStore.saveSnapshot(captureResult.snapshotId, captureResult.graph as any);
          
          return {
            success: true,
            data: { graph: captureResult.graph, screenshotUrl: captureResult.visual }
          };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      });

      if (!result.success) {
        await kernel.abortTransaction(transaction, true);
        await browserRuntime.closeSession(sessionId);
        
        let status = 500;
        if (result.error.includes('Timeout navigating')) status = 504;
        else if (result.error.includes('Session not found')) status = 404;
        else if (result.error.includes('Failed to capture')) status = 400;

        return res.status(status).json({ error: result.error });
      }

      await kernel.commitTransaction(transaction);
      await browserRuntime.closeSession(sessionId);

      res.json({
        success: true,
        graph: result.data.graph,
        logs,
        screenshotUrl: result.data.screenshotUrl
      });
    } catch (e: any) {
      let status = 500;
      if (e.name === 'BrowserLaunchError') status = 500;
      res.status(status).json({ error: e.message });
    }
  });

  // API Route: Simulator Command (Gemini Coordinator Sandbox)
  
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

  app.post('/api/simulator/command', async (req, res) => {
    try {
      const { command, snapshotId } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      if (!snapshotId) {
        return res.status(400).json({ error: 'No active session. Navigate to a URL first.' });
      }

      const graph = await observationStore.getSnapshot(snapshotId);
      if (!graph) {
        return res.status(404).json({ error: 'Observation graph not found in store for this session' });
      }

      const logs = [`Executing command using Coordinator Sandbox...`];
      
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });
      
      const simplifiedGraph = graph.nodes.map((n: any) => ({
        id: n.id, type: n.type, properties: { tagName: n.properties?.tagName, text: n.properties?.text?.substring(0, 50) }
      })).slice(0, 300);

      const prompt = `
        You are the Coordinator Sandbox AI agent.
        You have been given a command: "${command}"
        
        Here is a partial snapshot of the Observation Graph (flattened DOM nodes):
        ${JSON.stringify(simplifiedGraph, null, 2)}
        
        Provide a short response indicating what action you would take on this graph, or answer the user's question about the UI structure. Keep it under 2 sentences.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const responseText = response.text || 'No response from model.';
      
      // Proxied Request via Execution Kernel
      const sessionId = await browserRuntime.createSession();
      // Decoupled from Playwright

      const transaction = await kernel.beginTransaction('M-011', sessionId, 'admin');
      
      const actionResult = await kernel.executeTask(transaction, new Task([{ type: 'evaluate' }]), async () => {
        return { success: true, data: responseText };
      });
      
      await kernel.commitTransaction(transaction);
      await browserRuntime.closeSession(sessionId);

      logs.push(`Coordinator (via Kernel): ${actionResult.data}`);

      res.json({
        success: true,
        logs,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/workers/tokens', async (req, res) => {
    try {
      const { snapshotId } = req.body;
      if (!snapshotId) return res.status(400).json({ error: 'snapshotId is required' });
      const graph = await observationStore.getSnapshot(snapshotId);
      if (!graph) return res.status(404).json({ error: 'Snapshot not found' });
      const result = tokenExtractor.extract(graph);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/workers/mine', async (req, res) => {
    try {
      const { snapshotId, containerNodeId } = req.body;
      if (!snapshotId || !containerNodeId) return res.status(400).json({ error: 'snapshotId and containerNodeId required' });
      const graph = await observationStore.getSnapshot(snapshotId);
      if (!graph) return res.status(404).json({ error: 'Snapshot not found' });
      const result = componentMiner.mine(graph, containerNodeId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/workers/layout', async (req, res) => {
    try {
      const { snapshotId, containerNodeId } = req.body;
      if (!snapshotId || !containerNodeId) return res.status(400).json({ error: 'snapshotId and containerNodeId required' });
      const graph = await observationStore.getSnapshot(snapshotId);
      if (!graph) return res.status(404).json({ error: 'Snapshot not found' });
      const result = layoutAnalyzer.analyze(graph, containerNodeId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/coordinator/start', async (req, res) => {
    try {
      const { objective, sessionId } = req.body;
      if (!objective) return res.status(400).json({ error: 'Objective required' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
      
      const kernelAdapter: IExecutionKernelAdapter = {
        captureObservation: async (levels?: string[]) => {
          let numericFlags = [1]; // Default to DOM (1)
          if (levels && levels.length > 0) {
            numericFlags = levels.map(l => {
              if (l === 'DOM') return 1;
              if (l === 'A11Y') return 2;
              return 1;
            });
          }
          const snapshot = await browserRuntime.capture(sessionId, numericFlags);
          await observationStore.saveSnapshot(snapshot.snapshotId, snapshot.graph as any);
          return { status: 'captured', snapshotId: snapshot.snapshotId };
        },
        click: async (nodeId: string) => {
          await browserRuntime.click(sessionId, nodeId);
          return { status: 'clicked', nodeId };
        },
        type: async (nodeId: string, text: string) => {
          await browserRuntime.type(sessionId, nodeId, text);
          return { status: 'typed', nodeId, text };
        },
        goto: async (url: string) => {
          await browserRuntime.navigate(sessionId, url);
          return { status: 'navigated', url };
        }
      };

      const workerAdapter: IWorkerAdapter = {
        extractDesignTokens: async (snapshotId: string) => {
           const graph = await observationStore.getSnapshot(snapshotId);
           if (!graph) throw new Error('Snapshot not found');
           return tokenExtractor.extract(graph);
        },
        mineComponents: async (snapshotId: string, containerNodeId: string) => {
           const graph = await observationStore.getSnapshot(snapshotId);
           if (!graph) throw new Error('Snapshot not found');
           return componentMiner.mine(graph, containerNodeId);
        },
        analyzeLayout: async (snapshotId: string, containerNodeId: string) => {
           const graph = await observationStore.getSnapshot(snapshotId);
           if (!graph) throw new Error('Snapshot not found');
           return layoutAnalyzer.analyze(graph, containerNodeId);
        }
      };

      const agent = new CoordinatorAgent(process.env.GEMINI_API_KEY, kernelAdapter, workerAdapter);
      const result = await agent.start(objective);
      
      res.json({ success: true, result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/validation/evaluate', async (req, res) => {
    try {
      const { validate } = await import('@wip/validation-engine');
      const { originalGraph, reconstructedGraph, originalScreenshotBase64, reconstructedScreenshotBase64 } = req.body;
      const result = validate({
        originalGraph,
        reconstructedGraph,
        originalScreenshotBase64,
        reconstructedScreenshotBase64
      });
      res.json({ success: true, result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const port = 3000;
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.listen(port, () => {
    console.log(`[Browser Lab Backend] Server listening on port ${port}`);
  });
}

createServer();
