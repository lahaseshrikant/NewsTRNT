import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';

let io: Server;

/**
 * Initialize Socket.io with Redis pub/sub adapter for cross-service events.
 * Users subscribe to rooms for real-time article updates, breaking news, etc.
 */
export const initializeSocketIO = async (httpServer: HttpServer): Promise<Server> => {
  const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: clientUrls,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ── Redis subscriber for cross-service events ──────────────────────────
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const subscriber = createClient({ url: redisUrl });
    await subscriber.connect();

    // Listen for events published by admin-backend (e.g. article published)
    await subscriber.subscribe('article:published', (message) => {
      const data = JSON.parse(message);
      io.to('feed').emit('article:new', data);
    });

    await subscriber.subscribe('article:updated', (message) => {
      const data = JSON.parse(message);
      io.to(`article:${data.id}`).emit('article:updated', data);
    });

    await subscriber.subscribe('breaking:news', (message) => {
      const data = JSON.parse(message);
      io.emit('breaking:news', data); // broadcast to ALL connected users
    });

    await subscriber.subscribe('market:update', (message) => {
      const data = JSON.parse(message);
      io.to('market').emit('market:update', data);
    });

    console.log('📡 Socket.io Redis subscriber connected');
  } catch (error) {
    console.error('⚠️  Socket.io Redis subscriber failed:', (error as Error).message);
    console.log('   Real-time will work locally but not cross-service');
  }

  // ── Connection handler ─────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join the global feed room
    socket.join('feed');

    // Join article-specific room for live comment updates
    socket.on('article:join', (articleId: string) => {
      socket.join(`article:${articleId}`);
    });

    socket.on('article:leave', (articleId: string) => {
      socket.leave(`article:${articleId}`);
    });

    // Join market room for real-time market data
    socket.on('market:join', () => {
      socket.join('market');
    });

    socket.on('market:leave', () => {
      socket.leave('market');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  console.log('📡 Socket.io initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocketIO first.');
  }
  return io;
};

export { io };
