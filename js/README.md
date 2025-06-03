# Documentação dos Scripts JavaScript

Este diretório contém os arquivos JavaScript responsáveis pela lógica de funcionamento do sistema AtibainhaVisits.

## Índice

- [autenticacao.js](#autenticacaojs)
- [cadastro.js](#cadastrojs)
- [calendar.js](#calendarjs)
- [logout.js](#logoutjs)
- [relatorio.js](#relatariojs)
- [script.js](#scriptjs)
- [server.js](#serverjs)
- [usuario.js](#usuariojs)
- [login.js](#loginjs)
- [visita.js](#visitajs)

## autenticacao.js

Gerencia a autenticação de usuários no sistema.

**Funcionalidades principais:**
- Verifica se o usuário está autenticado através do token JWT armazenado no localStorage
- Redireciona para a página de login caso o token não exista ou seja inválido
- Realiza requisições ao servidor para validar o token
- Armazena o ID do usuário no localStorage quando o token é validado

**Exemplo de código:**
```javascript
function verificarAutenticacao() {
  const token = localStorage.getItem('token');
  
  // Se não houver token, redireciona para a página de login
  if (!token) {
    window.location.href = './login.html';
    return false;
  }
  
  // Verifica se o token é válido
  return fetch('http://localhost:3000/verificar-token', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Token inválido');
    }
    return response.json();
  })
  .then(data => {
    // Token válido, continua na página
    localStorage.setItem('userId', data.userId);
    return true;
  })
  .catch(error => {
    // Token inválido, limpa localStorage e redireciona
    localStorage.clear();
    window.location.href = './login.html';
    return false;
  });
}
```

## cadastro.js

Gerencia o cadastro de novos usuários no sistema.

**Funcionalidades principais:**
- Validação de formulários de cadastro (nome, email, senha, telefone)
- Envio de dados para o servidor via API REST
- Tratamento de erros e exibição de mensagens para o usuário
- Redirecionamento para a página de login após cadastro bem-sucedido

**Exemplo de código:**
```javascript
document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Obter valores dos campos
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const telefone = document.getElementById('telefone').value.trim();
  const setor = document.getElementById('setor').value;
  
  // Validação do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrarErro('email', 'Por favor, digite um email válido');
    return;
  }
  
  // Enviar dados para o servidor
  fetch('http://localhost:3000/cadastrar-usuario', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, email, senha, telefone, setor })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message || 'Usuário cadastrado com sucesso!');
    window.location.href = 'login.html';
  })
  .catch(error => {
    alert('Erro ao cadastrar usuário: ' + error.message);
  });
});
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
    const response = await fetch(`http://localhost:3000/api/relatorio-visita/${visitaId}`);
    
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
- Configuração do servidor Express e conexão com banco de dados MySQL
- Implementação de rotas para autenticação (login, verificação de token)
- Rotas para gerenciamento de usuários (cadastro, atualização, exclusão)
- Rotas para gerenciamento de visitas (cadastro, consulta, finalização)
- Middleware para verificação de token JWT
- Tratamento de erros e respostas HTTP

**Exemplo de código:**
```javascript
// Configuração do servidor
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
const port = process.env.PORT;

// Configuração do banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  });
}

// Rota para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  
  // Buscar usuário no banco
  connection.query('SELECT * FROM tb_usuarios WHERE tb_email = ?', [email], async (err, results) => {
    // Verificar senha e gerar token
    // ...
  });
});
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

    if (!response.ok) {
      throw new Error('Credenciais inválidas');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.nome);
    
    window.location.href = './index.html';
  } catch (error) {
    alert('Ocorreu um erro ao fazer login. Verifique suas credenciais.');
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function togglePassword() {
  document.querySelectorAll(".eye").forEach((eye) => eye.classList.toggle("hide"));
  const senha = document.getElementById("senha");
  const type = senha.getAttribute("type") === "password" ? "text" : "password";
  senha.setAttribute("type", type);
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
  const response = await fetch('http://localhost:3000/api/finalizar-visita', {
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