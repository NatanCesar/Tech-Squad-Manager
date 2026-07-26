import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { api } from '../services/api.js';
import { connectToSession, getSocket } from '../services/socket.js';

export default function Lobby() {
    const { sessionCode, playerId, playerName, setCallIndices, resetClassMode } = useGame();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (!sessionCode) {
            navigate('/join');
            return;
        }

        connectToSession(sessionCode, playerId, 'player');

        api.getSession(sessionCode)
            .then(data => {
                if (data.status === 'ENDED') {
                    resetClassMode();
                    navigate('/');
                    return;
                }
                if (data.players) {
                    setPlayers(data.players);
                }
            })
            .catch(err => console.error('Erro ao buscar sessão no lobby:', err));

        const socket = getSocket();

        socket.on('session:player_joined', ({ player }) => {
            setPlayers(prev => {
                if (prev.find(p => p.id === player.id)) return prev;
                return [...prev, player];
            });
        });

        socket.on('session:player_left', ({ playerId: leftId }) => {
            setPlayers(prev => prev.filter(p => p.id !== leftId));
        });

        socket.on('session:started', ({ callIndices }) => {
            if (callIndices) setCallIndices(callIndices);
            navigate('/game');
        });

        socket.on('session:ended', () => {
            resetClassMode();
            navigate('/');
        });

        return () => {
            socket.off('session:player_joined');
            socket.off('session:player_left');
            socket.off('session:started');
            socket.off('session:ended');
        };
    }, [sessionCode, playerId, navigate, setCallIndices, resetClassMode]);

    return (
        <div className="menu-page">
            <div className="menu-container" style={{ maxWidth: '500px' }}>
                <h1 className="page-title">Sala de Espera</h1>

                <p style={{ color: '#94a3b8', marginBottom: '8px' }}>Código da turma:</p>
                <p style={{
                    fontSize: 'clamp(1.8rem, 8vw, 2.5rem)',
                    fontWeight: 'bold',
                    letterSpacing: '0.2em',
                    color: '#38bdf8',
                    marginBottom: '24px',
                    wordBreak: 'break-all',
                }}>
                    {sessionCode}
                </p>

                <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                    Aguardando o professor iniciar o jogo...
                </p>

                <div style={{ textAlign: 'left', width: '100%' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        Jogadores conectados ({players.length}):
                    </p>
                    {players.length === 0 ? (
                        <p style={{ color: '#475569' }}>Ninguém ainda...</p>
                    ) : (
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {players.map(p => (
                                <li key={p.id} style={{
                                    background: 'rgba(56,189,248,0.08)',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    color: p.name === playerName ? '#38bdf8' : 'white',
                                }}>
                                    {p.name} {p.name === playerName && '(você)'}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="loading-dots" style={{ marginTop: '24px', color: '#475569' }}>
                    ⏳ Aguardando início...
                </div>
            </div>
        </div>
    );
}
