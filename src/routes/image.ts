import { Router } from 'express';
import { ImageController } from '../controllers/imageController';
import { validatePrompt } from '../middleware/validation';

export function createImageRoutes(controller: ImageController): Router {
  const router = Router();

  router.post('/generate-image', validatePrompt, (req, res) => {
    controller.generateImage(req, res);
  });

  router.get('/session-info/:sessionId', (req, res) => {
    controller.getSessionInfo(req, res);
  });

  return router;
}
