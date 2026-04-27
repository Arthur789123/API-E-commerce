USE ecommerce_simples;

INSERT INTO products (name, description, price, stock)
VALUES
  ('Notebook Dell Inspiron 15', 'Notebook com 16GB de RAM, SSD 512GB e tela Full HD.', 3899.90, 12),
  ('Mouse Logitech M170', 'Mouse sem fio com conexao USB e design ambidestro.', 79.90, 40),
  ('Teclado Mecanico Redragon Kumara', 'Teclado mecanico compacto com iluminacao RGB.', 229.90, 25),
  ('Monitor LG 24 Polegadas', 'Monitor IPS Full HD com taxa de atualizacao de 75Hz.', 899.90, 18),
  ('Headset HyperX Cloud Stinger', 'Headset gamer com microfone e audio estereo.', 249.90, 20),
  ('Webcam Logitech C920', 'Webcam Full HD ideal para reunioes e streaming.', 319.90, 15),
  ('SSD Kingston 480GB', 'SSD SATA para melhorar o desempenho do computador.', 289.90, 30),
  ('Cadeira Gamer ThunderX3', 'Cadeira ergonomica com ajuste de altura e inclinacao.', 1199.90, 8),
  ('Mousepad Extra Grande', 'Mousepad com superficie speed e base antiderrapante.', 59.90, 50),
  ('Notebook Lenovo IdeaPad 3', 'Notebook com 8GB de RAM, SSD 256GB e processador Ryzen 5.', 3299.90, 10);

INSERT INTO customers (name, email, phone)
VALUES
  ('Ana Souza', 'ana.souza@email.com', '11987654321'),
  ('Carlos Lima', 'carlos.lima@email.com', '21991234567'),
  ('Fernanda Rocha', 'fernanda.rocha@email.com', '31999887766'),
  ('Juliana Martins', 'juliana.martins@email.com', '41995554433'),
  ('Ricardo Alves', 'ricardo.alves@email.com', '11993332211');

INSERT INTO orders (customer_id, total, status)
VALUES
  (1, 4278.90, 'paid'),
  (3, 1549.70, 'processing'),
  (5, 369.70, 'shipped');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
VALUES
  (1, 1, 1, 3899.90, 3899.90),
  (1, 2, 1, 79.90, 79.90),
  (1, 9, 1, 59.90, 59.90),
  (1, 6, 1, 319.90, 319.90),
  (2, 4, 1, 899.90, 899.90),
  (2, 5, 2, 249.90, 499.80),
  (2, 9, 1, 59.90, 59.90),
  (2, 2, 1, 79.90, 79.90),
  (2, 7, 1, 289.90, 289.90),
  (3, 3, 1, 229.90, 229.90),
  (3, 2, 1, 79.90, 79.90),
  (3, 9, 1, 59.90, 59.90);
