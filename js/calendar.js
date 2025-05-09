// Variáveis globais
let currentDate = new Date();
let visitas = [];
let serverOnline = false;
let DEBUG = false; // Controle para logs de depuração

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
    
    // Forçar o layout correto
    calendarEl.style.display = 'flex';
    calendarEl.style.flexDirection = 'column';
    calendarEl.style.width = '100%';
    
    // Adicionar cabeçalho dos dias da semana
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekdaysContainer = document.createElement('div');
    weekdaysContainer.className = 'weekdays';
    
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        weekdaysContainer.appendChild(dayEl);
    });
    
    calendarEl.appendChild(weekdaysContainer);
    
    // Criar o grid do calendário
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Determinar o primeiro dia do mês e o número de dias
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Adicionar células vazias para os dias antes do primeiro dia do mês
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Adicionar os dias do mês
    const today = new Date();
    
    // Filtrar visitas para o mês atual
    const visitasDoMes = visitas.filter(visita => {
        if (!visita.tb_data) return false;
        
        // Corrigir o problema com o fuso horário
        const dataStr = visita.tb_data;
        const [ano, mes, dia] = dataStr.split('-').map(num => parseInt(num, 10));
        const mesAtual = currentDate.getMonth() + 1; // Mês atual (1-12)
        const anoAtual = currentDate.getFullYear();
        
        return mes === mesAtual && ano === anoAtual;
    });
    
    for (let day = 1; day <= totalDays; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Verificar se é hoje
        if (currentDate.getFullYear() === today.getFullYear() && 
            currentDate.getMonth() === today.getMonth() && 
            day === today.getDate()) {
            dayEl.classList.add('today');
        }
        
        // Verificar se tem visita neste dia
        const visitasNoDia = visitasDoMes.filter(v => {
            // Corrigir o problema com o fuso horário
            const dataStr = v.tb_data;
            const [ano, mes, diaVisita] = dataStr.split('-').map(num => parseInt(num, 10));
            
            return diaVisita === day;
        });
        
        if (visitasNoDia.length > 0) {
            // Usar sempre verde para todas as visitas
            dayEl.classList.add('has-visit');
            
            // Adicionar dados da visita como atributos de dados
            dayEl.setAttribute('data-visitas', JSON.stringify(visitasNoDia));
            
            // Adicionar evento de clique para mostrar detalhes da visita
            dayEl.addEventListener('click', function() {
                showVisitDetails(visitasNoDia);
            });
        }
        
        calendarGrid.appendChild(dayEl);
    }
    
    calendarEl.appendChild(calendarGrid);
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
    const dataStr = visitasNoDia[0].tb_data;
    const [ano, mes, dia] = dataStr.split('-').map(num => parseInt(num, 10));
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
            <p><strong>Nome:</strong> ${visita.tb_nome || 'Não informado'}</p>
            <p><strong>Empresa:</strong> ${visita.tb_empresa || 'Não informada'}</p>
            <p><strong>Horário:</strong> ${visita.tb_hora || 'Não informado'}</p>
            <p><strong>Locais:</strong> ${visita.tb_locais || 'Não informados'}</p>
        `;
        
        popupContent.appendChild(details);
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