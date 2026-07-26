/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const GameContext = createContext(null);

function loadStorage(key, fallback = null) {
    try {
        const item = sessionStorage.getItem(key);
        return item !== null ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        if (value === null || value === undefined) {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    } catch {
        // silencioso
    }
}

export function GameProvider({ children }) {
    const [playerName, setPlayerNameState] = useState(() => loadStorage('playerName'));
    const [gameConfig, setGameConfigState] = useState(() => loadStorage('gameConfig'));
    const [reportData, setReportDataState] = useState(() => loadStorage('reportData'));
    const [rankings, setRankings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('rankings') || '[]');
        } catch {
            return [];
        }
    });

    // Modo turma com persistência em sessionStorage
    const [isClassMode, setIsClassModeState] = useState(() => loadStorage('isClassMode', false));
    const [sessionCode, setSessionCodeState] = useState(() => loadStorage('sessionCode'));
    const [playerId, setPlayerIdState] = useState(() => loadStorage('playerId'));
    const [callIndices, setCallIndicesState] = useState(() => loadStorage('callIndices'));
    const [sessionRankings, setSessionRankings] = useState([]);

    const setPlayerName = (val) => { setPlayerNameState(val); saveStorage('playerName', val); };
    const setGameConfig = (val) => { setGameConfigState(val); saveStorage('gameConfig', val); };
    const setReportData = (val) => { setReportDataState(val); saveStorage('reportData', val); };
    const setIsClassMode = (val) => { setIsClassModeState(val); saveStorage('isClassMode', val); };
    const setSessionCode = (val) => { setSessionCodeState(val); saveStorage('sessionCode', val); };
    const setPlayerId = (val) => { setPlayerIdState(val); saveStorage('playerId', val); };
    const setCallIndices = (val) => { setCallIndicesState(val); saveStorage('callIndices', val); };

    function addRankingEntry(entry) {
        setRankings(prev => {
            const updated = [...prev, entry]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            localStorage.setItem('rankings', JSON.stringify(updated));
            return updated;
        });
    }

    function clearRankings() {
        setRankings([]);
        localStorage.removeItem('rankings');
    }

    function resetClassMode() {
        setIsClassMode(false);
        setSessionCode(null);
        setPlayerId(null);
        setCallIndices(null);
        setGameConfig(null);
        setReportData(null);
        setSessionRankings([]);
    }

    return (
        <GameContext.Provider value={{
            playerName, setPlayerName,
            gameConfig, setGameConfig,
            reportData, setReportData,
            rankings, addRankingEntry, clearRankings,
            isClassMode, setIsClassMode,
            sessionCode, setSessionCode,
            playerId, setPlayerId,
            callIndices, setCallIndices,
            sessionRankings, setSessionRankings,
            resetClassMode,
        }}>
            {children}
        </GameContext.Provider>
    );
}

GameProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useGame() {
    return useContext(GameContext);
}
