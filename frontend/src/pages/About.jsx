import { useNavigate } from 'react-router-dom';

export default function About() {
    const navigate = useNavigate();

    return (
        <div className="about-page">
            <div className="about-container">
                <div className="about-header">
                    <h1>Tech Squad Manager</h1>
                    <p className="tagline">Gamificação das Profissões de TI</p>
                </div>

                <div className="about-section">
                    <h2>Sobre o Projeto</h2>
                    <p>
                        Tech Squad Manager é um jogo educacional desenvolvido para estudantes do
                        ensino técnico em informática. O objetivo é apresentar de forma prática e
                        divertida as principais áreas de atuação profissional na área de TI.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Como Jogar</h2>
                    <p>
                        Você assume o papel de gerente de uma equipe de TI. Chamados de suporte chegam
                        e você deve delegá-los ao profissional correto: Frontend, Backend, DevOps, UX/UI,
                        QA ou Dados. Cada acerto aumenta sua pontuação. Erros custam vidas!
                    </p>
                </div>

                <div className="about-section">
                    <h2>Autores</h2>
                    <ul>
                        <li>Nataniel Cesar da Silva</li>
                    </ul>
                </div>

                <div className="about-section">
                    <h2>Instituição</h2>
                    <p>Universidade Federal da Paraíba (UFPB) — Campus IV, Rio Tinto, 2025</p>
                    <p>Estágio Supervisionado III — Ciência da Computação</p>
                </div>

                <button className="btn btn-about btn-back" onClick={() => navigate('/')}>
                    Voltar ao Menu
                </button>
            </div>
        </div>
    );
}
