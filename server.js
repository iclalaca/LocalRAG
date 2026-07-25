// server.js – Express.js API sunucusu
const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const config = require("./config");
const { initFoundry, answerQuery, answerQueryStream, retrieveContext } = require("./src/chatEngine");
const { initEmbedding } = require("./src/embeddingClient");
const { ingest } = require("./src/ingest");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Statik dosyaları doğrudan kök dizinden sunar
// Dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.DOCS_DIR)) {
      fs.mkdirSync(config.DOCS_DIR, { recursive: true });
    }
    cb(null, config.DOCS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".md", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Sadece .md ve .txt dosyaları kabul edilir."));
    }
  },
});

// ── /api/health ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    model: config.CHAT_MODEL,
    embeddingModel: config.EMBEDDING_MODEL,
    docsDir: config.DOCS_DIR,
    dbPath: config.DB_PATH,
  });
});

// ── /api/chat — Streaming SSE ─────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Soru boş olamaz." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = answerQueryStream(question);
    for await (const delta of stream) {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    const chunks = await retrieveContext(question);
    const sources = [...new Set(chunks.map((c) => c.source))];
    res.write(`data: ${JSON.stringify({ sources, done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

// ── /api/chat-sync — Non-streaming ───────────────────────────────────────────
app.post("/api/chat-sync", async (req, res) => {
  const { question } = req.body;
  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Soru boş olamaz." });
  }
  try {
    const result = await answerQuery(question);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── /api/upload — Dosya yükle ve yeniden indeksle ────────────────────────────
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Dosya yüklenemedi." });
  }
  try {
    const result = await ingest();
    res.json({
      message: `'${req.file.originalname}' yüklendi ve indekslendi.`,
      chunkCount: result.chunkCount,
      docCount: result.docCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Sunucuyu başlat ───────────────────────────────────────────────────────────
async function startServer() {
  console.log("Modeller başlatılıyor, lütfen bekleyin...");
  await initFoundry();
  await initEmbedding();
  const path = require('path');

  // Statik dosyaları sun
  app.use(express.static(__dirname));

  // Ana dizine gelindiğinde index.html'i gönder
  app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
  });
  app.listen(config.PORT, () => {
    console.log(`\nSunucu hazır → http://localhost:${config.PORT}`);
    console.log("Tarayıcıda yukarıdaki adresi aç!");
  });
}

startServer().catch((err) => {
  console.error("Sunucu başlatılamadı:", err);
  process.exit(1);
});