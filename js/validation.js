document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  if (!validateEmail(email)) {
    alert('Por favor, insira um e-mail válido.');
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
   const errorText = await response.text();
   throw new Error(errorText);
    window.location.href = '../index.html';
  } 
   const data = await response.json();

   localStorage.setItem('token', data.token);
   localStorage.setItem('userId', data.userId);
   localStorage.setItem('userName', data.nome);
   
   alert('Login realizado com sucesso!');
   window.location.href = './index.html';
  } 
  catch (error) {
    //console.error('Erro ao fazer login:', error);
    alert(error.message = 'Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
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

/**
 * Alterna a visibilidade da senha entre texto e senha.
 */
function togglePassword() {
  document.querySelectorAll(".eye").forEach((eye) => eye.classList.toggle("hide"));

  const senha = document.getElementById("senha");
  const type = senha.getAttribute("type") === "password" ? "text" : "password";
  senha.setAttribute("type", type);
}
