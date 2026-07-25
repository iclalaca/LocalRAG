// chatEngine.js — RAG orkestratörü: Retrieve → Augment → Generate
const Database = require("better-sqlite3");
const { FoundryLocalManager } = require("foundry-local-sdk");

const config = require("../config");
const { findTopK } = require("./vectorStore");
const { embedText } = require("./embeddingClient");
const { buildSystemPrompt, buildUserPrompt } = require("./prompts");

let manager = null;
let model = null;
let chatClient = null;

// Foundry Local'i başlatır, chat modelini indirir/yükler ve chat client oluşturur.
// Bir kere çağrılması yeterli (server başlarken).
async function initFoundry() {
  if (chatClient) return chatClient; // zaten hazırsa tekrar kurma

  console.log("Foundry Local başlatılıyor...");
  manager = await FoundryLocalManager.createAsync({ appName: "LocalRAGAssistant" });

  console.log(`Model alınıyor: ${config.CHAT_MODEL}`);
  model = await manager.catalog.getModel(config.CHAT_MODEL);

  console.log("Model indiriliyor (zaten indirildiyse hızlıca geçer)...");
  await model.download();

  console.log("Model belleğe yükleniyor...");
  await model.load();

  chatClient = await model.createChatClient();
  console.log("Foundry Local hazır!");
  return chatClient;
}

// Veritabanından tüm chunk'ları okur
function loadIndex(dbPath = config.DB_PATH) {
  const db = new Database(dbPath, { readonly: true, fileMustExist: false });

  const rows = db.prepare("SELECT id, source, content, vector FROM chunks").all();
  const documents = rows.map((r) => ({
    id: r.id,
    source: r.source,
    content: r.content,
    vector: JSON.parse(r.vector),
  }));

  db.close();
  return documents;
}

// Sorguya göre en alakalı chunk'ları getirir (gerçek embedding modeliyle)
async function retrieveContext(question, topK = config.TOP_K) {
  const documents = loadIndex();
  if (documents.length === 0) {
    return [];
  }

  const queryVector = await embedText(question);
  const results = findTopK(queryVector, documents, topK, config.SIMILARITY_THRESHOLD);
  return results;
}

// Ana fonksiyon: kullanıcı sorusunu al, context'i bul, modelden cevap üret
async function answerQuery(question) {
  await initFoundry();

  const contextChunks = await retrieveContext(question);

  const systemPrompt = buildSystemPrompt();
  const userPrompt =
    contextChunks.length > 0
      ? buildUserPrompt(question, contextChunks)
      : `Question: ${question}\n\n(No relevant documents were found in the knowledge base. Tell the user you don't have information on this topic.)`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await chatClient.completeChat(messages);
  const answer = response.choices[0].message.content;

  return {
    answer,
    sources: [...new Set(contextChunks.map((c) => c.source))],
    chunksUsed: contextChunks.length,
  };
}

// Streaming versiyon (SSE için)
async function* answerQueryStream(question) {
  await initFoundry();

  const contextChunks = await retrieveContext(question);
  const systemPrompt = buildSystemPrompt();
  const userPrompt =
    contextChunks.length > 0
      ? buildUserPrompt(question, contextChunks)
      : `Question: ${question}\n\n(No relevant documents were found in the knowledge base. Tell the user you don't have information on this topic.)`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const stream = await chatClient.completeStreamingChat(messages);
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}

module.exports = { initFoundry, answerQuery, answerQueryStream, retrieveContext };