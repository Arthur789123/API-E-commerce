# API E-commerce Simples

## Sobre o projeto

Este projeto é uma API REST simples para um e-commerce enxuto. A ideia é servir como base de estudo para quem quer entender como montar um backend com `Node.js`, `Express` e `MySQL` sem usar ORM.

A API permite trabalhar com tres partes principais do sistema:

- produtos
- clientes
- pedidos

No fluxo atual, ja e possivel:

- cadastrar, listar, buscar, editar e deletar produtos
- criar pedidos com itens
- calcular automaticamente o total do pedido
- baixar o estoque dos produtos no momento da compra
- listar pedidos
- visualizar os detalhes de um pedido
- atualizar o status de um pedido

O projeto foi organizado de forma simples e didatica para ficar facil de ler, testar e evoluir.

## Tecnologias usadas

As principais tecnologias do projeto sao:

- `Node.js`: ambiente de execucao do JavaScript no servidor
- `Express`: framework para criar rotas e organizar a API
- `MySQL`: banco de dados relacional
- `mysql2/promise`: biblioteca para conectar no MySQL usando `async/await`
- `cors`: permite que o frontend acesse a API
- `dotenv`: carrega variaveis de ambiente do arquivo `.env`

## Estrutura do projeto

```text
api-ecommerce/
src/
  controllers/
    customerController.js
    orderController.js
    productController.js
  database/
    connection.js
    migrations.sql
    seeders.sql
  routes/
    customerRoutes.js
    orderRoutes.js
    productRoutes.js
  utils/
    responseHandler.js
  app.js
  server.js
.env.example
package.json
README.md
```

## Como instalar as dependencias

Com o terminal aberto na pasta do projeto, rode:

```bash
npm install
```

Esse comando vai instalar tudo o que a API precisa para funcionar.

## Como configurar o `.env`

Na raiz do projeto existe um arquivo chamado `.env.example`. Ele serve como modelo.

Crie um arquivo chamado `.env` na raiz do projeto e preencha com os dados do seu MySQL.

Exemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=ecommerce_simples
```

Explicando cada campo:

- `PORT`: porta em que a API vai rodar
- `DB_HOST`: endereco do servidor MySQL
- `DB_PORT`: porta do MySQL
- `DB_USER`: usuario do banco
- `DB_PASSWORD`: senha do banco
- `DB_NAME`: nome do banco que a API vai usar

Importante: o valor de `DB_NAME` deve bater com o banco criado no arquivo `migrations.sql`.

## Como criar o banco de dados

O banco usado no projeto se chama `ecommerce_simples`.

Voce pode criar e estruturar esse banco executando o arquivo:

- [migrations.sql](C:/Users/User/API-E-commerce/src/database/migrations.sql)

Esse arquivo faz o seguinte:

- cria o banco `ecommerce_simples`
- cria a tabela `products`
- cria a tabela `customers`
- cria a tabela `orders`
- cria a tabela `order_items`

## Como rodar o `migrations.sql`

Existem duas formas simples de fazer isso.

### Opcao 1: usando o MySQL Workbench

1. Abra o MySQL Workbench.
2. Conecte no seu servidor MySQL.
3. Abra o arquivo `src/database/migrations.sql`.
4. Execute o script.

### Opcao 2: usando o terminal do MySQL

Se o MySQL estiver configurado no seu computador, voce pode rodar:

```bash
mysql -u root -p < src/database/migrations.sql
```

Depois disso, o MySQL vai pedir sua senha e executar o script.

Se o seu usuario nao for `root`, troque pelo usuario correto.

## Como rodar o `seeders.sql`

Depois de criar as tabelas, rode o arquivo:

- [seeders.sql](C:/Users/User/API-E-commerce/src/database/seeders.sql)

Esse arquivo insere dados ficticios para facilitar os testes da API, como:

- produtos
- clientes
- pedidos
- itens dos pedidos

### Usando o MySQL Workbench

1. Abra o arquivo `src/database/seeders.sql`.
2. Execute o script.

### Usando o terminal

```bash
mysql -u root -p < src/database/seeders.sql
```

## Como iniciar o servidor

Depois de instalar as dependencias, configurar o `.env` e preparar o banco, inicie a API com:

```bash
npm run dev
```

No estado atual do projeto, o script `dev` usa:

```bash
node src/server.js
```

Se tudo estiver certo, voce deve ver no terminal uma mensagem parecida com:

```text
Servidor rodando na porta 3000
```

## URL base da API

Se estiver usando a porta `3000`, a URL base sera:

```text
http://localhost:3000
```

## Endpoint inicial de teste

Para conferir se a API esta no ar, voce pode testar:

```http
GET /
```

Resposta esperada:

```json
{
  "message": "API do e-commerce funcionando."
}
```

## Lista de endpoints

### Produtos

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

### Clientes

- `GET /customers`
- `GET /customers/:id`
- `POST /customers`
- `PUT /customers/:id`
- `DELETE /customers/:id`

### Pedidos

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id/status`

## Exemplos de body JSON

### Criar produto

Endpoint:

```http
POST /products
```

Body:

```json
{
  "name": "Monitor AOC 27 Polegadas",
  "description": "Monitor Full HD com painel IPS e entrada HDMI.",
  "price": 1199.90,
  "stock": 12
}
```

### Criar cliente

Endpoint:

```http
POST /customers
```

Body:

```json
{
  "name": "Mariana Costa",
  "email": "mariana.costa@email.com",
  "phone": "11999998888"
}
```

### Criar pedido

Endpoint:

```http
POST /orders
```

Body:

```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 1
    },
    {
      "product_id": 2,
      "quantity": 2
    }
  ]
}
```

O que acontece quando esse pedido e criado:

- a API verifica se o cliente existe
- a API verifica se os produtos existem
- a API confere o estoque de cada item
- a API pega o preco atual de cada produto
- a API calcula o subtotal de cada item
- a API calcula o total do pedido
- a API salva o pedido e os itens
- a API baixa o estoque automaticamente

### Atualizar status do pedido

Endpoint:

```http
PUT /orders/:id/status
```

Body:

```json
{
  "status": "paid"
}
```

Status permitidos:

- `pending`
- `paid`
- `shipped`
- `delivered`
- `canceled`

## Exemplos de respostas de erro

A API segue um formato simples e padronizado para erros:

```json
{
  "error": true,
  "message": "Produto nao encontrado."
}
```

Alguns exemplos:

- `400`: dados invalidos enviados na requisicao
- `404`: rota ou registro nao encontrado
- `500`: erro interno da aplicacao

## Fluxo recomendado para testar

Se voce estiver comecando, um caminho bom para testar e:

1. Rodar o `migrations.sql`
2. Rodar o `seeders.sql`
3. Iniciar o servidor com `npm run dev`
4. Testar `GET /`
5. Testar `GET /products`
6. Criar um pedido com `POST /orders`
7. Verificar a listagem em `GET /orders`
8. Ver os detalhes com `GET /orders/:id`
9. Atualizar o status com `PUT /orders/:id/status`

## Observacoes finais

Este projeto foi pensado para ser simples. Por isso:

- nao usa ORM
- nao usa TypeScript
- nao usa Sequelize
- nao usa Prisma

A ideia e que voce consiga entender primeiro o basico do funcionamento de uma API com banco relacional, rotas, controllers, queries SQL e tratamento de erros.
