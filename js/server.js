const express = require('express');
const mysql = require('mysql2/promise'); // Usando mysql2 com promises para melhorar o controle assíncrono
const cors = require('cors');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs'); // Usando bcryptjs para hash de senhas
const jwt = require('jsonwebtoken');
const ratelimit = require('express-rate-limit'); // Importando express-rate-limit para limitar requisições
const helmet = require('helmet'); // Importando helmet para segurança adicional

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT;

// Pool de conexões MySQL para melhor gerenciamento de conexões e performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Para limitar o número de conexões simultâneas a 10 
  queueLimit: 0, // Para não haver limite de fila de conexões
  connectTimeout: 60000 // Tempo máximo de espera pela conexão (60 segundos)
});

// Conectar ao banco de dados
const verificarConexaoBanco = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados foi estabelecida com sucesso!');
    connection.release();
  } catch (error) {
    console.log('Erro na conexão com o banco de dados:', error);
    process.exit(1); // Encerrar o processo se não conseguir conectar
  }
};

// Configurando o rate limiting para a prevenção de de ataques de força bruta e etc...
const limiteGeral = ratelimit({
  windowMs: 15 * 60 * 1000, // janela de tempo na qual as requisições são contadas (15 minutos)
  max: 100, // Define o numero máximo de requisições que um IP dentro da janela de tempo determinada (15 Minutos)
  message: {message:'Foram feita muitas requisições, tente novamente após 15 minutos.'}
});

const limiteLogin = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limitação de 5 tentativas por IP por janela de tempo 
  message: {message:'Foram feita muitas tentativas de login, tente novamente após 15 minutos.'}
})


// Middleware
app.use(helmet()); // Proteção contra vulnerabilidades comuns
app.use(limiteGeral); // Aplicar o rate limiting geral
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limitar o tamanho do corpo da requisição para 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limitar o tamanho do corpo da requisição para 10MB

// Middleware para tratamento de erros
app.use((err, _req, res, _next) => {
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
app.get('/test-connection', (_req, res) => {
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
app.post('/login', limiteLogin, async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    const query = 'SELECT * FROM tb_usuarios WHERE tb_email = ?';
    
    // Usando o pool de conexões com promises
    const [results] = await pool.query(query, [email]);
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    const usuario = results[0];
    
    // Verificar senha
    const senhaCorreta = await bcryptjs.compare(senha, usuario.tb_senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }
    
    // Gerar token JWT
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
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
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
    const [results] = await pool.query(queryVerificar, [email]);
    
    if (results.length > 0) {
      console.log('Email já está em uso:', email);
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Hash da senha
    const salt = await bcryptjs.genSalt(10);
    const senhaHash = await bcryptjs.hash(senha, salt);
    
    // Inserir novo usuário
    const queryCadastrar = 'INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone, tb_setor) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(queryCadastrar, [nome, email, senhaHash, telefone || null, setor || null]);
    
    console.log('Usuário cadastrado com sucesso:', { id: result.insertId, nome, email });
    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      userId: result.insertId
    });
    
  } catch (error) {
    console.error('Erro ao processar cadastro:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

// Rota para obter informações do usuário logado
app.get('/user-info', verificarToken, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    const query = 'SELECT tb_id, tb_nome, tb_email, tb_telefone, tb_setor FROM tb_usuarios WHERE tb_id = ?';
    const [results] = await pool.query(query, [userId]);
    
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
  } catch (err) {
    console.error('Erro ao buscar informações do usuário:', err);
    return res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
  }
});

// Rota para atualizar um usuário
app.post('/update-user', verificarToken, async (req, res) => {
  try {
    const { userId, nome, email, senha, tel, setor } = req.body;
    
    // Verificar se o usuário existe
    const queryVerificar = 'SELECT * FROM tb_usuarios WHERE tb_id = ?';
    const [results] = await pool.query(queryVerificar, [userId]);
    
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
      const salt = await bcryptjs.genSalt(10);
      dadosAtualizacao.tb_senha = await bcryptjs.hash(senha, salt);
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
    await pool.query(queryAtualizar, valores);
    
    res.status(200).json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Rota para excluir um usuário
app.post('/delete-user', verificarToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verificar se o usuário existe
    const queryVerificar = 'SELECT tb_id FROM tb_usuarios WHERE tb_email = ?';
    const [results] = await pool.query(queryVerificar, [email]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Excluir o usuário
    const queryExcluir = 'DELETE FROM tb_usuarios WHERE tb_email = ?';
    await pool.query(queryExcluir, [email]);
    
    res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
});

// Rota para obter todas as visitas
app.get('/visitas', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        v.tb_id AS id, 
        v.tb_nome AS nome, 
        v.tb_empresa AS empresa, 
        v.tb_data AS data, 
        v.tb_hora AS hora, 
        v.tb_locais AS locais,
        v.tb_usuario_id AS usuarioId,
        u.tb_nome AS nomeUsuario
      FROM 
        tb_visitas v
      LEFT JOIN
        tb_usuarios u ON v.tb_usuario_id = u.tb_id
    `;
    
    const [results] = await pool.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error('Erro ao buscar visitas:', err);
    res.status(500).json({ message: 'Erro ao buscar visitas' });
  }
});

// Rota para cadastrar uma nova visita
app.post('/cadastrar-visita', verificarToken, async (req, res) => {
  try {
    const { nome, empresa, data, hora, locais } = req.body;
    const userId = req.userId; // Obtém o ID do usuário do token JWT
    
    if (!nome || !empresa || !data || !hora || !locais) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    const query = 'INSERT INTO tb_visitas (tb_usuario_id, tb_nome, tb_empresa, tb_data, tb_hora, tb_locais) VALUES (?, ?, ?, ?, ?, ?)';
    
    const [result] = await pool.query(query, [userId, nome, empresa, data, hora, locais]);
    
    res.status(201).json({
      message: 'Visita cadastrada com sucesso!',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erro ao cadastrar visita:', error);
    res.status(500).json({ message: 'Erro ao cadastrar visita' });
  }
});

// Rota para obter dados de uma visita específica
app.get('/visita/:id', verificarToken, async (req, res) => {
  try {
    const visitaId = req.params.id;
    
    const query = `
      SELECT 
        v.tb_id AS id, 
        v.tb_nome AS nome, 
        v.tb_empresa AS empresa, 
        v.tb_data AS data, 
        v.tb_hora AS hora, 
        v.tb_locais AS locais,
        v.tb_usuario_id AS usuarioId,
        u.tb_nome AS nomeUsuario,
        u.tb_setor AS setorUsuario
      FROM 
        tb_visitas v
      LEFT JOIN
        tb_usuarios u ON v.tb_usuario_id = u.tb_id
      WHERE 
        v.tb_id = ?
    `;
    
    const [results] = await pool.query(query, [visitaId]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Visita não encontrada' });
    }
    
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Erro ao buscar visita:', err);
    res.status(500).json({ message: 'Erro ao buscar visita' });
  }
});

// Rota para finalizar uma visita
app.post('/finalizar-visita', verificarToken, async (req, res) => {
  try {
    const { visitaId, dataVisita, locaisVisitados, observacoes } = req.body;
    const userId = req.userId; // Obtém o ID do usuário do token JWT
    
    // Verificar se a visita existe
    if (visitaId) {
      const queryVerificar = 'SELECT tb_id FROM tb_visitas WHERE tb_id = ?';
      
      const [results] = await pool.query(queryVerificar, [visitaId]);
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Visita não encontrada' });
      }
      
      // Salvar os dados da visita finalizada
      await salvarDadosVisitaFinalizada(visitaId, dataVisita, locaisVisitados, observacoes, res, userId);
    } else {
      // Se não tiver ID da visita, apenas salvar os dados
      await salvarDadosVisitaFinalizada(null, dataVisita, locaisVisitados, observacoes, res, userId);
    }
  } catch (error) {
    console.error('Erro ao finalizar visita:', error);
    res.status(500).json({ message: 'Erro ao finalizar visita' });
  }
});

// Função para salvar os dados da visita finalizada
async function salvarDadosVisitaFinalizada(visitaId, dataVisita, locaisVisitados, observacoes, res, userId) {
  try {
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
      return res.status(400).json({ message: 'Formato de data inválido' });
    }
    
    // Inserir na tabela de visitas finalizadas
    const query = 'INSERT INTO tb_visitas_finalizadas (tb_visita_id, tb_usuario_id, tb_data_visita, tb_locais_visitados, tb_observacoes) VALUES (?, ?, ?, ?, ?)';
    
    const [result] = await pool.query(query, [visitaId, userId, formattedDate, locaisJSON, observacoesJSON]);
    
    console.log('Visita finalizada com sucesso:', result);
    return res.status(200).json({ 
      message: 'Visita finalizada com sucesso.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erro ao salvar visita finalizada:', error);
    return res.status(500).json({ message: 'Erro ao salvar visita finalizada' });
  }
}

// Rota para obter relatório de uma visita
app.get('/relatorio-visita/:id', verificarToken, async (req, res) => {
  try {
    const visitaFinalizadaId = req.params.id;
    
    // Buscar dados da visita finalizada
    const query = `
      SELECT 
        vf.tb_id AS id,
        vf.tb_data_visita AS dataVisita,
        vf.tb_locais_visitados AS locaisVisitados,
        vf.tb_observacoes AS observacoes,
        vf.tb_usuario_id AS usuarioId,
        v.tb_nome AS nome,
        v.tb_empresa AS empresa,
        v.tb_data AS data,
        v.tb_hora AS hora,
        v.tb_locais AS locais,
        u.tb_nome AS nomeUsuario,
        u.tb_setor AS setorUsuario
      FROM 
        tb_visitas_finalizadas vf
      LEFT JOIN 
        tb_visitas v ON vf.tb_visita_id = v.tb_id
      LEFT JOIN
        tb_usuarios u ON vf.tb_usuario_id = u.tb_id
      WHERE 
        vf.tb_id = ?
    `;
    
    const [results] = await pool.query(query, [visitaFinalizadaId]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Relatório de visita não encontrado' });
    }
    
    // Processar os dados
    const relatorio = results[0];
    
    // Converter strings JSON para objetos
    try {
      // Verificar se os dados já são objetos antes de tentar fazer parse
      relatorio.locaisVisitados = typeof relatorio.locaisVisitados === 'string' 
        ? JSON.parse(relatorio.locaisVisitados) 
        : relatorio.locaisVisitados;
      
      relatorio.observacoes = typeof relatorio.observacoes === 'string' 
        ? JSON.parse(relatorio.observacoes) 
        : relatorio.observacoes;
    } catch (error) {
      console.error('Erro ao processar dados JSON:', error);
      relatorio.locaisVisitados = [];
      relatorio.observacoes = {};
    }
    
    res.status(200).json(relatorio);
  } catch (error) {
    console.error('Erro ao buscar relatório de visita:', error);
    res.status(500).json({ message: 'Erro ao buscar relatório de visita' });
  }
});

// Rota para verificar se uma visita já foi finalizada
app.get('/verificar-visita-finalizada/:id', verificarToken, async (req, res) => {
  try {
    const visitaId = req.params.id;
    
    const query = `
      SELECT 
        vf.tb_id AS id,
        vf.tb_usuario_id AS usuarioId,
        u.tb_nome AS nomeUsuario
      FROM 
        tb_visitas_finalizadas vf
      LEFT JOIN
        tb_usuarios u ON vf.tb_usuario_id = u.tb_id
      WHERE 
        vf.tb_visita_id = ? 
      ORDER BY 
        vf.tb_id DESC 
      LIMIT 1
    `;
    
    const [results] = await pool.query(query, [visitaId]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Visita não finalizada' });
    }
    
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Erro ao verificar visita finalizada:', err);
    res.status(500).json({ message: 'Erro ao verificar visita finalizada' });
  }
});

// Inicialização do servidor
const inicializarServidor = async () => {
  {
    try {
      await verificarConexaoBanco();
      
      app.listen(port, () => {
        console.log(`🚀 Servidor rodando na porta ${port}`);
      });
    } catch (error) {
      console.error('❌ Falha ao iniciar servidor:', error);
      process.exit(1);
    }
  }
}
// Chamar a função para inicializar o servidor
inicializarServidor();