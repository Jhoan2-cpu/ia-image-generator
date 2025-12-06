import { HfInference } from '@huggingface/inference';

export class StableDiffusionService {
  private hf: HfInference;
  private model = 'black-forest-labs/FLUX.1-schnell';

  constructor(apiKey: string) {
    this.hf = new HfInference(apiKey);
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      console.log(`Generando imagen con prompt: "${prompt}"`);

      // Generar imagen usando el SDK oficial
      const imageBlob = await this.hf.textToImage({
        model: this.model,
        inputs: prompt,
      }) as any;

      // Convertir blob a base64
      const buffer = Buffer.from(await imageBlob.arrayBuffer());
      const base64 = buffer.toString('base64');

      console.log('Imagen generada exitosamente');
      return `data:image/png;base64,${base64}`;
    } catch (error: any) {
      console.error('Error generando imagen con Stable Diffusion:', error);

      // Si es un error de modelo cargándose, reintentar
      if (error.message?.includes('loading') || error.message?.includes('503')) {
        console.log('Modelo cargándose, esperando 20 segundos...');
        await new Promise(resolve => setTimeout(resolve, 20000));
        return this.generateImage(prompt);
      }

      throw new Error(`Error al generar imagen: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.hf.textToImage({
        model: this.model,
        inputs: 'test',
      });
      return true;
    } catch (error: any) {
      // 503 significa que el modelo está cargándose, lo cual es aceptable
      if (error.message?.includes('loading') || error.message?.includes('503')) {
        return true;
      }
      console.error('Error al probar conexión con Hugging Face:', error);
      return false;
    }
  }
}
