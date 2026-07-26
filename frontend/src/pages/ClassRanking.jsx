import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useGame } from '../context/GameContext.jsx';
import { connectToSession, getSocket, disconnectSocket } from '../services/socket.js';
import { api } from '../services/api.js';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MEDAL_COLORS = { 1: '#fbbf24', 2: '#94a3b8', 3: '#cd7c3a' };

function PodiumBar({ player, playerId, height, rank }) {
    const isMe = player?.playerId === playerId;
    const color = MEDAL_COLORS[rank] || '#38bdf8';
    return (
        <div className="podium-slot" style={{ '--bar-height': height }}>
            <div className={`podium-name${isMe ? ' podium-name--me' : ''}`}>
                <span>{MEDALS[rank]}</span>
                <span>{player?.name ?? '—'}</span>
            </div>
            <div className="podium-score" style={{ color }}>
                {player?.score ?? 0} <span>pts</span>
            </div>
            <div className="podium-bar" style={{ background: color }}>
                <span className="podium-rank">{rank}º</span>
            </div>
        </div>
    );
}

PodiumBar.propTypes = {
    player: PropTypes.shape({
        playerId: PropTypes.string,
        name: PropTypes.string,
        score: PropTypes.number,
    }),
    playerId: PropTypes.string,
    height: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
};

export default function ClassRanking() {
    const { sessionCode, playerId, reportData, resetClassMode, sessionRankings } = useGame();
    const navigate = useNavigate();
    const [rankings, setRankings] = useState(sessionRankings || []);
    const [allFinished, setAllFinished] = useState(false);
    const [loading, setLoading] = useState(!sessionRankings || sessionRankings.length === 0);

    useEffect(() => {
        if (!sessionCode) {
            navigate('/');
            return;
        }

        connectToSession(sessionCode, playerId, 'player');

        api.getRanking(sessionCode)
            .then(data => {
                if (data.rankings) setRankings(data.rankings);
                if (data.status === 'ENDED') setAllFinished(true);
            })
            .catch(() => {})
            .finally(() => setLoading(false));

        const socket = getSocket();
        socket.on('session:ranking_updated', ({ rankings }) => {
            setRankings(rankings);
            setLoading(false);
        });
        socket.on('session:all_finished', ({ rankings }) => {
            setRankings(rankings);
            setAllFinished(true);
            setLoading(false);
        });
        socket.on('session:ended', () => setAllFinished(true));

        return () => {
            socket.off('session:ranking_updated');
            socket.off('session:all_finished');
            socket.off('session:ended');
        };
    }, [sessionCode, playerId, navigate]);

    function handleLeave() {
        disconnectSocket();
        resetClassMode();
        navigate('/');
    }

    const top3 = [1, 2, 3].map(pos => rankings.find(r => r.position === pos) ?? null);
    const myRank = rankings.find(r => r.playerId === playerId);

    return (
        <main className="ranking-page">
            <div className="ranking-container">

                {/* Header */}
                <div className="ranking-header">
                    <h1 className="ranking-title">Ranking da Turma</h1>
                    <div className={`ranking-status ${allFinished ? 'ranking-status--done' : 'ranking-status--live'}`}>
                        {allFinished ? (
                            <>🏁 <span>Sessão encerrada</span></>
                        ) : (
                            <><span className="live-dot" /> <span>Ao vivo</span></>
                        )}
                    </div>
                </div>

                {/* My score pill */}
                {reportData && (
                    <div className="ranking-my-score">
                        <div className="ranking-my-score__left">
                            <span className="ranking-my-score__label">Sua pontuação</span>
                            <span className="ranking-my-score__pos">
                                {myRank ? `#${myRank.position}` : '—'}
                            </span>
                        </div>
                        <div className="ranking-my-score__right">
                            <span className="ranking-my-score__pts">{reportData.score} pts</span>
                            <span className="ranking-my-score__acc">
                                {reportData.correctAnswers}/{reportData.totalAnswered} corretos · {myRank?.accuracy ?? (reportData.totalAnswered > 0 ? Math.round((reportData.correctAnswers / reportData.totalAnswered) * 100) : 0)}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Podium */}
                {rankings.length >= 2 && (
                    <div className="podium">
                        <PodiumBar player={top3[1]} playerId={playerId} height="90px" rank={2} />
                        <PodiumBar player={top3[0]} playerId={playerId} height="130px" rank={1} />
                        <PodiumBar player={top3[2]} playerId={playerId} height="70px" rank={3} />
                    </div>
                )}

                {/* Full table */}
                <div className="ranking-table-wrap">
                    {loading && rankings.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                            Carregando classificação da turma...
                        </p>
                    ) : (
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Jogador</th>
                                    <th>Pts</th>
                                    <th>Acerto</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map(r => {
                                    const isMe = r.playerId === playerId;
                                    const color = MEDAL_COLORS[r.position];
                                    return (
                                        <tr
                                            key={r.playerId}
                                            className={`ranking-row${isMe ? ' ranking-row--me' : ''}`}
                                            style={color ? { '--row-accent': color } : {}}
                                        >
                                            <td className="ranking-pos">
                                                {MEDALS[r.position] ?? <span style={{ color: '#475569' }}>{r.position}</span>}
                                            </td>
                                            <td className="ranking-name">
                                                <span className="ranking-name-inner">
                                                    {r.name}
                                                    {isMe && <span className="ranking-you-tag">você</span>}
                                                </span>
                                            </td>
                                            <td className="ranking-pts" style={color ? { color } : {}}>
                                                {r.score}
                                            </td>
                                            <td className="ranking-acc">{r.accuracy}%</td>
                                            <td className="ranking-status-cell">
                                                {r.status === 'FINISHED'
                                                    ? <span className="status-done">✓</span>
                                                    : <span className="status-playing">▶</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                                {rankings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="ranking-empty">Aguardando resultados dos outros alunos...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer action - sempre visível para não prender o usuário */}
                <button className="btn primary ranking-btn-leave" onClick={handleLeave}>
                    Voltar ao Menu Principal
                </button>
            </div>
        </main>
    );
}
