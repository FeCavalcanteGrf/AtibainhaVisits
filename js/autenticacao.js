
// Verifica se o usuário está autenticado
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
      console.log('Usuário autenticado:', data.email);
      
      if(!localStorage.getItem('userId') )  {
        localStorage.setItem('userId', data.userId);
      }  

      return true;
    })
    .catch(error => {
      console.error('Erro de autenticação:', error);
      // Token inválido, limpa localStorage e redireciona
      localStorage.clear();
      window.location.href = './login.html';
      return false;
    });
  }
  
  // Verifica autenticação quando a página carrega
  document.addEventListener('DOMContentLoaded', verificarAutenticacao);