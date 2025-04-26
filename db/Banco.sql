CREATE DATABASE atibainhavisit;
use atibainhavisit;
CREATE TABLE IF NOT EXISTS tb_usuarios (
    tb_id INT AUTO_INCREMENT PRIMARY KEY,
    tb_nome VARCHAR(100) NOT NULL,
    tb_email VARCHAR(100) NOT NULL UNIQUE,
    tb_senha VARCHAR(255) NOT NULL,
    tb_telefone VARCHAR(15),
    tb_setor VARCHAR(60) NOT NULL, 
);

/* Tabela de visitas */
CREATE TABLE IF NOT EXISTS tb_visitas (
    tb_id INT AUTO_INCREMENT PRIMARY KEY,
    tb_nome VARCHAR(100) NOT NULL,
    tb_empresa VARCHAR(100) NOT NULL,
    tb_data DATE NOT NULL,
    tb_hora TIME NOT NULL,
    tb_locais TEXT NOT NULL
);

/* Adicionando uma coluna para a FK na tabela tb_visitas */

ALTER TABLE tb_visitas
ADD COLUMN tb_usuarios_id INT;

/* Configurando a chave estrangeira para referenciar tb_usuarios(tb_id) */
ALTER TABLE tb_visitas
ADD CONSTRAINT fk_usuarios
FOREIGN KEY (tb_usuarios_id)
REFERENCES tb_usuarios(tb_id);

/* Inserir 5 funcionários na tabela tb_usuarios */
INSERT INTO tb_usuarios (tb_nome, tb_email, tb_senha, tb_telefone, tb_setor) VALUES
('João Silva', 'joao.silva@email.com', 'senha123', '11999999999', 'Recepção'),
('Maria Oliveira', 'maria.oliveira@email.com', 'senha123', '11988888888', 'Administração'),
('Carlos Santos', 'carlos.santos@email.com', 'senha123', '11977777777', 'Manutenção'),
('Ana Costa', 'ana.costa@email.com', 'senha123', '11966666666', 'Reservas'),
('Allan', 'allan@gmail.com', '123456', '11955555555', 'Eventos'),
('Felipe', 'felipe@gmail.com', '123456', '11955555555', 'Ti');

 /* Inserir 5 visitas na tabela tb_visitas */
INSERT INTO tb_visitas (tb_nome, tb_empresa, tb_data, tb_hora, tb_locais, tb_usuarios_id) VALUES
('Visita 1', 'Empresa A', '2025-04-10', '10:00:00', 'Sala de Reuniões, Restaurante', 1),
('Visita 2', 'Empresa B', '2025-04-11', '11:00:00', 'Auditório, Piscina', 2),
('Visita 3', 'Empresa C', '2025-04-12', '14:00:00', 'Jardim, Restaurante', 3),
('Visita 4', 'Empresa D', '2025-04-13', '09:00:00', 'Sala de Reuniões, Auditório', 4),
('Visita 5', 'Empresa E', '2025-04-14', '15:00:00', 'Piscina, Jardim', 5);
