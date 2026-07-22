import { Router } from 'express';
import { ServiceLocator } from '../ServiceLocator.js';
import { Task } from '@wip/execution-kernel';
import { CoordinatorAgent } from '@wip/coordinator';
import { KernelAdapter } from '../adapters/KernelAdapter.js';
import { WorkerAdapter } from '../adapters/WorkerAdapter.js';

export const simulatorRouter = Router();
const services = ServiceLocator.getInstance();

simulatorRouter.post('/snapshot', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const logs = [`Navigating to ${url}...`];
    const sessionId = await services.browserRuntime.createSession();
    const transaction = await services.executionKernel.beginTransaction('M-011', sessionId, 'admin');
    
    const result = await services.executionKernel.executeTask(transaction, new Task([{ type: 'evaluate' }]), async () => {
      try {
        await services.browserRuntime.navigate(sessionId, url);
        logs.push(`Capturing snapshot...`);
        const snapshot = await services.browserRuntime.capture(sessionId, [1, 2]); // DOM + A11Y
        await services.observationStore.saveSnapshot(snapshot.snapshotId, snapshot.graph as any);
        return { success: true, data: snapshot };
      } catch (e: any) {
        return { success: false, data: null, error: e.message };
      }
    });

    await services.executionKernel.commitTransaction(transaction);

    if (result.success) {
      logs.push(`Snapshot captured: ${result.data.snapshotId}`);
      res.json({
        success: true,
        snapshotId: result.data.snapshotId,
        graph: result.data.graph,
        screenshotBase64: result.data.visual,
        sessionId,
        logs
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

simulatorRouter.post('/click', async (req, res) => {
  try {
    const { sessionId, nodeId } = req.body;
    if (!sessionId || !nodeId) return res.status(400).json({ error: 'sessionId and nodeId are required' });
    await services.browserRuntime.click(sessionId, nodeId);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

simulatorRouter.post('/type', async (req, res) => {
  try {
    const { sessionId, nodeId, text, delay } = req.body;
    if (!sessionId || !nodeId || !text) return res.status(400).json({ error: 'sessionId, nodeId, and text are required' });
    await services.browserRuntime.type(sessionId, nodeId, text, delay);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

simulatorRouter.post('/scroll', async (req, res) => {
  try {
    const { sessionId, distanceY, behavior } = req.body;
    if (!sessionId || distanceY === undefined) return res.status(400).json({ error: 'sessionId and distanceY are required' });
    await services.browserRuntime.scroll(sessionId, distanceY, behavior);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

simulatorRouter.post('/command', async (req, res) => {
  try {
    const { command, snapshotId, sessionId } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }
    if (!snapshotId) {
      return res.status(400).json({ error: 'No active session. Navigate to a URL first.' });
    }

    const graph = await services.observationStore.getSnapshot(snapshotId);
    if (!graph) {
      return res.status(404).json({ error: 'Observation graph not found in store for this session' });
    }

    const logs = [`Executing command using Coordinator Sandbox...`];
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    }

    const kernelAdapter = new KernelAdapter(sessionId);
    const workerAdapter = new WorkerAdapter();
    const agent = new CoordinatorAgent(process.env.GEMINI_API_KEY, kernelAdapter, workerAdapter);

    const transaction = await services.executionKernel.beginTransaction('M-011', sessionId, 'admin');
    
    const actionResult = await services.executionKernel.executeTask(transaction, new Task([{ type: 'evaluate' }]), async () => {
       const result = await agent.start(command);
       return { success: true, data: result };
    });
    
    await services.executionKernel.commitTransaction(transaction);
    logs.push(`Coordinator (via Kernel): Mission completed.`);

    // Re-capture snapshot after command completes
    logs.push(`Capturing updated snapshot...`);
    const snapshot = await services.browserRuntime.capture(sessionId, [1, 2]);
    await services.observationStore.saveSnapshot(snapshot.snapshotId, snapshot.graph as any);
    
    res.json({
      success: true,
      logs,
      snapshotId: snapshot.snapshotId,
      graph: snapshot.graph,
      screenshotBase64: snapshot.visual,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
