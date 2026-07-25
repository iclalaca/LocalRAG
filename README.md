# 🤖 Local RAG Assistant

An end-to-end, fully offline **Retrieval-Augmented Generation (RAG)** assistant built with **Node.js**, **Express**, and **Foundry Local**. 

This project allows users to query internal documentation (e.g., Microsoft 365, Teams, OneDrive, Windows 11 guides) with **100% data privacy** and zero internet dependency.

---

## ✨ Features

* 🔒 **100% Offline & Private:** Runs entirely on local hardware without sending data to external APIs.
* ⚡ **Semantic Search:** Converts text into vector embeddings using `qwen3-embedding` and stores them locally via SQLite (`rag.db`).
* 🧠 **Local LLM Inference:** Powered by `qwen2.5-7b` for accurate, context-aware Turkish natural language responses.
* 📑 **Source Attribution:** Automatically cites the source document (`.md`, `.txt`) used for generating each answer.
* 🎨 **Modern Dark UI:** A sleek, responsive web interface built with vanilla HTML, CSS, and JavaScript.

---

## 🏗️ Architecture & RAG Pipeline

```text
[User Query] 
     │
     ▼
[Embedding Model: qwen3-embedding] ────► [Vector Database: SQLite / rag.db]
                                                      │
                                                      ▼ (Top Relevant Chunks)
                                                      │
[Local LLM: qwen2.5-7b] ◄─────────────────────────────┘
     │
     ▼
[Grounded Answer + Source Citation]
Ingestion: Local .md and .txt documents are chunked and embedded into rag.db.
Retrieval: When a user asks a question, the system retrieves the most relevant document chunks based on vector similarity.
Generation: The retrieved chunks are fed as context to the qwen2.5-7b model to generate a precise answer without hallucination.
🛠️ Tech Stack
Backend: Node.js, Express.js
Frontend: HTML5, CSS3, JavaScript (Fetch API)
Local AI Runtime: Foundry Local / Ollama
LLM Engine: qwen2.5-7b
Embedding Model: qwen3-embedding
Vector Store: SQLite (rag.db)
Utilities: cors, multer
🚀 Getting Started
Prerequisites
Install Node.js (v18 or higher).
Ensure Foundry Local (or your local LLM runner) is active with qwen2.5-7b and qwen3-embedding models pulled.
Installation
Clone the repository:
Bash
git clone [https://github.com/iclalaca/LocalRAG.git](https://github.com/iclalaca/LocalRAG.git)
cd LocalRAG
Install dependencies:
Bash
npm install
Start the application:
Bash
node server.js
Open your browser and navigate to:
Plaintext
http://localhost:3000
📁 Project Structure
Plaintext
LocalRAG/
├── docs/                 # Source knowledge base (.md, .txt)
├── src/                  # Core RAG engine & client modules
│   ├── chatEngine.js     # Query answering & LLM streaming logic
│   ├── embeddingClient.js# Vector embedding generator
│   └── ingest.js         # Document parsing & chunking pipeline
├── index.html            # Web user interface
├── server.js             # Express API server & static file host
├── config.js             # Project configurations
├── rag.db                # SQLite vector storage
└── package.json          # Node.js dependencies
📜 License
Distributed under the MIT License. Feel free to fork and adapt for personal or enterprise local RAG experiments!
