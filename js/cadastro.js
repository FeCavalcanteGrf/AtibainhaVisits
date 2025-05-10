document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmaSenha').value;
  const telefone = document.getElementById('telefone').value;
  const setor = document.getElementById('setor').value;

  if (senha !== confirmarSenha) {
    alert('As senhas não coincidem.');
    return;
  }

  // Mostrar mensagem de carregamento
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