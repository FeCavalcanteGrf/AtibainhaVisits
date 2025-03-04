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

app.listen(port, () => {
  console.log('Servidor rodando na porta 3000.');
});
