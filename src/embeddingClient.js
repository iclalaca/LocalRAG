// embeddingClient.js — Foundry Local embedding modelini başlatır ve embedding üretir
const config = require("../config");

let manager = null;
let embedModel = null;
let embedClient = null;

async function initEmbedding() {
  if (embedClient) return embedClient;

  const { FoundryLocalManager } = require("foundry-local-sdk");

  if (!manager) {
    manager = await FoundryLocalManager.createAsync({ appName: "LocalRAGAssistant" });
  }

  console.log(`Embedding modeli alınıyor: ${config.EMBEDDING_MODEL}`);
  embedModel = await manager.catalog.getModel(config.EMBEDDING_MODEL);

  console.log("Embedding modeli indiriliyor (zaten indirildiyse hızlıca geçer)...");
  await embedModel.download();

  console.log("Embedding modeli belleğe yükleniyor...");
  await embedModel.load();

  embedClient = await embedModel.createEmbeddingClient();
  console.log("Embedding modeli hazır!");
  return embedClient;
}

// Tek bir metin için embedding vektörü üretir (number[] döner)
async function embedText(text) {
  await initEmbedding();
  // generateEmbedding da OpenAI formatında dönebilir, her iki durumu destekle
  const result = await embedClient.generateEmbedding(text);
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.embedding)) return result.embedding;
  if (result && result.data) {
    const arr = Array.isArray(result.data) ? result.data : [result.data];
    return arr[0].embedding ?? arr[0];
  }
  throw new Error("Beklenmeyen embedding formatı: " + JSON.stringify(result).slice(0, 200));
}

// Birden fazla metin için embedding vektörleri üretir (number[][] döner)
// generateEmbeddings OpenAI formatında döner: { model, data: [{index, embedding}, ...] }
async function embedTexts(texts) {
  await initEmbedding();
  const result = await embedClient.generateEmbeddings(texts);
  return result.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

module.exports = { initEmbedding, embedText, embedTexts };