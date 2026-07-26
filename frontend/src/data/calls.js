export const allCalls = [
    // Frontend
    { text: "O botão não está alinhado corretamente.", role: "frontend", reason: "Alinhamento de elementos visuais é responsabilidade do Frontend, que cuida da interface e experiência visual." },
    { text: "A página não está responsiva no mobile.", role: "frontend", reason: "Responsividade e adaptação do layout para diferentes telas é tarefa do Frontend." },
    { text: "O formulário não dispara a validação corretamente.", role: "frontend", reason: "Validações de formulários no cliente são implementadas pelo Frontend." },
    { text: "A animação de transição está travando no Safari.", role: "frontend", reason: "Compatibilidade entre navegadores e correção de animações CSS é responsabilidade do Frontend." },
    { text: "A fonte customizada não está carregando corretamente.", role: "frontend", reason: "Carregamento de assets como fontes e imagens é gerenciado pelo Frontend." },
    { text: "O menu hambúrguer não abre no mobile.", role: "frontend", reason: "Interações e comportamentos da interface em dispositivos móveis são responsabilidade do Frontend." },

    // Backend
    { text: "A API está retornando erro 500.", role: "backend", reason: "Erro 500 indica falha no servidor. O Backend é responsável pela lógica de negócio e pelo funcionamento das APIs." },
    { text: "Erro de autenticação ao gerar o token JWT.", role: "backend", reason: "JWT e autenticação são processados no servidor, sendo responsabilidade do Backend." },
    { text: "Endpoint está retornando dados inconsistentes.", role: "backend", reason: "A integridade dos dados retornados por endpoints é responsabilidade do Backend." },
    { text: "A aplicação está consumindo memória excessiva no servidor.", role: "backend", reason: "Memory leaks e otimização de processos server-side são tratados pelo Backend." },
    { text: "O limite de requisições (rate limiting) não está funcionando.", role: "backend", reason: "Controle de tráfego e segurança das APIs são implementados pelo Backend." },
    { text: "Erro de CORS ao acessar a API pelo frontend.", role: "backend", reason: "Configuração de CORS é feita no servidor, sendo responsabilidade do Backend." },

    // DevOps
    { text: "Pipeline de deploy falhou.", role: "devops", reason: "Pipelines de CI/CD são gerenciados pelo DevOps, que cuida da infraestrutura e automação de entregas." },
    { text: "Servidor caiu após atualização.", role: "devops", reason: "Estabilidade de servidores e deploys seguros são gerenciados pelo DevOps." },
    { text: "Problema na configuração do ambiente de produção.", role: "devops", reason: "Configuração de ambientes (dev, staging, produção) é responsabilidade do DevOps." },
    { text: "Certificado SSL expirou e o site está inseguro.", role: "devops", reason: "Gerenciamento de certificados SSL e segurança da infraestrutura é responsabilidade do DevOps." },
    { text: "O disco do servidor está quase cheio.", role: "devops", reason: "Monitoramento e gerenciamento de recursos de servidor são responsabilidade do DevOps." },
    { text: "Container Docker não está iniciando após a atualização.", role: "devops", reason: "Gerenciamento de containers e orquestração são responsabilidade do DevOps." },

    // UX/UI
    { text: "Usuários estão confusos com o layout.", role: "ux", reason: "Problemas de usabilidade e clareza da interface são resolvidos pelo UX/UI, especialista em experiência do usuário." },
    { text: "Fluxo de cadastro está confuso.", role: "ux", reason: "Fluxos de navegação e experiência do usuário são analisados e corrigidos pelo UX/UI." },
    { text: "Ícones não deixam claro sua funcionalidade.", role: "ux", reason: "Clareza visual e comunicação dos elementos de interface são responsabilidade do UX/UI." },
    { text: "A paleta de cores do sistema não é consistente.", role: "ux", reason: "Consistência visual e design system são definidos e mantidos pelo UX/UI." },
    { text: "O formulário de checkout tem etapas demais e os usuários desistem.", role: "ux", reason: "Simplificação de fluxos para reduzir fricção do usuário é responsabilidade do UX/UI." },

    // QA
    { text: "Bug crítico encontrado em produção.", role: "qa", reason: "O QA é responsável por garantir a qualidade do software, investigando e documentando bugs encontrados." },
    { text: "Funcionalidade quebrou após nova release.", role: "qa", reason: "Testes de regressão para garantir que novas releases não quebrem funcionalidades são responsabilidade do QA." },
    { text: "Erro intermitente ao finalizar pedido.", role: "qa", reason: "Identificar e reproduzir erros intermitentes para reportar ao time correto é função do QA." },
    { text: "A cobertura de testes caiu abaixo do limite mínimo.", role: "qa", reason: "Monitorar e garantir a cobertura de testes automatizados é responsabilidade do QA." },
    { text: "Testes automatizados passam localmente mas falham na CI.", role: "qa", reason: "Investigar e corrigir instabilidades nos testes automatizados é responsabilidade do QA." },

    // Dados
    { text: "Consulta ao banco está lenta.", role: "data", reason: "Otimização de queries e desempenho de banco de dados é responsabilidade da área de Dados." },
    { text: "Relatório está apresentando dados duplicados.", role: "data", reason: "Duplicidade e consistência de dados em relatórios é investigada pela área de Dados." },
    { text: "Índice do banco não está sendo utilizado na consulta.", role: "data", reason: "Otimização de índices e performance de consultas SQL é responsabilidade da área de Dados." },
    { text: "A migração de dados falhou e registros foram perdidos.", role: "data", reason: "Migrações de dados com segurança e rollback são responsabilidade da área de Dados." },
    { text: "O dashboard está exibindo métricas desatualizadas.", role: "data", reason: "Atualização e confiabilidade de pipelines de dados para dashboards são responsabilidade da área de Dados." }
];
