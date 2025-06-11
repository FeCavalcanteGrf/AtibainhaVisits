// Este script aguarda o carregamento completo da página antes de executar qualquer ação.

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 script de logout carregado'); /* O evento 'DOMcontentLoaded' garante que todo HTML foi carregado antes de
                                                   tentar manipular os elementos da página.
                                                   */
    
    // Faz a procura pelo id do botão de logout 
    const logoutBtn = document.getElementById('logout-btn');
    
    // Faz a verificação se o botão de logout foi encontrado antes de adicionar o evento de clique
    if (logoutBtn) {
        console.log('✅ Botão de Logout encontrado');
        
        // Adiciona um evento de clique ao botão de logout
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('🖱️ Logout button clicked');
            
            // Remove todos os dados armazenados no localStorage 
            localStorage.clear();
            
            console.log('🗑️ Removido dados armazenados no local storage');
            
            // Redireciona o usuário para a página de login
            console.log('🔄 Redirecionando para a página de login');
            window.location.href = 'login.html';
        });
    } else {
        console.error('❌ Botão de Logout não encontrado');
        // Exibe uma mensagem de erro se o botão não for encontrado
    }
});
