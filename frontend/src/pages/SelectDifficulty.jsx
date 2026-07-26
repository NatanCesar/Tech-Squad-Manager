import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import LevelCard from '../components/LevelCard.jsx';

const levelConfigs = {
    junior: {
        levelName: 'Júnior',
        totalCalls: 5,
        timePerCall: 30,
        lives: 5,
        description: 'Ideal para quem está começando a conhecer as áreas de TI.',
    },
    pleno: {
        levelName: 'Pleno',
        totalCalls: 8,
        timePerCall: 20,
        lives: 3,
        description: 'Para quem já tem alguma familiaridade com os papéis de TI.',
    },
    senior: {
        levelName: 'Sênior',
        totalCalls: 12,
        timePerCall: 15,
        lives: 2,
        description: 'Desafio máximo — rápido, muitos chamados e poucas chances.',
    },
};

export default function SelectDifficulty() {
    const { setGameConfig } = useGame();
    const navigate = useNavigate();

    function handleSelect(key) {
        setGameConfig(levelConfigs[key]);
        navigate('/game');
    }

    return (
        <div className="difficulty-page">
            <div className="difficulty-container">
                <div className="difficulty-header">
                    <h1>Selecione a Dificuldade</h1>
                    <p className="difficulty-subtitle">Escolha o nível de acordo com seu conhecimento</p>
                </div>

                <div className="levels-grid">
                    {Object.entries(levelConfigs).map(([key, config]) => (
                        <LevelCard
                            key={key}
                            levelKey={key}
                            title={config.levelName}
                            description={config.description}
                            calls={config.totalCalls}
                            timePerCall={config.timePerCall}
                            lives={config.lives}
                            onSelect={() => handleSelect(key)}
                        />
                    ))}
                </div>

                <div className="back-btn-wrapper">
                    <button className="btn btn-about" onClick={() => navigate('/')}>
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
}
