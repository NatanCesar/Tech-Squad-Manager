import PropTypes from 'prop-types';

export default function HUD({ levelName, callProgress, timeLeft, score, lives }) {
    return (
        <header className="hud">
            <div className="hud-stat">
                <span className="hud-value">{levelName}</span>
                <span className="hud-label">Nível</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
                <span className="hud-value">{callProgress}</span>
                <span className="hud-label">Chamado</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
                <span className={`hud-value hud-time${timeLeft <= 5 ? ' hud-time--urgent' : ''}`}>{timeLeft}s</span>
                <span className="hud-label">Tempo</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
                <span className="hud-value hud-score">{score}</span>
                <span className="hud-label">Pontos</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
                <span className="hud-value hud-lives">{lives}</span>
                <span className="hud-label">Vidas</span>
            </div>
        </header>
    );
}

HUD.propTypes = {
    levelName: PropTypes.string,
    callProgress: PropTypes.string,
    timeLeft: PropTypes.number,
    score: PropTypes.number,
    lives: PropTypes.number,
};
