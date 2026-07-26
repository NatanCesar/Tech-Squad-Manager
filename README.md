# Tech Squad Manager 🎮

> **Gamificação das Profissões de TI**

Plataforma educacional e jogo interativo voltado ao apoio do ensino técnico e superior em Informática e Tecnologia da Informação, apresentando de forma prática e divertida as principais áreas de atuação profissional do mercado de TI.

---

## 📌 Sobre o Projeto

O **Tech Squad Manager** é um jogo educacional desenvolvido para auxiliar estudantes a compreenderem o ecossistema de funções e responsabilidades dentro de uma equipe de tecnologia.

O sistema simula o dia a dia do gerenciamento de chamados de suporte e desenvolvimento, permitindo que os alunos pratiquem o reconhecimento de competências de cada perfil profissional de forma dinâmica, ativa e gamificada.

### 🎯 Objetivos
* Apresentar o mercado de trabalho de TI e suas especialidades de forma prática.
* Desenvolver a tomada de decisão e resolução de problemas em equipe.
* Estimular a aprendizagem ativa e engajadora por meio da gamificação.
* Apoiar professores e instrutores em atividades pedagógicas interativas.

---

## 🕹️ Como Jogar

1. **Assuma a Gerência:** Você assume o papel de **Gerente de Equipe de TI**.
2. **Receba os Chamados:** Chamados de suporte e demandas técnicas chegam continuamente à sua tela.
3. **Delegue ao Profissional Correto:** Analise a descrição da demanda e direcione o chamado para uma das áreas especializadas:
   * 🎨 **UX/UI Design:** Interfaces, prototipagem, usabilidade e experiência do usuário.
   * 💻 **Frontend:** Telas, componentes visuais, interatividade e integração web.
   * ⚙️ **Backend:** APIs, regras de negócio, banco de dados e arquitetura de servidores.
   * 🛠️ **DevOps:** CI/CD, infraestrutura em nuvem, automação e servidores.
   * 🧪 **QA (Quality Assurance):** Testes de software, garantia de qualidade e identificação de bugs.
   * 📊 **Dados (Data/BI):** Análise de dados, pipelines, dashboards e engenharia de dados.
4. **Pontue e Sobreviva:** Cada delegação correta aumenta sua pontuação final. Cuidado: **erros custam vidas!**

---

## ✨ Principais Funcionalidades

* 🚀 **Comunicação em Tempo Real:** Conexão instantânea via WebSockets (Socket.IO).
* 🎮 **Salas e Sessões Multiplayer:** Criação e ingresso em partidas através de códigos únicos.
* ⚙️ **Configuração de Dificuldade:** Ajuste de número de chamados, tempo por rodada e quantidade de vidas.
* 📊 **Feedback e Histórico:** Relatório detalhado das respostas ao final de cada partida para revisão pedagógica.
* 📱 **Interface Intuitiva:** Design focado em UX/UI com visual moderno e responsivo.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **[React 18](https://react.dev/)** — Biblioteca para construção de interfaces web
* **[Vite](https://vitejs.dev/)** — Build tool rápida e otimizada
* **[React Router DOM](https://reactrouter.com/)** — Roteamento dinâmico no cliente
* **[Socket.IO Client](https://socket.io/)** — Cliente WebSocket para eventos em tempo real

### Backend
* **[Node.js](https://nodejs.org/)** — Ambiente de execução JavaScript
* **[Express](https://expressjs.com/)** — Framework web minimalista
* **[Socket.IO](https://socket.io/)** — Comunicação bidirecional em tempo real
* **[Prisma ORM](https://www.prisma.io/)** — Mapeamento objeto-relacional moderno

### Banco de Dados
* **[PostgreSQL](https://www.postgresql.org/)** — Banco de dados relacional robusto

---

## 📁 Estrutura do Projeto

```text
Tech-Squad-Manager/
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas principais (Home, Game, About, etc.)
│   │   ├── services/        # Configuração de Socket e chamadas de API
│   │   └── App.jsx
│   ├── public/              # Ativos estáticos
│   ├── vite.config.js       # Configuração do Vite e Proxy
│   └── package.json
│
├── backend/
│   ├── prisma/              # Migrações e Schema do Prisma
│   ├── src/
│   │   ├── controllers/     # Lógica de controle dos endpoints
│   │   ├── socket/          # Manipuladores de eventos WebSocket
│   │   └── server.js        # Ponto de entrada do servidor
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **PostgreSQL** instalado e em execução
* Gerenciador de pacotes **npm** ou **yarn**

---

### 1. Clonar o Repositório

```bash
git clone https://github.com/NatanCesar/Tech-Squad-Manager.git
cd Tech-Squad-Manager
```

---

### 2. Configurar e Executar o Backend

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Ajuste a variável `DATABASE_URL` no `.env` com suas credenciais do PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/tech_squad_manager"
   FRONTEND_ORIGIN="*"
   PORT=3001
   ```

5. Execute as migrações do banco de dados e gere o cliente Prisma:
   ```bash
   npm run db:migrate
   ```

6. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   > O servidor estará rodando em `http://localhost:3001`

---

### 3. Configurar e Executar o Frontend

1. Abra um novo terminal e acesse a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie a aplicação React:
   ```bash
   npm run dev
   ```
   > A aplicação estará disponível em `http://localhost:5173/Tech-Squad-Manager/`

---

## 📜 Scripts Disponíveis

### Backend
* `npm run dev`: Inicia o servidor com reload automático (`node --watch`).
* `npm start`: Inicia o servidor em modo produção.
* `npm run db:migrate`: Executa as migrações do Prisma no banco de dados.
* `npm run db:generate`: Atualiza o Prisma Client.
* `npm run db:studio`: Abre a interface visual do Prisma Studio.

### Frontend
* `npm run dev`: Inicia o servidor de desenvolvimento do Vite.
* `npm run build`: Compila o projeto para produção.
* `npm run preview`: Visualiza o build de produção localmente.

---

## 👨‍💻 Autores & Contexto Acadêmico

* **Desenvolvedor:** Nataniel Cesar da Silva
* **Instituição:** Universidade Federal da Paraíba (UFPB) — Campus IV, Rio Tinto (2025)
* **Curso:** Bacharelado em Ciência da Computação
* **Disciplina:** Estágio Supervisionado III

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
