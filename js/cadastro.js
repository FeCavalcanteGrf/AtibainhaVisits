document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmaSenha').value;
  const telefone = document.getElementById('telefone').value;

  if (senha !== confirmarSenha) {
    alert('As senhas não coincidem.');
    return;
  }

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, email, senha, telefone })
  })
  .then(response => response.text())
  .then(data => {
    alert(data);
    if (data === 'Usuário cadastrado com sucesso.') {
      window.location.href = 'login.html';
    }
  })
  .catch(error => {
    console.error('Erro ao cadastrar usuário:', error);
    alert('Erro ao cadastrar usuário.');
  });
});
