/**
 * login.js - Gerencia o processo de autenticação de usuários
 * 
 * Este arquivo contém as funções para:
 * - Validar e processar o formulário de login
 * - Enviar credenciais para autenticação
 * - Armazenar token e informações do usuário
 * - Tratar erros de autenticação
 * - Alternar visibilidade da senha
 */

/**
 * Adiciona um listener para o evento de envio do formulário de login
 * Valida os campos, envia a requisição e processa a resposta
 */
document.getElementById('login-form').addEventListener('submit', async function(event) {
  // Previne o comportamento padrão do formulário (recarregar a página)
  event.preventDefault();
  
  // Obtém os valores dos campos do formulário
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  // Valida o formato do email
  if (!validateEmail(email)) {
    alert('Insira um e-mail válido.');
    return;
  }
  
  // Valida o tamanho mínimo da senha
  if (senha.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres.');
    return;
  }
  
  try {
    // Envia a requisição de login para o servidor
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    // Converte a resposta para JSON
    const data = await response.json();
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      // Se o limitador de login foi acionado, o servidor retornará um status de erro
      // com uma mensagem específica que podemos mostrar ao usuário
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Armazena dados do usuário no localStorage para manter a sessão
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.nome);
    
    console.log('Login feito com sucesso:', {userId: data.userId, nome: data.nome});
    alert('Login realizado com sucesso!');
    
    // Redireciona para a página principal após login bem-sucedido
    window.location.href = './index.html';
  } 
  catch (error) {
    console.error('Erro ao fazer login:', error);
    
    // Exibe mensagem personalizada para diferentes tipos de erro
    if (error.message.includes('muitas tentativas')) {
      // Mensagem específica para limite de tentativas excedido (rate limiting)
      alert('Limite de tentativas excedido. Por favor, aguarde 15 minutos antes de tentar novamente.');
    } else {
      // Mensagem genérica para outros erros
      alert('Ocorreu um erro ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  }
});

/**
 * Valida o formato do e-mail usando expressão regular
 * Verifica se o email tem o formato básico user@domain.com
 * 
 * @param {string} email - O e-mail a ser validado
 * @returns {boolean} - Retorna true se o e-mail for válido, caso contrário, false
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Alterna a visibilidade da senha entre texto e caracteres ocultos
 * Também alterna a exibição do ícone de olho aberto/fechado
 */
function togglePassword() {
  // Alterna a classe 'hide' em todos os elementos com classe 'eye'
  document.querySelectorAll(".eye").forEach((eye) => eye.classList.toggle("hide"));

  // Obtém o campo de senha e alterna seu tipo entre 'password' e 'text'
  const senha = document.getElementById("senha");
  const type = senha.getAttribute("type") === "password" ? "text" : "password";
  senha.setAttribute("type", type);
}
