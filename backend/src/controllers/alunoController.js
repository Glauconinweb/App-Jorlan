// src/controllers/alunoController.js

const fs = require("fs").promises;
const path = require("path");
const puppeteer = require("puppeteer");
const prisma = require("../services/prismaService");

// Função utilitária para tratar campos opcionais vazios
const normalizeOptionalString = (value) =>
  value && value.trim() !== "" ? value.trim() : null;

// Criar aluno
exports.criarAluno = async (req, res) => {
  const { nome, email, alturaCm, objetivo, treinoHtml } = req.body;
  if (!nome) return res.status(400).json({ error: "O nome é obrigatório." });

  try {
    const novoAluno = await prisma.aluno.create({
      data: {
        nome,
        email: normalizeOptionalString(email),
        alturaCm: alturaCm ? parseInt(alturaCm) : null,
        objetivo: normalizeOptionalString(objetivo),
        treinoHtml: normalizeOptionalString(treinoHtml),
      },
    });
    res.status(201).json(novoAluno);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao cadastrar aluno.", details: error.message });
  }
};

// Listar alunos (sem mudanças)
exports.listarAlunos = async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany({
      select: { id: true, nome: true, email: true },
    });
    res.status(200).json(alunos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao listar alunos.", details: error.message });
  }
};

// Detalhes de um aluno
exports.detalhesAluno = async (req, res) => {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: req.params.id },
      include: { evolucao: { orderBy: { dataRegistro: "asc" } } },
    });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado." });
    res.status(200).json(aluno);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao buscar aluno.", details: error.message });
  }
};

// Atualizar aluno
exports.atualizarAluno = async (req, res) => {
  const { nome, email, alturaCm, objetivo, treinoHtml } = req.body;
  try {
    const alunoAtualizado = await prisma.aluno.update({
      where: { id: req.params.id },
      data: {
        nome,
        email: normalizeOptionalString(email),
        alturaCm: alturaCm ? parseInt(alturaCm) : null,
        objetivo: normalizeOptionalString(objetivo),
        treinoHtml: normalizeOptionalString(treinoHtml),
      },
    });
    res.status(200).json(alunoAtualizado);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar aluno.", details: error.message });
  }
};

// Adicionar evolução (sem mudanças)
exports.adicionarEvolucao = async (req, res) => {
  const { alunoId } = req.params;
  const { pesoKg, percGordura, observacoes } = req.body;

  try {
    const evolucao = await prisma.evolucao.create({
      data: {
        alunoId: alunoId,
        pesoKg: parseFloat(pesoKg),
        percGordura: percGordura ? parseFloat(percGordura) : null,
        observacoes: normalizeOptionalString(observacoes),
        dataRegistro: new Date(),
      },
    });
    res.status(201).json(evolucao);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao adicionar evolução.", details: error.message });
  }
};

// ✅ NOVO: DELETAR EVOLUÇÃO
exports.deletarEvolucao = async (req, res) => {
  const { evolucaoId } = req.params;
  try {
    await prisma.evolucao.delete({
      where: { id: evolucaoId },
    });
    res.status(200).json({
      message: "Registro de evolução deletado com sucesso.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "Registro de evolução não encontrado." });
    }
    console.error("Erro ao deletar evolução:", error);
    res
      .status(500)
      .json({ error: "Falha ao deletar registro.", details: error.message });
  }
};

// Gerar PDF do aluno
exports.gerarDownloadPDF = async (req, res) => {
  const alunoId = req.params.alunoId;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: { evolucao: { orderBy: { dataRegistro: "asc" } } },
    });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado." });

    let htmlTemplate = await fs.readFile(
      path.join(__dirname, "../../public/views/planilha_pdf_template.html"),
      "utf-8"
    ); // 1. TRATAMENTO DO CONTEÚDO HTML DO TREINO

    const treinoContent = aluno.treinoHtml
      ? aluno.treinoHtml
      : '<div class="bloco-treino" style="border-left: 5px solid #ff0000;"><h3>Nenhum Treino Cadastrado</h3><p>Use a tela de acompanhamento para adicionar o treino A, B, C, etc., em HTML.</p></div>'; // 2. SUBSTITUIÇÃO DE PLACEHOLDERS (incluindo o novo treino)

    htmlTemplate = htmlTemplate
      .replace("{{ALUNO_NOME}}", aluno.nome)
      .replace("{{ALUNO_EMAIL}}", aluno.email || "Não informado")
      .replace(
        "{{ALUNO_ALTURA}}",
        aluno.alturaCm ? `${aluno.alturaCm} cm` : "Não informado"
      )
      .replace("{{ALUNO_OBJETIVO}}", aluno.objetivo || "Não informado")
      .replace("{{TREINO_BLOCO}}", treinoContent);

    const linhasEvolucao = aluno.evolucao
      .map(
        (e) => `
 <tr>
<td>${new Date(e.dataRegistro).toLocaleDateString("pt-BR")}</td>
 <td>${e.pesoKg.toFixed(1)} Kg</td>
<td>${e.percGordura ? e.percGordura.toFixed(1) + "%" : "-"}</td>
 <td>${e.observacoes || "Sem notas"}</td>
 </tr>`
      )
      .join("");

    htmlTemplate = htmlTemplate.replace("{{EVOLUCAO_LINHAS}}", linhasEvolucao);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Relatorio_${aluno.nome.replace(/\s/g, "_")}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro na geração do PDF:", error);
    res
      .status(500)
      .json({ error: "Falha ao gerar o PDF.", details: error.message });
  }
};
