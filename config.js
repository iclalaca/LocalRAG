// config.js — Genel ayarlar
module.exports = {
  PORT: 3000,

  // Foundry Local model adı (chat için) — daha kaliteli cevap için büyük model
  CHAT_MODEL: "qwen2.5-7b",

  // Foundry Local embedding modeli
  EMBEDDING_MODEL: "qwen3-embedding-0.6b",

  // Doküman klasörü
  DOCS_DIR: "./docs",

  // SQLite veritabanı dosyası
  DB_PATH: "./rag.db",

  // Chunking ayarları
  CHUNK_SIZE: 200,      // kelime sayısı
  CHUNK_OVERLAP: 25,    // kelime sayısı

  // Retrieval ayarları
  TOP_K: 3,
  SIMILARITY_THRESHOLD: 0.15, // düşük skorlu sonuçları eler
};