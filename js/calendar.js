// Variáveis globais
let currentDate = new Date();
let visitas = [];
let serverOnline = false;
let DEBUG = true; // Ativando logs para depuração

// Função para log condicional
function logDebug(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando calendário');
    
    // Verificar status do servidor
    verificarStatusServidor().then(online => {
        serverOnline = online;
        
        // Configurar os botões de navegação
        document.getElementById('prev-month').addEventListener('click', function() {
            navigateMonth(-1);
        });
        
        document.getElementById('next-month').addEventListener('click', function() {
            navigateMonth(1);
        });
        
        // Configurar o botão de fechar popup
        const closePopupBtn = document.getElementById('close-popup');
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', closeVisitPopup);
        }
        
        // Configurar botões de fechar no popup
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', closeVisitPopup);
        });
        
        // Carregar visitas e renderizar o calendário
        carregarVisitas().then(() => {
            renderCalendar();
        });
        
        // Preencher a data de hoje no formulário
        const hoje = new Date();
        const dataFormatada = formatDate(hoje);
        const inputData = document.getElementById('novo-data');
        if (inputData) {
            inputData.value = dataFormatada;
        }
    });
});

// Função para verificar o status do servidor
async function verificarStatusServidor() {
    logDebug('🔄 Verificando status do servidor...');
    
    try {
        const response = await fetch('http://localhost:3000/test-connection', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Adicionar um timeout para não esperar muito tempo
            signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
            logDebug('✅ Servidor online');
            return true;
        } else {
            logDebug('⚠️ Servidor respondeu, mas com erro:', response.status);
            return false;
        }
    } catch (error) {
        logDebug('❌ Erro ao verificar status do servidor:', error);
        return false;
    }
}

// Função para navegar entre os meses
function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// Função para renderizar o calendário
function renderCalendar() {
    logDebug('🔄 Iniciando renderização do calendário');
    
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('❌ Elemento do calendário não encontrado');
        return;
    }
    
    // Atualizar o título do mês
    const monthYearEl = document.getElementById('month-year');
    if (monthYearEl) {
        monthYearEl.textContent = currentDate.toLocaleString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Limpar o calendário
    calendarEl.innerHTML = '';
    
    // Garantir que o calendário ocupe todo o espaço disponível
    calendarEl.style.width = '100%';
    calendarEl.style.display = 'block';
    
    // Criar uma tabela HTML para o calendário (abordagem mais compatível)
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '5px';
    table.style.tableLayout = 'fixed';
    table.style.margin = '0';
    table.style.padding = '0';
    
    // Criar cabeçalho com os dias da semana
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.padding = '10px';
        th.style.textAlign = 'center';
        th.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        th.style.color = 'white';
        th.style.fontWeight = 'bold';
        th.style.borderRadius = '8px';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    
    // Determinar o primeiro dia do mês e o número de dias
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Filtrar visitas para o mês atual
    const visitasDoMes = visitas.filter(visita => {
        if (!visita.data) return false;
        
        // Corrigir o problema com o fuso horário
        const dataStr = visita.data;
        // Remover a parte do fuso horário se existir
        const dataSemFuso = dataStr.split('T')[0];
        const [ano, mes, dia] = dataSemFuso.split('-').map(num => parseInt(num, 10));
        const mesAtual = currentDate.getMonth() + 1; // Mês atual (1-12)
        const anoAtual = currentDate.getFullYear();
        
        return mes === mesAtual && ano === anoAtual;
    });
    
    logDebug(`🔍 Visitas filtradas para ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}:`, visitasDoMes);
    
    // Criar as linhas e células do calendário
    let day = 1;
    const today = new Date();
    
    // Criar 6 linhas no máximo (suficiente para qualquer mês)
    for (let i = 0; i < 6; i++) {
        // Parar se já passamos do último dia do mês
        if (day > totalDays) break;
        
        const row = document.createElement('tr');
        
        // Criar 7 células para cada dia da semana
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            cell.style.height = '60px';
            cell.style.textAlign = 'center';
            cell.style.verticalAlign = 'middle';
            cell.style.borderRadius = '10px';
            cell.style.position = 'relative';
            
            // Adicionar dia apenas se estivermos no mês atual
            if (i === 0 && j < firstDayIndex) {
                // Dias vazios antes do início do mês
                cell.style.backgroundColor = 'transparent';
            } else if (day <= totalDays) {
                // Dias do mês atual
                cell.textContent = day;
                cell.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                cell.style.color = 'white';
                cell.style.cursor = 'pointer';
                
                // Verificar se é hoje
                if (currentDate.getFullYear() === today.getFullYear() && 
                    currentDate.getMonth() === today.getMonth() && 
                    day === today.getDate()) {
                    cell.style.border = '2px solid rgba(255, 255, 255, 0.8)';
                    cell.style.fontWeight = 'bold';
                }
                
                // Verificar se tem visita neste dia
                const currentDay = day; // Capturar o valor atual de day
                const visitasNoDia = visitasDoMes.filter(v => {
                    const dataStr = v.data;
                    const dataSemFuso = dataStr.split('T')[0];
                    const [ano, mes, diaVisita] = dataSemFuso.split('-').map(num => parseInt(num, 10));
                    return diaVisita === currentDay;
                });
                
                if (visitasNoDia.length > 0) {
                    // Marcar dias com visitas
                    cell.style.backgroundColor = 'rgba(76, 175, 80, 0.6)';
                    
                    // Adicionar indicador visual
                    const indicator = document.createElement('div');
                    indicator.style.position = 'absolute';
                    indicator.style.bottom = '5px';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translateX(-50%)';
                    indicator.style.width = '6px';
                    indicator.style.height = '6px';
                    indicator.style.borderRadius = '50%';
                    indicator.style.backgroundColor = 'white';
                    cell.appendChild(indicator);
                    
                    // Adicionar evento de clique
                    cell.addEventListener('click', function() {
                        showVisitDetails(visitasNoDia);
                    });
                    
                    // Armazenar dados da visita no atributo data
                    cell.setAttribute('data-visitas', JSON.stringify(visitasNoDia));
                }
                
                day++;
            } else {
                // Dias vazios após o fim do mês
                cell.style.backgroundColor = 'transparent';
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    calendarEl.appendChild(table);
    
    logDebug('✅ Calendário renderizado com sucesso');
}

// Função para formatar data como YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Função para carregar visitas do servidor
async function carregarVisitas() {
    try {
        const response = await fetch('http://localhost:3000/api/visitas');
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar a estrutura dos dados
        if (Array.isArray(data)) {
            visitas = data;
            console.log('✅ Visitas carregadas com sucesso:', visitas);
        } else {
            console.error('❌ Dados recebidos não são um array');
            visitas = [];
        }
        
        return visitas;
    } catch (error) {
        console.error('❌ Erro ao carregar visitas:', error);
        
        // Se não conseguir carregar do servidor, retorna um array vazio
        visitas = [];
        return visitas;
    }
}

// Função para mostrar detalhes da visita
function showVisitDetails(visitasNoDia) {
    const popup = document.getElementById('visit-popup');
    const popupContent = document.getElementById('popup-content');
    
    if (!popup || !popupContent) {
        console.error('❌ Elementos do popup não encontrados');
        return;
    }
    
    // Limpar conteúdo anterior
    popupContent.innerHTML = '';
    
    // Adicionar título
    const title = document.createElement('h3');
    
    // Corrigir o problema com o fuso horário
    const dataStr = visitasNoDia[0].data;
    // Remover a parte do fuso horário se existir
    const dataSemFuso = dataStr.split('T')[0];
    const [ano, mes, dia] = dataSemFuso.split('-').map(num => parseInt(num, 10));
    const dataFormatada = new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
    
    title.textContent = `Visitas em ${dataFormatada}`;
    popupContent.appendChild(title);
    
    // Adicionar botão de fechar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-popup';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeVisitPopup);
    popupContent.appendChild(closeBtn);
    
    // Adicionar detalhes de cada visita
    visitasNoDia.forEach((visita, index) => {
        if (index > 0) {
            const divider = document.createElement('hr');
            popupContent.appendChild(divider);
        }
        
        const details = document.createElement('div');
        details.className = 'visit-details';
        
        details.innerHTML = `
            <p><strong>Nome:</strong> ${visita.nome || 'Não informado'}</p>
            <p><strong>Empresa:</strong> ${visita.empresa || 'Não informada'}</p>
            <p><strong>Horário:</strong> ${visita.hora || 'Não informado'}</p>
            <p><strong>Locais:</strong> ${visita.locais || 'Não informados'}</p>
        `;
        
        popupContent.appendChild(details);
        
        // Adicionar botão de iniciar visita
        const iniciarBtn = document.createElement('button');
        iniciarBtn.className = 'btn-iniciar-visita';
        iniciarBtn.textContent = 'Iniciar Visita';
        iniciarBtn.addEventListener('click', function() {
            // Simplesmente redirecionar para a página de visita
            window.location.href = 'visita.html';
        });
        
        const btnContainer = document.createElement('div');
        btnContainer.className = 'btn-container';
        btnContainer.appendChild(iniciarBtn);
        
        popupContent.appendChild(btnContainer);
    });
    
    // Adicionar botões de ação
    const actions = document.createElement('div');
    actions.className = 'popup-actions';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'btn-close';
    closeButton.textContent = 'Fechar';
    closeButton.addEventListener('click', closeVisitPopup);
    actions.appendChild(closeButton);
    
    popupContent.appendChild(actions);
    
    // Mostrar o popup
    popup.style.display = 'flex';
}

// Função para fechar o popup de visita
function closeVisitPopup() {
    const popup = document.getElementById('visit-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Função para cadastrar uma nova visita
function cadastrarVisita(event) {
    event.preventDefault();
    
    const nome = document.getElementById('novo-nome').value;
    const empresa = document.getElementById('novo-empresa').value;
    const data = document.getElementById('novo-data').value;
    const hora = document.getElementById('novo-hora').value;
    const locais = document.getElementById('novo-locais').value;
    
    if (!nome || !empresa || !data || !hora || !locais) {
        alert('Por favor, preencha todos os campos.');
        return false;
    }
    
    // Enviar dados para o servidor
    fetch('http://localhost:3000/api/cadastrar-visita', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            nome: nome, 
            empresa: empresa, 
            data: data, 
            hora: hora, 
            locais: locais 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        return response.json();
    })
    .then(data => {
        alert('Visita cadastrada com sucesso!');
        
        // Resetar o formulário
        document.getElementById('register-visit-form').reset();
        
        // Preencher a data de hoje novamente
        const hoje = new Date();
        const dataFormatada = formatDate(hoje);
        const inputData = document.getElementById('novo-data');
        if (inputData) {
            inputData.value = dataFormatada;
        }
        
        // Recarregar visitas e atualizar o calendário
        carregarVisitas().then(() => {
            renderCalendar();
        });
    })
    .catch(error => {
        console.error('❌ Erro ao cadastrar visita:', error);
        alert('Erro ao cadastrar visita. Verifique se o servidor está rodando na porta 3000.');
    });
    
    return false;
}