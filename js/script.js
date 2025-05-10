const fundos = [
    '../img/Alvorada.jpeg',
    '../img/Castelinho.jpeg',
    '../img/Fonte.jpeg',
    '../img/RecantoDaHarmonia.jpeg',
    '../img/PianoBar.jpeg',
];

console.log('🔍 Script.js carregado');

function toggleSaloes() {
    console.log('🔄 Função toggleSaloes chamada');
    const saloesContainer = document.querySelector('.saloes');
    console.log('📦 Container de salões encontrado:', saloesContainer ? 'Sim' : 'Não');
    saloesContainer.classList.toggle('minimized');
    console.log('✅ Classe minimized alternada');
}

function toggleCarrossel(carrosselId) {
    console.log(`🔄 Função toggleCarrossel chamada para: ${carrosselId}`);
    const conteudo = document.querySelector(`[onclick="toggleCarrossel('${carrosselId}')"]`);
    console.log('📦 Elemento conteúdo encontrado:', conteudo ? 'Sim' : 'Não');
    const carrossel = document.getElementById(carrosselId);
    console.log('📦 Elemento carrossel encontrado:', carrossel ? 'Sim' : 'Não');

    // Alterna a visibilidade do carrossel
    if (carrossel.style.display === "none" || !carrossel.style.display) {
        console.log('📊 Exibindo carrossel');
        carrossel.style.display = "block";
        conteudo.classList.add("expandido"); // Adiciona a classe expandido
        console.log('✅ Classe expandido adicionada');
    } else {
        console.log('📊 Ocultando carrossel');
        carrossel.style.display = "none";
        conteudo.classList.remove("expandido"); // Remove a classe expandido
        console.log('✅ Classe expandido removida');
    }
}

function moveCarrossel(id, direction) {
    console.log(`🔄 Função moveCarrossel chamada para: ${id}, direção: ${direction}`);
    const carrossel = document.getElementById(id);
    console.log('📦 Elemento carrossel encontrado:', carrossel ? 'Sim' : 'Não');
    
    if (!carrossel) {
        console.error(`❌ Carrossel com ID ${id} não encontrado`);
        return;
    }
    
    const imagens = carrossel.querySelector('.carrossel-imagens');
    console.log('📦 Container de imagens encontrado:', imagens ? 'Sim' : 'Não');
    
    if (!imagens) {
        console.error(`❌ Container de imagens não encontrado no carrossel ${id}`);
        return;
    }
    
    const imgs = imagens.querySelectorAll('img');
    console.log(`📊 Total de imagens encontradas: ${imgs.length}`);
    const totalImages = imgs.length;

    let currentIndex = parseInt(imagens.getAttribute('data-index')) || 0;
    console.log(`📊 Índice atual: ${currentIndex}`);

    currentIndex += direction;
    console.log(`📊 Novo índice (antes da verificação): ${currentIndex}`);

    if (currentIndex >= totalImages) {
        currentIndex = 0;
        console.log('🔄 Índice ajustado para o início');
    } else if (currentIndex < 0) {
        currentIndex = totalImages - 1;
        console.log('🔄 Índice ajustado para o final');
    }

    console.log(`📊 Índice final: ${currentIndex}`);
    imagens.setAttribute('data-index', currentIndex);

    imgs.forEach(img => img.classList.remove('active'));
    imgs[currentIndex].classList.add('active');
    console.log(`✅ Imagem ${currentIndex} ativada`);
}

setInterval(() => {
    console.log('⏱️ Intervalo de carrossel executando');
    
    const carrossel1 = document.getElementById('carrossel1');
    if (carrossel1 && carrossel1.style.display === 'block') {
        console.log('🔄 Movendo carrossel1');
        moveCarrossel('carrossel1', 1);
    }

    const carrossel2 = document.getElementById('carrossel2');
    if (carrossel2 && carrossel2.style.display === 'block') {
        console.log('🔄 Movendo carrossel2');
        moveCarrossel('carrossel2', 1);
    }

    const carrossel3 = document.getElementById('carrossel3');
    if (carrossel3 && carrossel3.style.display === 'block') {
        console.log('🔄 Movendo carrossel3');
        moveCarrossel('carrossel3', 1);
    }
}, 3000);

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded - Configurando eventos');
    
    document.querySelectorAll('.conteudo').forEach(conteudo => {
        console.log('📦 Configurando evento para elemento conteúdo');
        conteudo.addEventListener('click', () => {
            console.log('🖱️ Conteúdo clicado');
            const sessao = conteudo.closest('.sessao');
            console.log('📦 Sessão encontrada:', sessao ? 'Sim' : 'Não');
            sessao.classList.toggle('expandida');
            console.log('✅ Classe expandida alternada');
        });
    });

    const menuToggle = document.getElementById('menu-toggle');
    console.log('📦 Botão de menu encontrado:', menuToggle ? 'Sim' : 'Não');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            console.log('🖱️ Botão de menu clicado');
            const navLinks = document.getElementById('nav-links');
            console.log('📦 Nav links encontrados:', navLinks ? 'Sim' : 'Não');
            navLinks.classList.toggle('active');
            console.log('✅ Classe active alternada');
        });
    }
    
    console.log('✅ Eventos configurados com sucesso');
});

/*--------------------------------------------------*/

// Função para abrir o popup
function openPopup(celula = null) {
    console.log('🔄 Função openPopup chamada');
    console.log('📦 Célula fornecida:', celula ? 'Sim' : 'Não');
    
    const popup = document.getElementById('visit-popup');
    console.log('📦 Popup encontrado:', popup ? 'Sim' : 'Não');
    
    if (celula) {
        console.log('📊 Processando dados da célula');
        const nome = document.getElementById('popup-nome');
        const empresa = document.getElementById('popup-empresa');
        const data = document.getElementById('popup-data');
        const hora = document.getElementById('popup-hora');
        const locais = document.getElementById('popup-locais');
        
        // Preencher os dados da visita
        if (celula.classList.contains('visita')) {
            console.log('📊 Célula contém classe visita, preenchendo dados');
            nome.textContent = celula.getAttribute('data-nome') || "Não informado";
            empresa.textContent = celula.getAttribute('data-empresa') || "Não informado";
            data.textContent = celula.getAttribute('data-data') || "Não informado";
            hora.textContent = celula.getAttribute('data-hora') || "Não informado";
            locais.textContent = celula.getAttribute('data-locais') || "Não informado";
            console.log('✅ Dados preenchidos no popup');
        } else {
            console.log('ℹ️ Célula não contém classe visita');
        }
    }

    popup.style.display = 'flex';
    console.log('✅ Popup exibido');
}

// Função para fechar o popup
function closePopup() {
    console.log('🔄 Função closePopup chamada');
    const popup = document.getElementById('visit-popup');
    console.log('📦 Popup encontrado:', popup ? 'Sim' : 'Não');
    
    if (popup) {
        popup.style.display = 'none';
        console.log('✅ Popup ocultado');
    } else {
        console.error('❌ Elemento popup não encontrado');
    }
}

// Função para cadastrar visita e marcar o calendário
function cadastrarVisita(event) {
    console.log('🔄 Função cadastrarVisita chamada');
    event.preventDefault(); // Evitar envio do formulário
    console.log('🛑 Comportamento padrão do formulário prevenido');

    const nome = document.getElementById('novo-nome').value;
    const empresa = document.getElementById('novo-empresa').value;
    const data = document.getElementById('novo-data').value;
    const hora = document.getElementById('novo-hora').value;
    const locais = document.getElementById('novo-locais').value;

    console.log('📋 Dados coletados:', { nome, empresa, data, hora, locais });

    if (!nome || !empresa || !data || !hora || !locais) {
        console.warn('⚠️ Campos obrigatórios não preenchidos');
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Ajustar para garantir que a data será exatamente a fornecida pelo usuário (sem considerar o fuso horário)
    console.log('🔄 Processando data');
    const dataParts = data.split('-');  // Dividir a data no formato YYYY-MM-DD
    console.log('📊 Partes da data:', dataParts);
    const dataVisita = new Date(Date.UTC(dataParts[0], dataParts[1] - 1, dataParts[2]));  // Criar data com hora em UTC
    console.log('📅 Data da visita (UTC):', dataVisita);

    const dia = dataVisita.getUTCDate(); // Pega o dia (em UTC)
    const mes = dataVisita.getUTCMonth(); // Pega o mês (em UTC)
    console.log('📊 Dia:', dia, 'Mês:', mes);

    // Marcar o dia no calendário
    console.log('🔄 Marcando dia no calendário');
    const calendarioDivs = document.querySelectorAll('.calendar div');
    console.log(`📊 Total de divs no calendário: ${calendarioDivs.length}`);
    
    let encontrado = false;
    calendarioDivs.forEach((div) => {
        if (div.textContent === dia.toString()) {
            console.log(`📊 Div do dia ${dia} encontrada`);
            div.classList.add('visita');
            div.setAttribute('data-nome', nome);
            div.setAttribute('data-empresa', empresa);
            div.setAttribute('data-data', data);
            div.setAttribute('data-hora', hora);
            div.setAttribute('data-locais', locais);
            encontrado = true;
            console.log('✅ Atributos adicionados à div');
        }
    });
    
    if (!encontrado) {
        console.warn(`⚠️ Div para o dia ${dia} não encontrada no calendário`);
    }

    // Limpar o formulário após o cadastro
    document.getElementById('register-visit-form').reset();
    console.log('✅ Formulário resetado');
    
    // Fechar o popup após o cadastro
    closePopup();
    console.log('✅ Cadastro concluído');
}

// Função para abrir o popup quando um dia com visita for clicado
function openVisitPopup(event) {
    console.log('🔄 Função openVisitPopup chamada');
    const dia = event.target;
    console.log('📦 Elemento dia clicado:', dia);

    if (dia.classList.contains('visita')) {
        console.log('📊 Dia contém classe visita, obtendo dados');
        // Pega as informações da visita associada ao dia
        const nome = dia.getAttribute('data-nome');
        const empresa = dia.getAttribute('data-empresa');
        const data = dia.getAttribute('data-data');
        const hora = dia.getAttribute('data-hora');
        const locais = dia.getAttribute('data-locais');
        const visitaId = dia.getAttribute('data-id');
        
        console.log('📋 Dados obtidos:', { nome, empresa, data, hora, locais, visitaId });

        // Verifica se os elementos do pop-up existem antes de definir os valores
        const popupNome = document.getElementById('popup-nome');
        const popupEmpresa = document.getElementById('popup-empresa');
        const popupData = document.getElementById('popup-data');
        const popupHora = document.getElementById('popup-hora');
        const popupLocais = document.getElementById('popup-locais');
        const btnIniciarVisita = document.getElementById('btn-iniciar-visita');
        
        console.log('📦 Elementos do popup encontrados:', 
            popupNome ? 'Nome: Sim' : 'Nome: Não',
            popupEmpresa ? 'Empresa: Sim' : 'Empresa: Não',
            popupData ? 'Data: Sim' : 'Data: Não',
            popupHora ? 'Hora: Sim' : 'Hora: Não',
            popupLocais ? 'Locais: Sim' : 'Locais: Não',
            btnIniciarVisita ? 'Botão Iniciar: Sim' : 'Botão Iniciar: Não'
        );

        if (popupNome && popupEmpresa && popupData && popupHora && popupLocais) {
            popupNome.textContent = nome || "Não informado";
            popupEmpresa.textContent = empresa || "Não informado";
            popupData.textContent = data || "Não informado";
            popupHora.textContent = hora || "Não informado";
            popupLocais.textContent = locais || "Não informado";
            console.log('✅ Dados preenchidos no popup');

            // Verificar se a visita já foi finalizada
            if (visitaId) {
                verificarVisitaFinalizada(visitaId).then(finalizada => {
                    if (finalizada && btnIniciarVisita) {
                        // Se a visita já foi finalizada, mudar o botão para "Relatório da Visita"
                        btnIniciarVisita.textContent = "Relatório da Visita";
                        btnIniciarVisita.onclick = function() {
                            window.location.href = `relatorio.html?id=${finalizada.id}`;
                        };
                        console.log('✅ Botão alterado para Relatório da Visita');
                    } else if (btnIniciarVisita) {
                        // Se a visita não foi finalizada, manter o botão como "Iniciar Visita"
                        btnIniciarVisita.textContent = "Iniciar Visita";
                        btnIniciarVisita.onclick = function() {
                            window.location.href = `visita.html?id=${visitaId}`;
                        };
                        console.log('✅ Botão configurado para Iniciar Visita');
                    }
                }).catch(error => {
                    console.error('❌ Erro ao verificar status da visita:', error);
                    // Em caso de erro, manter o botão como "Iniciar Visita"
                    if (btnIniciarVisita) {
                        btnIniciarVisita.textContent = "Iniciar Visita";
                        btnIniciarVisita.onclick = function() {
                            window.location.href = `visita.html?id=${visitaId}`;
                        };
                    }
                });
            } else if (btnIniciarVisita) {
                // Se não tiver ID da visita, esconder o botão
                btnIniciarVisita.style.display = 'none';
                console.log('✅ Botão de iniciar visita ocultado');
            }

            // Exibe o pop-up
            const popup = document.getElementById('visit-popup');
            popup.style.display = 'block';
            console.log('✅ Popup exibido');
        } else {
            console.error("❌ Elementos do pop-up não encontrados no DOM.");
        }
    } else {
        console.log('ℹ️ Dia não contém classe visita');
        // Se o dia não tiver visita, exibe uma mensagem de alerta
        alert("Não há visita registrada para este dia.");
    }
}

// Função para verificar se uma visita já foi finalizada
async function verificarVisitaFinalizada(visitaId) {
    console.log(`🔄 Verificando se a visita ${visitaId} já foi finalizada`);
    
    try {
        const response = await fetch(`http://localhost:3000/api/verificar-visita-finalizada/${visitaId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                // Visita não finalizada
                console.log(`ℹ️ Visita ${visitaId} não foi finalizada`);
                return null;
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log(`✅ Visita ${visitaId} já foi finalizada:`, resultado);
        return resultado;
    } catch (error) {
        console.error(`❌ Erro ao verificar se a visita ${visitaId} foi finalizada:`, error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded - Configurando eventos do calendário');
    
    // Adiciona o evento de clique ao calendário para abrir o popup
    const calendarioDivs = document.querySelectorAll('.calendar div');
    console.log(`📊 Total de divs no calendário: ${calendarioDivs.length}`);
    
    calendarioDivs.forEach((div) => {
        div.addEventListener('click', function(event) {
            console.log('🖱️ Div do calendário clicada:', div.textContent);
            openVisitPopup(event);
        });
    });
    
    console.log('✅ Eventos do calendário configurados');
});


let anoAtual = new Date().getFullYear();  // Ano atual
let mesAtual = new Date().getMonth();  // Mês atual (0-11)
console.log('📅 Ano atual:', anoAtual, 'Mês atual:', mesAtual);

// Função para obter o nome do mês
function obterNomeMes(mes) {
    console.log('🔄 Função obterNomeMes chamada para mês:', mes);
    const nomesDosMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const nomeMes = nomesDosMeses[mes];
    console.log('📊 Nome do mês:', nomeMes);
    return nomeMes;
}

// Função para carregar visitas do banco
async function carregarVisitas() {
    console.log('🔄 Função carregarVisitas chamada');
    alert("Carregando visitas do banco...");
    try {
        console.log('🔄 Iniciando requisição para obter visitas');
        const response = await fetch('http://localhost:3000/api/visitas'); // Substitua pela URL correta da API
        console.log('📊 Status da resposta:', response.status);
        
        if (!response.ok) {
            console.error('❌ Resposta não ok:', response.status, response.statusText);
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const visitas = await response.json();
        console.log('📋 Visitas recebidas:', visitas);

        alert(`Visitas carregadas: ${JSON.stringify(visitas)}`);
        marcarVisitasNoCalendario(visitas);
        console.log('✅ Visitas marcadas no calendário');
    } catch (error) {
        console.error('❌ Erro ao carregar visitas:', error);
        alert("Erro ao carregar visitas: " + error.message);
    }
}

// Função para gerar o calendário
function gerarCalendario() {
    console.log('🔄 Função gerarCalendario chamada');
    alert("Gerando calendário...");
    const diasDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate(); // Número de dias no mês atual
    const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay(); // Dia da semana do primeiro dia do mês
    console.log('📊 Dias no mês:', diasDoMes, 'Primeiro dia da semana:', primeiroDiaSemana);
    
    const calendarElement = document.getElementById('calendar');
    console.log('📦 Elemento calendário encontrado:', calendarElement ? 'Sim' : 'Não');

    if (!calendarElement) {
        console.error('❌ Elemento calendar não encontrado');
        alert("Elemento calendar não encontrado!");
        return;
    }
    
    console.log('✅ Calendário gerado com sucesso');
}