const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const port = 3000;
var cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { log } = require('console');
require('dotenv').config()

const app = express();  
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors())

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

app.post('/register', async (req, res) => {
  const { nome, email, senha, telefone, setor } = req.body;
  console.log('Dados recebidos:',{nome,email,senha,telefone});
  
  try{
    const saltRounds = 10;
    const hashedSenha = await bcrypt.hash(senha, saltRounds);
    
    const query = 'INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone, tb_setor) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(query, [nome, email, hashedSenha, telefone, setor], (err, results) => {
      if (err) {
        console.error('Erro ao inserir usuário:', err);
        res.status(500).send('Erro ao cadastrar usuário.');
        return;
      }
      console.log('Usuário cadastrado com sucesso.',results);
      
      res.status(200).send('Usuário cadastrado com sucesso.');
    });
  }  
  catch (error){
    console.error('Erro na criptografia da senha:', error);
    res.status(500).send('Erro ao cadastrar usuário.');
  } 
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const query = 'SELECT * FROM tb_usuarios WHERE tb_email = ?';

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro ao verificar usuário.');
    }
    
    if (results.length === 0) {
      return res.status(401).send('E-mail ou senha incorretos.');
    }
    
    const usuario = results[0];
    
    try {
      // Compara a senha fornecida com a hash armazenada
      const senhaCorreta = await bcrypt.compare(senha, usuario.tb_senha);
      
      if (!senhaCorreta) {
        return res.status(401).send('E-mail ou senha incorretos.');
      }
      
      // Gera o token JWT
      const token = jwt.sign(
        { 
          id: usuario.tb_id, 
          email: usuario.tb_email,
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      // Retorna o token e informações básicas do usuário
      res.status(200).json({
        message: 'Login bem-sucedido',
        token,
        userId: usuario.tb_id,
        nome: usuario.tb_nome
      });
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      res.status(500).send('Erro ao verificar usuário.');
    }
  });
});

const verificarToken = (req, res, next) => {
 const authHeader = req.headers.authorization;
 const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do cabeçalho de autorização
  
  if (!token){
    return res.status(401).json({message: 'Token não foi fornecido.'});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario= decoded; // Armazena o ID do usuário decodificado no objeto de requisição
    next(); // Chama o próximo middleware ou rota
  }
  catch (error){
    return res.status(403).json({message: 'O token é invalido ou expirou.'});
  }
};

app.get('/test-connection', (req, res) => {
  connection.ping(err => {
    if (err) {
      console.error('Erro ao pingar o banco de dados:', err);
      res.status(500).send('Erro ao conectar ao banco de dados.');
    } else {
      res.status(200).send('Conexão com o banco de dados está funcionando.');
    }
  });
});

//Rota para buscar informações do usuário
app.get('/user-info', verificarToken,(req, res) => {
  const userId = req.query.userId; // Supondo que o ID do usuário seja passado como query param
  
  console.log('userId:', userId);

   if (req.usuario.id != userId) {
    return res.status(403).json({message: 'Você não tem permissão para acessar essas informações.'});
   }

  const query = 'SELECT tb_nome AS nome, tb_email AS email, tb_setor AS setor, tb_telefone AS tel FROM tb_usuarios WHERE tb_id = ?';
  
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar informações do usuário:', err);
      res.status(500).send('Erro ao buscar informações do usuário.');
      return;
    }
    if (results.length > 0) {
      console.log('Informações do usuário:', results[0]);
      res.status(200).json(results[0]);
    } else {
      res.status(404).send('Usuário não encontrado.');
    }
  });
});

app.post('/update-user', verificarToken, async (req, res) => {
  const { nome, email, setor, senha, tel } = req.body;
  
  // Verifica se o usuário está atualizando seus próprios dados
  if (req.usuario.email !== email) {
    return res.status(403).json({ message: 'Acesso não autorizado' });
  }
  
  try {
    let query;
    let params;
    
    // Se a senha foi fornecida, criptografa e atualiza
    if (senha && senha.trim() !== '') {
      const saltRounds = 10;
      const hashedSenha = await bcrypt.hash(senha, saltRounds);
      query = 'UPDATE tb_usuarios SET tb_nome = ?, tb_setor = ?, tb_senha = ?, tb_telefone = ? WHERE tb_email = ?';
      params = [nome, setor, hashedSenha, tel, email];
    } else {
      // Se a senha não foi fornecida, atualiza somente os outros campos
      query = 'UPDATE tb_usuarios SET tb_nome = ?, tb_setor = ?, tb_telefone = ? WHERE tb_email = ?';
      params = [nome, setor, tel, email];
    }

    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Erro ao atualizar usuário:', err);
        return res.status(500).send('Erro ao atualizar usuário.');
      }
      res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
    });
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    res.status(500).send('Erro ao atualizar usuário.');
  }
});

app.post('/delete-user', verificarToken, (req, res) => {
  const { email } = req.body;
  
  // Verifica se o usuário está excluindo seu próprio perfil
  if (req.usuario.email !== email) {
    return res.status(403).json({ message: 'Acesso não autorizado' });
  }
  
  const query = 'DELETE FROM tb_usuarios WHERE tb_email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao excluir usuário:', err);
      res.status(500).send('Erro ao excluir usuário.');
      return;
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).send('Usuário não encontrado.');
    }
    
    res.status(200).json({ message: 'Usuário excluído com sucesso.' });
  });
});

// Corrigido o endpoint para verificar token
app.get('/verificar-token', verificarToken, (req, res) => {
  res.status(200).json({
    valid: true,
    userId: req.usuario.id,
    email: req.usuario.email
  });
});

app.listen(port, () => {
  console.log('Servidor rodando na porta 3000.');
});
