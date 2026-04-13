import express from 'express';
import { createServer as createViteServer } from 'vite';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to delete all assets from Cloudinary
  app.post('/api/media/delete-all', async (req, res) => {
    try {
      const { publicIds } = req.body;
      
      if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        return res.status(400).json({ error: 'No public IDs provided' });
      }

      if (!process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({ error: 'Cloudinary API Secret not configured in environment' });
      }

      // Delete multiple assets
      const result = await cloudinary.api.delete_resources(publicIds);
      
      res.json({ success: true, result });
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
      res.status(500).json({ error: 'Failed to delete assets from Cloudinary' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
