const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
var cors = require('cors');
const { log } = require('console');

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors())

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'GloriaDeus12',
  database: 'atibainhavisit'
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

app.post('/register', (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  console.log('Dados recebidos:',{nome,email,senha,telefone});
  
  const query = 'INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone) VALUES (?, ?, ?, ?)';

  connection.query(query, [nome, email, senha, telefone], (err, results) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      res.status(500).send('Erro ao cadastrar usuário.');
      return;
    }
    console.log('Usuário cadastrado com sucesso.',results);
    
    res.status(200).send('Usuário cadastrado com sucesso.');
  });
});

app.post('/login', (req, res) => {
  console.log('LOGINNN');
  const { email, senha } = req.body;
  const query = 'SELECT * FROM tb_usuarios WHERE tb_email = ? AND tb_senha = ?';

  connection.query(query, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      res.status(500).send('Erro ao verificar usuário.');
      return;
    }
    if (results.length > 0) {
      res.status(200).send('Login bem-sucedido.');
    } else {
      res.status(401).send('E-mail ou senha incorretos.');
    }
  });
});

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

app.get('/user-info', (req, res) => {
  const userId = req.query.userId; // Supondo que o ID do usuário seja passado como query param
  const query = 'SELECT tb_nome AS nome, tb_email AS email, tb_setor AS setor FROM tb_usuarios WHERE tb_id = ?';

  console.log('userId:', userId);

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

app.post('/update-user', (req, res) => {
  console.log('update-user');
  const { nome, email, setor, senha } = req.body;
  console.log(nome, email, setor, senha, "Hello guys, how are you?")
  const query = 'UPDATE tb_usuarios SET tb_nome = ?, tb_setor = ?, tb_senha = ? WHERE tb_email = ?';

  connection.query(query, [nome, setor, senha, email], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar usuário:', err);
      res.status(500).send('Erro ao atualizar usuário.');
      return;
    }
    res.status(200).send('Usuário atualizado com sucesso.');
  });
});

app.post('/add-user', (req, res) => {
  const { nome, email, setor, senha } = req.body;
  const query = 'INSERT INTO tb_usuarios (tb_nome, tb_email, tb_setor, tb_senha) VALUES (?, ?, ?, ?)';

  connection.query(query, [nome, email, setor, senha], (err, results) => {
    if (err) {
      console.error('Erro ao adicionar usuário:', err);
      res.status(500).send('Erro ao adicionar usuário.');
      return;
    }
    res.status(200).send('Usuário adicionado com sucesso.');
  });
});

app.post('/delete-user', (req, res) => {
  const { email } = req.body;
  const query = 'DELETE FROM tb_usuarios WHERE tb_email = ?';

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao excluir usuário:', err);
      res.status(500).send('Erro ao excluir usuário.');
      return;
    }
    res.status(200).send('Usuário excluído com sucesso.');
  });
});

app.listen(port, () => {
  console.log('Servidor rodando na porta 3000.');
});
