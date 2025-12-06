import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { ImageController } from './controllers/imageController';
import { createImageRoutes } from './routes/image';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.HUGGINGFACE_API_KEY || '';
const MAX_GENERATIONS = parseInt(process.env.MAX_GENERATIONS_PER_SESSION || '10', 10);
const IMAGE_SERVICE = process.env.IMAGE_SERVICE || 'stable-diffusion'; // 'stable-diffusion', 'gemini', 'dalle'

if (!API_KEY) {
  console.error('ERROR: API_KEY no está configurada en las variables de entorno');
  console.error('Configura una de estas variables: API_KEY, GEMINI_API_KEY, HUGGINGFACE_API_KEY, o OPENAI_API_KEY');
  process.exit(1);
}

// Configurar CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://moodle.cetivirgendelapuerta.com',
      'http://localhost:3000',
      'http://localhost:5173',
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

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar controlador
const imageController = new ImageController(API_KEY, MAX_GENERATIONS, IMAGE_SERVICE);

// Rutas API
app.use('/api', createImageRoutes(imageController));

// Health check
app.get('/health', async (req, res) => {
  const serviceConnected = await imageController.testConnection();

  res.json({
    status: serviceConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    imageService: IMAGE_SERVICE,
    serviceConnected
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎨 Servicio de imágenes: ${IMAGE_SERVICE}`);
  console.log(`✅ Generador de imágenes con IA listo`);
});
