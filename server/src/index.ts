import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { loadEnv } from './config/env.js';

async function start() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI);
  const app = createApp(env);
  const server = app.listen(env.PORT, () => console.info(`TestPilot API listening on port ${env.PORT}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error: unknown) => {
  console.error('API startup failed', error);
  process.exit(1);
});
