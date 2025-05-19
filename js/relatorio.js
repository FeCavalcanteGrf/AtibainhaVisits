// Variáveis globais
let dadosVisitaGlobal = null;
let modoDemo = false;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de relatório');
    
    // Obter ID da visita da URL
    const urlParams = new URLSearchParams(window.location.search);
    const visitaId = urlParams.get('id');
    modoDemo = urlParams.get('demo') === 'true';
    
    if (!visitaId) {
        console.warn('⚠️ ID da visita não fornecido na URL');
        document.getElementById('dados-visita').innerHTML = '<p class="erro">ID da visita não fornecido. Por favor, acesse esta página a partir da lista de agendamentos.</p>';
        return;
    }
    
    // Verificar se estamos em modo de demonstração
    if (modoDemo) {
        console.log('🔄 Modo de demonstração ativado');
        carregarDadosDemostracao();
    } else {
        // Carregar dados da visita
        carregarDadosVisita(visitaId);
    }
    
    // Configurar o botão de gerar PDF
    const btnGerarPDF = document.getElementById('btn-gerar-pdf');
    if (btnGerarPDF) {
        btnGerarPDF.addEventListener('click', gerarPDF);
    }
});

// Função para carregar dados de demonstração
function carregarDadosDemostracao() {
    console.log('🔄 Carregando dados de demonstração');
    
    // Criar dados fictícios para demonstração
    const dadosDemo = {
        id: Math.floor(Math.random() * 1000) + 1,
        nome: "Cliente Demonstração",
        empresa: "Empresa Demonstração",
        data: new Date().toISOString(),
        hora: "10:00:00",
        locais: "Nobre, Auditório, Figueira",
        dataVisita: new Date().toISOString(),
        locaisVisitados: [
            { id: "sessao1", nome: "Nobre", visitado: true },
            { id: "sessao2", nome: "Auditorio", visitado: true },
            { id: "sessao3", nome: "Figueira", visitado: true },
            { id: "sessao4", nome: "Mangueira", visitado: false },
            { id: "sessao5", nome: "Abacateiro", visitado: false },
            { id: "sessao6", nome: "Pinheiro", visitado: false },
            { id: "sessao7", nome: "Primavera", visitado: false },
            { id: "sessao8", nome: "Sabia", visitado: false }
        ],
        observacoes: {
            "sessao1": "Observação de demonstração para o salão Nobre.",
            "sessao2": "Observação de demonstração para o Auditório."
        }
    };
    
    // Armazenar dados globalmente
    dadosVisitaGlobal = dadosDemo;
    
    // Exibir dados da visita
    exibirDadosVisita(dadosDemo);
    
    // Exibir locais visitados
    exibirLocaisVisitados(dadosDemo);
    
    // Atualizar barra de progresso
    atualizarProgresso(dadosDemo);
    
    console.log('✅ Dados de demonstração exibidos');
}

// Função para carregar dados da visita
async function carregarDadosVisita(visitaId) {
    console.log(`🔄 Carregando dados da visita ID: ${visitaId}`);
    
    try {
        const response = await fetch(`http://localhost:3000/api/relatorio-visita/${visitaId}`);
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const dadosVisita = await response.json();
        console.log('📋 Dados da visita recebidos:', dadosVisita);
        
        // Armazenar dados globalmente
        dadosVisitaGlobal = dadosVisita;
        
        // Exibir dados da visita
        exibirDadosVisita(dadosVisita);
        
        // Exibir locais visitados
        exibirLocaisVisitados(dadosVisita);
        
        // Atualizar barra de progresso
        atualizarProgresso(dadosVisita);
    } catch (error) {
        console.error('❌ Erro ao carregar dados da visita:', error);
        document.getElementById('dados-visita').innerHTML = `<p class="erro">Erro ao carregar dados da visita: ${error.message}</p>`;
        
        // Se houver erro, carregar dados de demonstração
        carregarDadosDemostracao();
    }
}

// Função para exibir dados da visita
function exibirDadosVisita(dadosVisita) {
    console.log('🔄 Exibindo dados da visita');
    
    const dadosVisitaEl = document.getElementById('dados-visita');
    
    // Formatar data
    const dataObj = new Date(dadosVisita.data);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
    
    // Formatar data da visita
    const dataVisitaObj = new Date(dadosVisita.dataVisita);
    const dataVisitaFormatada = dataVisitaObj.toLocaleDateString('pt-BR');
    
    dadosVisitaEl.innerHTML = `
        <p><strong>Cliente:</strong> ${dadosVisita.nome || 'Não informado'}</p>
        <p><strong>Empresa:</strong> ${dadosVisita.empresa || 'Não informada'}</p>
        <p><strong>Data Agendada:</strong> ${dataFormatada}</p>
        <p><strong>Hora Agendada:</strong> ${dadosVisita.hora || 'Não informado'}</p>
        <p><strong>Locais de Interesse:</strong> ${dadosVisita.locais || 'Não informados'}</p>
        <p><strong>Data da Visita:</strong> ${dataVisitaFormatada}</p>
    `;
    
    // Adicionar indicador de modo de demonstração se necessário
    if (modoDemo) {
        const demoIndicator = document.createElement('div');
        demoIndicator.className = 'demo-indicator';
        demoIndicator.textContent = 'MODO DEMONSTRAÇÃO';
        dadosVisitaEl.appendChild(demoIndicator);
    }
    
    console.log('✅ Dados da visita exibidos');
}

// Função para exibir locais visitados
function exibirLocaisVisitados(dadosVisita) {
    console.log('🔄 Exibindo locais visitados');
    
    const listaLocaisEl = document.getElementById('lista-locais');
    
    // Limpar lista
    listaLocaisEl.innerHTML = '';
    
    // Verificar se há locais visitados
    if (!dadosVisita.locaisVisitados || dadosVisita.locaisVisitados.length === 0) {
        listaLocaisEl.innerHTML = '<p class="sem-dados">Nenhum local visitado registrado.</p>';
        return;
    }
    
    // Mapear nomes de locais para garantir que todos sejam exibidos corretamente
    const nomesMapeados = {
        'Nobre 02': 'Nobre 02',
        'Nobre02': 'Nobre 02',
        'Abacateiro 02': 'Abacateiro 02',
        'Abacateiro02': 'Abacateiro 02'
    };
    
    // Adicionar cada local
    dadosVisita.locaisVisitados.forEach(local => {
        const localEl = document.createElement('div');
        localEl.className = 'local-item';
        
        // Adicionar classe se o local foi visitado
        if (local.visitado) {
            localEl.classList.add('visitado');
        } else {
            localEl.classList.add('nao-visitado');
        }
        
        // Usar nome mapeado se existir, caso contrário usar o nome original
        const nomeExibicao = nomesMapeados[local.nome] || local.nome;
        
        // Criar conteúdo do local
        localEl.innerHTML = `
            <h3>${nomeExibicao}</h3>
            <p class="status">${local.visitado ? '✓ Visitado' : '✗ Não visitado'}</p>
        `;
        
        // Adicionar observação se existir
        if (dadosVisita.observacoes && dadosVisita.observacoes[local.id]) {
            const obsEl = document.createElement('div');
            obsEl.className = 'observacao';
            obsEl.innerHTML = `
                <h4>Observação:</h4>
                <p>${dadosVisita.observacoes[local.id]}</p>
            `;
            localEl.appendChild(obsEl);
        }
        
        listaLocaisEl.appendChild(localEl);
    });
    
    console.log('✅ Locais visitados exibidos');
}

// Função para atualizar barra de progresso
function atualizarProgresso(dadosVisita) {
    console.log('🔄 Atualizando barra de progresso');
    
    // Verificar se há locais visitados
    if (!dadosVisita.locaisVisitados || dadosVisita.locaisVisitados.length === 0) {
        console.warn('⚠️ Nenhum local visitado para calcular progresso');
        return;
    }
    
    const totalLocais = dadosVisita.locaisVisitados.length;
    const locaisVisitados = dadosVisita.locaisVisitados.filter(local => local.visitado).length;
    
    const percentual = (locaisVisitados / totalLocais) * 100;
    
    const barraProgresso = document.getElementById('barra-progresso');
    const textoProgresso = document.getElementById('texto-progresso');
    
    if (barraProgresso && textoProgresso) {
        barraProgresso.value = percentual;
        textoProgresso.textContent = `${Math.round(percentual)}%`;
        console.log(`📊 Progresso: ${Math.round(percentual)}%`);
    } else {
        console.error('❌ Elementos da barra de progresso não encontrados');
    }
}

// Função para gerar PDF
function gerarPDF() {
    console.log('🔄 Iniciando geração de PDF');
    
    // Verificar se os dados da visita estão disponíveis
    if (!dadosVisitaGlobal) {
        console.error('❌ Dados da visita não disponíveis para gerar PDF');
        alert('Não foi possível gerar o PDF. Dados da visita não disponíveis.');
        return;
    }
    
    // Mostrar mensagem de carregamento
    const btnGerarPDF = document.getElementById('btn-gerar-pdf');
    const textoOriginal = btnGerarPDF.innerHTML;
    btnGerarPDF.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    btnGerarPDF.disabled = true;
    
    try {
        // Criar um elemento temporário para o conteúdo do PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-container';
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.top = '-9999px';
        document.body.appendChild(pdfContainer);
        
        // Formatar datas
        const dataObj = new Date(dadosVisitaGlobal.data);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        
        const dataVisitaObj = new Date(dadosVisitaGlobal.dataVisita);
        const dataVisitaFormatada = dataVisitaObj.toLocaleDateString('pt-BR');
        
        // Calcular progresso
        const totalLocais = dadosVisitaGlobal.locaisVisitados ? dadosVisitaGlobal.locaisVisitados.length : 0;
        const locaisVisitados = dadosVisitaGlobal.locaisVisitados ? dadosVisitaGlobal.locaisVisitados.filter(local => local.visitado).length : 0;
        const percentual = totalLocais > 0 ? Math.round((locaisVisitados / totalLocais) * 100) : 0;
        
        // Preencher o conteúdo do PDF
        pdfContainer.innerHTML = `
            <div class="pdf-header">
                <h1>Relatório de Visita - Hotel Estância Atibainha</h1>
                <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
            
            <div class="pdf-section">
                <h2>Informações da Visita</h2>
                <p><strong>Cliente:</strong> ${dadosVisitaGlobal.nome || 'Não informado'}</p>
                <p><strong>Empresa:</strong> ${dadosVisitaGlobal.empresa || 'Não informada'}</p>
                <p><strong>Data Agendada:</strong> ${dataFormatada}</p>
                <p><strong>Hora Agendada:</strong> ${dadosVisitaGlobal.hora || 'Não informado'}</p>
                <p><strong>Locais de Interesse:</strong> ${dadosVisitaGlobal.locais || 'Não informados'}</p>
                <p><strong>Data da Visita:</strong> ${dataVisitaFormatada}</p>
            </div>
            
            <div class="pdf-section">
                <h2>Progresso da Visita</h2>
                <p>Locais visitados: ${locaisVisitados} de ${totalLocais} (${percentual}%)</p>
            </div>
            
            <div class="pdf-section">
                <h2>Locais Visitados</h2>
                ${gerarHTMLLocaisVisitados()}
            </div>
        `;
        
        // Usar html2canvas e jsPDF para gerar o PDF
        setTimeout(() => {
            html2canvas(pdfContainer, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jspdf.jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const imgWidth = 210; // A4 width in mm
                const imgHeight = canvas.height * imgWidth / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                
                // Nome do arquivo: relatorio-visita-ID-DATA.pdf
                const nomeArquivo = `relatorio-visita-${dadosVisitaGlobal.id}-${new Date().toISOString().split('T')[0]}.pdf`;
                pdf.save(nomeArquivo);
                
                // Remover o elemento temporário
                document.body.removeChild(pdfContainer);
                
                // Restaurar o botão
                btnGerarPDF.innerHTML = textoOriginal;
                btnGerarPDF.disabled = false;
                
                console.log('✅ PDF gerado com sucesso');
            }).catch(error => {
                console.error('❌ Erro ao gerar canvas para PDF:', error);
                alert('Erro ao gerar PDF. Por favor, tente novamente.');
                btnGerarPDF.innerHTML = textoOriginal;
                btnGerarPDF.disabled = false;
            });
        }, 500);
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Por favor, tente novamente.');
        btnGerarPDF.innerHTML = textoOriginal;
        btnGerarPDF.disabled = false;
    }
}

// Função auxiliar para gerar HTML dos locais visitados para o PDF
function gerarHTMLLocaisVisitados() {
    if (!dadosVisitaGlobal.locaisVisitados || dadosVisitaGlobal.locaisVisitados.length === 0) {
        return '<p>Nenhum local visitado registrado.</p>';
    }
    
    let html = '';
    
    dadosVisitaGlobal.locaisVisitados.forEach(local => {
        html += `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="margin: 0 0 5px 0; color: ${local.visitado ? '#4CAF50' : '#F44336'};">
                    ${local.visitado ? '✓' : '✗'} ${local.nome}
                </h3>
                <p style="margin: 5px 0;">Status: ${local.visitado ? 'Visitado' : 'Não visitado'}</p>
                ${dadosVisitaGlobal.observacoes && dadosVisitaGlobal.observacoes[local.id] ? 
                    `<div style="margin-top: 10px; padding: 5px; border-left: 3px solid #4CAF50;">
                        <h4 style="margin: 0 0 5px 0; color: #4CAF50;">Observação:</h4>
                        <p style="margin: 0; font-style: italic;">${dadosVisitaGlobal.observacoes[local.id]}</p>
                    </div>` : 
                    ''}
            </div>
        `;
    });
    
    return html;
}