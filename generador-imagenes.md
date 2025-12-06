# Servicio de Generación de Imágenes con IA para Moodle

## Descripción General

Servicio web que permite a estudiantes generar imágenes usando inteligencia artificial (Gemini 2.0 Flash con Imagen) basándose en descripciones de texto. El servicio será embebido en Moodle mediante un iframe, similar al chatbot existente.

---

## 1. Especificaciones Técnicas

### 1.1 Stack Tecnológico
- **Backend**: Node.js 18+ con TypeScript y Express.js
- **IA**: Google Gemini 2.0 Flash con capacidad de generación de imágenes (Imagen 3)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Deployment**: Render (free tier)
- **Control de versiones**: Git + GitHub

### 1.2 Dependencias Principales
```json
{
  "@google/generative-ai": "^0.24.1",
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "uuid": "^13.0.0",
  "typescript": "^5.9.3"
}
```

---

## 2. Funcionalidades Principales

### 2.1 Generación de Imágenes
- **Input**: Descripción de texto (prompt) en español o inglés
- **Output**: Imagen generada en formato base64 o URL
- **Modelo**: `gemini-2.0-flash-exp` con capacidad de generación de imágenes
- **Límites**:
  - Máximo 10 generaciones por sesión
  - Longitud de prompt: 10-500 caracteres
  - Tiempo de espera máximo: 30 segundos por generación

### 2.2 Características de UX
- **Prompts sugeridos**: 5 ejemplos educativos relacionados con Comunicación
  - "Crea una imagen de un estudiante presentando un proyecto"
  - "Genera una ilustración de comunicación no verbal"
  - "Diseña un cartel sobre medios de comunicación"
  - "Crea una escena de debate grupal en clase"
  - "Ilustra el proceso de comunicación efectiva"

- **Indicador de progreso**: Spinner animado durante la generación
- **Historial de sesión**: Mostrar últimas 3 imágenes generadas
- **Descarga de imágenes**: Botón para descargar imagen generada
- **Contador de usos**: Mostrar X/10 generaciones restantes

### 2.3 Validación y Seguridad
- Validación de longitud de prompt (10-500 caracteres)
- Filtro de contenido inapropiado (usando Google Safety Settings)
- Sanitización de inputs para prevenir XSS
- Rate limiting: Máximo 10 generaciones por sesión
- CORS configurado para Moodle: `https://moodle.cetivirgendelapuerta.com`

---

## 3. Arquitectura del Proyecto

### 3.1 Estructura de Carpetas
```
image-generator/
├── src/
│   ├── index.ts                 # Servidor Express principal
│   ├── controllers/
│   │   └── imageController.ts   # Lógica de control de generación
│   ├── services/
│   │   └── geminiImageService.ts # Integración con Gemini Imagen
│   ├── routes/
│   │   └── image.ts             # Rutas API
│   ├── middleware/
│   │   └── validation.ts        # Validación de requests
│   └── utils/
│       ├── prompts.ts           # Prompts predefinidos
│       └── sessionManager.ts    # Gestión de límites por sesión
├── public/
│   ├── index.html               # Interfaz principal
│   ├── styles.css               # Estilos responsive
│   └── app.js                   # Lógica frontend
├── dist/                        # Compilado TypeScript
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de configuración
├── .gitignore
├── package.json
├── tsconfig.json
├── render.yaml                  # Config de Render
└── README.md
```

### 3.2 Endpoints API

#### POST /api/generate-image
```typescript
Request:
{
  "prompt": string,        // 10-500 caracteres
  "sessionId": string      // UUID de sesión
}

Response Success (200):
{
  "success": true,
  "imageUrl": string,      // URL de la imagen o base64
  "prompt": string,        // Prompt usado
  "generationsLeft": number // Generaciones restantes
}

Response Error (400/429/500):
{
  "success": false,
  "error": string
}
```

#### GET /api/session-info/:sessionId
```typescript
Response:
{
  "generationsUsed": number,
  "generationsLeft": number,
  "sessionId": string
}
```

#### GET /health
```typescript
Response:
{
  "status": "healthy" | "unhealthy",
  "timestamp": string,
  "uptime": number,
  "geminiConnected": boolean
}
```

---

## 4. Implementación Paso a Paso

### Fase 1: Configuración Inicial (1 tarea)
1. Crear proyecto Node.js con TypeScript
2. Configurar `.gitignore`, `tsconfig.json`, `package.json`
3. Instalar dependencias necesarias
4. Crear estructura de carpetas

### Fase 2: Backend (3 tareas)

#### 4.1 Servicio de Gemini Image
```typescript
// src/services/geminiImageService.ts
export class GeminiImageService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'  // Modelo con capacidad de imágenes
    });
  }

  async generateImage(prompt: string): Promise<string> {
    // Implementación de generación de imagen
    // Retorna URL o base64 de la imagen
  }

  async testConnection(): Promise<boolean> {
    // Verificar conexión con API
  }
}
```

#### 4.2 Session Manager
```typescript
// src/utils/sessionManager.ts
export class SessionManager {
  private sessions: Map<string, SessionData>;
  private readonly MAX_GENERATIONS = 10;

  canGenerate(sessionId: string): boolean {}
  incrementCount(sessionId: string): void {}
  getSessionInfo(sessionId: string): SessionData {}
}
```

#### 4.3 Controlador de Imágenes
```typescript
// src/controllers/imageController.ts
export class ImageController {
  async generateImage(req: Request, res: Response) {
    // Validar prompt
    // Verificar límite de sesión
    // Generar imagen con Gemini
    // Retornar resultado
  }
}
```

### Fase 3: Frontend (2 tareas)

#### 4.4 Interfaz HTML
- Campo de texto para prompt con contador de caracteres
- Botón "Generar Imagen" con loading state
- Área de visualización de imagen generada
- Botón de descarga
- Galería de últimas 3 imágenes
- 5 botones de prompts sugeridos
- Contador X/10 generaciones

#### 4.5 Estilos CSS
- Diseño responsive (móvil, tablet, desktop)
- Tema educativo coherente con el chatbot
- Animaciones de carga suaves
- Estados hover, active, disabled
- Grid/Flexbox para galería de imágenes

#### 4.6 Lógica JavaScript
```javascript
// public/app.js
class ImageGenerator {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.generationsLeft = 10;
    this.imageHistory = [];
  }

  async generateImage(prompt) {
    // Validar prompt
    // Mostrar loading
    // Llamar API
    // Mostrar imagen
    // Actualizar historial
    // Actualizar contador
  }

  downloadImage(imageUrl) {
    // Descargar imagen como archivo
  }
}
```

### Fase 4: Configuración CORS y Seguridad (1 tarea)
```typescript
// src/index.ts
const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://moodle.cetivirgendelapuerta.com',
      'http://localhost:3000',
      /\.onrender\.com$/
    ];

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: false
};
```

### Fase 5: Deployment en Render (3 tareas)

#### 5.1 Configuración de Build
```json
// package.json scripts
{
  "build": "tsc && npm run copy-public",
  "copy-public": "mkdir -p dist && cp -r public dist/public",
  "start": "node dist/index.js"
}
```

#### 5.2 Configuración de Render
```yaml
# render.yaml
services:
  - type: web
    name: moodle-image-generator
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEMINI_API_KEY
        sync: false  # Configurar manualmente en Render dashboard
```

#### 5.3 Pasos de Deployment
1. Subir código a GitHub (nuevo repositorio)
2. Crear servicio en Render
3. Conectar repositorio de GitHub
4. Configurar variables de entorno (GEMINI_API_KEY)
5. Verificar deployment exitoso
6. Probar endpoint /health

### Fase 6: Integración en Moodle (1 tarea)

#### 6.1 Código HTML para embed
```html
<div style="width: 100%; height: 700px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <iframe
        src="https://moodle-image-generator.onrender.com"
        style="width: 100%; height: 100%; border: none;"
        title="Generador de Imágenes con IA"
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms">
    </iframe>
</div>
```

#### 6.2 Pasos en Moodle
1. Activar edición en curso
2. Añadir recurso "Página"
3. Nombre: "Generador de Imágenes con IA"
4. Cambiar a modo HTML (<>)
5. Pegar código iframe
6. Guardar cambios

---

## 5. Variables de Entorno

```env
# .env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
NODE_ENV=development
MAX_GENERATIONS_PER_SESSION=10
```

```env
# .env.example
GEMINI_API_KEY=obtén_tu_clave_en_https://aistudio.google.com/apikey
PORT=3000
NODE_ENV=development
MAX_GENERATIONS_PER_SESSION=10
```

---

## 6. Consideraciones Importantes

### 6.1 API de Gemini para Imágenes
- **Modelo**: Usar `gemini-2.0-flash-exp` o `gemini-pro-vision` según disponibilidad
- **Investigar**: Verificar si Gemini API soporta generación de imágenes nativamente o necesita Imagen 3
- **Alternativa**: Si Gemini no soporta generación, considerar:
  - DALL-E 3 (OpenAI) - de pago
  - Stable Diffusion (API libre) - más complejo
  - Google Cloud Imagen API - requiere configuración adicional

### 6.2 Almacenamiento de Imágenes
- **Opción 1**: Retornar base64 (más simple, sin almacenamiento)
- **Opción 2**: Guardar en Cloudinary/AWS S3 (más profesional, requiere cuenta)
- **Recomendación**: Empezar con base64 para MVP

### 6.3 Límites de Rate
- **Gemini Free Tier**: 15 requests/minuto, 1500 requests/día
- **Implementar**: Cola de requests si es necesario
- **Caché**: Guardar prompts comunes para reducir llamadas API

### 6.4 Prompts Educativos
- Enfocar en contenido educativo de Comunicación
- Evitar prompts que generen contenido inapropiado
- Usar Google Safety Settings: BLOCK_MEDIUM_AND_ABOVE

---

## 7. Testing y Validación

### 7.1 Tests Locales
1. Verificar generación de imagen con prompt simple
2. Probar límite de 10 generaciones por sesión
3. Validar filtros de contenido
4. Probar descarga de imagen
5. Verificar responsive design (móvil, tablet, desktop)

### 7.2 Tests en Producción
1. Verificar CORS desde Moodle
2. Probar carga de iframe en Moodle
3. Verificar tiempos de respuesta (<30s)
4. Monitorear errores en Render logs

---

## 8. Mejoras Futuras (Opcional)

1. **Galería persistente**: Guardar imágenes generadas en base de datos
2. **Estilos de imagen**: Permitir elegir estilo (realista, cartoon, abstracto)
3. **Edición básica**: Ajustar brillo, contraste, recorte
4. **Compartir en Moodle**: Integración para subir imagen directamente a tarea
5. **Multilenguaje**: Soporte para inglés, chino, japonés
6. **Analytics**: Registro de prompts más usados

---

## 9. Documentación Final

### README.md debe incluir:
- Descripción del proyecto
- Requisitos previos
- Instalación local
- Variables de entorno
- Scripts npm disponibles
- Deployment en Render
- Integración en Moodle
- Troubleshooting común
- Licencia

---

## 10. Cronograma Estimado

| Fase | Descripción | Tareas |
|------|-------------|--------|
| 1 | Configuración inicial | 1 |
| 2 | Backend (servicios, controladores, rutas) | 3 |
| 3 | Frontend (HTML, CSS, JS) | 3 |
| 4 | Seguridad y CORS | 1 |
| 5 | Deployment en Render | 3 |
| 6 | Integración en Moodle | 1 |
| **Total** | | **12 tareas** |

---

## 11. Recursos Necesarios

### APIs y Servicios
- [ ] Google Gemini API Key (gratis en https://aistudio.google.com/apikey)
- [ ] Cuenta GitHub (gratis)
- [ ] Cuenta Render (free tier)
- [ ] Acceso admin a Moodle para integración

### Investigación Previa
- [ ] Confirmar que Gemini API soporta generación de imágenes
- [ ] Verificar límites de free tier para generación de imágenes
- [ ] Revisar documentación de Imagen 3 / Gemini Vision

---

## 12. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Gemini no soporta generación de imágenes | Media | Alto | Usar API alternativa (DALL-E, Stable Diffusion) |
| Límites de API muy restrictivos | Alta | Medio | Implementar caché y reducir límite a 5/sesión |
| Tiempo de generación >30s | Baja | Medio | Mostrar mensaje de paciencia, aumentar timeout |
| Contenido inapropiado generado | Baja | Alto | Safety Settings estrictos, moderación manual inicial |

---

## Notas Finales

Este plan está diseñado para ser implementado de manera incremental, siguiendo la misma estructura exitosa del chatbot. Se recomienda:

1. **Comenzar con MVP**: Funcionalidad básica de generación
2. **Iterar según feedback**: Añadir features basándose en uso real
3. **Monitorear costos**: Verificar que free tier sea suficiente
4. **Documentar todo**: Facilitar mantenimiento futuro

El proyecto es similar en complejidad al chatbot existente, por lo que la experiencia previa acelerará el desarrollo considerablemente.
