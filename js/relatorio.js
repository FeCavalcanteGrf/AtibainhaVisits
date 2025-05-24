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
        // Formatar datas
        const dataObj = new Date(dadosVisitaGlobal.data);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        
        const dataVisitaObj = new Date(dadosVisitaGlobal.dataVisita);
        const dataVisitaFormatada = dataVisitaObj.toLocaleDateString('pt-BR');
        
        // Calcular progresso
        const totalLocais = dadosVisitaGlobal.locaisVisitados ? dadosVisitaGlobal.locaisVisitados.length : 0;
        const locaisVisitados = dadosVisitaGlobal.locaisVisitados ? dadosVisitaGlobal.locaisVisitados.filter(local => local.visitado).length : 0;
        const percentual = totalLocais > 0 ? Math.round((locaisVisitados / totalLocais) * 100) : 0;
        
        // Inicializar o PDF
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Definir cores do tema vermelho
        const corPrimaria = [180, 0, 0];       // Vermelho escuro
        const corSecundaria = [220, 0, 0];     // Vermelho médio
        const corDestaque = [255, 0, 0];       // Vermelho vivo
        const corFundo = [255, 240, 240];      // Vermelho claro (fundo)
        
        // Definir margens e dimensões
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);
        
        // Adicionar fundo vermelho claro na página
        pdf.setFillColor(corFundo[0], corFundo[1], corFundo[2]);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Posição Y atual (começa do topo com margem)
        let yPos = margin;
        
        // Adicionar cabeçalho com tema vermelho
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        pdf.text('Relatório de Visita - Hotel Estância Atibainha', margin, yPos);
        yPos += 10;
        
        // Adicionar barra decorativa vermelha
        pdf.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        pdf.rect(margin, yPos - 5, contentWidth, 1, 'F');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPos);
        yPos += 15;
        
        // Adicionar informações da visita com tema vermelho
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        pdf.text('Informações da Visita', margin, yPos);
        yPos += 8;
        
        // Adicionar barra decorativa vermelha
        pdf.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        pdf.rect(margin, yPos - 5, contentWidth / 2, 1, 'F');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Cliente: ${dadosVisitaGlobal.nome || 'Não informado'}`, margin, yPos);
        yPos += 6;
        
        pdf.text(`Empresa: ${dadosVisitaGlobal.empresa || 'Não informada'}`, margin, yPos);
        yPos += 6;
        
        pdf.text(`Data Agendada: ${dataFormatada}`, margin, yPos);
        yPos += 6;
        
        pdf.text(`Hora Agendada: ${dadosVisitaGlobal.hora || 'Não informado'}`, margin, yPos);
        yPos += 6;
        
        pdf.text(`Locais de Interesse: ${dadosVisitaGlobal.locais || 'Não informados'}`, margin, yPos);
        yPos += 6;
        
        pdf.text(`Data da Visita: ${dataVisitaFormatada}`, margin, yPos);
        yPos += 15;
        
        // Adicionar progresso da visita com tema vermelho
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        pdf.text('Progresso da Visita', margin, yPos);
        yPos += 8;
        
        // Adicionar barra decorativa vermelha
        pdf.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        pdf.rect(margin, yPos - 5, contentWidth / 2, 1, 'F');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Locais visitados: ${locaisVisitados} de ${totalLocais} (${percentual}%)`, margin, yPos);
        
        // Adicionar barra de progresso visual
        yPos += 6;
        const barraWidth = contentWidth * 0.8;
        const barraHeight = 5;
        const progressWidth = (percentual / 100) * barraWidth;
        
        // Fundo da barra (cinza claro)
        pdf.setFillColor(230, 230, 230);
        pdf.rect(margin, yPos, barraWidth, barraHeight, 'F');
        
        // Progresso da barra (vermelho)
        pdf.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        pdf.rect(margin, yPos, progressWidth, barraHeight, 'F');
        
        yPos += 15;
        
        // Adicionar locais visitados com tema vermelho
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        pdf.text('Locais Visitados', margin, yPos);
        yPos += 8;
        
        // Adicionar barra decorativa vermelha
        pdf.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        pdf.rect(margin, yPos - 5, contentWidth / 2, 1, 'F');
        
        yPos += 2;
        
        // Verificar se há locais visitados
        if (!dadosVisitaGlobal.locaisVisitados || dadosVisitaGlobal.locaisVisitados.length === 0) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(0, 0, 0);
            pdf.text('Nenhum local visitado registrado.', margin, yPos);
        } else {
            // Adicionar cada local visitado
            dadosVisitaGlobal.locaisVisitados.forEach(local => {
                // Verificar se precisamos adicionar uma nova página
                if (yPos > pageHeight - 30) {
                    pdf.addPage();
                    // Adicionar fundo vermelho claro na nova página
                    pdf.setFillColor(corFundo[0], corFundo[1], corFundo[2]);
                    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                    yPos = margin;
                }
                
                // Adicionar caixa de fundo para cada local
                const boxHeight = local.visitado ? 
                    (dadosVisitaGlobal.observacoes && dadosVisitaGlobal.observacoes[local.id] ? 30 : 20) : 
                    (dadosVisitaGlobal.observacoes && dadosVisitaGlobal.observacoes[local.id] ? 30 : 20);
                
                pdf.setFillColor(255, 255, 255); // Fundo branco para a caixa
                pdf.setDrawColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]); // Borda vermelha
                pdf.roundedRect(margin - 2, yPos - 5, contentWidth + 4, boxHeight, 2, 2, 'FD');
                
                // Nome do local
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                
                // Cor baseada no status
                if (local.visitado) {
                    pdf.setTextColor(0, 128, 0); // Verde para visitado
                } else {
                    pdf.setTextColor(corDestaque[0], corDestaque[1], corDestaque[2]); // Vermelho vivo para não visitado
                }
                
                pdf.text(`${local.visitado ? '✓' : '✗'} ${local.nome}`, margin, yPos);
                yPos += 6;
                
                // Status
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0); // Voltar para preto
                pdf.text(`Status: ${local.visitado ? 'Visitado' : 'Não visitado'}`, margin, yPos);
                yPos += 6;
                
                // Observação (se existir)
                if (dadosVisitaGlobal.observacoes && dadosVisitaGlobal.observacoes[local.id]) {
                    // Verificar se precisamos adicionar uma nova página para a observação
                    if (yPos > pageHeight - 40) {
                        pdf.addPage();
                        // Adicionar fundo vermelho claro na nova página
                        pdf.setFillColor(corFundo[0], corFundo[1], corFundo[2]);
                        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                        yPos = margin;
                    }
                    
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]); // Vermelho escuro
                    pdf.text('Observação:', margin, yPos);
                    yPos += 6;
                    
                    pdf.setFont('helvetica', 'italic');
                    pdf.setTextColor(0, 0, 0); // Preto
                    
                    // Quebrar texto longo em múltiplas linhas
                    const observacao = dadosVisitaGlobal.observacoes[local.id];
                    const splitText = pdf.splitTextToSize(observacao, contentWidth - 10);
                    
                    splitText.forEach(line => {
                        // Verificar se precisamos adicionar uma nova página
                        if (yPos > pageHeight - 20) {
                            pdf.addPage();
                            // Adicionar fundo vermelho claro na nova página
                            pdf.setFillColor(corFundo[0], corFundo[1], corFundo[2]);
                            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                            yPos = margin;
                        }
                        
                        pdf.text(line, margin + 5, yPos);
                        yPos += 5;
                    });
                }
                
                // Espaço entre locais
                yPos += 10;
                
                // Verificar se precisamos adicionar uma nova página para o próximo local
                if (yPos > pageHeight - 40) {
                    pdf.addPage();
                    // Adicionar fundo vermelho claro na nova página
                    pdf.setFillColor(corFundo[0], corFundo[1], corFundo[2]);
                    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
                    yPos = margin;
                }
            });
        }
        
        // Adicionar rodapé com tema vermelho
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        pdf.text('Hotel Estância Atibainha - Relatório de Visita', margin, pageHeight - 10);
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 40, pageHeight - 10, { align: 'right' });
        
        // Nome do arquivo: relatorio-visita-ID-DATA.pdf
        const nomeArquivo = `relatorio-visita-${dadosVisitaGlobal.id}-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(nomeArquivo);
        
        // Restaurar o botão
        btnGerarPDF.innerHTML = textoOriginal;
        btnGerarPDF.disabled = false;
        
        console.log('✅ PDF gerado com sucesso');
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
// Função para exibir locais visitados
function exibirLocaisVisitados(dadosVisita) {
    console.log('🔄 Exibindo locais visitados');
    
    // Limpar o container existente
    const listaLocaisEl = document.getElementById('lista-locais');
    listaLocaisEl.innerHTML = '';
    
    // Verificar se há locais visitados
    if (!dadosVisita.locaisVisitados || dadosVisita.locaisVisitados.length === 0) {
        listaLocaisEl.innerHTML = '<p class="sem-dados">Nenhum local visitado registrado.</p>';
        return;
    }
    
    // Criar container flex para as duas colunas
    const flexContainer = document.createElement('div');
    flexContainer.style.display = 'flex';
    flexContainer.style.gap = '20px';
    
    // Criar coluna para salões
    const colunaSaloes = document.createElement('div');
    colunaSaloes.style.flex = '1';
    colunaSaloes.innerHTML = '<h3 style="color:white;border-bottom:2px solid white;margin-bottom:15px;">Salões</h3>';
    
    // Criar coluna para chalés
    const colunaChales = document.createElement('div');
    colunaChales.style.flex = '1';
    colunaChales.innerHTML = '<h3 style="color:white;border-bottom:2px solid white;margin-bottom:15px;">Chalés</h3>';
    
    // Adicionar colunas ao container
    flexContainer.appendChild(colunaSaloes);
    flexContainer.appendChild(colunaChales);
    
    // Adicionar container ao elemento principal
    listaLocaisEl.appendChild(flexContainer);
    
    // Exibir salões e chalés
    exibirSaloes(dadosVisita, colunaSaloes);
    exibirChales(dadosVisita, colunaChales);
    
    console.log('✅ Locais visitados exibidos');
}

// Função para exibir salões
function exibirSaloes(dadosVisita, container) {
    // Filtrar apenas os salões (sessao1 até sessao10)
    const saloes = dadosVisita.locaisVisitados.filter(local => 
        parseInt(local.id.replace('sessao', '')) <= 10
    );
    
    if (saloes.length === 0) {
        container.innerHTML += '<p class="sem-dados">Nenhum salão visitado.</p>';
        return;
    }
    
    saloes.forEach(local => {
        const localEl = document.createElement('div');
        localEl.className = 'local-item';
        
        if (local.visitado) {
            localEl.classList.add('visitado');
        } else {
            localEl.classList.add('nao-visitado');
        }
        
        localEl.innerHTML = `
            <h3>${local.nome}</h3>
            <p class="status">${local.visitado ? '✓ Visitado' : '✗ Não visitado'}</p>
        `;
        
        if (dadosVisita.observacoes && dadosVisita.observacoes[local.id]) {
            const obsEl = document.createElement('div');
            obsEl.className = 'observacao';
            obsEl.innerHTML = `
                <h4>Observação:</h4>
                <p>${dadosVisita.observacoes[local.id]}</p>
            `;
            localEl.appendChild(obsEl);
        }
        
        container.appendChild(localEl);
    });
}

// Função para exibir chalés
function exibirChales(dadosVisita, container) {
    // Filtrar apenas os chalés (sessao11 em diante)
    const chales = dadosVisita.locaisVisitados.filter(local => 
        parseInt(local.id.replace('sessao', '')) > 10
    );
    
    if (chales.length === 0) {
        container.innerHTML += '<p class="sem-dados">Nenhum chalé visitado.</p>';
        return;
    }
    
    chales.forEach(local => {
        const localEl = document.createElement('div');
        localEl.className = 'local-item';
        
        if (local.visitado) {
            localEl.classList.add('visitado');
        } else {
            localEl.classList.add('nao-visitado');
        }
        
        localEl.innerHTML = `
            <h3>${local.nome}</h3>
            <p class="status">${local.visitado ? '✓ Visitado' : '✗ Não visitado'}</p>
        `;
        
        if (dadosVisita.observacoes && dadosVisita.observacoes[local.id]) {
            const obsEl = document.createElement('div');
            obsEl.className = 'observacao';
            obsEl.innerHTML = `
                <h4>Observação:</h4>
                <p>${dadosVisita.observacoes[local.id]}</p>
            `;
            localEl.appendChild(obsEl);
        }
        
        container.appendChild(localEl);
    });
}