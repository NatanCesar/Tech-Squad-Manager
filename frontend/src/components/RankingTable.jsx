import PropTypes from 'prop-types';

export default function RankingTable({ rankings }) {
    if (!rankings || rankings.length === 0) {
        return (
            <p className="empty-msg">
                Nenhuma partida registrada ainda. Jogue para aparecer aqui!
            </p>
        );
    }

    return (
        <div className="ranking-table-wrap">
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Jogador</th>
                        <th>Pontos</th>
                        <th>Nível</th>
                        <th>Aproveit.</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    {rankings.map((entry, index) => (
                        <tr key={index} className={index < 3 ? `rank-${index + 1}` : ''}>
                            <td>{index + 1}</td>
                            <td>{entry.name}</td>
                            <td>{entry.score}</td>
                            <td>{entry.levelName}</td>
                            <td>{entry.accuracy}%</td>
                            <td>{entry.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

RankingTable.propTypes = {
    rankings: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            score: PropTypes.number,
            levelName: PropTypes.string,
            accuracy: PropTypes.number,
            date: PropTypes.string,
        })
    ),
};
