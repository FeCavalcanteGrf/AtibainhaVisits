// Mock server para simular dados de visitas quando o servidor real não está disponível
console.log('🚀 Iniciando mock server para dados de visitas');

// Função para formatar data como YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Gerar dados de exemplo
function gerarDadosExemplo() {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    const proximaSemana = new Date();
    proximaSemana.setDate(hoje.getDate() + 7);
    
    return [
        {
            id: 1,
            nome: "Visita de Hoje",
            empresa: "Empresa ABC",
            data: formatDate(hoje),
            hora: "14:00",
            locais: "Recepção, Área Externa"
        },
        {
            id: 2,
            nome: "Visita de Amanhã",
            empresa: "Empresa XYZ",
            data: formatDate(amanha),
            hora: "10:30",
            locais: "Salão Principal, Jardim"
        },
        {
            id: 3,
            nome: "Visita de Ontem",
            empresa: "Empresa 123",
            data: formatDate(ontem),
            hora: "15:45",
            locais: "Área de Eventos"
        },
        {
            id: 4,
            nome: "Visita Futura",
            empresa: "Empresa Futura",
            data: formatDate(proximaSemana),
            hora: "09:00",
            locais: "Todas as áreas"
        }
    ];
}

// Substituir a função fetch global para interceptar chamadas para a API de visitas
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    console.log(`🔄 Mock server interceptando requisição para: ${url}`);
    
    // Interceptar apenas chamadas para a API de visitas
    if (url.includes('/api/visitas')) {
        console.log('✅ Retornando dados simulados de visitas');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(gerarDadosExemplo())
                });
            }, 300); // Simular um pequeno atraso de rede
        });
    }
    
    // Interceptar chamadas para cadastrar visitas
    if (url.includes('/api/cadastrar-visita')) {
        console.log('✅ Simulando cadastro de visita');
        const data = JSON.parse(options.body);
        console.log('📋 Dados recebidos:', data);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ 
                        message: 'Visita cadastrada com sucesso',
                        id: Date.now()
                    })
                });
            }, 500); // Simular um pequeno atraso de rede
        });
    }
    
    // Para outras chamadas, usar o fetch original
    return originalFetch(url, options);
};

console.log('✅ Mock server configurado com sucesso');
console.log('📊 Dados de exemplo gerados:', gerarDadosExemplo());