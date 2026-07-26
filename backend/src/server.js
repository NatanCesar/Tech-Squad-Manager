import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import sessionsRouter from './routes/sessions.js';
import { registerSocketHandlers } from './socket/handlers.js';

const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: allowedOrigin === '*' ? '*' : allowedOrigin },
});

app.use(cors({ origin: allowedOrigin === '*' ? '*' : allowedOrigin }));
app.use(express.json());

// Injeta io em cada request para os controllers emitirem eventos
app.use((req, _res, next) => {
    req.io = io;
    next();
});

app.use('/api', sessionsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT} (disponível na rede local em http://0.0.0.0:${PORT})`);
});
