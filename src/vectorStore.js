// vectorStore.js — Dense embedding vektörleri üzerinde cosine similarity araması

// İki dense vektör (number[]) arasında cosine similarity hesaplar
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Verilen sorgu vektörüne göre, dokümanlar arasından en alakalı top-K'yı bulur.
// documents: [{ id, content, source, vector: number[] }]
function findTopK(queryVector, documents, k = 3, threshold = 0.0) {
  const scored = documents.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryVector, doc.vector),
  }));

  return scored
    .filter((d) => d.score > threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = {
  cosineSimilarity,
  findTopK,
};