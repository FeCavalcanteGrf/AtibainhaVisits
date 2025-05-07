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

console.log('🔍 Arquivo usuario.js carregado');

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 DOMContentLoaded - Iniciando carregamento de dados do usuário');
  
  // Verifica se o usuário está logado
  const token = localStorage.getItem('token');
  console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');
  
  if (!token) {
    console.log('⚠️ Token não encontrado, redirecionando para login');
    window.location.href = 'login.html'; // Redireciona para login se não estiver autenticado
    return;
  }
  
  const userId = localStorage.getItem('userId');
  console.log('👤 ID do usuário:', userId);
  
  try {
    console.log('🔄 Iniciando requisição para obter dados do usuário');
    const response = await fetch(`http://localhost:3000/user-info?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Adiciona o token ao cabeçalho
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      console.error('❌ Resposta não ok:', response.status, response.statusText);
      throw new Error('Falha ao buscar informações do usuário');
    }
    
    const data = await response.json();
    console.log('📋 Dados recebidos:', data);
    
    // Preenche os campos do formulário com as informações do usuário
    document.getElementById('user-name').value = data.nome;
    document.getElementById('user-email').value = data.email;
    document.getElementById('user-tel').value = data.tel || '';
    document.getElementById('user-password').value = ''; // Por segurança, não exibimos a senha
    document.getElementById('user-sector').value = data.setor || '';
    
    console.log('✅ Campos do formulário preenchidos com sucesso');
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    alert('Erro ao carregar informações do usuário. Por favor, faça login novamente.');
    localStorage.clear();
    window.location.href = 'login.html';
  }
});

// Função para atualizar usuário
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Configurando eventos para atualização de usuário');
  
  const updateForm = document.getElementById('update-user-form');
  console.log('📝 Formulário de atualização encontrado:', updateForm ? 'Sim' : 'Não');
  
  if (updateForm) {
    updateForm.addEventListener('submit', async function(event) {
      console.log('🔄 Evento de submit do formulário acionado');
      event.preventDefault(); // Previne o envio padrão do formulário
      console.log('🛑 Comportamento padrão do formulário prevenido');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token para atualização:', token ? 'Disponível' : 'Indisponível');
      
      if (!token) {
        console.warn('⚠️ Token não encontrado para atualização');
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
      }
      
      const userId = localStorage.getItem('userId'); // Obtém o ID do usuário logado
      const nome = document.getElementById('user-name').value;
      const email = document.getElementById('user-email').value;
      const tel = document.getElementById('user-tel').value;
      const senha = document.getElementById('user-password').value;
      const setor = document.getElementById('user-sector').value;

      console.log('📋 Dados para atualização coletados:', { userId, nome, email, setor, tel, senha: senha ? '****' : 'não fornecida' });

      try {
        console.log('🔄 Iniciando requisição para atualizar usuário');
        
        // Verificando se o userId no token corresponde ao userId no localStorage
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 ID do usuário no token:', decodedToken.id);
        console.log('🔑 ID do usuário no localStorage:', userId);
        
        if (decodedToken.id != userId) {
          console.error('❌ IDs não correspondem. Token ID:', decodedToken.id, 'localStorage ID:', userId);
          throw new Error('ID do usuário no token não corresponde ao ID armazenado localmente');
        }
        
        const response = await fetch('http://localhost:3000/update-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: decodedToken.id, nome, email, setor, senha, tel }) // Usa o ID do token
        });
        
        console.log('📊 Status da resposta de atualização:', response.status);
        
        // Primeiro verifica se a resposta está ok antes de tentar converter para JSON
        if (!response.ok) {
          console.error('❌ Resposta de atualização não ok:', response.status, response.statusText);
          const errorData = await response.json().catch(() => {
            console.error('❌ Erro ao processar resposta JSON');
            return { message: 'Erro de conexão com o servidor' };
          });
          throw new Error(errorData.message || 'Falha ao atualizar usuário');
        }
        
        const responseData = await response.json();
        console.log('✅ Resposta do servidor após atualização:', responseData);
        alert('Usuário atualizado com sucesso!');
      } catch (error) {
        console.error('❌ Erro durante atualização:', error);
        alert(`Erro ao atualizar usuário: ${error.message || 'Verifique se o servidor está rodando na porta 3000'}`);
      }
    });
    
    console.log('✅ Evento de submit configurado com sucesso');
  }

  // Adicionar evento de clique diretamente ao botão de atualizar
  const updateButton = document.getElementById('update-user');
  console.log('🔘 Botão de atualizar encontrado:', updateButton ? 'Sim' : 'Não');
  
  if (updateButton) {
    updateButton.addEventListener('click', function(event) {
      console.log('🖱️ Botão de atualizar clicado');
      // O formulário já tem um evento de submit, então este evento serve apenas para garantir que o botão está respondendo
      console.log('ℹ️ Este clique deve acionar o evento de submit do formulário');
    });
    
    console.log('✅ Evento de clique no botão de atualizar configurado');
  }
});

// Implementação para excluir usuário
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Configurando evento para exclusão de usuário');
  
  const deleteButton = document.getElementById('delete-user');
  console.log('🔘 Botão de excluir encontrado:', deleteButton ? 'Sim' : 'Não');
  
  if (deleteButton) {
    deleteButton.addEventListener('click', async function() {
      console.log('🖱️ Botão de excluir clicado');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token para exclusão:', token ? 'Disponível' : 'Indisponível');
      
      if (!token) {
        console.warn('⚠️ Token não encontrado para exclusão');
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
      }

      // Confirmação antes de excluir
      console.log('❓ Solicitando confirmação do usuário');
      if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
        console.log('🛑 Exclusão cancelada pelo usuário');
        return;
      }

      const email = document.getElementById('user-email').value;
      console.log('📧 Email para exclusão:', email);

      try {
        console.log('🔄 Iniciando requisição para excluir usuário');
        
        // Verificando se o email no token corresponde ao email do formulário
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 Email do usuário no token:', decodedToken.email);
        console.log('🔑 Email do formulário:', email);
        
        if (decodedToken.email !== email) {
          console.error('❌ Emails não correspondem. Token email:', decodedToken.email, 'Formulário email:', email);
          throw new Error('Email do usuário no token não corresponde ao email do formulário');
        }
        
        const response = await fetch('http://localhost:3000/delete-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: decodedToken.email }) // Usa o email do token
        });
        
        console.log('📊 Status da resposta de exclusão:', response.status);
        
        // Verifica se a resposta está ok antes de tentar converter para JSON
        if (!response.ok) {
          console.error('❌ Resposta de exclusão não ok:', response.status, response.statusText);
          const errorData = await response.json().catch(() => {
            console.error('❌ Erro ao processar resposta JSON');
            return { message: 'Erro de conexão com o servidor' };
          });
          throw new Error(errorData.message || 'Falha ao excluir usuário');
        }
        
        console.log('✅ Usuário excluído com sucesso');
        alert('Usuário excluído com sucesso!');
        // Limpa o localStorage e redireciona para a página de login
        localStorage.clear();
        window.location.href = 'login.html';
      } catch (error) {
        console.error('❌ Erro durante exclusão:', error);
        alert(`Erro ao excluir usuário: ${error.message || 'Verifique se o servidor está rodando na porta 3000'}`);
      }
    });
    
    console.log('✅ Evento de clique no botão de excluir configurado');
  }
});