# Documentação dos Scripts JavaScript

Este diretório contém os arquivos JavaScript responsáveis pela lógica de funcionamento do sistema AtibainhaVisits.

## Índice

- [cadastro.js](#cadastrojs)
- [calendar.js](#calendarjs)
- [logout.js](#logoutjs)
- [relatorio.js](#relatariojs)
- [script.js](#scriptjs)
- [server.js](#serverjs)
- [usuario.js](#usuariojs)
- [login.js](#loginjs)
- [visita.js](#visitajs)

## cadastro.js

Gerencia o cadastro de novos usuários no sistema.

**Funcionalidades principais:**
- Validação de formulários de cadastro (nome, email, senha, telefone)
- Validação de confirmação de senha
- Validação de formato de telefone com expressão regular
- Verificação de conexão com o servidor antes de enviar dados
- Tratamento de erros e exibição de mensagens para o usuário
- Feedback visual para campos com erro
- Redirecionamento para a página de login após cadastro bem-sucedido
- Suporte para menu responsivo

**Exemplo de código:**
```javascript
document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Obter valores dos campos
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmaSenha').value;
  const telefone = document.getElementById('telefone').value.trim();
  const setor = document.getElementById('setor').value;
  
  // Validação do nome
  if (nome === '') {
    mostrarErro('nome', 'Por favor, digite seu nome completo');
    return;
  } else if (nome.length < 3) {
    mostrarErro('nome', 'O nome deve ter pelo menos 3 caracteres ou mais');
    return;
  }
  
  // Validação do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrarErro('email', 'Por favor, digite um email válido');
    return;
  }
  
  // Validação da senha
  if (senha.length < 6) {
    mostrarErro('senha', 'A senha deve ter pelo menos 6 caracteres ou mais');
    return;
  }
  
  // Validação de confirmação de senha
  if (senha !== confirmarSenha) {
    mostrarErro('confirmaSenha', 'As senhas não coincidem');
    return;
  }
  
  // Validação do telefone
  const telefoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
  if (!telefoneRegex.test(telefone)) {
    mostrarErro('telefone', 'Por favor, digite um telefone válido (Ex: (11)99999-9999)');
    return;
  }
  
  // Se todas as validações passarem, mostrar mensagem de carregamento
  alert('Enviando dados para cadastro...');

  // Verificar se o servidor está respondendo antes de enviar os dados
  fetch('http://localhost:3000/test-connection')
    .then(response => {
      if (!response.ok) {
        throw new Error('Servidor não está respondendo corretamente');
      }
      
      // Se o servidor estiver respondendo, enviar os dados de cadastro
      return fetch('http://localhost:3000/cadastrar-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha, telefone, setor })
      });
    })
    .then(response => {
      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json().then(data => {
          if (!response.ok) {
            throw new Error(data.message || 'Erro ao cadastrar usuário');
          }
          return data;
        });
      } else {
        // Se não for JSON, obter o texto e lançar erro
        return response.text().then(text => {
          console.error('Resposta não-JSON recebida:', text);
          throw new Error('Resposta inválida do servidor');
        });
      }
    })
    .then(data => {
      alert(data.message || 'Usuário cadastrado com sucesso!');
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Erro ao cadastrar usuário:', error);
      alert('Erro ao cadastrar usuário: ' + error.message);
    });
});

// Função para mostrar mensagens de erro
function mostrarErro(campoId, mensagem) {
  const campo = document.getElementById(campoId);
  const divErro = document.createElement('div');
  
  // Remover mensagens de erro anteriores
  const erroAnterior = campo.parentElement.querySelector('.erro-mensagem');
  if (erroAnterior) {
    erroAnterior.remove();
  }
  
  // Adicionar nova mensagem de erro
  divErro.className = 'erro-mensagem';
  divErro.textContent = mensagem;
  
  campo.classList.add('erro');
  campo.parentElement.appendChild(divErro);
  campo.focus();
}
```

## calendar.js

Implementa o calendário interativo para visualização e agendamento de visitas.

**Funcionalidades principais:**
- Renderização dinâmica do calendário mensal
- Navegação entre meses
- Marcação de dias com visitas agendadas
- Exibição de detalhes das visitas ao clicar em um dia
- Verificação do status das visitas (finalizadas ou não)
- Carregamento de visitas do servidor

**Exemplo de código:**
```javascript
function renderCalendar() {
  const calendarEl = document.getElementById('calendar');
  
  // Atualizar o título do mês
  document.getElementById('month-year').textContent = currentDate.toLocaleString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Limpar o calendário
  calendarEl.innerHTML = '';
  
  // Determinar o primeiro dia do mês e o número de dias
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const totalDays = lastDay.getDate();
  const firstDayIndex = firstDay.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  
  // Filtrar visitas para o mês atual
  const visitasDoMes = visitas.filter(visita => {
    const dataStr = visita.data;
    const dataSemFuso = dataStr.split('T')[0];
    const [ano, mes, dia] = dataSemFuso.split('-').map(num => parseInt(num, 10));
    const mesAtual = currentDate.getMonth() + 1;
    const anoAtual = currentDate.getFullYear();
    
    return mes === mesAtual && ano === anoAtual;
  });
  
  // Criar as células do calendário e marcar dias com visitas
  // ...
}
```

## logout.js

Gerencia o processo de logout do sistema.

**Funcionalidades principais:**
- Limpa os dados de sessão armazenados no localStorage
- Redireciona o usuário para a página de login

**Exemplo de código:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Limpar dados de sessão
      localStorage.clear();
      
      // Redirecionar para login
      window.location.href = 'login.html';
    });
  }
});
```

## relatorio.js

Gerencia a geração e exibição de relatórios de visitas.

**Funcionalidades principais:**
- Carrega dados de visitas finalizadas do servidor
- Exibe informações detalhadas sobre a visita
- Lista locais visitados e não visitados
- Exibe observações registradas durante a visita
- Gera relatórios em PDF para download
- Possui modo de demonstração para testes

**Exemplo de código:**
```javascript
async function carregarDadosVisita(visitaId) {
  try {
    const response = await fetch(`http://localhost:3000/relatorio-visita/${visitaId}`);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const dadosVisita = await response.json();
    
    // Armazenar dados globalmente
    dadosVisitaGlobal = dadosVisita;
    
    // Exibir dados da visita
    exibirDadosVisita(dadosVisita);
    
    // Exibir locais visitados
    exibirLocaisVisitados(dadosVisita);
    
    // Atualizar barra de progresso
    atualizarProgresso(dadosVisita);
  } catch (error) {
    console.error('Erro ao carregar dados da visita:', error);
    // Se houver erro, carregar dados de demonstração
    carregarDadosDemostracao();
  }
}

function gerarPDF() {
  // Inicializar o PDF
  const pdf = new jspdf.jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Adicionar conteúdo ao PDF
  // ...
  
  // Salvar o PDF
  pdf.save(`relatorio-visita-${dadosVisitaGlobal.id}.pdf`);
}
```

## script.js

Contém funções gerais utilizadas em várias páginas do sistema.

**Funcionalidades principais:**
- Controle de elementos de interface (toggle de menus, carrosséis)
- Manipulação de popups
- Funções auxiliares para o calendário
- Verificação de status de visitas

**Exemplo de código:**
```javascript
function toggleCarrossel(carrosselId) {
  const conteudo = document.querySelector(`[onclick="toggleCarrossel('${carrosselId}')"]`);
  const carrossel = document.getElementById(carrosselId);

  // Alterna a visibilidade do carrossel
  if (carrossel.style.display === "none" || !carrossel.style.display) {
    carrossel.style.display = "block";
    conteudo.classList.add("expandido");
  } else {
    carrossel.style.display = "none";
    conteudo.classList.remove("expandido");
  }
}

function moveCarrossel(id, direction) {
  const carrossel = document.getElementById(id);
  const imagens = carrossel.querySelector('.carrossel-imagens');
  const imgs = imagens.querySelectorAll('img');
  const totalImages = imgs.length;

  let currentIndex = parseInt(imagens.getAttribute('data-index')) || 0;
  currentIndex += direction;

  if (currentIndex >= totalImages) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = totalImages - 1;
  }

  imagens.setAttribute('data-index', currentIndex);
  imgs.forEach(img => img.classList.remove('active'));
  imgs[currentIndex].classList.add('active');
}
```

## server.js

Implementa o servidor Node.js/Express que fornece a API REST para o sistema.

**Funcionalidades principais:**
- Configuração do servidor Express e conexão com banco de dados MySQL usando pool de conexões
- Implementação de rotas para autenticação (login, verificação de token)
- Rotas para gerenciamento de usuários (cadastro, atualização, exclusão)
- Rotas para gerenciamento de visitas (cadastro, consulta, finalização)
- Middleware para verificação de token JWT
- Tratamento de erros e respostas HTTP
- Implementação de segurança com rate limiting para prevenção de ataques de força bruta
- Uso de Helmet para proteção contra vulnerabilidades comuns
- Tratamento assíncrono de requisições com Promises

**Exemplo de código:**
```javascript
const express = require('express');
const mysql = require('mysql2/promise'); // Usando mysql2 com promises para melhorar o controle assíncrono
const cors = require('cors');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs'); // Usando bcryptjs para hash de senhas
const jwt = require('jsonwebtoken');
const ratelimit = require('express-rate-limit'); // Importando express-rate-limit para limitar requisições
const helmet = require('helmet'); // Importando helmet para segurança adicional

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT;

// Pool de conexões MySQL para melhor gerenciamento de conexões e performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Para limitar o número de conexões simultâneas a 10 
  queueLimit: 0, // Para não haver limite de fila de conexões
  connectTimeout: 60000 // Tempo máximo de espera pela conexão (60 segundos)
});

// Configurando o rate limiting para a prevenção de ataques de força bruta
const limiteGeral = ratelimit({
  windowMs: 15 * 60 * 1000, // janela de tempo na qual as requisições são contadas (15 minutos)
  max: 100, // Define o numero máximo de requisições que um IP dentro da janela de tempo determinada
  message: {message:'Foram feita muitas requisições, tente novamente após 15 minutos.'}
});

const limiteLogin = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limitação de 5 tentativas por IP por janela de tempo 
  message: {message:'Foram feita muitas tentativas de login, tente novamente após 15 minutos.'}
});

// Middleware
app.use(helmet()); // Proteção contra vulnerabilidades comuns
app.use(limiteGeral); // Aplicar o rate limiting geral
```

## usuario.js

Gerencia as operações relacionadas aos usuários.

**Funcionalidades principais:**
- Carrega informações do usuário logado
- Permite atualização de dados do perfil
- Implementa a exclusão de conta de usuário
- Validação de formulários e tratamento de erros

**Exemplo de código:**
```javascript
document.addEventListener('DOMContentLoaded', async function() {
  // Verifica se o usuário está logado
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/user-info?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar informações do usuário');
    }
    
    const data = await response.json();
    
    // Preenche os campos do formulário
    document.getElementById('user-name').value = data.nome;
    document.getElementById('user-email').value = data.email;
    document.getElementById('user-tel').value = data.tel || '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-sector').value = data.setor || '';
  } catch (error) {
    alert('Erro ao carregar informações do usuário.');
    localStorage.clear();
    window.location.href = 'login.html';
  }
});
```

## login.js

Implementa validações de formulários, especialmente para o login.

**Funcionalidades principais:**
- Validação de formato de email
- Validação de senha
- Envio de credenciais para autenticação
- Armazenamento de token e informações do usuário no localStorage
- Toggle de visibilidade da senha
- Tratamento de erros específicos, incluindo limite de tentativas excedido
- Feedback visual para o usuário durante o processo de login

**Exemplo de código:**
```javascript
document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  if (!validateEmail(email)) {
    alert('Insira um e-mail válido.');
    return;
  }
  
  if (senha.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Se o limitador de login foi acionado, o servidor retornará um status de erro
      // com uma mensagem específica que podemos mostrar ao usuário
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Armazenar dados do usuário no localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.nome);
    
    console.log('Login feito com sucesso:', {userId: data.userId, nome: data.nome});
    alert('Login realizado com sucesso!');
    window.location.href = './index.html';
  } 
  catch (error) {
    console.error('Erro ao fazer login:', error);
    
    // Mensagem personalizada para limite de tentativas excedido
    if (error.message.includes('muitas tentativas')) {
      alert('Limite de tentativas excedido. Por favor, aguarde 15 minutos antes de tentar novamente.');
    } else {
      alert('Ocorreu um erro ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  }
});

/**
 * Valida o formato do e-mail.
 * @param {string} email - O e-mail a ser validado.
 * @returns {boolean} - Retorna true se o e-mail for válido, caso contrário, false.
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
```

## visita.js

Gerencia o processo de realização e finalização de visitas.

**Funcionalidades principais:**
- Carrega dados da visita agendada
- Controla os checkboxes para marcar locais visitados
- Calcula e exibe o progresso da visita
- Permite registro de observações para cada local
- Finaliza a visita e envia dados para o servidor
- Controla a exibição de carrosséis de imagens dos locais

**Exemplo de código:**
```javascript
function atualizarProgresso() {
  const checkboxes = document.querySelectorAll('.checkbox');
  let locaisVisitados = 0;
  
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      locaisVisitados++;
    }
  });
  
  const percentual = (locaisVisitados / totalLocais) * 100;
  
  const barraProgresso = document.getElementById('barra-progresso');
  const porcentagemProgresso = document.getElementById('porcentagem-progresso');
  
  barraProgresso.value = percentual;
  porcentagemProgresso.textContent = `${Math.round(percentual)}%`;
}

async function finalizarVisita() {
  // Coletar dados da visita
  const dadosVisita = {
    visitaId: visitaAtual ? visitaAtual.id : null,
    dataVisita: new Date().toISOString(),
    locaisVisitados: [],
    observacoes: {}
  };
  
  // Coletar informações sobre locais visitados e observações
  const sessoes = document.querySelectorAll('.sessao');
  sessoes.forEach(sessao => {
    const sessaoId = sessao.id;
    const checkbox = sessao.querySelector('.checkbox');
    const nomeLocal = sessao.querySelector('h2').textContent;
    const observacao = sessao.querySelector('.observacao-input').value;
    
    dadosVisita.locaisVisitados.push({
      id: sessaoId,
      nome: nomeLocal,
      visitado: checkbox.checked
    });
    
    if (observacao.trim() !== '') {
      dadosVisita.observacoes[sessaoId] = observacao;
    }
  });
  
  // Enviar dados para o servidor
  const response = await fetch('http://localhost:3000/finalizar-visita', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosVisita)
  });
  
  // Redirecionar para a página de relatório
  window.location.href = `relatorio.html?id=${resultado.id}`;
}
```