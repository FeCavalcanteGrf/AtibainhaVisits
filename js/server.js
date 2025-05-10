const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'atibainha_visits'
});

// Conectar ao banco de dados
connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota de teste de conexão
app.get('/test-connection', (req, res) => {
  res.status(200).send('Conexão estabelecida com sucesso!');
});

// Rota para obter todas as visitas
app.get('/api/visitas', (req, res) => {
  const query = 'SELECT tb_id AS id, tb_nome AS nome, tb_empresa AS empresa, tb_data AS data, tb_hora AS hora, tb_locais AS locais FROM tb_visitas';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar visitas:', err);
      res.status(500).send('Erro ao buscar visitas.');
      return;
    }
    
    res.status(200).json(results);
  });
});

// Rota para cadastrar uma nova visita
app.post('/api/cadastrar-visita', (req, res) => {
  const { nome, empresa, data, hora, locais } = req.body;
  
  if (!nome || !empresa || !data || !hora || !locais) {
    res.status(400).send('Todos os campos são obrigatórios.');
    return;
  }
  
  const query = 'INSERT INTO tb_visitas (tb_nome, tb_empresa, tb_data, tb_hora, tb_locais) VALUES (?, ?, ?, ?, ?)';
  
  connection.query(query, [nome, empresa, data, hora, locais], (err, results) => {
    if (err) {
      console.error('Erro ao cadastrar visita:', err);
      res.status(500).send('Erro ao cadastrar visita.');
      return;
    }
    
    res.status(201).json({
      message: 'Visita cadastrada com sucesso!',
      id: results.insertId
    });
  });
});

// Rota para obter dados de uma visita específica
app.get('/api/visita/:id', (req, res) => {
  const visitaId = req.params.id;
  
  const query = 'SELECT tb_id AS id, tb_nome AS nome, tb_empresa AS empresa, tb_data AS data, tb_hora AS hora, tb_locais AS locais FROM tb_visitas WHERE tb_id = ?';
  
  connection.query(query, [visitaId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar visita:', err);
      res.status(500).send('Erro ao buscar visita.');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).send('Visita não encontrada.');
      return;
    }
    
    res.status(200).json(results[0]);
  });
});

// Rota para finalizar uma visita
app.post('/api/finalizar-visita', (req, res) => {
  const { visitaId, dataVisita, locaisVisitados, observacoes } = req.body;
  
  // Verificar se a visita existe
  if (visitaId) {
    const queryVerificar = 'SELECT tb_id FROM tb_visitas WHERE tb_id = ?';
    
    connection.query(queryVerificar, [visitaId], (err, results) => {
      if (err) {
        console.error('Erro ao verificar visita:', err);
        res.status(500).send('Erro ao verificar visita.');
        return;
      }
      
      if (results.length === 0) {
        res.status(404).send('Visita não encontrada.');
        return;
      }
      
      // Salvar os dados da visita finalizada
      salvarDadosVisitaFinalizada(visitaId, dataVisita, locaisVisitados, observacoes, res);
    });
  } else {
    // Se não tiver ID da visita, apenas salvar os dados
    salvarDadosVisitaFinalizada(null, dataVisita, locaisVisitados, observacoes, res);
  }
});

// Função para salvar os dados da visita finalizada
function salvarDadosVisitaFinalizada(visitaId, dataVisita, locaisVisitados, observacoes, res) {
  // Converter os dados para formato JSON
  const locaisJSON = JSON.stringify(locaisVisitados);
  const observacoesJSON = JSON.stringify(observacoes);
  
  // Formatar a data para o formato aceito pelo MySQL (YYYY-MM-DD HH:MM:SS)
  let formattedDate;
  try {
    // Converter a string ISO para objeto Date
    const date = new Date(dataVisita);
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      throw new Error('Data inválida');
    }
    
    // Formatar para o formato MySQL YYYY-MM-DD HH:MM:SS usando UTC
    const utcYear = date.getUTCFullYear();
    const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(date.getUTCDate()).padStart(2, '0');
    const utcHours = String(date.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    formattedDate = `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
    console.log('Data formatada:', formattedDate);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    res.status(400).send('Formato de data inválido.');
    return;
  }
  
  // Inserir na tabela de visitas finalizadas
  const query = 'INSERT INTO tb_visitas_finalizadas (tb_visita_id, tb_data_visita, tb_locais_visitados, tb_observacoes) VALUES (?, ?, ?, ?)';
  
  connection.query(query, [visitaId, formattedDate, locaisJSON, observacoesJSON], (err, results) => {
    if (err) {
      console.error('Erro ao salvar visita finalizada:', err);
      res.status(500).send('Erro ao salvar visita finalizada.');
      return;
    }
    
    console.log('Visita finalizada com sucesso:', results);
    res.status(200).json({ 
      message: 'Visita finalizada com sucesso.',
      id: results.insertId
    });
  });
}

// Rota para obter relatório de uma visita
app.get('/api/relatorio-visita/:id', (req, res) => {
  const visitaFinalizadaId = req.params.id;
  
  // Buscar dados da visita finalizada
  const query = `
    SELECT 
      vf.tb_id AS id,
      vf.tb_data_visita AS dataVisita,
      vf.tb_locais_visitados AS locaisVisitados,
      vf.tb_observacoes AS observacoes,
      v.tb_nome AS nome,
      v.tb_empresa AS empresa,
      v.tb_data AS data,
      v.tb_hora AS hora,
      v.tb_locais AS locais
    FROM 
      tb_visitas_finalizadas vf
    LEFT JOIN 
      tb_visitas v ON vf.tb_visita_id = v.tb_id
    WHERE 
      vf.tb_id = ?
  `;
  
  connection.query(query, [visitaFinalizadaId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar relatório de visita:', err);
      res.status(500).send('Erro ao buscar relatório de visita.');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).send('Relatório de visita não encontrado.');
      return;
    }
    
    // Processar os dados
    const relatorio = results[0];
    
    // Converter strings JSON para objetos
    try {
      relatorio.locaisVisitados = JSON.parse(relatorio.locaisVisitados);
      relatorio.observacoes = JSON.parse(relatorio.observacoes);
    } catch (error) {
      console.error('Erro ao processar dados JSON:', error);
      relatorio.locaisVisitados = [];
      relatorio.observacoes = {};
    }
    
    res.status(200).json(relatorio);
  });
});

// Rota para verificar se uma visita já foi finalizada
app.get('/api/verificar-visita-finalizada/:id', (req, res) => {
  const visitaId = req.params.id;
  
  const query = 'SELECT tb_id AS id FROM tb_visitas_finalizadas WHERE tb_visita_id = ? ORDER BY tb_id DESC LIMIT 1';
  
  connection.query(query, [visitaId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar visita finalizada:', err);
      res.status(500).send('Erro ao verificar visita finalizada.');
      return;
    }
    
    if (results.length === 0) {
      res.status(404).send('Visita não finalizada.');
      return;
    }
    
    res.status(200).json(results[0]);
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});