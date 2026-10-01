import http from 'http';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { config } from './config/index.js';
import { initSocketIO } from './socket/index.js';

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB first — fail fast if DB is unreachable
    await connectDatabase();

    const app = createApp();
    const server = http.createServer(app);

    // Attach Socket.io to the unified HTTP server
    initSocketIO(server);

    server.listen(config.port, () => {
      console.log(`[server] Running on http://localhost:${config.port} (${config.env})`);
      console.log(`[server] API base URL: http://localhost:${config.port}/api/v1`);
      console.log(`[server] Socket.io attached and listening`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`\n[server] ${signal} received. Shutting down...`);
      server.close(() => {
        console.log('[server] HTTP and Socket.io server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[server] Failed to start: ${message}`);
    process.exit(1);
  }
}

startServer();
