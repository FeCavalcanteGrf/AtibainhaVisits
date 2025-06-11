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
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Alterna a visibilidade da senha entre texto e senha.
 */
function togglePassword() {
  document.querySelectorAll(".eye").forEach((eye) => eye.classList.toggle("hide"));

  const senha = document.getElementById("senha");
  const type = senha.getAttribute("type") === "password" ? "text" : "password";
  senha.setAttribute("type", type);
}
