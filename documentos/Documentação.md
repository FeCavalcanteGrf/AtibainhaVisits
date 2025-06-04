# Sistema de Controle de Visitas ao Hotel Fazenda Estância Atibainha - Documentação do Banco de Dados

## Visão Geral do Sistema

Este banco de dados foi projetado para gerenciar um sistema de controle de visitas, permitindo o registro, acompanhamento e finalização de visitas realizadas por diferentes usuários(Funcionários) ao hotel.

## Justificativa do Modelo de Dados

### Paradigma Relacional Escolhido
O modelo relacional foi adotado por suas características fundamentais que se alinham perfeitamente com os requisitos do sistema:

**Integridade Referencial**: O sistema de visitas requer controle rigoroso sobre os relacionamentos entre usuários e suas respectivas visitas. A integridade referencial garante que não existam visitas órfãs (sem usuário associado) e mantém a consistência dos dados mesmo durante operações de exclusão.

**Controle de Acesso e Auditoria**: A estrutura relacional facilita a implementação de logs de auditoria e controle de acesso baseado em roles, essencial para sistemas corporativos onde diferentes setores podem ter diferentes níveis de permissão.

**Consultas Complexas**: O modelo permite consultas sofisticadas usando JOINs para relatórios gerenciais, como "todas as visitas finalizadas por setor no último trimestre" ou "usuários com maior número de visitas pendentes".

## Arquitetura das Entidades

### 1. Entidade `tb_usuarios` - Núcleo do Sistema de Autenticação

Esta entidade representa o ponto central do sistema, armazenando informações dos usuários(Funcionários) autorizados a registrar visitas.

**Estrutura e Justificativas:**

- `tb_id` (INT AUTO_INCREMENT PRIMARY KEY): Chave primária sintética que garante unicidade absoluta. O uso de auto-incremento evita conflitos de inserção concorrente e oferece performance superior em operações de JOIN comparado a chaves compostas.

- `tb_nome` (VARCHAR(100) NOT NULL): Armazena o nome completo do usuário. O tamanho de 100 caracteres foi dimensionado considerando nomes compostos e sobrenomes extensos, comuns na cultura brasileira.

- `tb_email` (VARCHAR(100) NOT NULL UNIQUE): Funciona como identificador natural único do usuário. A constraint UNIQUE previne duplicatas e permite uso do email como alternativa de login. O campo é obrigatório para garantir comunicação com o usuário.

- `tb_senha` (VARCHAR(255) NOT NULL): Dimensionado para acomodar hashes de senhas modernas (bcrypt, Argon2) que podem gerar strings de até 255 caracteres. O tamanho generoso garante compatibilidade futura com algoritmos mais robustos.

- `tb_telefone` (VARCHAR(20)): Campo opcional que acomoda diferentes formatos de telefone (nacional/internacional, com/sem formatação). A flexibilidade do VARCHAR permite entrada de dados sem validação rígida no banco.

- `tb_setor` (VARCHAR(50) NOT NULL): Categoriza o usuário organizacionalmente. Este campo é fundamental para relatórios gerenciais e controle de acesso. O NOT NULL garante que todo usuário tenha vinculação setorial definida.

- `tb_data_criacao` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Registro automático do momento de criação da conta. Essencial para auditoria e análise temporal do crescimento da base de usuários.

### 2. Entidade `tb_visitas` - Agendamento e Planejamento

Representa visitas planejadas ou agendadas, funcionando como um registro de intenção antes da execução efetiva.

**Estrutura e Justificativas:**

- `tb_usuario_id` (INT, FOREIGN KEY): Estabelece a relação com o usuário responsável pela visita. A chave estrangeira garante integridade referencial e permite rastreamento de responsabilidade.

- `tb_nome` (VARCHAR(100) NOT NULL): Nome do visitante. Separado do sistema de usuários pois visitantes são entidades externas que não necessitam de conta no sistema.

- `tb_empresa` (VARCHAR(100) NOT NULL): Empresa do visitante. Campo obrigatório para controle de acesso e relatórios de empresas mais frequentes.

- `tb_data` e `tb_hora` (DATE, TIME): Separação proposital entre data e hora permite consultas mais eficientes. Por exemplo, buscar todas as visitas de um dia específico fica mais performática com DATE do que extraindo data de um DATETIME.

- `tb_locais` (TEXT NOT NULL): Armazena locais planejados para visita. O tipo TEXT permite descrições extensas e múltiplos locais separados por delimitadores.

### 3. Entidade `tb_visitas_finalizadas` - Registro de Execução

Esta entidade crítica registra visitas efetivamente realizadas, com dados estruturados para análise posterior.

**Estrutura e Justificativas:**

- `tb_visita_id` (INT, FOREIGN KEY): Referência opcional à visita planejada. O ON DELETE SET NULL permite manter o histórico de visitas finalizadas mesmo se o registro de planejamento for removido.

- `tb_data_visita` (DATETIME NOT NULL): Timestamp exato da realização da visita. O tipo DATETIME capture tanto data quanto horário preciso, fundamental para auditoria e relatórios temporais detalhados.

- `tb_locais_visitados` (JSON NOT NULL): Estrutura moderna que armazena dados complexos sobre locais visitados. O JSON permite flexibilidade para diferentes tipos de informação (nome do local, tempo de permanência, observações específicas) sem necessidade de criar tabelas adicionais.

- `tb_observacoes` (JSON): Campo opcional para metadados adicionais da visita. A flexibilidade do JSON permite evolução do sistema sem alterações estruturais no banco.

## Relacionamentos e Cardinalidades

### Relacionamento Usuários ↔ Visitas (1:N)
Um usuário pode ter múltiplas visitas, mas cada visita pertence a apenas um usuário. Este relacionamento garante rastreabilidade e responsabilização individual.

### Relacionamento Visitas ↔ Visitas Finalizadas (1:0..1)
Uma visita planejada pode gerar zero ou uma visita finalizada. O relacionamento opcional (SET NULL) permite flexibilidade operacional onde visitas podem ser finalizadas sem registro prévio de planejamento.

### Relacionamento Usuários ↔ Visitas Finalizadas (1:N)
Permite rastreamento direto de quem finalizou cada visita, independentemente de quem a planejou inicialmente.

## Decisões de Design Avançadas

### Uso de JSON vs. Tabelas Normalizadas
A escolha por campos JSON em `tb_locais_visitados` e `tb_observacoes` representa um design híbrido que combina vantagens do modelo relacional com flexibilidade NoSQL. Esta decisão foi baseada em:

**Flexibilidade de Schema**: Visitas podem ter diferentes tipos de dados coletados sem impacto na estrutura do banco.

**Performance**: Elimina JOINs complexos para dados que são tipicamente consumidos em conjunto.

**Evolução**: Permite adição de novos campos sem migrations disruptivas.

### Estratégia de Índices
O índice `idx_visita_id` em `tb_visitas_finalizadas` otimiza a consulta mais comum do sistema: encontrar a finalização de uma visita específica. Esta otimização é crucial para relatórios e telas de acompanhamento.

### Política de Deleção
O uso de `ON DELETE SET NULL` nas chaves estrangeiras de `tb_visitas_finalizadas` implementa uma política de preservação histórica. Esta decisão arquitetural garante que dados de auditoria sejam mantidos mesmo quando registros de planejamento são removidos.

## Vantagens do Modelo Implementado

**Escalabilidade**: A estrutura suporta crescimento horizontal através de particionamento por data ou setor.

**Manutenibilidade**: Separação clara de responsabilidades entre entidades facilita manutenção e debugging.

**Flexibilidade**: Campos JSON permitem adaptação a novos requisitos sem reestruturação.

**Performance**: Índices estratégicos e separação data/hora otimizam consultas comuns.

**Auditoria**: Timestamps automáticos e preservação de histórico atendem requisitos de compliance.

Este modelo representa um equilíbrio cuidadoso entre rigidez estrutural necessária para integridade dos dados e flexibilidade operacional exigida por sistemas corporativos dinâmicos.