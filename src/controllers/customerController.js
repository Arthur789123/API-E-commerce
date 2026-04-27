const connection = require("../database/connection");
const {
  sendBadRequest,
  sendNotFound,
  sendInternalError,
  isValidId
} = require("../utils/responseHandler");

function validateCustomer(data) {
  const { name, email } = data;

  if (!name || !email) {
    return "Os campos name e email sao obrigatorios.";
  }

  if (!String(email).includes("@")) {
    return "O campo email precisa ser um email valido.";
  }

  return null;
}

const customerController = {
  async list(req, res) {
    try {
      const [customers] = await connection.execute(
        "SELECT id, name, email, phone, created_at, updated_at FROM customers ORDER BY id ASC"
      );

      return res.status(200).json(customers);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel listar os clientes.");
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do cliente precisa ser um numero inteiro positivo.");
      }

      const [customers] = await connection.execute(
        "SELECT id, name, email, phone, created_at, updated_at FROM customers WHERE id = ?",
        [id]
      );

      if (customers.length === 0) {
        return sendNotFound(res, "Cliente nao encontrado.");
      }

      return res.status(200).json(customers[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel buscar o cliente.");
    }
  },

  async create(req, res) {
    try {
      const { name, email, phone } = req.body;
      const validationError = validateCustomer({ name, email });

      if (validationError) {
        return sendBadRequest(res, validationError);
      }

      const [existingCustomers] = await connection.execute(
        "SELECT id FROM customers WHERE email = ?",
        [email.trim()]
      );

      if (existingCustomers.length > 0) {
        return sendBadRequest(res, "Ja existe um cliente cadastrado com esse email.");
      }

      const [result] = await connection.execute(
        "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
        [name.trim(), email.trim(), phone || null]
      );

      const [customers] = await connection.execute(
        "SELECT id, name, email, phone, created_at, updated_at FROM customers WHERE id = ?",
        [result.insertId]
      );

      return res.status(201).json(customers[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel cadastrar o cliente.");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do cliente precisa ser um numero inteiro positivo.");
      }

      const validationError = validateCustomer({ name, email });

      if (validationError) {
        return sendBadRequest(res, validationError);
      }

      const [existingCustomers] = await connection.execute(
        "SELECT id FROM customers WHERE id = ?",
        [id]
      );

      if (existingCustomers.length === 0) {
        return sendNotFound(res, "Cliente nao encontrado.");
      }

      const [customerWithEmail] = await connection.execute(
        "SELECT id FROM customers WHERE email = ? AND id <> ?",
        [email.trim(), id]
      );

      if (customerWithEmail.length > 0) {
        return sendBadRequest(res, "Ja existe outro cliente cadastrado com esse email.");
      }

      await connection.execute(
        "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?",
        [name.trim(), email.trim(), phone || null, id]
      );

      const [customers] = await connection.execute(
        "SELECT id, name, email, phone, created_at, updated_at FROM customers WHERE id = ?",
        [id]
      );

      return res.status(200).json(customers[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel atualizar o cliente.");
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do cliente precisa ser um numero inteiro positivo.");
      }

      const [existingCustomers] = await connection.execute(
        "SELECT id FROM customers WHERE id = ?",
        [id]
      );

      if (existingCustomers.length === 0) {
        return sendNotFound(res, "Cliente nao encontrado.");
      }

      await connection.execute("DELETE FROM customers WHERE id = ?", [id]);

      return res.status(200).json({
        message: "Cliente deletado com sucesso."
      });
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel deletar o cliente.");
    }
  }
};

module.exports = customerController;
