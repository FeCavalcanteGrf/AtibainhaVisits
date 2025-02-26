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

function toggleCarrossel(id) {
    const carrossel = document.getElementById(id);
    carrossel.style.display = carrossel.style.display === 'block' ? 'none' : 'block';
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
    if (carrossel1.style.display === 'block') {
        moveCarrossel('carrossel1', 1);
    }

    const carrossel2 = document.getElementById('carrossel2');
    if (carrossel2.style.display === 'block') {
        moveCarrossel('carrossel2', 1);
    }

    const carrossel3 = document.getElementById('carrossel3');
    if (carrossel3.style.display === 'block') {
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

let indiceFundo = 0;

function trocarFundo() {
    document.body.style.backgroundImage = `url(${fundos[indiceFundo]})`;
    indiceFundo = (indiceFundo + 1) % fundos.length;
}

setInterval(trocarFundo, 5000);

/*--------------------------------------------------*/

// Função para abrir o popup
function openPopup(celula) {
    const popup = document.getElementById('visit-popup');
    const nome = document.getElementById('nome');
    const empresa = document.getElementById('empresa');
    const data = document.getElementById('data');
    const hora = document.getElementById('hora');
    const locais = document.getElementById('locais');
    
    // Preencher os dados da visita (Exemplo fixo, pode ser ajustado)
    if (celula.classList.contains('visita')) {
        nome.textContent = celula.getAttribute('data-nome');
        empresa.textContent = celula.getAttribute('data-empresa');
        data.textContent = celula.getAttribute('data-data');
        hora.textContent = celula.getAttribute('data-hora');
        locais.textContent = celula.getAttribute('data-locais');
    }

    popup.style.display = 'flex';
}

// Função para fechar o popup
function closePopup() {
    document.getElementById('visit-popup').style.display = 'none';
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

        // Preenche as informações no popup
        document.getElementById('popup-nome').textContent = nome;
        document.getElementById('popup-empresa').textContent = empresa;
        document.getElementById('popup-data').textContent = data;
        document.getElementById('popup-hora').textContent = hora;
        document.getElementById('popup-locais').textContent = locais;

        // Abre o popup
        openPopup();
    } else {
        // Se o dia não tiver visita, não abre o popup
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

function gerarCalendario() {
    const diasDoMes = new Date(anoAtual, mesAtual + 1, 0).getDate(); // Número de dias no mês atual
    const calendarElement = document.getElementById('calendar');
    calendarElement.innerHTML = ''; // Limpa o calendário antes de preencher

    // Atualiza o título do mês no calendário
    const tituloMes = document.createElement('h3');
    tituloMes.textContent = `${obterNomeMes(mesAtual)} de ${anoAtual}`;
    calendarElement.appendChild(tituloMes);

    // Gera os dias do mês
    for (let i = 1; i <= diasDoMes; i++) {
        const div = document.createElement('div');
        div.textContent = i;
        div.addEventListener('click', function() {
            openPopup(this);
        });
        calendarElement.appendChild(div);
    }
}

// Função auxiliar para obter o nome do mês
function obterNomeMes(mes) {
    const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return nomesMeses[mes];
}

// Função para alterar para o mês anterior
function mesAnterior() {
    if (mesAtual === 0) {
        mesAtual = 11;  // Dezembro
        anoAtual--;  // Decrementa o ano
    } else {
        mesAtual--;
    }
    gerarCalendario();
}

// Função para alterar para o próximo mês
function proximoMes() {
    if (mesAtual === 11) {
        mesAtual = 0;  // Janeiro
        anoAtual++;  // Incrementa o ano
    } else {
        mesAtual++;
    }
    gerarCalendario();
}

// Adicionando eventos de clique para os botões de navegação
document.getElementById('prev-month').addEventListener('click', mesAnterior);
document.getElementById('next-month').addEventListener('click', proximoMes);

// Chama a função para gerar o calendário ao carregar a página
window.onload = function() {
    gerarCalendario();
}

document.querySelector('.form-cadastro').addEventListener('submit', async function(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const telefone = document.getElementById('telefone').value;

  if (senha !== confirmarSenha) {
    showPopup('As senhas não coincidem.');
    return;
  }

  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, email, senha, telefone })
  });

  if (response.ok) {
    showPopup('Usuário cadastrado com sucesso!');
  } else {
    showPopup('Erro ao cadastrar usuário.');
  }
});

function showPopup(message) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button onclick="closePopup()">Fechar</button>
    </div>
  `;
  document.body.appendChild(popup);
}

function closePopup() {
  const popup = document.querySelector('.popup');
  if (popup) {
    popup.remove();
  }
}
