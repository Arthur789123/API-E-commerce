const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API do e-commerce funcionando."
  });
});

app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      error: true,
      message: "JSON invalido no corpo da requisicao."
    });
  }

  return res.status(500).json({
    error: true,
    message: "Erro interno ao processar a requisicao."
  });
});

app.use((req, res) => {
  return res.status(404).json({
    error: true,
    message: "Rota nao encontrada."
  });
});

module.exports = app;
