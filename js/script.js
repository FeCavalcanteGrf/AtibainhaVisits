const fundos = [
    '../img/Alvorada.jpeg',
    '../img/Castelinho.jpeg',
    '../img/Fonte.jpeg',
    '../img/RecantoDaHarmonia.jpeg',
    '../img/PianoBar.jpeg',
];

function toggleSaloes() {
    const saloesContainer = document.querySelector('.saloes');
    saloesContainer.classList.toggle('minimized');
}

function toggleCarrossel(carrosselId) {
    const conteudo = document.querySelector(`[onclick="toggleCarrossel('${carrosselId}')"]`);
    const carrossel = document.getElementById(carrosselId);

    // Alterna a visibilidade do carrossel
    if (carrossel.style.display === "none" || !carrossel.style.display) {
        carrossel.style.display = "block";
        conteudo.classList.add("expandido"); // Adiciona a classe expandido
    } else {
        carrossel.style.display = "none";
        conteudo.classList.remove("expandido"); // Remove a classe expandido
    }
}

function moveCarrossel(id, direction) {
    const carrossel = document.getElementById(id);
    const imagens = carrossel.querySelector('.carrossel-imagens');
    const imgs = imagens.querySelectorAll('img');
    const totalImages = imgs.length;

    let currentIndex = parseInt(imagens.getAttribute('data-index')) || 0;

    currentIndex += direction;

    if (currentIndex >= totalImages) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = totalImages - 1;
    }

    imagens.setAttribute('data-index', currentIndex);

    imgs.forEach(img => img.classList.remove('active'));
    imgs[currentIndex].classList.add('active');
}

setInterval(() => {
    const carrossel1 = document.getElementById('carrossel1');
    if (carrossel1 && carrossel1.style.display === 'block') {
        moveCarrossel('carrossel1', 1);
    }

    const carrossel2 = document.getElementById('carrossel2');
    if (carrossel2 && carrossel2.style.display === 'block') {
        moveCarrossel('carrossel2', 1);
    }

    const carrossel3 = document.getElementById('carrossel3');
    if (carrossel3 && carrossel3.style.display === 'block') {
        moveCarrossel('carrossel3', 1);
    }
}, 3000);

document.querySelectorAll('.conteudo').forEach(conteudo => {
    conteudo.addEventListener('click', () => {
        const sessao = conteudo.closest('.sessao');
        sessao.classList.toggle('expandida');
    });
});

document.getElementById('menu-toggle').addEventListener('click', () => {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
});

/*--------------------------------------------------*/

// Função para abrir o popup
function openPopup(celula = null) {
    const popup = document.getElementById('visit-popup');
    if (celula) {
        const nome = document.getElementById('popup-nome');
        const empresa = document.getElementById('popup-empresa');
        const data = document.getElementById('popup-data');
        const hora = document.getElementById('popup-hora');
        const locais = document.getElementById('popup-locais');
        
        // Preencher os dados da visita
        if (celula.classList.contains('visita')) {
            nome.textContent = celula.getAttribute('data-nome') || "Não informado";
            empresa.textContent = celula.getAttribute('data-empresa') || "Não informado";
            data.textContent = celula.getAttribute('data-data') || "Não informado";
            hora.textContent = celula.getAttribute('data-hora') || "Não informado";
            locais.textContent = celula.getAttribute('data-locais') || "Não informado";
        }
    }

    popup.style.display = 'flex';
}

// Função para fechar o popup
function closePopup() {
    const popup = document.getElementById('visit-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Função para cadastrar visita e marcar o calendário
function cadastrarVisita(event) {
    event.preventDefault(); // Evitar envio do formulário

    const nome = document.getElementById('novo-nome').value;
    const empresa = document.getElementById('novo-empresa').value;
    const data = document.getElementById('novo-data').value;
    const hora = document.getElementById('novo-hora').value;
    const locais = document.getElementById('novo-locais').value;

    if (!nome || !empresa || !data || !hora || !locais) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Ajustar para garantir que a data será exatamente a fornecida pelo usuário (sem considerar o fuso horário)
    const dataParts = data.split('-');  // Dividir a data no formato YYYY-MM-DD
    const dataVisita = new Date(Date.UTC(dataParts[0], dataParts[1] - 1, dataParts[2]));  // Criar data com hora em UTC

    const dia = dataVisita.getUTCDate(); // Pega o dia (em UTC)
    const mes = dataVisita.getUTCMonth(); // Pega o mês (em UTC)

    // Marcar o dia no calendário
    const calendarioDivs = document.querySelectorAll('.calendar div');
    calendarioDivs.forEach((div) => {
        if (div.textContent === dia.toString()) {
            div.classList.add('visita');
            div.setAttribute('data-nome', nome);
            div.setAttribute('data-empresa', empresa);
            div.setAttribute('data-data', data);
            div.setAttribute('data-hora', hora);
            div.setAttribute('data-locais', locais);
        }
    });

    // Limpar o formulário após o cadastro
    document.getElementById('register-visit-form').reset();
    
    // Fechar o popup após o cadastro
    closePopup();
}

// Função para abrir o popup quando um dia com visita for clicado
function openVisitPopup(event) {
    const dia = event.target;

    if (dia.classList.contains('visita')) {
        // Pega as informações da visita associada ao dia
        const nome = dia.getAttribute('data-nome');
        const empresa = dia.getAttribute('data-empresa');
        const data = dia.getAttribute('data-data');
        const hora = dia.getAttribute('data-hora');
        const locais = dia.getAttribute('data-locais');

        // Verifica se os elementos do pop-up existem antes de definir os valores
        const popupNome = document.getElementById('popup-nome');
        const popupEmpresa = document.getElementById('popup-empresa');
        const popupData = document.getElementById('popup-data');
        const popupHora = document.getElementById('popup-hora');
        const popupLocais = document.getElementById('popup-locais');

        if (popupNome && popupEmpresa && popupData && popupHora && popupLocais) {
            popupNome.textContent = nome || "Não informado";
            popupEmpresa.textContent = empresa || "Não informado";
            popupData.textContent = data || "Não informado";
            popupHora.textContent = hora || "Não informado";
            popupLocais.textContent = locais || "Não informado";

            // Exibe o pop-up
            const popup = document.getElementById('visit-popup');
            popup.style.display = 'block';
        } else {
            console.error("Elementos do pop-up não encontrados no DOM.");
        }
    } else {
        // Se o dia não tiver visita, exibe uma mensagem de alerta
        alert("Não há visita registrada para este dia.");
    }
}

// Adiciona o evento de clique ao calendário para abrir o popup
const calendarioDivs = document.querySelectorAll('.calendar div');
calendarioDivs.forEach((div) => {
    div.addEventListener('click', openVisitPopup);
});


let anoAtual = new Date().getFullYear();  // Ano atual
let mesAtual = new Date().getMonth();  // Mês atual (0-11)

// Função para obter o nome do mês
function obterNomeMes(mes) {
    const nomesDosMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return nomesDosMeses[mes];
}

// Função para carregar visitas do banco
async function carregarVisitas() {
    alert("Carregando visitas do banco...");
    try {
        const response = await fetch('http://localhost:3000/api/visitas'); // Substitua pela URL correta da API
        const visitas = await response.json();

        alert(`Visitas carregadas: ${JSON.stringify(visitas)}`);
        marcarVisitasNoCalendario(visitas);
    } catch (error) {
        alert("Erro ao carregar visitas: " + error.message);
        console.error("Erro ao carregar visitas:", error);
    }
}

// Função para gerar o calendário
function gerarCalendario() {
    alert("Gerando calendário...");
    const diasDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate(); // Número de dias no mês atual
    const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay(); // Dia da semana do primeiro dia do mês
    const calendarElement = document.getElementById('calendar');

    if (!calendarElement) {
        alert("Elemento #calendar não encontrado!");
        console.error("Elemento #calendar não encontrado!");
        return;
    }

    calendarElement.innerHTML = ''; // Limpa o calendário antes de preencher

    // Atualiza o título do mês no calendário
    const tituloMes = document.createElement('h3');
    tituloMes.textContent = `${obterNomeMes(mesAtual)} de ${anoAtual}`;
    calendarElement.appendChild(tituloMes);

    // Adiciona espaços vazios para os dias antes do primeiro dia do mês
    for (let i = 0; i < primeiroDiaSemana; i++) {
        const div = document.createElement('div');
        div.classList.add('empty'); // Classe para estilizar os espaços vazios
        calendarElement.appendChild(div);
    }

    // Gera os dias do mês
    for (let i = 1; i <= diasDoMes; i++) {
        const div = document.createElement('div');
        div.textContent = i;

        // Adicionar o atributo data-date no formato YYYY-MM-DD
        const data = new Date(anoAtual, mesAtual, i);
        div.setAttribute('data-date', data.toISOString().split('T')[0]);

        div.addEventListener('click', function () {
            openPopup(this);
        });
        calendarElement.appendChild(div);
    }

    alert("Calendário gerado com sucesso!");
    carregarVisitas(); // Chamar carregarVisitas após gerar o calendário
}

// Funções para navegar entre os meses
function mesAnterior() {
    mesAtual--; // Vai para o mês anterior
    if (mesAtual < 0) {
        mesAtual = 11; // Volta para dezembro do ano anterior
        anoAtual--;
    }
    gerarCalendario(); // Atualiza o calendário
}

function proximoMes() {
    mesAtual++; // Vai para o próximo mês
    if (mesAtual > 11) {
        mesAtual = 0; // Volta para janeiro do próximo ano
        anoAtual++;
    }
    gerarCalendario(); // Atualiza o calendário
}

function marcarVisitasNoCalendario(visitas) {
    alert("Marcando visitas no calendário...");
    const hoje = new Date();

    visitas.forEach(visita => {
        // Extrair apenas a parte da data no formato YYYY-MM-DD
        const dataVisita = new Date(visita.tb_data);
        const dataFormatada = dataVisita.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const diaElemento = document.querySelector(`[data-date="${dataFormatada}"]`);

        if (diaElemento) {
            // Adicionar classes e atributos de dados para a visita
            if (dataVisita < hoje) {
                diaElemento.classList.add('dia-passado'); // Vermelho
            } else {
                diaElemento.classList.add('dia-futuro'); // Verde
            }

            diaElemento.classList.add('visita'); // Classe para identificar dias com visitas
            diaElemento.setAttribute('data-nome', visita.tb_nome);
            diaElemento.setAttribute('data-empresa', visita.tb_empresa);
            diaElemento.setAttribute('data-data', visita.tb_data);
            diaElemento.setAttribute('data-hora', visita.tb_hora);
            diaElemento.setAttribute('data-locais', visita.tb_locais);

            diaElemento.addEventListener('click', () => openVisitPopup({ target: diaElemento }));
        } else {
            console.warn(`Elemento não encontrado para a data: ${dataFormatada}`);
        }
    });
}

// Adicionando eventos de clique para os botões de navegação
document.addEventListener("DOMContentLoaded", () => {
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', mesAnterior);
    } else {
        console.error("Elemento #prev-month não encontrado.");
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', proximoMes);
    } else {
        console.error("Elemento #next-month não encontrado.");
    }

    gerarCalendario(); // Gera o calendário e chama carregarVisitas
});

