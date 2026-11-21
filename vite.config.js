import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const SERVER_ENV_KEYS = [
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'GROQ_API_KEY',
  'GROQ_MODEL',
  'OPENROUTER_API_KEY',
  'OPENROUTER_MODEL',
];

function createApiMiddleware(loadHandler) {
  return async (req, res) => {
    try {
      const handler = await loadHandler();
      if (!handler) {
        res.statusCode = 501;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API handler not implemented.' }));
        return;
      }
      await handler(req, res);
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
        })
      );
    }
  };
}

function localApiPlugin() {
  let previewSsrServer = null;

  const getPreviewServer = async () => {
    if (!previewSsrServer) {
      const { createServer } = await import('vite');
      previewSsrServer = await createServer({
        server: { middlewareMode: true },
        appType: 'custom',
      });
    }
    return previewSsrServer;
  };

  return {
    name: 'local-api-generate-campaign',
    configureServer(server) {
      server.middlewares.use(
        '/api/generate-campaign',
        createApiMiddleware(async () => {
          const mod = await server.ssrLoadModule('/api/generate-campaign.js');
          return typeof mod.default === 'function' ? mod.default : null;
        })
      );
    },
    configurePreviewServer(server) {
      server.middlewares.use(
        '/api/generate-campaign',
        createApiMiddleware(async () => {
          const ssr = await getPreviewServer();
          const mod = await ssr.ssrLoadModule('/api/generate-campaign.js');
          return typeof mod.default === 'function' ? mod.default : null;
        })
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of SERVER_ENV_KEYS) {
    if (!process.env[key] && env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), localApiPlugin()],
  };
});
