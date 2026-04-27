const connection = require("../database/connection");
const {
  sendBadRequest,
  sendNotFound,
  sendInternalError,
  isValidId
} = require("../utils/responseHandler");

function validateProduct(data) {
  const { name, price, stock } = data;

  if (!name || price === undefined || stock === undefined) {
    return "Os campos name, price e stock sao obrigatorios.";
  }

  if (Number(price) < 0) {
    return "O campo price nao pode ser negativo.";
  }

  if (Number(stock) < 0) {
    return "O campo stock nao pode ser negativo.";
  }

  if (Number.isNaN(Number(price))) {
    return "O campo price precisa ser um numero valido.";
  }

  if (Number.isNaN(Number(stock))) {
    return "O campo stock precisa ser um numero valido.";
  }

  return null;
}

const productController = {
  async list(req, res) {
    try {
      const [products] = await connection.execute(
        "SELECT id, name, description, price, stock, created_at, updated_at FROM products ORDER BY id ASC"
      );

      return res.status(200).json(products);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel listar os produtos.");
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do produto precisa ser um numero inteiro positivo.");
      }

      const [products] = await connection.execute(
        "SELECT id, name, description, price, stock, created_at, updated_at FROM products WHERE id = ?",
        [id]
      );

      if (products.length === 0) {
        return sendNotFound(res, "Produto nao encontrado.");
      }

      return res.status(200).json(products[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel buscar o produto.");
    }
  },

  async create(req, res) {
    try {
      const { name, description, price, stock } = req.body;
      const validationError = validateProduct({ name, price, stock });

      if (validationError) {
        return sendBadRequest(res, validationError);
      }

      const [result] = await connection.execute(
        "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)",
        [name.trim(), description || null, Number(price), Number(stock)]
      );

      const [products] = await connection.execute(
        "SELECT id, name, description, price, stock, created_at, updated_at FROM products WHERE id = ?",
        [result.insertId]
      );

      return res.status(201).json(products[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel cadastrar o produto.");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock } = req.body;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do produto precisa ser um numero inteiro positivo.");
      }

      const validationError = validateProduct({ name, price, stock });

      if (validationError) {
        return sendBadRequest(res, validationError);
      }

      const [existingProducts] = await connection.execute(
        "SELECT id FROM products WHERE id = ?",
        [id]
      );

      if (existingProducts.length === 0) {
        return sendNotFound(res, "Produto nao encontrado.");
      }

      await connection.execute(
        "UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?",
        [name.trim(), description || null, Number(price), Number(stock), id]
      );

      const [products] = await connection.execute(
        "SELECT id, name, description, price, stock, created_at, updated_at FROM products WHERE id = ?",
        [id]
      );

      return res.status(200).json(products[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel atualizar o produto.");
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do produto precisa ser um numero inteiro positivo.");
      }

      const [existingProducts] = await connection.execute(
        "SELECT id FROM products WHERE id = ?",
        [id]
      );

      if (existingProducts.length === 0) {
        return sendNotFound(res, "Produto nao encontrado.");
      }

      await connection.execute("DELETE FROM products WHERE id = ?", [id]);

      return res.status(200).json({
        message: "Produto deletado com sucesso."
      });
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel deletar o produto.");
    }
  }
};

module.exports = productController;
