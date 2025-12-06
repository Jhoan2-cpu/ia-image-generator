# Generador de Imágenes con IA para Moodle

Servicio web que permite a estudiantes generar imágenes usando inteligencia artificial (Google Gemini 2.0 Flash) basándose en descripciones de texto. Diseñado para ser embebido en Moodle mediante iframe.

## Características

- Generación de imágenes con IA usando Google Gemini 2.0 Flash
- Interfaz intuitiva y responsive
- 5 prompts sugeridos educativos
- Límite de 10 generaciones por sesión
- Historial de últimas 3 imágenes generadas
- Descarga de imágenes generadas
- Validación de contenido y seguridad
- CORS configurado para Moodle

## Requisitos Previos

- Node.js 18 o superior
- Cuenta de Google para obtener API Key de Gemini
- Cuenta de GitHub (para deployment)
- Cuenta de Render (para hosting)

## Instalación Local

1. **Clonar o descargar el proyecto**

```bash
git clone <tu-repositorio>
cd moodle-image-generator
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
NODE_ENV=development
MAX_GENERATIONS_PER_SESSION=10
```

Para obtener tu API Key de Gemini:
- Visita https://aistudio.google.com/apikey
- Inicia sesión con tu cuenta de Google
- Crea una nueva API Key
- Cópiala en el archivo `.env`

4. **Compilar TypeScript**

```bash
npm run build
```

5. **Iniciar el servidor**

Para desarrollo:
```bash
npm run dev
```

Para producción:
```bash
npm start
```

6. **Acceder a la aplicación**

Abre tu navegador en `http://localhost:3000`

## Scripts Disponibles

- `npm run dev` - Ejecuta el servidor en modo desarrollo con ts-node
- `npm run build` - Compila TypeScript y copia archivos públicos
- `npm start` - Inicia el servidor en producción
- `npm run copy-public` - Copia archivos de la carpeta public a dist

## Estructura del Proyecto

```
moodle-image-generator/
├── src/
│   ├── index.ts                 # Servidor Express principal
│   ├── controllers/
│   │   └── imageController.ts   # Lógica de generación de imágenes
│   ├── services/
│   │   └── geminiImageService.ts # Integración con Gemini
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
├── dist/                        # Compilado TypeScript (generado)
├── .env                         # Variables de entorno (no subir a Git)
├── .env.example                 # Ejemplo de configuración
├── .gitignore
├── package.json
├── tsconfig.json
├── render.yaml                  # Configuración de Render
└── README.md
```

## API Endpoints

### POST /api/generate-image

Genera una imagen basada en un prompt de texto.

**Request:**
```json
{
  "prompt": "Descripción de la imagen (10-500 caracteres)",
  "sessionId": "uuid-de-sesión"
}
```

**Response (200):**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "Prompt usado",
  "generationsLeft": 9
}
```

**Response Error (400/429/500):**
```json
{
  "success": false,
  "error": "Mensaje de error"
}
```

### GET /api/session-info/:sessionId

Obtiene información sobre la sesión actual.

**Response:**
```json
{
  "generationsUsed": 1,
  "generationsLeft": 9,
  "sessionId": "uuid-de-sesión"
}
```

### GET /health

Health check del servicio.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "geminiConnected": true
}
```

## Deployment en Render

### Paso 1: Preparar el Repositorio

1. Inicializar Git (si no lo has hecho):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Crear repositorio en GitHub y subir el código:
```bash
git remote add origin https://github.com/tu-usuario/moodle-image-generator.git
git branch -M main
git push -u origin main
```

### Paso 2: Configurar Render

1. Ve a https://render.com y crea una cuenta (puedes usar GitHub)
2. Click en "New +" y selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Name:** moodle-image-generator
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Paso 3: Variables de Entorno

En la sección "Environment" de Render, agrega:

- `NODE_ENV` = `production`
- `GEMINI_API_KEY` = `tu_api_key_de_gemini`
- `MAX_GENERATIONS_PER_SESSION` = `10`

### Paso 4: Deploy

1. Click en "Create Web Service"
2. Espera a que el deploy termine (puede tardar 5-10 minutos)
3. Verifica que el servicio esté funcionando visitando la URL de Render
4. Prueba el endpoint `/health`

### Notas sobre Render Free Tier

- El servicio se "duerme" después de 15 minutos de inactividad
- Primera carga puede tardar 30-60 segundos (cold start)
- Límite de 750 horas/mes (suficiente para uso educativo)

## Integración en Moodle

### Paso 1: Código HTML para Embed

```html
<div style="width: 100%; height: 700px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <iframe
        src="https://tu-servicio.onrender.com"
        style="width: 100%; height: 100%; border: none;"
        title="Generador de Imágenes con IA"
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms">
    </iframe>
</div>
```

Reemplaza `https://tu-servicio.onrender.com` con la URL de tu servicio en Render.

### Paso 2: Agregar en Moodle

1. Entra a tu curso en Moodle como administrador/profesor
2. Click en "Activar edición"
3. En la sección deseada, click en "Añadir una actividad o recurso"
4. Selecciona "Página"
5. Completa:
   - **Nombre:** "Generador de Imágenes con IA"
   - **Descripción:** (opcional) Descripción del recurso
6. En el contenido, cambia a modo HTML (botón `<>`)
7. Pega el código HTML del iframe
8. Guarda los cambios

### Paso 3: Verificar

1. Visita la página en Moodle
2. Verifica que el iframe cargue correctamente
3. Prueba generar una imagen

## Troubleshooting

### Error: "GEMINI_API_KEY no está configurada"

**Solución:** Verifica que el archivo `.env` exista y contenga la API Key correcta.

### Error: "No permitido por CORS"

**Solución:** Asegúrate de que la URL de tu Moodle esté en la lista de orígenes permitidos en [src/index.ts](src/index.ts):

```typescript
const allowedOrigins = [
  'https://moodle.cetivirgendelapuerta.com',
  // Agrega tu URL de Moodle aquí
];
```

### Error: "El modelo no generó una imagen"

**Nota Importante:** Gemini 2.0 Flash actualmente está en fase experimental para generación de imágenes. Si encuentras este error:

1. Verifica que estás usando el modelo correcto: `gemini-2.0-flash-exp`
2. Consulta la documentación de Google: https://ai.google.dev/gemini-api/docs/models/generative-models
3. **Alternativas si Gemini no soporta generación de imágenes:**
   - **Opción 1:** Usar DALL-E 3 de OpenAI (requiere API key de pago)
   - **Opción 2:** Usar Stable Diffusion con API gratuita (más complejo)
   - **Opción 3:** Usar Google Cloud Imagen API (requiere configuración adicional)

### El iframe no carga en Moodle

**Soluciones:**
- Verifica que la URL del iframe sea correcta (HTTPS)
- Asegúrate de que Render no esté "dormido" (primera carga puede tardar)
- Revisa la consola del navegador para errores
- Verifica las políticas de seguridad de Moodle

### "Has alcanzado el límite máximo de generaciones"

**Solución:** Las sesiones se limpian automáticamente después de 24 horas. Para resetear manualmente:
- Cierra y vuelve a abrir el iframe
- Borra las cookies del navegador
- Espera 24 horas para que la sesión expire

## Consideraciones de Seguridad

- Validación de longitud de prompt (10-500 caracteres)
- Sanitización de inputs para prevenir XSS
- Google Safety Settings configurados en MEDIUM_AND_ABOVE
- Rate limiting: 10 generaciones por sesión
- CORS restringido a dominios específicos
- Límites de API de Gemini: 15 req/min, 1500 req/día (free tier)

## Mejoras Futuras (Opcional)

- [ ] Galería persistente con base de datos
- [ ] Estilos de imagen seleccionables (realista, cartoon, abstracto)
- [ ] Edición básica de imágenes (brillo, contraste, recorte)
- [ ] Integración para subir imagen directamente a tarea de Moodle
- [ ] Soporte multiidioma
- [ ] Analytics de prompts más usados

## Tecnologías Utilizadas

- **Backend:** Node.js 18+, TypeScript, Express.js
- **IA:** Google Gemini 2.0 Flash
- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Deployment:** Render (free tier)
- **Control de versiones:** Git + GitHub

## Licencia

MIT License - Siéntete libre de usar y modificar este proyecto.

## Soporte

Si encuentras problemas:
1. Revisa la sección de Troubleshooting
2. Verifica los logs en Render Dashboard
3. Consulta la documentación de Gemini API

---

Desarrollado para integración con Moodle CETI Virgen de la Puerta.
