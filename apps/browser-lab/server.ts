import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ExecutionKernel } from '@wip/execution-kernel';
import { DesignTokenExtractor, ComponentMiner, LayoutAnalyzer } from '@wip/workers';
import { CoordinatorAgent, IExecutionKernelAdapter, IWorkerAdapter } from '@wip/coordinator';
import { MemoryObservationStore } from '@wip/observation-store';
import { chromium, Browser } from 'playwright';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let browserInstance: Browser | null = null;
const kernel = new ExecutionKernel();
const tokenExtractor = new DesignTokenExtractor();
const componentMiner = new ComponentMiner();
const layoutAnalyzer = new LayoutAnalyzer();
const observationStore = new MemoryObservationStore();


async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true });
  }
  return browserInstance;
}

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: __dirname,
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.use(express.json());

  // API Route: Simulator Snapshot
  app.post('/api/simulator/snapshot', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      const logs = [`Navigating to ${url}...`];

      const sessionId = `session-${Date.now()}`;
      const browser = await getBrowser();
      const context = await browser.newContext();
      const page = await context.newPage();
      
      kernel.registerSession(sessionId, context, page);
      const transaction = await kernel.beginTransaction('M-011', sessionId);
      
      const result = await kernel.executeAction(transaction, async () => {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          logs.push('Page loaded successfully via Kernel.');

          const snapshotId = `snap-${Date.now()}`;

          // Evaluate script in the browser to extract the Observation Graph
          const graphResult = await page.evaluate(({ snapshotId, url }) => {
            const graph: any = {
              snapshot: {
                id: snapshotId,
                timestamp: Date.now(),
                url
              },
              nodes: [],
              edges: []
            };
            
            graph.nodes.push({
              id: snapshotId,
              type: 'SnapshotNode',
              properties: {
                url,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
              }
            });
            
            let nodeIdCounter = 0;
            
            const traverse = (el: Element, parentId: string | null, depth: number) => {
              const domNodeId = `node-${nodeIdCounter++}`;
              const geoNodeId = `geo-${nodeIdCounter++}`;
              const styleNodeId = `style-${nodeIdCounter++}`;
              
              const classes = el.className && typeof el.className === 'string' ? el.className.split(' ').filter(c => c) : [];
              
              let text = '';
              for (const child of Array.from(el.childNodes)) {
                if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                  text += child.textContent.trim() + ' ';
                }
              }
              
              const properties: any = {
                tagName: el.tagName.toLowerCase(),
                nodeType: el.nodeType,
                classes,
                depth
              };
              
              if (text.trim()) {
                properties.text = text.trim();
              }
              
              // 1. Add DOMNode
              graph.nodes.push({
                id: domNodeId,
                type: 'DOMNode',
                properties
              });
              
              // 2. Add GeometryNode
              const rect = el.getBoundingClientRect();
              graph.nodes.push({
                id: geoNodeId,
                type: 'GeometryNode',
                properties: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                  top: rect.top,
                  right: rect.right,
                  bottom: rect.bottom,
                  left: rect.left
                }
              });
              
              // 3. Add StyleNode (just a few key properties to avoid massive payloads)
              const computed = window.getComputedStyle(el);
              graph.nodes.push({
                id: styleNodeId,
                type: 'StyleNode',
                properties: {
                  display: computed.display,
                  position: computed.position,
                  backgroundColor: computed.backgroundColor,
                  color: computed.color,
                  fontFamily: computed.fontFamily,
                  fontSize: computed.fontSize,
                  margin: computed.margin,
                  padding: computed.padding,
                  opacity: computed.opacity,
                  zIndex: computed.zIndex
                }
              });
              
              // Edges
              graph.edges.push({ source: domNodeId, target: geoNodeId, type: 'HAS_GEOMETRY' });
              graph.edges.push({ source: domNodeId, target: styleNodeId, type: 'HAS_STYLE' });
              
              if (parentId) {
                graph.edges.push({ source: domNodeId, target: parentId, type: 'CHILD_OF' });
              } else {
                graph.edges.push({ source: domNodeId, target: snapshotId, type: 'BELONGS_TO' });
              }
              
              for (const child of Array.from(el.children)) {
                traverse(child, domNodeId, depth + 1);
              }
              if (el.shadowRoot) {
                for (const child of Array.from(el.shadowRoot.children)) {
                  traverse(child, domNodeId, depth + 1);
                }
              }
            };
            
            traverse(document.documentElement, null, 0);
            return graph;
          }, { snapshotId, url });
          
          logs.push(`Snapshot extracted. Found ${graphResult.nodes.length} nodes and ${graphResult.edges.length} edges.`);

          // Capture real screenshot
          const screenshotBuffer = await page.screenshot({ type: 'png' });
          const screenshotUrl = 'data:image/png;base64,' + screenshotBuffer.toString('base64');
          
          await observationStore.saveSnapshot(snapshotId, graphResult as any);
          
          return {
            success: true,
            data: { graph: graphResult, screenshotUrl }
          };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      });

      if (!result.success) {
        await kernel.abortTransaction(transaction, true);
        await context.close();
        return res.status(500).json({ error: result.error });
      }

      await kernel.commitTransaction(transaction);
      await context.close();

      res.json({
        success: true,
        graph: result.data.graph,
        logs,
        screenshotUrl: result.data.screenshotUrl
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route: Simulator Command (Gemini Coordinator Sandbox)
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
      
      // We pass a simplified version of the graph to Gemini to avoid blowing up the context window for large sites
      const simplifiedGraph = graph.nodes.map((n: any) => ({
        id: n.id, type: n.type, properties: { tagName: n.properties?.tagName, text: n.properties?.text?.substring(0, 50) }
      })).slice(0, 300); // Take first 300 nodes to fit easily in the context for testing

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
      const sessionId = `session-${Date.now()}`;
      const browser = await getBrowser();
      const context = await browser.newContext();
      const page = await context.newPage();
      
      kernel.registerSession(sessionId, context, page);
      const transaction = await kernel.beginTransaction('M-011', sessionId);
      
      const actionResult = await kernel.executeAction(transaction, async () => {
        // Here we would actually dispatch the Tool call (e.g., page.click())
        return { success: true, data: responseText };
      });
      
      await kernel.commitTransaction(transaction);
      await context.close();

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
        captureObservation: async () => {
          return { status: 'mock_captured', snapshotId: 'snap-123' };
        },
        click: async (nodeId: string) => {
          return { status: 'mock_clicked', nodeId };
        },
        type: async (nodeId: string, text: string) => {
          return { status: 'mock_typed', nodeId, text };
        },
        goto: async (url: string) => {
          return { status: 'mock_navigated', url };
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`[Browser Lab Backend] Server listening on port ${port}`);
  });
}

createServer();

// To be added inside app routes block
