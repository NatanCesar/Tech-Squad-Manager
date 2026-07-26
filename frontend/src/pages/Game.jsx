import { useReducer, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { allCalls } from '../data/calls.js';
import { api } from '../services/api.js';
import { connectToSession, getSocket } from '../services/socket.js';
import HUD from '../components/HUD.jsx';
import TimerBar from '../components/TimerBar.jsx';
import CallCard from '../components/CallCard.jsx';
import DropZone from '../components/DropZone.jsx';
import FeedbackModal from '../components/FeedbackModal.jsx';

const roleLabels = {
    frontend: 'Frontend',
    backend: 'Backend',
    devops: 'DevOps',
    ux: 'UX/UI',
    qa: 'QA',
    data: 'Dados',
};

const dropZones = [
    { role: 'frontend', label: 'Frontend' },
    { role: 'backend',  label: 'Backend'  },
    { role: 'devops',   label: 'DevOps'   },
    { role: 'ux',       label: 'UX/UI'    },
    { role: 'qa',       label: 'QA'       },
    { role: 'data',     label: 'Dados'    },
];

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildInitialState(config, orderedCalls) {
    if (!config) return null;
    return {
        score: 0,
        lives: config.lives || 3,
        remainingCalls: config.totalCalls || 5,
        timeLeft: config.timePerCall || 30,
        currentCall: null,
        shuffledCalls: (orderedCalls && orderedCalls.length > 0) ? orderedCalls : shuffle(allCalls),
        callIndex: 0,
        feedback: null,       // { isCorrect, title, message, reason }
        gameOver: false,
        resetSignal: 0,       // incrementado a cada novo chamado para resetar TimerBar
        answersLog: [],       // respostas acumuladas para envio no modo turma
    };
}

function reducer(state, action) {
    if (!state) return state;

    switch (action.type) {
        case 'LOAD_CALL': {
            let { shuffledCalls, callIndex } = state;
            if (!shuffledCalls || shuffledCalls.length === 0) {
                shuffledCalls = shuffle(allCalls);
                callIndex = 0;
            }
            if (callIndex >= shuffledCalls.length) {
                shuffledCalls = shuffle(allCalls);
                callIndex = 0;
            }
            const currentCall = shuffledCalls[callIndex] || null;
            return {
                ...state,
                currentCall,
                shuffledCalls,
                callIndex: callIndex + 1,
                remainingCalls: state.remainingCalls - 1,
                timeLeft: action.timePerCall,
                feedback: null,
                resetSignal: state.resetSignal + 1,
            };
        }
        case 'TICK':
            return { ...state, timeLeft: state.timeLeft - 1 };
        case 'CORRECT_ANSWER':
            return {
                ...state,
                score: state.score + 100,
                answersLog: [...state.answersLog, {
                    callIndex: action.callIndex,
                    chosenRole: action.chosenRole,
                    correctRole: state.currentCall ? state.currentCall.role : '',
                    isCorrect: true,
                    timeSpent: action.timeSpent,
                }],
                feedback: {
                    isCorrect: true,
                    title: 'Boa decisão!',
                    message: state.currentCall ? `O ${roleLabels[state.currentCall.role]} é responsável por esse tipo de chamado.` : '',
                    reason: state.currentCall ? state.currentCall.reason : '',
                },
            };
        case 'WRONG_ANSWER':
            return {
                ...state,
                lives: state.lives - 1,
                answersLog: [...state.answersLog, {
                    callIndex: action.callIndex,
                    chosenRole: action.chosenRole ?? null,
                    correctRole: state.currentCall ? state.currentCall.role : '',
                    isCorrect: false,
                    timeSpent: action.timeSpent,
                }],
                feedback: {
                    isCorrect: false,
                    title: 'Atenção!',
                    message: state.currentCall ? `Quem deveria resolver isso é o ${roleLabels[state.currentCall.role]}.` : '',
                    reason: state.currentCall ? state.currentCall.reason : '',
                },
            };
        case 'CLOSE_FEEDBACK':
            return { ...state, feedback: null };
        case 'END_GAME':
            return { ...state, gameOver: true, feedback: null };
        default:
            return state;
    }
}

export default function Game() {
    const { gameConfig, setReportData, addRankingEntry, playerName,
            isClassMode, playerId, sessionCode, callIndices, setSessionRankings } = useGame();
    const navigate = useNavigate();

    // Redireciona se gameConfig estiver ausente
    useEffect(() => {
        if (!gameConfig) {
            navigate(isClassMode ? '/join' : '/');
        }
    }, [gameConfig, isClassMode, navigate]);

    // Reconecta socket e escuta eventos no modo turma
    useEffect(() => {
        if (isClassMode && sessionCode && playerId) {
            connectToSession(sessionCode, playerId, 'player');
            const socket = getSocket();
            const handleEnded = () => {
                navigate('/class-ranking');
            };
            socket.on('session:ended', handleEnded);
            return () => {
                socket.off('session:ended', handleEnded);
            };
        }
    }, [isClassMode, sessionCode, playerId, navigate]);

    const orderedCalls = (callIndices && Array.isArray(callIndices)) ? callIndices.map(i => allCalls[i]).filter(Boolean) : null;
    const [state, dispatch] = useReducer(reducer, null, () => buildInitialState(gameConfig, orderedCalls));
    const timerRef = useRef(null);
    const callCardRef = useRef(null);
    const touchCloneRef = useRef(null);

    const score = state?.score ?? 0;
    const lives = state?.lives ?? 0;
    const remainingCalls = state?.remainingCalls ?? 0;
    const timeLeft = state?.timeLeft ?? 0;
    const currentCall = state?.currentCall ?? null;
    const feedback = state?.feedback ?? null;
    const gameOver = state?.gameOver ?? false;
    const resetSignal = state?.resetSignal ?? 0;
    const answersLog = state?.answersLog ?? [];
    const callIndex = state?.callIndex ?? 0;

    // Emite progresso em tempo real no modo turma a cada resposta
    const emitProgress = useCallback((newScore, newLives, answersCount, correctCount) => {
        if (!isClassMode || !sessionCode || !playerId) return;
        try {
            const socket = getSocket();
            if (socket && socket.connected) {
                socket.emit('player:progress', {
                    score: newScore,
                    correctAnswers: correctCount,
                    totalAnswered: answersCount,
                    livesLeft: newLives,
                });
            }
        } catch {
            // silencioso
        }
    }, [isClassMode, sessionCode, playerId]);

    // Carrega primeiro chamado
    const initialLoadDone = useRef(false);
    useEffect(() => {
        if (!gameConfig || initialLoadDone.current) return;
        initialLoadDone.current = true;
        dispatch({ type: 'LOAD_CALL', timePerCall: gameConfig.timePerCall });
    }, [gameConfig]);

    // Timer
    useEffect(() => {
        if (!currentCall || feedback || gameOver) return;
        timerRef.current = setInterval(() => {
            dispatch({ type: 'TICK' });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [currentCall, feedback, gameOver, resetSignal]);

    // Timeout
    useEffect(() => {
        if (timeLeft <= 0 && currentCall && !feedback && gameConfig) {
            clearInterval(timerRef.current);
            const currentCallIndex = (callIndices ?? [])[callIndex - 1] ?? (callIndex - 1);
            const newLives = lives - 1;
            const newScore = score;
            const answersCount = answersLog.length + 1;
            const correctCount = score / 100;

            dispatch({ type: 'WRONG_ANSWER', chosenRole: null, callIndex: currentCallIndex, timeSpent: gameConfig.timePerCall });
            emitProgress(newScore, newLives, answersCount, correctCount);
        }
    }, [timeLeft, currentCall, feedback, callIndex, callIndices, gameConfig, lives, score, answersLog.length, emitProgress]);

    // Fim de jogo
    useEffect(() => {
        if (gameOver || feedback) return;
        if (lives <= 0 || (remainingCalls <= 0 && !currentCall)) {
            dispatch({ type: 'END_GAME' });
        }
    }, [lives, remainingCalls, feedback, currentCall, gameOver]);

    useEffect(() => {
        if (!gameOver || !gameConfig) return;

        let isSubscribed = true;

        async function handleFinish() {
            const totalAnswered = gameConfig.totalCalls - remainingCalls;
            const correctAnswers = score / 100;
            const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
            const data = { score, totalAnswered, correctAnswers, levelName: gameConfig.levelName };
            setReportData(data);

            if (isClassMode && playerId) {
                try {
                    const res = await api.finishPlayer(playerId, {
                        score,
                        livesLeft: lives,
                        correctAnswers,
                        totalAnswered,
                        answers: answersLog,
                    });
                    if (res && res.rankings && isSubscribed) {
                        setSessionRankings(res.rankings);
                    }
                } catch (err) {
                    console.error('Erro ao finalizar jogador:', err);
                }
                if (isSubscribed) {
                    navigate('/class-ranking');
                }
            } else {
                addRankingEntry({
                    name: playerName || 'Anônimo',
                    score,
                    levelName: gameConfig.levelName,
                    accuracy,
                    date: new Date().toLocaleDateString('pt-BR'),
                });
                navigate('/report');
            }
        }

        handleFinish();

        return () => {
            isSubscribed = false;
        };
    }, [gameOver, addRankingEntry, answersLog, gameConfig, isClassMode, lives, navigate, playerId, playerName, remainingCalls, score, setReportData, setSessionRankings]);

    // Resposta via drop
    const handleDrop = useCallback((role) => {
        if (!currentCall || feedback || !gameConfig) return;
        clearInterval(timerRef.current);
        const timeSpent = gameConfig.timePerCall - timeLeft;
        const currentCallIndex = (callIndices ?? [])[callIndex - 1] ?? (callIndex - 1);
        const isCorrect = role === currentCall.role;
        const answersCount = answersLog.length + 1;
        const newScore = isCorrect ? score + 100 : score;
        const newLives = isCorrect ? lives : lives - 1;
        const correctCount = isCorrect ? (score / 100) + 1 : (score / 100);

        if (isCorrect) {
            dispatch({ type: 'CORRECT_ANSWER', chosenRole: role, callIndex: currentCallIndex, timeSpent });
        } else {
            dispatch({ type: 'WRONG_ANSWER', chosenRole: role, callIndex: currentCallIndex, timeSpent });
        }

        emitProgress(newScore, newLives, answersCount, correctCount);
    }, [currentCall, feedback, gameConfig, timeLeft, callIndices, callIndex, answersLog.length, score, lives, emitProgress]);

    // Continuar após feedback
    function handleContinue() {
        if (!gameConfig) return;
        if (lives <= 0 || remainingCalls <= 0) {
            dispatch({ type: 'END_GAME' });
        } else {
            dispatch({ type: 'LOAD_CALL', timePerCall: gameConfig.timePerCall });
        }
    }

    // Touch support
    useEffect(() => {
        const card = callCardRef.current;
        if (!card || !currentCall) return;

        let offsetX = 0;
        let offsetY = 0;

        function onTouchStart(e) {
            if (!currentCall) return;
            e.preventDefault();
            const touch = e.touches[0];
            const rect = card.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;

            const clone = card.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.width = rect.width + 'px';
            clone.style.zIndex = '9999';
            clone.style.opacity = '0.85';
            clone.style.pointerEvents = 'none';
            clone.style.margin = '0';
            clone.style.left = (touch.clientX - offsetX) + 'px';
            clone.style.top = (touch.clientY - offsetY) + 'px';
            document.body.appendChild(clone);
            touchCloneRef.current = clone;
        }

        function onTouchMove(e) {
            if (!touchCloneRef.current) return;
            e.preventDefault();
            const touch = e.touches[0];
            touchCloneRef.current.style.left = (touch.clientX - offsetX) + 'px';
            touchCloneRef.current.style.top = (touch.clientY - offsetY) + 'px';

            document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
            touchCloneRef.current.style.display = 'none';
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            touchCloneRef.current.style.display = '';
            const zone = el?.closest('.drop-zone');
            if (zone) zone.classList.add('drag-over');
        }

        function onTouchEnd(e) {
            if (!touchCloneRef.current) return;
            const touch = e.changedTouches[0];
            document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
            touchCloneRef.current.style.display = 'none';
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            touchCloneRef.current.remove();
            touchCloneRef.current = null;

            const zone = el?.closest('.drop-zone');
            if (zone) handleDrop(zone.dataset.role);
        }

        card.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);

        return () => {
            card.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        };
    }, [currentCall, handleDrop]);

    if (!gameConfig || !currentCall) return null;

    const callNumber = gameConfig.totalCalls - remainingCalls;

    return (
        <main className="game-container">
            <HUD
                levelName={gameConfig.levelName}
                callProgress={`${callNumber} de ${gameConfig.totalCalls}`}
                timeLeft={timeLeft}
                score={score}
                lives={lives}
            />

            <TimerBar
                timeLeft={timeLeft}
                totalTime={gameConfig.timePerCall}
                resetSignal={resetSignal}
            />

            <section className="call-area">
                <CallCard ref={callCardRef} text={currentCall.text} />
            </section>

            <section className="team-area">
                {dropZones.map(({ role, label }) => (
                    <DropZone key={role} role={role} label={label} onDrop={handleDrop} />
                ))}
            </section>

            {feedback && (
                <FeedbackModal
                    visible={true}
                    isCorrect={feedback.isCorrect}
                    title={feedback.title}
                    message={feedback.message}
                    reason={feedback.reason}
                    onContinue={handleContinue}
                />
            )}
        </main>
    );
}
