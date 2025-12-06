import { Request, Response } from 'express';
import { GeminiImageService } from '../services/geminiImageService';
import { StableDiffusionService } from '../services/stableDiffusionService';
import { SessionManager } from '../utils/sessionManager';

interface ImageService {
  generateImage(prompt: string): Promise<string>;
  testConnection(): Promise<boolean>;
}

export class ImageController {
  private imageService: ImageService;
  private sessionManager: SessionManager;

  constructor(apiKey: string, maxGenerations: number, serviceType: string = 'stable-diffusion') {
    // Seleccionar servicio según configuración
    if (serviceType === 'gemini') {
      this.imageService = new GeminiImageService(apiKey);
    } else if (serviceType === 'stable-diffusion') {
      this.imageService = new StableDiffusionService(apiKey);
    } else {
      throw new Error(`Servicio de imagen no soportado: ${serviceType}`);
    }

    this.sessionManager = new SessionManager(maxGenerations);
  }

  async generateImage(req: Request, res: Response): Promise<void> {
    const { prompt, sessionId } = req.body;

    try {
      // Verificar límite de sesión
      if (!this.sessionManager.canGenerate(sessionId)) {
        res.status(429).json({
          success: false,
          error: 'Has alcanzado el límite máximo de generaciones para esta sesión'
        });
        return;
      }

      // Generar imagen
      const imageUrl = await this.imageService.generateImage(prompt);

      // Incrementar contador de sesión
      this.sessionManager.incrementCount(sessionId);

      // Obtener información de sesión actualizada
      const sessionInfo = this.sessionManager.getSessionInfo(sessionId);

      res.status(200).json({
        success: true,
        imageUrl,
        prompt,
        generationsLeft: sessionInfo.generationsLeft
      });
    } catch (error: any) {
      console.error('Error en generateImage:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar la imagen'
      });
    }
  }

  async getSessionInfo(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'sessionId es requerido'
      });
      return;
    }

    const sessionInfo = this.sessionManager.getSessionInfo(sessionId);
    res.status(200).json(sessionInfo);
  }

  async testConnection(): Promise<boolean> {
    return await this.imageService.testConnection();
  }
}
