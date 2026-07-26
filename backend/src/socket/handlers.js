export function registerSocketHandlers(io) {
    io.on('connection', (socket) => {

        socket.on('session:join', ({ code, playerId, role }) => {
            socket.join(code);
            socket.data = { code, playerId, role };
        });

        socket.on('player:progress', async ({ score, correctAnswers, totalAnswered, livesLeft }) => {
            const { code, playerId } = socket.data || {};
            if (!code || !playerId) return;

            try {
                const { default: prisma } = await import('../lib/prisma.js');
                const player = await prisma.player.findUnique({ where: { id: playerId } });
                if (!player || player.status === 'FINISHED') return;

                await prisma.player.update({
                    where: { id: playerId },
                    data: {
                        score: Math.max(0, Number(score) || 0),
                        correctAnswers: Math.max(0, Number(correctAnswers) || 0),
                        totalAnswered: Math.max(0, Number(totalAnswered) || 0),
                        livesLeft: Math.max(0, Number(livesLeft) ?? player.livesLeft),
                    },
                });

                const allPlayers = await prisma.player.findMany({
                    where: { sessionId: player.sessionId },
                    orderBy: [{ score: 'desc' }, { finishedAt: 'asc' }],
                });

                const rankings = allPlayers.map((p, i) => ({
                    position: i + 1,
                    playerId: p.id,
                    name: p.name,
                    score: p.score,
                    correctAnswers: p.correctAnswers,
                    totalAnswered: p.totalAnswered,
                    accuracy: p.totalAnswered > 0 ? Math.round((p.correctAnswers / p.totalAnswered) * 100) : 0,
                    status: p.status,
                }));

                io.to(code).emit('session:ranking_updated', { rankings });
            } catch (err) {
                console.error('Erro no player:progress:', err);
            }
        });

        socket.on('disconnecting', async () => {
            const { code, playerId, role } = socket.data || {};
            if (!code || role !== 'player' || !playerId) return;

            // Notifica apenas se o jogador ainda estava em WAITING (não começou)
            try {
                const { default: prisma } = await import('../lib/prisma.js');
                const player = await prisma.player.findUnique({ where: { id: playerId } });
                if (player?.status === 'WAITING') {
                    io.to(code).emit('session:player_left', { playerId, name: player.name });
                }
            } catch {
                // silencioso — player pode não existir se desconectou antes do join REST
            }
        });
    });
}
