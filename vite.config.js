import { defineConfig, loadEnv } from 'vite';
import { translationMiddleware } from './server/translation.js';
import { seoMiddleware } from './server.js';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const attach = server => {
    server.middlewares.use(seoMiddleware(() => env.VITE_API_URL || process.env.VITE_API_URL || (mode === 'development' ? 'http://localhost:4000' : 'https://rug-backend.onrender.com')));
    server.middlewares.use(translationMiddleware(() => process.env.GOOGLE_TRANSLATE_API_KEY || env.GOOGLE_TRANSLATE_API_KEY));
  };
  const apiProxy = { '/api/storefront': { target: 'http://localhost:4000', changeOrigin: true } };
  return { plugins: [{ name: 'Tanu-Rugs-server-translation', configureServer: attach, configurePreviewServer: attach }], server: { proxy: apiProxy }, preview: { proxy: apiProxy } };
});
