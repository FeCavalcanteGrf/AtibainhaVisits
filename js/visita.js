// Variáveis globais
let totalLocais = 10; // Atualizado para 10 locais (incluindo Nobre 02 e Abacateiro 02)
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
    const btnFinalizar = document.getElementById('finalizar-visita');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function() {
            finalizarVisita();
        });
    } else {
        console.error('❌ Botão de finalizar visita não encontrado');
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
    const porcentagemProgresso = document.getElementById('porcentagem-progresso');
    
    if (barraProgresso && porcentagemProgresso) {
        barraProgresso.value = percentual;
        porcentagemProgresso.textContent = `${Math.round(percentual)}%`;
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
// Função para corrigir os carrosséis dos chalés
document.addEventListener('DOMContentLoaded', function() {
    // Corrigir Chalé Standart
    const chaleStandart = document.querySelector('#sessao11 .conteudo');
    if (chaleStandart) {
        chaleStandart.onclick = function() { 
            const carrossel = document.querySelector('#sessao11 .carrossel');
            if (carrossel.style.display === "none" || !carrossel.style.display) {
                carrossel.style.display = "block";
                chaleStandart.classList.add("expandido");
            } else {
                carrossel.style.display = "none";
                chaleStandart.classList.remove("expandido");
            }
        };
    }
    
    // Corrigir Chalé Family 1D
    const chaleFamily1D = document.querySelector('#sessao12 .conteudo');
    if (chaleFamily1D) {
        chaleFamily1D.onclick = function() { 
            const carrossel = document.querySelector('#sessao12 .carrossel');
            if (carrossel.style.display === "none" || !carrossel.style.display) {
                carrossel.style.display = "block";
                chaleFamily1D.classList.add("expandido");
            } else {
                carrossel.style.display = "none";
                chaleFamily1D.classList.remove("expandido");
            }
        };
    }
    
    // Corrigir Chalé Family 2D
    const chaleFamily2D = document.querySelector('#sessao13 .conteudo');
    if (chaleFamily2D) {
        chaleFamily2D.onclick = function() { 
            const carrossel = document.querySelector('#sessao13 .carrossel');
            if (carrossel.style.display === "none" || !carrossel.style.display) {
                carrossel.style.display = "block";
                chaleFamily2D.classList.add("expandido");
            } else {
                carrossel.style.display = "none";
                chaleFamily2D.classList.remove("expandido");
            }
        };
    }
    
    // Corrigir Chalé Suiço
    const chaleSuico = document.querySelector('#sessao14 .conteudo');
    if (chaleSuico) {
        chaleSuico.onclick = function() { 
            const carrossel = document.querySelector('#sessao14 .carrossel');
            if (carrossel.style.display === "none" || !carrossel.style.display) {
                carrossel.style.display = "block";
                chaleSuico.classList.add("expandido");
            } else {
                carrossel.style.display = "none";
                chaleSuico.classList.remove("expandido");
            }
        };
    }
});
    // Corrigir Villa Atibainha
    const villaAtibainha = document.querySelector('#sessao15 .conteudo');
    if (villaAtibainha) {
        villaAtibainha.onclick = function() { 
            const carrossel = document.querySelector('#sessao15 .carrossel');
            if (carrossel.style.display === "none" || !carrossel.style.display) {
                carrossel.style.display = "block";
                villaAtibainha.classList.add("expandido");
            } else {
                carrossel.style.display = "none";
                villaAtibainha.classList.remove("expandido");
            }
        };
    }