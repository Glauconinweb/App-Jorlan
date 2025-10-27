// src/routes/alunoRoutes.js

const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController");

// ✅ Deve vir primeiro: Rota Específica do PDF
router.get("/pdf/download/:alunoId", alunoController.gerarDownloadPDF);

// CRUD Alunos
router.post("/", alunoController.criarAluno);
router.get("/", alunoController.listarAlunos);
router.get("/:id", alunoController.detalhesAluno);
router.put("/:id", alunoController.atualizarAluno);

// Evolução
router.post("/:alunoId/evolucao", alunoController.adicionarEvolucao);

module.exports = router;
