import { Router } from 'express';
import { ServiceLocator } from '../ServiceLocator.js';

export const workersRouter = Router();
const services = ServiceLocator.getInstance();

workersRouter.post('/tokens', async (req, res) => {
  try {
    const { snapshotId } = req.body;
    if (!snapshotId) return res.status(400).json({ error: 'snapshotId is required' });
    const graph = await services.observationStore.getSnapshot(snapshotId);
    if (!graph) return res.status(404).json({ error: 'Snapshot not found' });
    const result = services.tokenExtractor.extract(graph);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

workersRouter.post('/mine', async (req, res) => {
  try {
    const { snapshotId, containerNodeId } = req.body;
    if (!snapshotId || !containerNodeId) return res.status(400).json({ error: 'snapshotId and containerNodeId required' });
    const graph = await services.observationStore.getSnapshot(snapshotId);
    if (!graph) return res.status(404).json({ error: 'Snapshot not found' });
    const result = services.componentMiner.mine(graph, containerNodeId);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

workersRouter.post('/layout', async (req, res) => {
  try {
    const { snapshotId, containerNodeId } = req.body;
    if (!snapshotId || !containerNodeId) return res.status(400).json({ error: 'snapshotId and containerNodeId required' });
    const graph = await services.observationStore.getSnapshot(snapshotId);
    if (!graph) return res.status(404).json({ error: 'Snapshot not found' });
    const result = services.layoutAnalyzer.analyze(graph, containerNodeId);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
