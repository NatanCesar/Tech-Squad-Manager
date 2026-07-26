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

### ⚡ Modo Rápido (Execução Simplificada)

1. **Instalar todas as dependências (Backend e Frontend):**
   ```bash
   npm run setup
   ```

2. **Iniciar Servidores Backend e Frontend:**
   ```bash
   npm run dev
   ```
   > 🚀 O script detectará automaticamente o seu **IP local** e exibirá no terminal o link pronto para a turma acessar!

---

## 🌐 Hospedagem em Rede Local / Offline (Sem Internet)

O **Tech Squad Manager** pode ser hospedado localmente no seu computador para jogar em salas de aula, laboratórios ou eventos **sem depender de conexão com a internet**. Basta que os dispositivos estejam na **mesma rede Wi-Fi ou cabo (LAN)**.

### 📋 Passo a Passo para o Anfitrião (Host)

1. **Conecte na mesma rede:** Certifique-se de que o computador hospedeiro e os celulares/notebooks dos jogadores estão no mesmo Wi-Fi ou roteador local.
2. **Inicie o sistema:** Na raiz do projeto, execute:
   ```bash
   npm run dev
   ```
3. **Compartilhe o Link gerado:** O terminal exibirá um painel com o seu IP local e o link exato:
   ```text
   ===============================================================
   🎮  TECH SQUAD MANAGER — SERVIDOR DE REDE LOCAL
   ===============================================================

   📌 Seu IP Local: 192.168.1.15

   👉 Link para a TURMA conectar (copie e envie):
      http://192.168.1.15:5173/Tech-Squad-Manager/

   ⚙️  Backend rodando em: http://192.168.1.15:3001
   ===============================================================
   ```
4. **Pronto!** Os alunos/jogadores só precisam abrir o link no navegador para criar e entrar nas salas.

---

### 🛠️ Resolução de Problemas Comuns em Rede Local

* 🧱 **Outras pessoas não conseguem abrir o link?**
  * **Firewall:** O Firewall do computador pode bloquear conexões de entrada. Permita a passagem do Node.js/Vite ou libere as portas `5173` (Frontend) e `3001` (Backend).
  * **Mesma Rede:** Verifique se os jogadores não estão navegando via 4G/5G ou em uma rede Wi-Fi diferente (ex: Wi-Fi Visitantes).
  * **Isolamento de AP (Wi-Fi de Escolas/Empresas):** Algumas redes Wi-Fi institucionais ativam o "AP Isolation" (Isolamento de Pontos de Acesso), que impede os dispositivos de se comunicarem entre si. Se estiver em uma rede restrita, crie um **Roteador Wi-Fi pelo próprio celular (Hotspot)** ou use um roteador local.

---

### 🛠️ Execução Manual (Modo Tradicional)

Caso prefira rodar os serviços em terminais separados:

#### 1. Executar o Backend
```bash
cd backend
npm install
npm run db:migrate
npm run dev
```
> Servidor em `http://localhost:3001` (ou `http://SEU_IP:3001`)

#### 2. Executar o Frontend
```bash
cd frontend
npm install
npm run dev
```
> Aplicação em `http://localhost:5173/Tech-Squad-Manager/` (ou `http://SEU_IP:5173/Tech-Squad-Manager/`)

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
