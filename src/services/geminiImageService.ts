import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

export class GeminiImageService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      // Gemini 2.0 Flash genera imágenes directamente en la respuesta
      const result = await this.model.generateContent([
        {
          text: `Generate an image based on this description: ${prompt}. The image should be educational, appropriate for students, and visually clear.`
        }
      ]);

      const response = await result.response;

      // Verifica si hay una parte de imagen en la respuesta
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content.parts;

        for (const part of parts) {
          // Si el modelo retorna datos de imagen inline
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            const base64Image = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64Image}`;
          }
        }
      }

      // Si no hay imagen, lanza un error descriptivo
      throw new Error('El modelo no generó una imagen. Gemini 2.0 Flash puede no soportar generación de imágenes directamente. Considera usar un modelo diferente o una API especializada.');
    } catch (error: any) {
      console.error('Error generando imagen:', error);
      throw new Error(`Error al generar imagen: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent(['Test connection']);
      return !!result.response;
    } catch (error) {
      console.error('Error al probar conexión con Gemini:', error);
      return false;
    }
  }
}
