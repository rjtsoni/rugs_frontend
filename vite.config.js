import { defineConfig, loadEnv } from 'vite';
import { translationMiddleware } from './server/translation.js';
export default defineConfig(({ mode }) => {
  const env=loadEnv(mode,process.cwd(),'');
  const attach=server=>{server.middlewares.use(translationMiddleware(()=>process.env.GOOGLE_TRANSLATE_API_KEY||env.GOOGLE_TRANSLATE_API_KEY));};
  const apiProxy = { '/api/storefront': { target: 'http://localhost:4000', changeOrigin: true } };
  return {plugins:[{name:'aara-server-translation',configureServer:attach,configurePreviewServer:attach}],server:{proxy:apiProxy},preview:{proxy:apiProxy}};
});
