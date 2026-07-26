import { useState } from 'react';
import PropTypes from 'prop-types';

export default function DropZone({ role, label, onDrop }) {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            className={`drop-zone drop-zone--${role}${isDragOver ? ' drag-over' : ''}`}
            data-role={role}
            onClick={() => onDrop(role)}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={() => { setIsDragOver(false); onDrop(role); }}
        >
            {label}
        </div>
    );
}

DropZone.propTypes = {
    role: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onDrop: PropTypes.func.isRequired,
};
