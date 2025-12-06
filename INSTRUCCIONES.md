# Cómo Configurar el Generador de Imágenes

## Problema Identificado

**Gemini NO genera imágenes.** Los modelos de Gemini (incluyendo 2.0 Flash) solo procesan texto y pueden analizar imágenes, pero NO pueden generarlas.

## Soluciones Disponibles

### Opción 1: Stable Diffusion con Hugging Face (GRATIS) ⭐ RECOMENDADO

1. **Crear cuenta en Hugging Face:**
   - Ve a https://huggingface.co/join
   - Crea una cuenta gratuita

2. **Obtener tu API Token:**
   - Ve a https://huggingface.co/settings/tokens
   - Click en "New token"
   - Nombre: "image-generator"
   - Type: "Read"
   - Click "Generate token"
   - Copia el token que empieza con `hf_`

3. **Configurar el proyecto:**

   Edita tu archivo `.env`:
   ```env
   IMAGE_SERVICE=stable-diffusion
   HUGGINGFACE_API_KEY=hf_TU_TOKEN_AQUI
   PORT=3000
   NODE_ENV=development
   MAX_GENERATIONS_PER_SESSION=10
   ```

4. **Ejecutar:**
   ```bash
   npm run build
   npm start
   ```

**Ventajas:**
- ✅ 100% Gratis
- ✅ Sin límites estrictos
- ✅ Buena calidad de imágenes
- ✅ No requiere tarjeta de crédito

**Desventajas:**
- ⏱️ Primera generación puede tardar 20-30 segundos (modelo cargándose)
- ⏱️ Generaciones siguientes: 5-10 segundos

---

### Opción 2: OpenAI DALL-E 3 (DE PAGO)

Si prefieres mejor calidad y tienes presupuesto:

1. **Crear cuenta en OpenAI:**
   - Ve a https://platform.openai.com/signup
   - Agrega método de pago

2. **Obtener API Key:**
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva API key

3. **Instalar dependencia:**
   ```bash
   npm install openai
   ```

4. **Crear el servicio DALL-E:**

   Crea el archivo `src/services/dalleImageService.ts`:
   ```typescript
   import OpenAI from 'openai';

   export class DalleImageService {
     private openai: OpenAI;

     constructor(apiKey: string) {
       this.openai = new OpenAI({ apiKey });
     }

     async generateImage(prompt: string): Promise<string> {
       const response = await this.openai.images.generate({
         model: "dall-e-3",
         prompt: `Educational image for students: ${prompt}`,
         size: "1024x1024",
         quality: "standard",
       });

       const imageUrl = response.data[0].url!;
       const imageResponse = await fetch(imageUrl);
       const arrayBuffer = await imageResponse.arrayBuffer();
       const base64 = Buffer.from(arrayBuffer).toString('base64');

       return `data:image/png;base64,${base64}`;
     }

     async testConnection(): Promise<boolean> {
       try {
         await this.openai.models.list();
         return true;
       } catch {
         return false;
       }
     }
   }
   ```

5. **Actualizar el controlador:**

   En `src/controllers/imageController.ts`, agrega:
   ```typescript
   import { DalleImageService } from '../services/dalleImageService';

   // En el constructor, agrega:
   } else if (serviceType === 'dalle') {
     this.imageService = new DalleImageService(apiKey);
   }
   ```

6. **Configurar `.env`:**
   ```env
   IMAGE_SERVICE=dalle
   OPENAI_API_KEY=sk-TU_KEY_AQUI
   PORT=3000
   NODE_ENV=development
   MAX_GENERATIONS_PER_SESSION=10
   ```

**Costos aproximados:**
- DALL-E 3 Standard (1024x1024): $0.040 por imagen
- 10 imágenes = $0.40
- 100 imágenes = $4.00

---

## Verificar que Todo Funciona

1. Inicia el servidor:
   ```bash
   npm start
   ```

2. Verifica el health check:
   ```bash
   # En otro terminal
   curl http://localhost:3000/health
   ```

   Deberías ver:
   ```json
   {
     "status": "healthy",
     "imageService": "stable-diffusion",
     "serviceConnected": true
   }
   ```

3. Abre http://localhost:3000 en tu navegador y prueba generar una imagen

---

## Troubleshooting

### "You exceeded your current quota" (Gemini)
**Causa:** Gemini no puede generar imágenes.
**Solución:** Usa Stable Diffusion (Opción 1)

### "Model loading" o tarda mucho la primera vez
**Causa:** Hugging Face está cargando el modelo en su servidor.
**Solución:** Espera 30 segundos y vuelve a intentar. Siguientes generaciones serán más rápidas.

### "Invalid API token"
**Causa:** El token de Hugging Face es incorrecto.
**Solución:** Verifica que copiaste bien el token desde https://huggingface.co/settings/tokens

---

## Deployment en Render

Cuando despliegues en Render, agrega estas variables de entorno:

**Para Stable Diffusion:**
- `IMAGE_SERVICE` = `stable-diffusion`
- `HUGGINGFACE_API_KEY` = `tu_token_hf`
- `MAX_GENERATIONS_PER_SESSION` = `10`

**Para DALL-E:**
- `IMAGE_SERVICE` = `dalle`
- `OPENAI_API_KEY` = `tu_key_openai`
- `MAX_GENERATIONS_PER_SESSION` = `10`
