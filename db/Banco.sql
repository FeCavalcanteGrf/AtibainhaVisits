-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS atibainha_visits;
USE atibainha_visits;

-- Tabela de usuários
 -- Representa os usuários(Funcionários) do sistema que podem registrar visitas
 -- Um usuário pode registrar várias visitas (1:N com tb_visitas)
 -- Um usuário pode ter várias visitas finalizadas (1:N com tb_visitas_finalizadas)
CREATE TABLE IF NOT EXISTS tb_usuarios (
    tb_id INT AUTO_INCREMENT PRIMARY KEY,
    tb_nome VARCHAR(100) NOT NULL,
    tb_email VARCHAR(100) NOT NULL UNIQUE,
    tb_senha VARCHAR(255) NOT NULL,
    tb_telefone VARCHAR(20),
    tb_setor VARCHAR(50) NOT NULL,
    tb_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de visitas
 -- Representa as visitas registradas pelos usuários
 -- Uma visita agendada pode pertencer a um usuário (N:1 com tb_usuarios)
 -- Uma visita agendada pode ter várias visitas finalizadas ou não (1:0..1 com tb_visitas_finalizadas) 
CREATE TABLE IF NOT EXISTS tb_visitas (
    tb_id INT AUTO_INCREMENT PRIMARY KEY,
    tb_usuario_id INT,
    tb_nome VARCHAR(100) NOT NULL,
    tb_empresa VARCHAR(100) NOT NULL,
    tb_data DATE NOT NULL,
    tb_hora TIME NOT NULL,
    tb_locais TEXT NOT NULL,
    tb_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tb_usuario_id) REFERENCES tb_usuarios(tb_id)
);

-- Tabela de visitas finalizadas
 -- Representa as visitas que foram finalizadas
 -- Uma visita finalizada pertence a uma visita agendada (N:1 com tb_visitas)
 -- Uma visita finalizada pertence a um usuário que a realizou (N:1 com tb_usuarios)
CREATE TABLE IF NOT EXISTS tb_visitas_finalizadas (
  tb_id INT AUTO_INCREMENT PRIMARY KEY,
  tb_visita_id INT,
  tb_usuario_id INT,
  tb_data_visita DATETIME NOT NULL,
  tb_locais_visitados JSON NOT NULL,
  tb_observacoes JSON,
  FOREIGN KEY (tb_visita_id) REFERENCES tb_visitas(tb_id) ON DELETE SET NULL,
  FOREIGN KEY (tb_usuario_id) REFERENCES tb_usuarios(tb_id) ON DELETE SET NULL
);

-- Índice para melhorar a performance das consultas
CREATE INDEX idx_visita_id ON tb_visitas_finalizadas(tb_visita_id);