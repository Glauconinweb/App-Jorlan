// server.js
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const alunoRoutes = require("./src/routes/alunoRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware para fornecer a URL base da API
app.use((req, res, next) => {
  req.apiBaseUrl = `${req.protocol}://${req.get("host")}/api/alunos`;
  next();
});

// Rotas da API
app.use("/api/alunos", alunoRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
