import { Request, Response, NextFunction } from 'express';

export const validatePrompt = (req: Request, res: Response, next: NextFunction): void => {
  const { prompt, sessionId } = req.body;

  // Validar que exista el prompt
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({
      success: false,
      error: 'El prompt es requerido y debe ser un texto'
    });
    return;
  }

  // Validar longitud del prompt
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length < 10) {
    res.status(400).json({
      success: false,
      error: 'El prompt debe tener al menos 10 caracteres'
    });
    return;
  }

  if (trimmedPrompt.length > 500) {
    res.status(400).json({
      success: false,
      error: 'El prompt no debe exceder 500 caracteres'
    });
    return;
  }

  // Validar sessionId
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({
      success: false,
      error: 'El sessionId es requerido'
    });
    return;
  }

  // Sanitizar prompt (prevenir XSS)
  req.body.prompt = trimmedPrompt
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  next();
};
