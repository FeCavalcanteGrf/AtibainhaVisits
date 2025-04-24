// console.log("SCRIPT")
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log("cheguei")
//     const userId = 1; // Substitua pelo ID do usuário que você deseja buscar
//     const response = await fetch(`http://localhost:3000/user-info?userId=${userId}`, {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json'
//     }
//     }).then(response => response.json())
//         .then(data => {
//             document.getElementById('user-name').value = data.nome;
//             document.getElementById('user-email').value = data.email;
//             document.getElementById('user-tel').value = data.tel;
//             document.getElementById('user-password').value = data.password;
//             document.getElementById('user-sector').value = data.setor;
//         })
//         .catch(error => console.error('Erro ao buscar informações do usuário:', error));
//     const data = await response.json();

  
    
// });

//     document.getElementById('update-user').addEventListener('click', function() {
//         const nome = document.getElementById('user-name').value;
//         const email = document.getElementById('user-email').value;
//         const tel = document.getElementById('user-tel').value;
//         const senha = document.getElementById('user-password').value;
//         const setor = document.getElementById('user-sector').value;

//         fetch('/update-user', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ nome, email, tel, senha, setor })
//         })
//         .then(response => response.json())
//         .then(data => {
//             alert('Usuário atualizado com sucesso!');
//         })
//         .catch(error => console.error('Erro ao atualizar usuário:', error));
//     });

//     document.getElementById('delete-user').addEventListener('click', function() {
//         const email = document.getElementById('user-email').value;

//         fetch('/delete-user', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email })
//         })
//         .then(response => response.json())
//         .then(data => {
//             alert('Usuário excluído com sucesso!');
//         })
//         .catch(error => console.error('Erro ao excluir usuário:', error));
//     });

document.addEventListener('DOMContentLoaded', async function() {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html'; // Redireciona para a página de login se não estiver autenticado
      return;
    }
    
    const userId = localStorage.getItem('userId');
    
    try {
      const response = await fetch(`http://localhost:3000/user-info?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Adiciona o token ao cabeçalho
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar informações do usuário');
      }
      
      const data = await response.json();
      
      document.getElementById('user-name').value = data.nome;
      document.getElementById('user-email').value = data.email;
      document.getElementById('user-tel').value = data.tel || '';
      document.getElementById('user-password').value = ''; // Por segurança, não exibimos a senha
      document.getElementById('user-sector').value = data.setor || '';
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar informações do usuário. Por favor, faça login novamente.');
      localStorage.clear();
      window.location.href = 'login.html';
    }
  });
  
  document.getElementById('update-user').addEventListener('click', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      window.location.href = 'login.html';
      return;
    }
    
    const nome = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const tel = document.getElementById('user-tel').value;
    const senha = document.getElementById('user-password').value;
    const setor = document.getElementById('user-sector').value;
  
    try {
      const response = await fetch('http://localhost:3000/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, email, tel, senha, setor })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar usuário');
      }
      
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar usuário.');
    }
  });