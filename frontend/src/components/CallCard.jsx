import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const CallCard = forwardRef(function CallCard({ text }, ref) {
    return (
        <div className="call-card" draggable="true" ref={ref} id="callCard">
            <span className="call-card-label">Chamado Recebido</span>
            <p>{text}</p>
            <span className="call-card-hint">Arraste para a equipe correta</span>
        </div>
    );
});

CallCard.propTypes = {
    text: PropTypes.string.isRequired,
};

export default CallCard;
