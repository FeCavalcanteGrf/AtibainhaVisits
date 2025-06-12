/**
 * cadastro.js - Gerencia o cadastro de novos usuários no sistema
 * 
 * Este arquivo contém as funções para:
 * - Controlar o menu responsivo
 * - Validar o formulário de cadastro
 * - Enviar dados para o servidor
 * - Exibir mensagens de erro
 */

// Função para lidar com o menu responsivo quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  // Obtém referências aos elementos do menu
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  // Adiciona evento de clique ao botão do menu, se ele existir
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      // Alterna as classes para mostrar/esconder o menu
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
});

// Adiciona evento de submit ao formulário de cadastro para validação
document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  // Impede o envio padrão do formulário
  event.preventDefault();
  
  // Obtém valores dos campos e remove espaços extras
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmaSenha').value;
  const telefone = document.getElementById('telefone').value.trim();
  const setor = document.getElementById('setor').value;
  
  // Validação do nome: não pode estar vazio e deve ter pelo menos 3 caracteres
  if (nome === '') {
    mostrarErro('nome', 'Por favor, digite seu nome completo');
    return;
  } else if (nome.length < 3) {
    mostrarErro('nome', 'O nome deve ter pelo menos 3 caracteres ou mais');
    return;
  }
  
  // Validação do email usando expressão regular
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrarErro('email', 'Por favor, digite um email válido');
    return;
  }
  
  // Validação da senha: deve ter pelo menos 6 caracteres
  if (senha.length < 6) {
    mostrarErro('senha', 'A senha deve ter pelo menos 6 caracteres ou mais');
    return;
  }
  
  // Validação de confirmação de senha: deve ser igual à senha
  if (senha !== confirmarSenha) {
    mostrarErro('confirmaSenha', 'As senhas não coincidem');
    return;
  }
  
  // Validação do telefone usando expressão regular para formato brasileiro
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
      // Verifica se a resposta do servidor está ok
      if (!response.ok) {
        throw new Error('Servidor não está respondendo corretamente');
      }
      
      // Se o servidor estiver respondendo, envia os dados de cadastro
      return fetch('http://localhost:3000/cadastrar-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha, telefone, setor })
      });
    })
    .then(response => {
      // Verifica se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json().then(data => {
          // Se a resposta não for ok, lança um erro com a mensagem do servidor
          if (!response.ok) {
            throw new Error(data.message || 'Erro ao cadastrar usuário');
          }
          return data;
        });
      } else {
        // Se não for JSON, obtém o texto e lança erro
        return response.text().then(text => {
          console.error('Resposta não-JSON recebida:', text);
          throw new Error('Resposta inválida do servidor');
        });
      }
    })
    .then(data => {
      // Exibe mensagem de sucesso e redireciona para a página de login
      alert(data.message || 'Usuário cadastrado com sucesso!');
      window.location.href = 'login.html';
    })
    .catch(error => {
      // Trata erros durante o processo de cadastro
      console.error('Erro ao cadastrar usuário:', error);
      alert('Erro ao cadastrar usuário: ' + error.message);
    });
});

/**
 * Exibe mensagem de erro para um campo específico
 * @param {string} campoId - ID do campo com erro
 * @param {string} mensagem - Mensagem de erro a ser exibida
 */
function mostrarErro(campoId, mensagem) {
  const campo = document.getElementById(campoId);
  const divErro = document.createElement('div');
  
  // Remove mensagens de erro anteriores para evitar duplicação
  const erroAnterior = campo.parentElement.querySelector('.erro-mensagem');
  if (erroAnterior) {
    erroAnterior.remove();
  }
  
  // Adiciona nova mensagem de erro
  divErro.className = 'erro-mensagem';
  divErro.textContent = mensagem;
  
  // Marca o campo como erro e adiciona a mensagem
  campo.classList.add('erro');
  campo.parentElement.appendChild(divErro);
  campo.focus(); // Coloca o foco no campo com erro
}

// Limpa mensagens de erro quando o usuário começa a digitar
document.addEventListener('DOMContentLoaded', function() {
  // Adiciona evento de input a todos os campos do formulário
  document.querySelectorAll('#cadastro-form input').forEach(input => {
    input.addEventListener('input', function() {
      // Remove a mensagem de erro e a classe de erro quando o usuário digita
      const erroMensagem = this.parentElement.querySelector('.erro-mensagem');
      if (erroMensagem) {
        erroMensagem.remove();
        this.classList.remove('erro');
      }
    });
  });
});