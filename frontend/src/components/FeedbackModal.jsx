import PropTypes from 'prop-types';

export default function FeedbackModal({ visible, isCorrect, title, message, reason, onContinue }) {
    if (!visible) return null;

    return (
        <div className="modal">
            <div className={`modal-content ${isCorrect ? 'success' : 'error'}`}>
                <h2>{title}</h2>
                <p>{message}</p>
                <p className="feedback-reason">{reason}</p>
                <button className={`btn modal-btn ${isCorrect ? 'btn-start' : 'btn-danger'}`} onClick={onContinue}>
                    Continuar
                </button>
            </div>
        </div>
    );
}

FeedbackModal.propTypes = {
    visible: PropTypes.bool,
    isCorrect: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    reason: PropTypes.string,
    onContinue: PropTypes.func.isRequired,
};
