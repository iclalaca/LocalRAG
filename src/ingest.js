// ingest.js — Dokümanları okur, parçalar, Foundry Local embedding modeliyle
// vektörleştirir ve SQLite'a kaydeder
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const config = require("../config");
const { chunkText } = require("./chunker");
const { embedTexts } = require("./embeddingClient");

function setupDatabase(dbPath = config.DB_PATH) {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      content TEXT NOT NULL,
      vector TEXT NOT NULL
    )
  `);
  return db;
}

function readDocsFromDir(docsDir = config.DOCS_DIR) {
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const files = fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"));

  return files.map((file) => ({
    source: file,
    content: fs.readFileSync(path.join(docsDir, file), "utf-8"),
  }));
}

async function ingest(docsDir = config.DOCS_DIR, dbPath = config.DB_PATH) {
  const db = setupDatabase(dbPath);

  // Önceki verileri temizle (yeniden indeksleme)
  db.exec("DELETE FROM chunks");

  const docs = readDocsFromDir(docsDir);

  if (docs.length === 0) {
    console.log(`Uyarı: '${docsDir}' klasöründe .md veya .txt dosyası bulunamadı.`);
    db.close();
    return { chunkCount: 0, docCount: 0 };
  }

  // Tüm dokümanları chunk'la, kaynağını işaretleyerek tek listede topla
  const allChunks = [];
  for (const doc of docs) {
    const pieces = chunkText(doc.content);
    for (const piece of pieces) {
      allChunks.push({ source: doc.source, content: piece });
    }
  }

  console.log(`${allChunks.length} chunk için embedding üretiliyor (Foundry Local)...`);
  const vectors = await embedTexts(allChunks.map((c) => c.content));

  const insertChunk = db.prepare(
    "INSERT INTO chunks (source, content, vector) VALUES (?, ?, ?)"
  );
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertChunk.run(row.source, row.content, JSON.stringify(row.vector));
    }
  });

  const rows = allChunks.map((c, i) => ({
    source: c.source,
    content: c.content,
    vector: vectors[i],
  }));
  insertMany(rows);

  db.close();

  console.log(
    `Indeksleme tamamlandı: ${docs.length} doküman, ${allChunks.length} chunk.`
  );
  return { chunkCount: allChunks.length, docCount: docs.length };
}

module.exports = { ingest, setupDatabase, readDocsFromDir };

// Doğrudan çalıştırılırsa: node src/ingest.js
if (require.main === module) {
  ingest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Hata:", err);
      process.exit(1);
    });
}