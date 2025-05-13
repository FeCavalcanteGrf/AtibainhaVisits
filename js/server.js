const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs'); // Usando bcryptjs em vez de bcrypt
const jwt = require('jsonwebtoken');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT;

// Configuração do banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  });
}

// Rota de teste de conexão
app.get('/test-connection', (req, res) => {
  res.status(200).json({ message: 'Conexão estabelecida com sucesso!' });
});

// Rota para verificar token
app.get('/verificar-token', verificarToken, (req, res) => {
  res.status(200).json({ 
    message: 'Token válido', 
    userId: req.userId,
    email: req.email
  });
});

// Rota para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }
  
  const query = 'SELECT * FROM tb_usuarios WHERE tb_email = ?';
  
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro ao fazer login' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    const usuario = results[0];
    
    try {
      // Verificar senha
      const senhaCorreta = await bcryptjs.compare(senha, usuario.tb_senha);
      
      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }
      
      // Gerar token JWT com userId (não id)
      const token = jwt.sign(
        { userId: usuario.tb_id, email: usuario.tb_email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        userId: usuario.tb_id,
        nome: usuario.tb_nome,
        email: usuario.tb_email
      });
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  });
});

// Rota para cadastrar usuário
app.post('/cadastrar-usuario', async (req, res) => {
  try {
    console.log('Recebida requisição para cadastrar usuário:', req.body);
    const { nome, email, senha, telefone, setor } = req.body;
    
    if (!nome || !email || !senha) {
      console.log('Campos obrigatórios não fornecidos');
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se o email já está em uso
    const queryVerificar = 'SELECT tb_id FROM tb_usuarios WHERE tb_email = ?';
    
    connection.query(queryVerificar, [email], async (err, results) => {
      if (err) {
        console.error('Erro ao verificar email:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
      }
      
      if (results.length > 0) {
        console.log('Email já está em uso:', email);
        return res.status(400).json({ message: 'Este email já está em uso' });
      }
      
      try {
        // Hash da senha
        const salt = await bcryptjs.genSalt(10);
        const senhaHash = await bcryptjs.hash(senha, salt);
        
        // Inserir novo usuário
        const queryCadastrar = 'INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone, tb_setor) VALUES (?, ?, ?, ?, ?)';
        
        connection.query(queryCadastrar, [nome, email, senhaHash, telefone || null, setor || null], (err, results) => {
          if (err) {
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
          }
          
          console.log('Usuário cadastrado com sucesso:', { id: results.insertId, nome, email });
          res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            userId: results.insertId
          });
        });
      } catch (error) {
        console.error('Erro ao gerar hash da senha:', error);
        res.status(500).json({ message: 'Erro ao processar senha' });
      }
    });
  } catch (error) {
    console.error('Erro ao processar cadastro:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

// Rota para listar todos os usuários
app.get('/usuarios', verificarToken, (req, res) => {
  const query = 'SELECT tb_id, tb_nome, tb_email, tb_telefone, tb_setor FROM tb_usuarios';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
    
    res.status(200).json(results);
  });
});

// Rota para obter um usuário específico
app.get('/usuario/:id', verificarToken, (req, res) => {
  const userId = req.params.id;
  
  const query = 'SELECT tb_id, tb_nome, tb_email, tb_telefone, tb_setor FROM tb_usuarios WHERE tb_id = ?';
  
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json(results[0]);
  });
});

// Rota para obter informações do usuário logado
app.get('/user-info', verificarToken, (req, res) => {
  const userId = req.query.userId || req.userId;
  
  const query = 'SELECT tb_id, tb_nome, tb_email, tb_telefone, tb_setor FROM tb_usuarios WHERE tb_id = ?';
  
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar informações do usuário:', err);
      return res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const usuario = results[0];
    res.status(200).json({
      id: usuario.tb_id,
      nome: usuario.tb_nome,
      email: usuario.tb_email,
      tel: usuario.tb_telefone,
      setor: usuario.tb_setor
    });
  });
});

// Rota para atualizar um usuário
app.post('/update-user', verificarToken, async (req, res) => {
  const { userId, nome, email, senha, tel, setor } = req.body;
  
  // Verificar se o usuário existe
  const queryVerificar = 'SELECT * FROM tb_usuarios WHERE tb_id = ?';
  
  connection.query(queryVerificar, [userId], async (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Preparar dados para atualização
    const dadosAtualizacao = {};
    
    if (nome) dadosAtualizacao.tb_nome = nome;
    if (email) dadosAtualizacao.tb_email = email;
    if (tel) dadosAtualizacao.tb_telefone = tel;
    if (setor) dadosAtualizacao.tb_setor = setor;
    
    // Se a senha foi fornecida, fazer hash
    if (senha) {
      try {
        const salt = await bcryptjs.genSalt(10);
        dadosAtualizacao.tb_senha = await bcryptjs.hash(senha, salt);
      } catch (error) {
        console.error('Erro ao gerar hash da senha:', error);
        return res.status(500).json({ message: 'Erro ao processar senha' });
      }
    }
    
    // Se não houver dados para atualizar
    if (Object.keys(dadosAtualizacao).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
    }
    
    // Construir a query de atualização dinamicamente
    const campos = Object.keys(dadosAtualizacao).map(campo => `${campo} = ?`).join(', ');
    const valores = Object.values(dadosAtualizacao);
    valores.push(userId); // Adicionar o ID ao final para a cláusula WHERE
    
    const queryAtualizar = `UPDATE tb_usuarios SET ${campos} WHERE tb_id = ?`;
    
    connection.query(queryAtualizar, valores, (err, results) => {
      if (err) {
        console.error('Erro ao atualizar usuário:', err);
        return res.status(500).json({ message: 'Erro ao atualizar usuário' });
      }
      
      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    });
  });
});

// Rota para excluir um usuário
app.post('/delete-user', verificarToken, (req, res) => {
  const { email } = req.body;
  
  // Verificar se o usuário existe
  const queryVerificar = 'SELECT tb_id FROM tb_usuarios WHERE tb_email = ?';
  
  connection.query(queryVerificar, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Excluir o usuário
    const queryExcluir = 'DELETE FROM tb_usuarios WHERE tb_email = ?';
    
    connection.query(queryExcluir, [email], (err, results) => {
      if (err) {
        console.error('Erro ao excluir usuário:', err);
        return res.status(500).json({ message: 'Erro ao excluir usuário' });
      }
      
      res.status(200).json({ message: 'Usuário excluído com sucesso' });
    });
  });
});

// Rota para obter todas as visitas
app.get('/api/visitas', (req, res) => {
  const query = 'SELECT tb_id AS id, tb_nome AS nome, tb_empresa AS empresa, tb_data AS data, tb_hora AS hora, tb_locais AS locais FROM tb_visitas';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar visitas:', err);
      res.status(500).json({ message: 'Erro ao buscar visitas' });
      return;
    }
    
    res.status(200).json(results);
  });
});

// Rota para cadastrar uma nova visita
app.post('/api/cadastrar-visita', (req, res) => {
  const { nome, empresa, data, hora, locais } = req.body;
  
  if (!nome || !empresa || !data || !hora || !locais) {
    res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    return;
  }
  
  const query = 'INSERT INTO tb_visitas (tb_nome, tb_empresa, tb_data, tb_hora, tb_locais) VALUES (?, ?, ?, ?, ?)';
  
  connection.query(query, [nome, empresa, data, hora, locais], (err, results) => {
    if (err) {
      console.error('Erro ao cadastrar visita:', err);
      res.status(500).json({ message: 'Erro ao cadastrar visita' });
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
      res.status(500).json({ message: 'Erro ao buscar visita' });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ message: 'Visita não encontrada' });
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
        res.status(500).json({ message: 'Erro ao verificar visita' });
        return;
      }
      
      if (results.length === 0) {
        res.status(404).json({ message: 'Visita não encontrada' });
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
    res.status(400).json({ message: 'Formato de data inválido' });
    return;
  }
  
  // Inserir na tabela de visitas finalizadas
  const query = 'INSERT INTO tb_visitas_finalizadas (tb_visita_id, tb_data_visita, tb_locais_visitados, tb_observacoes) VALUES (?, ?, ?, ?)';
  
  connection.query(query, [visitaId, formattedDate, locaisJSON, observacoesJSON], (err, results) => {
    if (err) {
      console.error('Erro ao salvar visita finalizada:', err);
      res.status(500).json({ message: 'Erro ao salvar visita finalizada' });
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
      res.status(500).json({ message: 'Erro ao buscar relatório de visita' });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ message: 'Relatório de visita não encontrado' });
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
      res.status(500).json({ message: 'Erro ao verificar visita finalizada' });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ message: 'Visita não finalizada' });
      return;
    }
    
    res.status(200).json(results[0]);
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});