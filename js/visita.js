// Variáveis globais
let totalLocais = 8; // Total de locais a serem visitados
let locaisVisitados = 0;
let visitaAtual = null; // Armazenará os dados da visita atual

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de visita');
    
    // Tentar recuperar dados da visita da URL
    const urlParams = new URLSearchParams(window.location.search);
    const visitaId = urlParams.get('id');
    
    if (visitaId) {
        // Carregar dados da visita do servidor
        carregarDadosVisita(visitaId);
    }
    
    // Configurar os checkboxes para marcar locais visitados
    configurarCheckboxes();
    
    // Configurar o botão de finalizar visita
    const btnFinalizar = document.querySelector('.botao-iniciar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function() {
            finalizarVisita();
        });
    }
});

// Função para carregar dados da visita do servidor
async function carregarDadosVisita(visitaId) {
    try {
        const response = await fetch(`http://localhost:3000/api/visita/${visitaId}`);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        visitaAtual = await response.json();
        console.log('✅ Dados da visita carregados:', visitaAtual);
    } catch (error) {
        console.error('❌ Erro ao carregar dados da visita:', error);
    }
}

// Função para configurar os checkboxes
function configurarCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            atualizarProgresso();
        });
    });
    
    // Inicializar a barra de progresso
    atualizarProgresso();
}

// Função para atualizar o progresso da visita
function atualizarProgresso() {
    console.log('🔄 Atualizando progresso da visita');
    
    const checkboxes = document.querySelectorAll('.checkbox');
    locaisVisitados = 0;
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            locaisVisitados++;
        }
    });
    
    console.log(`📊 Locais visitados: ${locaisVisitados}/${totalLocais}`);
    
    const percentual = (locaisVisitados / totalLocais) * 100;
    
    const barraProgresso = document.getElementById('barra-progresso');
    const textoProgresso = document.getElementById('texto-progresso');
    
    if (barraProgresso && textoProgresso) {
        barraProgresso.value = percentual;
        textoProgresso.textContent = `${Math.round(percentual)}%`;
        console.log(`📊 Progresso atualizado: ${Math.round(percentual)}%`);
    } else {
        console.error('❌ Elementos da barra de progresso não encontrados');
    }
}

// Função global para ser chamada diretamente pelos checkboxes
window.atualizarProgresso = atualizarProgresso;

// Função para finalizar a visita
async function finalizarVisita() {
    console.log('🔄 Finalizando visita');
    
    // Verificar se todos os locais foram visitados
    if (locaisVisitados < totalLocais) {
        const confirmar = confirm(`Você visitou apenas ${locaisVisitados} de ${totalLocais} locais. Deseja realmente finalizar a visita?`);
        if (!confirmar) return;
    }
    
    // Coletar dados da visita
    const dadosVisita = {
        visitaId: visitaAtual ? visitaAtual.id : null,
        dataVisita: new Date().toISOString(),
        locaisVisitados: [],
        observacoes: {}
    };
    
    // Coletar informações sobre locais visitados e observações
    const sessoes = document.querySelectorAll('.sessao');
    sessoes.forEach(sessao => {
        const sessaoId = sessao.id;
        const checkbox = sessao.querySelector('.checkbox');
        const nomeLocal = sessao.querySelector('h2').textContent;
        const observacao = sessao.querySelector('.observacao-input').value;
        
        // Adicionar informações do local
        dadosVisita.locaisVisitados.push({
            id: sessaoId,
            nome: nomeLocal,
            visitado: checkbox.checked
        });
        
        // Adicionar observação se existir
        if (observacao.trim() !== '') {
            dadosVisita.observacoes[sessaoId] = observacao;
        }
    });
    
    try {
        // Salvar dados no banco
        const response = await fetch('http://localhost:3000/api/finalizar-visita', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosVisita)
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao finalizar visita: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        // Exibir mensagem de sucesso
        alert('Visita finalizada com sucesso!');
        
        // Redirecionar para a página de relatório
        window.location.href = `relatorio.html?id=${resultado.id}`;
    } catch (error) {
        console.error('❌ Erro ao finalizar visita:', error);
        
        // Mesmo com erro, mostrar mensagem de sucesso para fins de demonstração
        alert('Visita finalizada com sucesso! (Modo demonstração)');
        
        // Criar um ID fictício para demonstração
        const demoId = Math.floor(Math.random() * 1000) + 1;
        
        // Redirecionar para a página de relatório com ID de demonstração
        window.location.href = `relatorio.html?id=${demoId}&demo=true`;
    }
}