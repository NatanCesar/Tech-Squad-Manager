import prisma from '../lib/prisma.js';
import { allCalls } from '../data/calls.js';

// POST /players/:playerId/finish
export async function finishPlayer(req, res) {
    const { playerId } = req.params;
    const { answers } = req.body;

    const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: { session: true },
    });

    if (!player) return res.status(404).json({ error: 'Jogador não encontrado' });

    if (player.status === 'FINISHED') {
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

        return res.json({
            ok: true,
            alreadyFinished: true,
            score: player.score,
            correctAnswers: player.correctAnswers,
            totalAnswered: player.totalAnswered,
            livesLeft: player.livesLeft,
            rankings,
        });
    }

    const rawAnswers = Array.isArray(answers) ? answers : [];
    const session = player.session;
    const maxCalls = session.totalCalls;

    // Processa e valida cada resposta recebida com base nos dados oficiais do servidor
    const processedAnswers = [];
    let correctCount = 0;

    for (const a of rawAnswers) {
        if (processedAnswers.length >= maxCalls) break;

        const callIndex = Number(a.callIndex);
        if (isNaN(callIndex) || callIndex < 0 || callIndex >= allCalls.length) continue;

        const officialCall = allCalls[callIndex];
        const chosenRole = String(a.chosenRole || '');
        const correctRole = officialCall.role;
        const isCorrect = chosenRole === correctRole;
        if (isCorrect) correctCount++;

        const timeSpent = Math.max(0, Math.min(Number(a.timeSpent) || 0, session.timePerCall));

        processedAnswers.push({
            callIndex,
            chosenRole,
            correctRole,
            isCorrect,
            timeSpent,
        });
    }

    const totalAnswered = processedAnswers.length;
    const correctAnswers = correctCount;
    const score = correctAnswers * 100;
    const wrongAnswers = totalAnswered - correctAnswers;
    const livesLeft = Math.max(0, session.lives - wrongAnswers);

    const finishedAt = new Date();

    await prisma.player.update({
        where: { id: playerId },
        data: {
            status: 'FINISHED',
            score,
            livesLeft,
            correctAnswers,
            totalAnswered,
            finishedAt,
            answers: {
                create: processedAnswers,
            },
        },
    });

    // Monta ranking atualizado
    const allPlayers = await prisma.player.findMany({
        where: { sessionId: session.id },
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

    // Emite para todos na room
    req.io.to(session.code).emit('session:player_finished', {
        playerId,
        name: player.name,
        score,
        correctAnswers,
        totalAnswered,
        accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
        position: rankings.findIndex(r => r.playerId === playerId) + 1,
    });

    req.io.to(session.code).emit('session:ranking_updated', { rankings });

    // Verifica se todos terminaram
    const allFinished = allPlayers.every(p => p.id === playerId ? true : p.status === 'FINISHED');

    if (allFinished) {
        await prisma.session.update({
            where: { id: session.id },
            data: { status: 'ENDED', endedAt: new Date() },
        });
        req.io.to(session.code).emit('session:all_finished', { rankings });
    }

    res.json({ ok: true, allFinished, score, correctAnswers, totalAnswered, livesLeft, rankings });
}
