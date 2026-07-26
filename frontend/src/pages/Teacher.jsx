import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { connectToSession, disconnectSocket, getSocket } from '../services/socket.js';

const DIFFICULTIES = [
    { key: 'junior', label: 'Júnior',  desc: '5 chamados · 30s · 5 vidas' },
    { key: 'pleno',  label: 'Pleno',   desc: '8 chamados · 20s · 3 vidas' },
    { key: 'senior', label: 'Sênior',  desc: '12 chamados · 15s · 2 vidas' },
];

const ROLE_CONFIG = {
    frontend: { label: 'Frontend', color: '#3b82f6', icon: '💻' },
    backend:  { label: 'Backend',  color: '#22c55e', icon: '⚙️' },
    devops:   { label: 'DevOps',   color: '#f97316', icon: '🚀' },
    ux:       { label: 'UX/UI',    color: '#a855f7', icon: '🎨' },
    qa:       { label: 'QA',       color: '#eab308', icon: '🔍' },
    data:     { label: 'Dados',    color: '#06b6d4', icon: '📊' },
};

const roleLabels = {
    frontend: 'Frontend', backend: 'Backend', devops: 'DevOps',
    ux: 'UX/UI', qa: 'QA', data: 'Dados',
};

export default function Teacher() {
    const navigate = useNavigate();
    const [view, setView]             = useState('home');   // home | lobby | playing | report
    const [difficulty, setDifficulty] = useState('junior');
    const [session, setSession]       = useState(null);     // { code, sessionId, ... }
    const [players, setPlayers]       = useState([]);
    const [rankings, setRankings]     = useState([]);
    const [report, setReport]         = useState(null);
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState('all'); // 'all' | 'high' | 'mid' | 'low'

    const reportMetrics = useMemo(() => {
        if (!report) return null;

        const roles = ['frontend', 'backend', 'devops', 'ux', 'qa', 'data'];

        const specialtyStats = roles.map(role => {
            const catData = report.classAverage?.byCategory?.[role] || { correct: 0, total: 0 };
            const correct = catData.correct || 0;
            const total   = catData.total || 0;
            const errors  = Math.max(0, total - correct);
            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

            let statusKey = 'empty';
            let statusLabel = 'Sem dados';
            if (total > 0) {
                if (accuracy >= 80) {
                    statusKey = 'excelencia';
                    statusLabel = 'Excelência';
                } else if (accuracy >= 60) {
                    statusKey = 'bom';
                    statusLabel = 'Bom';
                } else {
                    statusKey = 'atencao';
                    statusLabel = 'Atenção';
                }
            }

            return {
                key: role,
                label: ROLE_CONFIG[role]?.label || role,
                icon: ROLE_CONFIG[role]?.icon || '📌',
                color: ROLE_CONFIG[role]?.color || '#38bdf8',
                correct,
                errors,
                total,
                accuracy,
                statusKey,
                statusLabel,
            };
        });

        const activeStats = specialtyStats.filter(s => s.total > 0);
        let bestSpecialty = null;
        let focusSpecialty = null;

        if (activeStats.length > 0) {
            const sortedByAcc = [...activeStats].sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
            bestSpecialty = sortedByAcc[0];
            focusSpecialty = sortedByAcc[sortedByAcc.length - 1];
        }

        const totalPlayers = report.players.length || 1;
        const highPlayers  = report.players.filter(p => p.accuracy >= 70);
        const midPlayers   = report.players.filter(p => p.accuracy >= 50 && p.accuracy < 70);
        const lowPlayers   = report.players.filter(p => p.accuracy < 50);

        const tiers = {
            high: { count: highPlayers.length, pct: Math.round((highPlayers.length / totalPlayers) * 100) },
            mid:  { count: midPlayers.length,  pct: Math.round((midPlayers.length / totalPlayers) * 100) },
            low:  { count: lowPlayers.length,  pct: Math.round((lowPlayers.length / totalPlayers) * 100) },
        };

        return {
            specialtyStats,
            bestSpecialty,
            focusSpecialty,
            tiers,
        };
    }, [report]);

    const filteredPlayers = useMemo(() => {
        if (!report?.players) return [];
        return report.players.filter(p => {
            const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
            if (!matchesName) return false;

            if (filterTier === 'high') return p.accuracy >= 70;
            if (filterTier === 'mid') return p.accuracy >= 50 && p.accuracy < 70;
            if (filterTier === 'low') return p.accuracy < 50;
            return true;
        });
    }, [report?.players, searchTerm, filterTier]);

    const loadReport = useCallback(async () => {
        if (!session?.code) return;
        try {
            const data = await api.getReport(session.code);
            setReport(data);
            setView('report');
        } catch (err) {
            console.error('Erro ao carregar relatório:', err);
        }
    }, [session?.code]);

    // Socket listeners ao entrar no lobby ou no jogo ao vivo
    useEffect(() => {
        if (view !== 'lobby' && view !== 'playing') return;
        if (!session?.code) return;

        if (view === 'playing') {
            api.getRanking(session.code)
                .then(data => {
                    if (data.rankings) setRankings(data.rankings);
                })
                .catch(err => console.error('Erro ao buscar ranking inicial:', err));
        } else if (view === 'lobby') {
            api.getSession(session.code)
                .then(data => {
                    if (data.players) setPlayers(data.players);
                })
                .catch(err => console.error('Erro ao buscar jogadores no lobby do professor:', err));
        }

        const socket = getSocket();

        socket.on('session:player_joined', ({ player }) => {
            setPlayers(prev => prev.find(p => p.id === player.id) ? prev : [...prev, player]);
        });
        socket.on('session:player_left', ({ playerId }) => {
            setPlayers(prev => prev.filter(p => p.id !== playerId));
        });
        socket.on('session:ranking_updated', ({ rankings }) => setRankings(rankings));
        socket.on('session:player_finished', () => {
            if (session?.code) {
                api.getRanking(session.code).then(data => setRankings(data.rankings)).catch(() => {});
            }
        });
        socket.on('session:all_finished', ({ rankings }) => {
            setRankings(rankings);
            loadReport();
        });

        return () => {
            socket.off('session:player_joined');
            socket.off('session:player_left');
            socket.off('session:ranking_updated');
            socket.off('session:player_finished');
            socket.off('session:all_finished');
        };
    }, [view, session?.code, loadReport]);

    async function handleCreate() {
        setError('');
        setLoading(true);
        try {
            const data = await api.createSession(difficulty);
            setSession(data);
            setPlayers([]);
            connectToSession(data.code, null, 'teacher');
            setView('lobby');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleStart() {
        setError('');
        setLoading(true);
        try {
            await api.startSession(session.code);
            setView('playing');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleEnd() {
        await api.endSession(session.code).catch(() => {});
        await loadReport();
    }

    function handleReset() {
        disconnectSocket();
        setSession(null);
        setPlayers([]);
        setRankings([]);
        setReport(null);
        setView('home');
    }

    // ── Views ──────────────────────────────────────────────────────────

    if (view === 'home') return (
        <div className="menu-page">
            <div className="menu-container" style={{ maxWidth: '480px' }}>
                <h1 className="page-title">Painel do Professor</h1>

                {error && <p className="error-msg">{error}</p>}

                <p style={{ color: '#94a3b8', marginBottom: '12px' }}>Selecione a dificuldade:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {DIFFICULTIES.map(d => (
                        <label key={d.key} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: difficulty === d.key ? 'rgba(56,189,248,0.12)' : 'rgba(15,23,42,0.5)',
                            border: `2px solid ${difficulty === d.key ? '#38bdf8' : '#334155'}`,
                            borderRadius: '8px', padding: '12px 16px', cursor: 'pointer',
                        }}>
                            <input type="radio" name="diff" value={d.key}
                                checked={difficulty === d.key}
                                onChange={() => setDifficulty(d.key)}
                                style={{ accentColor: '#38bdf8' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <strong>{d.label}</strong>
                                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{d.desc}</span>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="button-group">
                    <button className="btn btn-teacher" onClick={handleCreate} disabled={loading}>
                        {loading ? 'Criando...' : 'Criar Sessão'}
                    </button>
                    <button className="btn btn-about" onClick={() => navigate('/')}>
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );

    if (view === 'lobby') return (
        <div className="menu-page">
            <div className="menu-container" style={{ maxWidth: '540px' }}>
                <h1 className="page-title">Sala de Espera</h1>
                <p style={{ color: '#94a3b8', marginBottom: '4px' }}>Código para os alunos:</p>
                <p style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 'bold', letterSpacing: '0.25em', color: '#38bdf8', marginBottom: '8px', wordBreak: 'break-all' }}>
                    {session.code}
                </p>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '24px' }}>
                    {session.levelName} · {session.totalCalls} chamados · {session.timePerCall}s · {session.lives} vidas
                </p>

                {error && <p className="error-msg">{error}</p>}

                <div style={{ textAlign: 'left', width: '100%', marginBottom: '24px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        Alunos conectados ({players.length}):
                    </p>
                    {players.length === 0
                        ? <p style={{ color: '#475569' }}>Aguardando alunos...</p>
                        : <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {players.map(p => (
                                <li key={p.id} style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px' }}>
                                    {p.name}
                                </li>
                            ))}
                        </ul>
                    }
                </div>

                <div className="button-group">
                    <button className="btn primary" onClick={handleStart} disabled={loading || players.length === 0}>
                        {loading ? 'Iniciando...' : `Iniciar Jogo (${players.length} aluno${players.length !== 1 ? 's' : ''})`}
                    </button>
                </div>
            </div>
        </div>
    );

    if (view === 'playing') return (
        <main className="ranking-page">
            <div className="ranking-container">
                <div className="ranking-header">
                    <h1 className="ranking-title">Acompanhamento ao Vivo</h1>
                    <div className="ranking-status ranking-status--live">
                        <span className="live-dot" /> <span>Jogo em andamento</span>
                    </div>
                </div>

                <div className="teacher-session-info">
                    <span>{session.levelName}</span>
                    <span>{session.totalCalls} chamados</span>
                    <span>{session.timePerCall}s por chamado</span>
                    <span>{session.lives} vidas</span>
                </div>

                <div className="ranking-table-wrap" style={{ marginBottom: '24px' }}>
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Aluno</th>
                                <th>Pts</th>
                                <th>Acerto</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map(r => (
                                <tr key={r.playerId} className="ranking-row">
                                    <td className="ranking-pos">{r.position}</td>
                                    <td className="ranking-name">
                                        <span className="ranking-name-inner">{r.name}</span>
                                    </td>
                                    <td className="ranking-pts">{r.score}</td>
                                    <td className="ranking-acc">{r.accuracy}%</td>
                                    <td className="ranking-status-cell">
                                        {r.status === 'FINISHED'
                                            ? <span className="status-done">✓</span>
                                            : <span className="status-playing">▶</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {rankings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="ranking-empty">Aguardando respostas...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <button className="btn secondary ranking-btn-leave" onClick={handleEnd}>
                    Encerrar Sessão
                </button>
            </div>
        </main>
    );

    function handlePrintPDF() {
        window.print();
    }

    if (view === 'report' && report) {
        const { specialtyStats, bestSpecialty, focusSpecialty, tiers } = reportMetrics || {};

        return (
            <main className="ranking-page teacher-report-page">
                <div className="ranking-container teacher-report-container">

                    {/* Header & Quick Actions */}
                    <header className="report-header-redesign">
                        <div className="report-title-group">
                            <div className="report-badge-row">
                                <span className="report-level-badge">{report.levelName}</span>
                                {report.code && <span className="report-code-badge">Código: #{report.code}</span>}
                            </div>
                            <h1 className="ranking-title">Relatório da Turma</h1>
                            <p className="ranking-subtitle">
                                Desempenho geral da turma e domínio por área técnica
                            </p>
                        </div>
                        <div className="report-top-actions no-print">
                            <button className="btn btn-pdf" onClick={handlePrintPDF}>
                                📄 Baixar PDF
                            </button>
                            <button className="btn primary" onClick={handleReset}>
                                Nova Sessão
                            </button>
                            <button className="btn secondary" onClick={() => { disconnectSocket(); navigate('/'); }}>
                                Menu Principal
                            </button>
                        </div>
                    </header>

                    {/* 1. TOP KPI GRID */}
                    <section className="teacher-kpi-grid">
                        <div className="kpi-card">
                            <span className="kpi-card__icon">👥</span>
                            <span className="kpi-card__val">{report.totalPlayers}</span>
                            <span className="kpi-card__label">Alunos</span>
                        </div>
                        <div className="kpi-card">
                            <span className="kpi-card__icon">🏆</span>
                            <span className="kpi-card__val">{report.classAverage.score} <small>pts</small></span>
                            <span className="kpi-card__label">Média Pontos</span>
                        </div>
                        <div className="kpi-card">
                            <span className="kpi-card__icon">🎯</span>
                            <span className="kpi-card__val">{report.classAverage.accuracy}%</span>
                            <span className="kpi-card__label">Precisão Geral</span>
                        </div>
                        <div className="kpi-card kpi-card--highlight-success">
                            <span className="kpi-card__icon">🌟</span>
                            <span className="kpi-card__val">{bestSpecialty?.label || '-'}</span>
                            <span className="kpi-card__sub">{bestSpecialty ? `${bestSpecialty.accuracy}% acerto` : 'Sem dados'}</span>
                            <span className="kpi-card__label">Destaque da Turma</span>
                        </div>
                        <div className="kpi-card kpi-card--highlight-warning">
                            <span className="kpi-card__icon">⚠️</span>
                            <span className="kpi-card__val">{focusSpecialty?.label || '-'}</span>
                            <span className="kpi-card__sub">{focusSpecialty ? `${focusSpecialty.accuracy}% acerto` : 'Sem dados'}</span>
                            <span className="kpi-card__label">Ponto de Atenção</span>
                        </div>
                    </section>

                    {/* 2. INSIGHT PEDAGÓGICO */}
                    {bestSpecialty && focusSpecialty && (
                        <section className="teacher-insight-card">
                            <div className="teacher-insight-card__header">
                                <span className="teacher-insight-card__badge">💡 Feedback Pedagógico para o Professor</span>
                            </div>
                            <p className="teacher-insight-card__text">
                                A turma obteve o maior domínio na especialidade <strong>{bestSpecialty.icon} {bestSpecialty.label}</strong> com <strong>{bestSpecialty.accuracy}%</strong> de taxa de acerto.
                                {bestSpecialty.key !== focusSpecialty.key ? (
                                    <> Por outro lado, a maior concentração de erros ocorreu em <strong>{focusSpecialty.icon} {focusSpecialty.label}</strong> (<strong>{focusSpecialty.accuracy}%</strong> de acerto). Vale revisar os conceitos dessa área na próxima aula!</>
                                ) : (
                                    <> Parabéns! A turma manteve consistência ao longo da sessão.</>
                                )}
                            </p>
                        </section>
                    )}

                    {/* 3. GRÁFICO VISUAL: ERROS E ACERTOS POR ATUAÇÃO */}
                    <section className="teacher-section">
                        <div className="section-header-wrap">
                            <h2 className="section-title">Erros e Acertos por Atuação</h2>
                            <p className="section-desc">Detalhamento proporcional do desempenho da turma em cada especialidade</p>
                        </div>

                        <div className="specialty-grid">
                            {specialtyStats.map(stat => (
                                <div key={stat.key} className="specialty-card" style={{ '--role-color': stat.color }}>
                                    <div className="specialty-card__header">
                                        <div className="specialty-card__title">
                                            <span className="specialty-card__icon">{stat.icon}</span>
                                            <strong>{stat.label}</strong>
                                        </div>
                                        <span className={`status-pill status-pill--${stat.statusKey}`}>
                                            {stat.statusLabel}
                                        </span>
                                    </div>

                                    {/* Barra visual proporcional: Verde (Acertos) vs Vermelho (Erros) */}
                                    <div className="specialty-bar-wrap" title={`Acertos: ${stat.correct} | Erros: ${stat.errors}`}>
                                        {stat.total > 0 ? (
                                            <>
                                                <div
                                                    className="specialty-bar__correct"
                                                    style={{ width: `${stat.accuracy}%` }}
                                                />
                                                <div
                                                    className="specialty-bar__error"
                                                    style={{ width: `${100 - stat.accuracy}%` }}
                                                />
                                            </>
                                        ) : (
                                            <div className="specialty-bar__empty" style={{ width: '100%' }} />
                                        )}
                                    </div>

                                    <div className="specialty-card__metrics">
                                        <span className="metric-tag metric-tag--correct">
                                            <span className="dot dot--green"></span> Acertos: <strong>{stat.correct}</strong>
                                        </span>
                                        <span className="metric-tag metric-tag--error">
                                            <span className="dot dot--red"></span> Erros: <strong>{stat.errors}</strong>
                                        </span>
                                        <span className="metric-tag metric-tag--total">
                                            Aproveitamento: <strong>{stat.accuracy}%</strong> ({stat.total} chamados)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. DISTRIBUIÇÃO E FILTRO DE ALUNOS */}
                    <section className="teacher-section">
                        <div className="section-header-wrap">
                            <h2 className="section-title">Desempenho dos Alunos ({report.totalPlayers})</h2>
                            <p className="section-desc">Visão consolidada por nível de domínio e pesquisa de alunos</p>
                        </div>

                        {/* Tier distribution cards */}
                        <div className="tier-distribution-grid">
                            <div
                                className={`tier-card tier-card--high ${filterTier === 'high' ? 'active' : ''}`}
                                onClick={() => setFilterTier(filterTier === 'high' ? 'all' : 'high')}
                            >
                                <span className="tier-card__count">{tiers?.high.count || 0}</span>
                                <span className="tier-card__label">Domínio Alto (≥70%)</span>
                                <span className="tier-card__pct">{tiers?.high.pct || 0}% da turma</span>
                            </div>
                            <div
                                className={`tier-card tier-card--mid ${filterTier === 'mid' ? 'active' : ''}`}
                                onClick={() => setFilterTier(filterTier === 'mid' ? 'all' : 'mid')}
                            >
                                <span className="tier-card__count">{tiers?.mid.count || 0}</span>
                                <span className="tier-card__label">Domínio Médio (50-69%)</span>
                                <span className="tier-card__pct">{tiers?.mid.pct || 0}% da turma</span>
                            </div>
                            <div
                                className={`tier-card tier-card--low ${filterTier === 'low' ? 'active' : ''}`}
                                onClick={() => setFilterTier(filterTier === 'low' ? 'all' : 'low')}
                            >
                                <span className="tier-card__count">{tiers?.low.count || 0}</span>
                                <span className="tier-card__label">Necessita Suporte (&lt;50%)</span>
                                <span className="tier-card__pct">{tiers?.low.pct || 0}% da turma</span>
                            </div>
                        </div>

                        {/* Search & filter toolbar */}
                        <div className="student-filter-bar">
                            <div className="student-search-wrap">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Buscar aluno pelo nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="student-search-input"
                                />
                                {searchTerm && (
                                    <button className="clear-search-btn" onClick={() => setSearchTerm('')}>✕</button>
                                )}
                            </div>

                            <div className="filter-pill-group">
                                <button
                                    className={`filter-pill ${filterTier === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterTier('all')}
                                >
                                    Todos ({report.totalPlayers})
                                </button>
                                <button
                                    className={`filter-pill filter-pill--high ${filterTier === 'high' ? 'active' : ''}`}
                                    onClick={() => setFilterTier('high')}
                                >
                                    ≥ 70%
                                </button>
                                <button
                                    className={`filter-pill filter-pill--mid ${filterTier === 'mid' ? 'active' : ''}`}
                                    onClick={() => setFilterTier('mid')}
                                >
                                    50-69%
                                </button>
                                <button
                                    className={`filter-pill filter-pill--low ${filterTier === 'low' ? 'active' : ''}`}
                                    onClick={() => setFilterTier('low')}
                                >
                                    &lt; 50%
                                </button>
                            </div>
                        </div>

                        {/* Student cards grid */}
                        <div className="teacher-players-grid">
                            {filteredPlayers.map((p, i) => (
                                <div key={i} className="teacher-player-card-redesign">
                                    <div className="player-card-main-info">
                                        <div className="player-avatar">{p.name.charAt(0).toUpperCase()}</div>
                                        <div className="player-name-wrap">
                                            <span className="player-name">{p.name}</span>
                                            <span className="player-rank-position">Pontuação total: <strong>{p.score} pts</strong></span>
                                        </div>
                                        <div className="player-score-badges">
                                            <span className={`player-acc-tag ${p.accuracy >= 70 ? 'acc--high' : p.accuracy >= 50 ? 'acc--mid' : 'acc--low'}`}>
                                                {p.accuracy}% acerto
                                            </span>
                                        </div>
                                    </div>

                                    <div className="teacher-category-grid">
                                        {Object.entries(p.byCategory).map(([role, stats]) => {
                                            const isEmpty = stats.total === 0;
                                            const isAll   = !isEmpty && stats.correct === stats.total;
                                            const isNone  = !isEmpty && stats.correct === 0;
                                            return (
                                                <div
                                                    key={role}
                                                    className={`teacher-cat${isEmpty ? ' teacher-cat--empty' : isAll ? ' teacher-cat--ok' : isNone ? ' teacher-cat--fail' : ' teacher-cat--partial'}`}
                                                    title={`${ROLE_CONFIG[role]?.label || role}: ${stats.correct} acertos de ${stats.total} chamados`}
                                                >
                                                    <span className="teacher-cat__role">{ROLE_CONFIG[role]?.icon} {ROLE_CONFIG[role]?.label || role}</span>
                                                    <span className="teacher-cat__score">{stats.correct}/{stats.total}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {filteredPlayers.length === 0 && (
                                <div className="no-students-found">
                                    <p>Nenhum aluno encontrado para os filtros selecionados.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>
        );
    }

    return null;
}
