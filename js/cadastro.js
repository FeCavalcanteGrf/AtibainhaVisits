// Função para lidar com o menu responsivo
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
});

// Validações do formulário
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
    mostrarErro('nome', 'O nome deve ter pelo menos 3 caracteres');
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
    mostrarErro('senha', 'A senha deve ter pelo menos 6 caracteres');
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

// Limpar mensagens de erro quando o usuário começa a digitar
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('#cadastro-form input').forEach(input => {
    input.addEventListener('input', function() {
      const erroMensagem = this.parentElement.querySelector('.erro-mensagem');
      if (erroMensagem) {
        erroMensagem.remove();
        this.classList.remove('erro');
      }
    });
  });
});