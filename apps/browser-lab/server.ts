import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

      // Use standard fetch to get the raw HTML
      const response = await fetch(url, {
        headers: { 'User-Agent': 'BrowserLab-Simulated-Headless/1.0' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      logs.push('Page HTML retrieved successfully.');
      
      // Parse with JSDOM
      const dom = new JSDOM(html, { url });
      const document = dom.window.document;
      
      const snapshotId = `snap-${Date.now()}`;
      const graph = {
        snapshot: {
          id: snapshotId,
          timestamp: Date.now(),
          url
        },
        nodes: [] as any[],
        edges: [] as any[]
      };
      
      // Add SnapshotNode to nodes array
      graph.nodes.push({
        id: snapshotId,
        type: 'SnapshotNode',
        properties: {
          url,
          viewportWidth: 1024,
          viewportHeight: 768
        }
      });
      
      let nodeIdCounter = 0;
      
      const traverse = (el: Element, parentId: string | null, depth: number) => {
        const id = `node-${nodeIdCounter++}`;
        const classes = el.className && typeof el.className === 'string' ? el.className.split(' ').filter(c => c) : [];
        
        // Extract direct text content (simplified)
        let text = '';
        for (const child of Array.from(el.childNodes)) {
          if (child.nodeType === dom.window.Node.TEXT_NODE && child.textContent?.trim()) {
            text += child.textContent.trim() + ' ';
          }
        }
        
        // Push DOMNode
        const properties: any = {
          tagName: el.tagName.toLowerCase(),
          nodeType: el.nodeType,
          classes,
          depth // Adding depth to properties to help the UI rendering
        };
        
        if (text.trim()) {
          properties.text = text.trim();
        }
        
        graph.nodes.push({
          id,
          type: 'DOMNode',
          properties
        });
        
        // Link to parent or snapshot
        if (parentId) {
          graph.edges.push({
            source: id,
            target: parentId,
            type: 'CHILD_OF'
          });
        } else {
          graph.edges.push({
            source: id,
            target: snapshotId,
            type: 'BELONGS_TO'
          });
        }
        
        for (const child of Array.from(el.children)) {
          traverse(child, id, depth + 1);
        }
      };
      
      traverse(document.documentElement, null, 0);
      logs.push(`Snapshot extracted. Found ${graph.nodes.length} nodes and ${graph.edges.length} edges.`);

      res.json({
        success: true,
        graph,
        logs,
        screenshotUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1920&auto=format&fit=crop'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route: Simulator Command (Gemini Coordinator Sandbox)
  app.post('/api/simulator/command', async (req, res) => {
    try {
      const { command, graph } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      if (!graph) {
        return res.status(400).json({ error: 'No active session. Navigate to a URL first.' });
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
      logs.push(`Coordinator: ${responseText}`);

      res.json({
        success: true,
        logs,
      });
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
