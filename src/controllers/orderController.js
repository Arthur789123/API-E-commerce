const connection = require("../database/connection");
const {
  sendBadRequest,
  sendNotFound,
  sendInternalError,
  isValidId
} = require("../utils/responseHandler");
const allowedStatus = ["pending", "paid", "shipped", "delivered", "canceled"];

const orderController = {
  async list(req, res) {
    try {
      const [orders] = await connection.execute(
        `SELECT
          o.id,
          o.customer_id,
          o.total,
          o.status,
          o.created_at,
          o.updated_at,
          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        ORDER BY o.id ASC`
      );

      const formattedOrders = orders.map((order) => ({
        id: order.id,
        customer_id: order.customer_id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        customer: {
          id: order.customer_id,
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        }
      }));

      return res.status(200).json(formattedOrders);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel listar os pedidos.");
    }
  },

  async show(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do pedido precisa ser um numero inteiro positivo.");
      }

      const [orderRows] = await connection.execute(
        `SELECT
          o.id,
          o.customer_id,
          o.total,
          o.status,
          o.created_at,
          o.updated_at,
          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?`,
        [id]
      );

      if (orderRows.length === 0) {
        return sendNotFound(res, "Pedido nao encontrado.");
      }

      const [itemRows] = await connection.execute(
        `SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          oi.subtotal,
          oi.created_at,
          p.name AS product_name,
          p.description AS product_description,
          p.price AS product_price,
          p.stock AS product_stock
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC`,
        [id]
      );

      const order = orderRows[0];

      return res.status(200).json({
        order: {
          id: order.id,
          customer_id: order.customer_id,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at
        },
        customer: {
          id: order.customer_id,
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone
        },
        items: itemRows.map((item) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          created_at: item.created_at,
          product: {
            id: item.product_id,
            name: item.product_name,
            description: item.product_description,
            price: item.product_price,
            stock: item.product_stock
          }
        }))
      });
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel buscar o pedido.");
    }
  },

  async create(req, res) {
    const db = await connection.getConnection();
    let transactionStarted = false;

    try {
      const { customer_id, items } = req.body;

      if (!isValidId(customer_id)) {
        return sendBadRequest(res, "O campo customer_id precisa ser um numero inteiro positivo.");
      }

      if (!Array.isArray(items) || items.length === 0) {
        return sendBadRequest(res, "O campo items precisa ser um array com pelo menos um item.");
      }

      for (const item of items) {
        if (!isValidId(item.product_id)) {
          return sendBadRequest(res, "Cada item precisa ter product_id como numero inteiro positivo.");
        }

        if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
          return sendBadRequest(res, "Cada item precisa ter quantity maior que zero.");
        }
      }

      await db.beginTransaction();
      transactionStarted = true;

      const [customers] = await db.execute(
        "SELECT id, name, email, phone FROM customers WHERE id = ?",
        [customer_id]
      );

      if (customers.length === 0) {
        await db.rollback();

        return sendNotFound(res, "Cliente nao encontrado.");
      }

      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const [products] = await db.execute(
          "SELECT id, name, price, stock FROM products WHERE id = ?",
          [item.product_id]
        );

        if (products.length === 0) {
          await db.rollback();

          return sendNotFound(res, `Produto com id ${item.product_id} nao encontrado.`);
        }

        const product = products[0];

        if (product.stock < Number(item.quantity)) {
          await db.rollback();

          return sendBadRequest(res, `Estoque insuficiente para o produto ${product.name}.`);
        }

        const unitPrice = Number(product.price);
        const quantity = Number(item.quantity);
        const subtotal = unitPrice * quantity;

        total += subtotal;
        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          subtotal
        });
      }

      const [orderResult] = await db.execute(
        "INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)",
        [customer_id, total.toFixed(2), "pending"]
      );

      for (const item of orderItems) {
        await db.execute(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
          [orderResult.insertId, item.product_id, item.quantity, item.unit_price, item.subtotal.toFixed(2)]
        );

        await db.execute(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      await db.commit();
      transactionStarted = false;

      const [orders] = await connection.execute(
        "SELECT id, customer_id, total, status, created_at, updated_at FROM orders WHERE id = ?",
        [orderResult.insertId]
      );

      return res.status(201).json({
        order: orders[0],
        customer: customers[0],
        items: orderItems
      });
    } catch (error) {
      if (transactionStarted) {
        await db.rollback();
      }

      return sendInternalError(res, "Nao foi possivel criar o pedido.");
    } finally {
      db.release();
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!isValidId(id)) {
        return sendBadRequest(res, "O id do pedido precisa ser um numero inteiro positivo.");
      }

      if (!status) {
        return sendBadRequest(res, "O campo status e obrigatorio.");
      }

      if (!allowedStatus.includes(status)) {
        return sendBadRequest(
          res,
          "Status invalido. Use: pending, paid, shipped, delivered ou canceled."
        );
      }

      const [orders] = await connection.execute(
        "SELECT id, customer_id, total, status, created_at, updated_at FROM orders WHERE id = ?",
        [id]
      );

      if (orders.length === 0) {
        return sendNotFound(res, "Pedido nao encontrado.");
      }

      await connection.execute(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id]
      );

      const [updatedOrders] = await connection.execute(
        "SELECT id, customer_id, total, status, created_at, updated_at FROM orders WHERE id = ?",
        [id]
      );

      return res.status(200).json(updatedOrders[0]);
    } catch (error) {
      return sendInternalError(res, "Nao foi possivel atualizar o status do pedido.");
    }
  }
};

module.exports = orderController;
