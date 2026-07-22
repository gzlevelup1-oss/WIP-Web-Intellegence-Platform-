import { Router } from 'express';

export const validationRouter = Router();

validationRouter.post('/evaluate', async (req, res) => {
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
