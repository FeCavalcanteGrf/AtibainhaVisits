-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS atibainha_visits;
USE atibainha_visits;

-- Tabela de usuários
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
-- Inserir alguns dados de exemplo para usuários
INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone, tb_setor) VALUES
('Admin', 'admin@example.com', '$2b$10$XdR0Z9XfMCi7UrTDgN7ZAOg5xKIoVsJ1Ey6YyqM.jP8JW/Kqvs9Ky', '11999999999', 'Administração'),
('Usuário Teste', 'teste@example.com', '$2b$10$XdR0Z9XfMCi7UrTDgN7ZAOg5xKIoVsJ1Ey6YyqM.jP8JW/Kqvs9Ky', '11988888888', 'Recepção');

-- Inserir alguns dados de exemplo para visitas
INSERT INTO tb_visitas (tb_nome, tb_empresa, tb_data, tb_hora, tb_locais) VALUES
('João Silva', 'Empresa ABC', '2025-05-15', '14:00:00', 'Recepção, Área Externa'),
('Maria Oliveira', 'Empresa XYZ', '2025-05-20', '10:30:00', 'Salão Principal, Jardim'),
('Carlos Santos', 'Empresa 123', '2025-05-05', '15:45:00', 'Área de Eventos'),
('Ana Pereira', 'Empresa Futura', '2025-05-15', '09:00:00', 'Todas as áreas');

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