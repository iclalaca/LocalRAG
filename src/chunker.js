// chunker.js — Dokümanları küçük, üst üste binmeli parçalara böler
const config = require("../config");

// Metni kelime bazlı, üst üste binmeli (overlap) parçalara böler
function chunkText(text, chunkSize = config.CHUNK_SIZE, overlap = config.CHUNK_OVERLAP) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  if (words.length === 0) return chunks;

  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunkWords = words.slice(start, end);
    chunks.push(chunkWords.join(" "));

    if (end === words.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

module.exports = { chunkText };