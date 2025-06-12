/**
 * logout.js - Gerencia o processo de logout do sistema
 * 
 * Este arquivo contém a lógica para:
 * - Detectar o clique no botão de logout
 * - Limpar os dados de sessão do usuário
 * - Redirecionar para a página de login
 */

// Este script aguarda o carregamento completo da página antes de executar qualquer ação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 script de logout carregado'); 
    /* 
     * O evento 'DOMContentLoaded' garante que todo HTML foi completamente
     * carregado e analisado antes de tentar manipular os elementos da página.
     * Isso evita erros de elementos não encontrados.
     */
    
    // Localiza o botão de logout pelo seu ID
    const logoutBtn = document.getElementById('logout-btn');
    
    // Verifica se o botão de logout foi encontrado antes de adicionar o evento de clique
    if (logoutBtn) {
        console.log('✅ Botão de Logout encontrado');
        
        // Adiciona um evento de clique ao botão de logout
        logoutBtn.addEventListener('click', function(event) {
            // Previne o comportamento padrão do link (navegação)
            event.preventDefault();
            console.log('🖱️ Logout button clicked');
            
            // Remove todos os dados armazenados no localStorage (token, userId, userName, etc.)
            localStorage.clear();
            console.log('🗑️ Removido dados armazenados no local storage');
            
            // Redireciona o usuário para a página de login após o logout
            console.log('🔄 Redirecionando para a página de login');
            window.location.href = 'login.html';
        });
    } else {
        // Exibe uma mensagem de erro no console se o botão não for encontrado
        console.error('❌ Botão de Logout não encontrado');
        // Isso pode acontecer se o ID estiver incorreto ou se o botão não existir na página atual
    }
});
