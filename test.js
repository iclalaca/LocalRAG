// test.js — RAG pipeline'ını birden fazla soruyla uçtan uca test eder
const { answerQuery } = require("./src/chatEngine");

const testQuestions = [
  "OneDrive senkronizasyon hatası nasıl çözülür?",
  "Teams şifresini nasıl sıfırlarım?",
  "Azure AI Foundry'de model yayınlarken 403 hatası alıyorum, ne yapmalıyım?",
  "Hava durumu nasıl?", // Cevap verilememeli (dokümanlarda yok)
];

async function main() {
  for (const question of testQuestions) {
    console.log("\n" + "=".repeat(60));
    console.log(`Soru: ${question}`);
    console.log("=".repeat(60));

    const result = await answerQuery(question);

    console.log("Cevap:", result.answer);
    console.log("Kaynaklar:", result.sources);
    console.log(`Kullanılan chunk: ${result.chunksUsed}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});