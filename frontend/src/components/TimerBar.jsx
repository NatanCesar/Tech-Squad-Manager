import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function TimerBar({ timeLeft, totalTime, resetSignal }) {
    const barRef = useRef(null);

    // Reset sem animação ao carregar novo chamado
    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;
        bar.style.transition = 'none';
        bar.style.width = '100%';
        bar.style.backgroundColor = '#22c55e';
        void bar.offsetHeight; // força reflow
        bar.style.transition = '';
    }, [resetSignal]);

    // Atualiza cor e largura a cada tick
    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;
        const pct = (timeLeft / totalTime) * 100;
        bar.style.width = pct + '%';
        if (pct > 60) {
            bar.style.backgroundColor = '#22c55e';
        } else if (pct > 30) {
            bar.style.backgroundColor = '#eab308';
        } else {
            bar.style.backgroundColor = '#ef4444';
        }
    }, [timeLeft, totalTime]);

    return (
        <div className="timer-bar-container">
            <div className="timer-bar" ref={barRef} />
        </div>
    );
}

TimerBar.propTypes = {
    timeLeft: PropTypes.number.isRequired,
    totalTime: PropTypes.number.isRequired,
    resetSignal: PropTypes.number.isRequired,
};
