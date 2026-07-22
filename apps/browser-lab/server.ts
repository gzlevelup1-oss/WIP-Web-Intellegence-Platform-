import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { simulatorRouter } from './src/backend/routes/simulator.routes.js';
import { coordinatorRouter } from './src/backend/routes/coordinator.routes.js';
import { workersRouter } from './src/backend/routes/workers.routes.js';
import { validationRouter } from './src/backend/routes/validation.routes.js';

dotenv.config();

async function createServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(express.json({ limit: '50mb' }));

  // Mount routers
  app.use('/api/simulator', simulatorRouter);
  app.use('/api/coordinator', coordinatorRouter);
  app.use('/api/workers', workersRouter);
  app.use('/api/validation', validationRouter);

  const port = 3000;
  
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.listen(port, () => {
    console.log(`[Browser Lab Backend] Server listening on port ${port}`);
  });
}

createServer();
