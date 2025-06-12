-- =============================================
-- Script de criação do banco de dados Atibainha Visits
-- =============================================

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS atibainha_visits;
USE atibainha_visits;

-- =============================================
-- Tabela de usuários
-- Representa os usuários(Funcionários) do sistema que podem registrar visitas
-- Um usuário pode registrar várias visitas (1:N com tb_visitas)
-- Um usuário pode ter várias visitas finalizadas (1:N com tb_visitas_finalizadas)
-- =============================================
CREATE TABLE IF NOT EXISTS tb_usuarios (
    tb_id INT AUTO_INCREMENT PRIMARY KEY,
    tb_nome VARCHAR(100) NOT NULL,
    tb_email VARCHAR(100) NOT NULL UNIQUE,
    tb_senha VARCHAR(255) NOT NULL,
    tb_telefone VARCHAR(20),
    tb_setor VARCHAR(50) NOT NULL,
    tb_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Tabela de visitas
-- Representa as visitas registradas pelos usuários
-- Uma visita agendada pode pertencer a um usuário (N:1 com tb_usuarios)
-- Uma visita agendada pode ter várias visitas finalizadas ou não (1:0..1 com tb_visitas_finalizadas) 
-- =============================================
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

-- =============================================
-- Tabela de visitas finalizadas
-- Representa as visitas que foram finalizadas
-- Uma visita finalizada pertence a uma visita agendada (N:1 com tb_visitas)
-- Uma visita finalizada pertence a um usuário que a realizou (N:1 com tb_usuarios)
-- =============================================
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

-- =============================================
-- Índices para melhorar a performance das consultas
-- =============================================
CREATE INDEX idx_visita_id ON tb_visitas_finalizadas(tb_visita_id);

-- =============================================
-- Dados de teste - Usuários
-- =============================================
INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone, tb_setor) VALUES
-- Senha: teste123
('Administrador', 'admin@atibainha.com', '$2a$10$JQvfGlKrFqZ8M5XEjvuRZeUG0HL3XQ3UEgA2n4AqDveKl4BjmvNSe', '11999999999', 'Administração'),
-- Senha: teste123
('Recepcionista', 'recepcao@atibainha.com', '$2a$10$JQvfGlKrFqZ8M5XEjvuRZeUG0HL3XQ3UEgA2n4AqDveKl4BjmvNSe', '11988888888', 'Recepção'),
-- Senha: teste123
('Vendedor', 'vendas@atibainha.com', '$2a$10$JQvfGlKrFqZ8M5XEjvuRZeUG0HL3XQ3UEgA2n4AqDveKl4BjmvNSe', '11977777777', 'Vendas');

-- =============================================
-- Dados de teste - Visitas para Junho/2024
-- =============================================
INSERT INTO tb_visitas (tb_usuario_id, tb_nome, tb_empresa, tb_data, tb_hora, tb_locais) VALUES
(1, 'João Silva', 'Empresa ABC', '2024-06-05', '10:00:00', 'Nobre, Auditório, Figueira'),
(2, 'Maria Oliveira', 'Empresa XYZ', '2024-06-10', '14:30:00', 'Mangueira, Abacateiro, Chalé Standart'),
(3, 'Pedro Santos', 'Corporação 123', '2024-06-15', '09:00:00', 'Villa Atibainha, Chalé Suiço'),
(1, 'Ana Costa', 'Grupo Empresarial', '2024-06-20', '11:00:00', 'Sabiá, Primavera, Chalé Family 2D'),
(2, 'Carlos Ferreira', 'Consultoria ABC', '2024-06-25', '15:00:00', 'Pinheiro, Chalé Family 1D');

-- =============================================
-- Dados de teste - Visitas para Julho/2024
-- =============================================
INSERT INTO tb_visitas (tb_usuario_id, tb_nome, tb_empresa, tb_data, tb_hora, tb_locais) VALUES
(3, 'Fernanda Lima', 'Empresa DEF', '2024-07-03', '10:30:00', 'Nobre, Auditório, Villa Atibainha'),
(1, 'Roberto Alves', 'Corporação 456', '2024-07-08', '13:00:00', 'Figueira, Mangueira, Chalé Standart'),
(2, 'Juliana Mendes', 'Grupo XYZ', '2024-07-12', '09:30:00', 'Abacateiro, Chalé Family 1D'),
(3, 'Marcelo Souza', 'Consultoria 789', '2024-07-18', '14:00:00', 'Pinheiro, Sabiá, Chalé Suiço'),
(1, 'Patrícia Gomes', 'Empresa GHI', '2024-07-22', '11:30:00', 'Primavera, Chalé Family 2D'),
(2, 'Lucas Martins', 'Corporação JKL', '2024-07-28', '16:00:00', 'Nobre, Auditório, Villa Atibainha');