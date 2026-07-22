import { Router } from 'express';
import { CoordinatorAgent } from '@wip/coordinator';
import { KernelAdapter } from '../adapters/KernelAdapter.js';
import { WorkerAdapter } from '../adapters/WorkerAdapter.js';

export const coordinatorRouter = Router();

coordinatorRouter.post('/start', async (req, res) => {
  try {
    const { objective, sessionId } = req.body;
    if (!objective) return res.status(400).json({ error: 'Objective required' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const kernelAdapter = new KernelAdapter(sessionId);
    const workerAdapter = new WorkerAdapter();
    const agent = new CoordinatorAgent(process.env.GEMINI_API_KEY, kernelAdapter, workerAdapter);
    
    const result = await agent.start(objective);
    
    res.json({ success: true, result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
