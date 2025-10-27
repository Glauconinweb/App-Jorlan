// src/routes/alunoRoutes.js

const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController");

// ✅ Deve vir primeiro: Rota Específica do PDF
router.get("/pdf/download/:alunoId", alunoController.gerarDownloadPDF);

// CRUD Alunos (O treino é atualizado no PUT)
router.post("/", alunoController.criarAluno);
router.get("/", alunoController.listarAlunos);
router.get("/:id", alunoController.detalhesAluno);
router.put("/:id", alunoController.atualizarAluno);

// Evolução
router.post("/:alunoId/evolucao", alunoController.adicionarEvolucao);
// ✅ Rota para deletar um registro de evolução específico
router.delete("/evolucao/:evolucaoId", alunoController.deletarEvolucao);

module.exports = router;
