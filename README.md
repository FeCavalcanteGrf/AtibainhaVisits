# AtibainhaVisits

Sistema de gerenciamento de visitas para o Atibainha, permitindo cadastro, agendamento e relatórios de visitas aos espaços disponíveis.

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)

## Visão Geral

AtibainhaVisits é uma aplicação web para gerenciamento de visitas internas ao Hotel Estância Atibainha, permitindo o cadastro de usuários, agendamento de visitas, visualização de calendário e geração de relatórios. O sistema utiliza uma arquitetura cliente-servidor com frontend em HTML, CSS e JavaScript, e backend em Node.js com Express e MySQL.

## Estrutura do Projeto

```
AtibainhaVisits/
|-- css/                  # Arquivos de estilo
|   |-- cadastro.css      # Estilos para página de cadastro
|   |-- calendar.css      # Estilos para o calendário
|   |-- login.css         # Estilos para página de login
|   |-- relatorio.css     # Estilos para relatórios
|   |-- styles.css        # Estilos globais
|   |-- usuarios.css      # Estilos para gerenciamento de usuários
|   `-- visita.css        # Estilos para página de visitas
|-- db/                   # Scripts de banco de dados
|   `-- Banco.sql         # Script de criação do banco de dados
|-- img/                  # Imagens e recursos visuais
|-- js/                   # Scripts JavaScript
|   |-- autenticacao.js   # Lógica de autenticação
|   |-- cadastro.js       # Lógica de cadastro
|   |-- calendar.js       # Lógica do calendário
|   |-- logout.js         # Lógica de logout
|   |-- relatorio.js      # Lógica de relatórios
|   |-- script.js         # Scripts globais
|   |-- server.js         # Servidor Node.js/Express
|   |-- usuario.js        # Lógica de gerenciamento de usuários
|   |-- login.js          # Validações do formulário de login
|   `-- visita.js         # Lógica de visitas
|-- node_modules          # Pasta Node_Modules (não versionado)
|-- .env                  # Variáveis de ambiente (não versionado)
|-- .env.example          # Exemplo de variáveis de ambiente
|-- .gitignore            # Arquivos ignorados pelo Git
|-- agendamentos.html     # Página de agendamentos
|-- cadastro.html         # Página de cadastro
|-- index.html            # Página inicial
|-- login.html            # Página de login
|-- package.json          # Dependências do projeto
|-- relatorio.html        # Página de relatórios
|-- usuarios.html         # Página de gerenciamento de usuários
`-- visita.html           # Página de visitas
```

## Requisitos

- Node.js (v14 ou superior)
- MySQL (v5.7 ou superior)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/AtibainhaVisits.git
cd AtibainhaVisits
```

2. Instale as dependências:

```bash
npm install 
```

> **IMPORTANTE**: É necessário executar o comando `npm install` para instalar todas as dependências do projeto listadas no package.json. Sem este passo, a aplicação não funcionará corretamente.

3. Configure o banco de dados:

- Crie um banco de dados MySQL
- Execute o script de criação do banco de dados localizado em `db/Banco.sql`

## Configuração

1. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:

```
PORT=porta do servidor
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=atibainha_visits
JWT_SECRET=sua_chave_secreta_para_jwt
```

## Execução

Para iniciar o servidor:

```bash
npm start
```

O servidor será iniciado na porta definida no arquivo `.env` (padrão: 3000).
Acesse a aplicação em seu navegador através do endereço: `http://localhost:3000`

## Arquivos a serem adicionados ao .gitignore

Os seguintes arquivos e diretórios devem ser adicionados ao `.gitignore`:

```
# Dependências
/node_modules

# Variáveis de ambiente
.env
```

## Funcionalidades

- **Autenticação**: Login e registro de usuários
- **Gerenciamento de Usuários**: Cadastro, edição e exclusão de usuários
- **Agendamento de Visitas**: Cadastro e visualização de visitas
- **Calendário**: Visualização de visitas agendadas
- **Relatórios**: Geração de relatórios de visitas

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Banco de Dados**: MySQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: bcryptjs para hash de senhas
- **Geração de PDF**: jspdf, html2canvas