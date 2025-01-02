const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;
const { gptlogic, loadConversationHistory, saveConversationHistory } = require('./lib/function')
const cors = require('cors');

// Konfigurasi API keys
const config = {
  ApiGroq: ["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", "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"]
};
app.use(cors());

// Middleware untuk mencatat request
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  console.log(`Request ke-${requestCount}: ${req.method} ${req.url}`);
  next();
});

app.set('view engine', 'html');
app.use(expressLayout);
app.use(express.static('public'));
app.use(cookieParser());


// Fungsi untuk mendapatkan daftar fitur secara dinamis
const getFeatureList = (req) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const path = middleware.route.path;
      routes.push(`${req.protocol}://${req.get('host')}${path}`);
    }
  });
  return routes;
};

// Endpoint untuk html
app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Endpoint untuk endpoint
app.get('/cek', async (req, res) => {
  try {
    var list_fitur = [
      domen + "/ai/chat?q=halo",
      domen + "/ai/logic?q=haloo&logic=",
    ]
    res.status(200).json({
      list_fitur,
      total_fitur: list_fitur.length
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});


// Endpoint untuk mendapatkan jumlah request
app.get('/request-count', (req, res) => {
  res.status(200).json({ creator: "Lana Api", count: requestCount, msg: `Jumlah request yang diterima: ${requestCount}` });
});


//LIST FITURE
// Endpoint untuk AI Gemini
app.get('/ai/groq', async (req, res) => {
  const { q, userId } = req.query;

  // Validasi parameter
  if (!q || !userId) {
    return res.status(400).json({
      status: 400,
      creator: "Lana X",
      message: "Masukkan parameter q dan userId",
    });
  }


  // Model yang digunakan
  const model = "llama-3.1-70b-versatile";
  // Memuat riwayat percakapan dari file
  let conversationHistories = loadConversationHistory();
  // Batas maksimum pesan dalam riwayat
  const MAX_MESSAGES = 100;

  // Pilih API key secara acak
  const word = Math.floor(Math.random() * config.ApiGroq.length);
  const apiKey = config.ApiGroq[word];

  // Header request
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    // Pastikan ada riwayat untuk pengguna ini
    if (!conversationHistories[userId]) {
      conversationHistories[userId] = [];
    }

    // Periksa apakah riwayat sudah mencapai batas maksimum
    if (conversationHistories[userId].length >= MAX_MESSAGES) {
      conversationHistories[userId] = []; // Reset riwayat percakapan
    }

    // Tambahkan pesan baru ke riwayat percakapan pengguna
    conversationHistories[userId].push({
      role: "user", // Role sesuai standar API
      content: q, // Konten diambil dari parameter q
    });

    // Request body dengan riwayat percakapan pengguna
    const requestBody = {
      model,
      messages: conversationHistories[userId],
    };

    // Kirim permintaan ke API Groq
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      requestBody,
      { headers }
    );

    // Dapatkan respon dari AI dan tambahkan ke riwayat percakapan pengguna
    const replyMessage = response.data.choices[0].message.content;
    conversationHistories[userId].push({
      role: "assistant", // Respon dari AI
      content: replyMessage,
    });

    // Simpan riwayat percakapan ke file
    saveConversationHistory(conversationHistories);

    // Kirim respons balik ke klien
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      reply: replyMessage,
      history: conversationHistories[userId], // Opsional: Tampilkan riwayat percakapan pengguna
    });
  } catch (error) {
    // Tangani kesalahan
    const errorMessage = error.response?.data || error.message;
    res.status(500).json({
      status: 500,
      creator: "Lana X",
      error: errorMessage,
    });
  }
});

// Endpoint untuk ai gemini
app.get('/ai/gptweb', async (req, res) => {
  let { q } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Masukan Parameter q" })
  }

  try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gptweb?text=+${q}`)
    let result = data.data
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    })
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
})

// Endpoint untuk ai gemini
app.get('/ai/gemini', async (req, res) => {
  let { q } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Masukan Parameter q" })
  }

  try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gemini?query=+${q}`)
    let result = data.message
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    })
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
})

// Endpoint untuk ai prompt
app.get('/ai/logic', async (req, res) => {
  let { q, logic } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Masukan Parameter q" })
  }
  if (!logic) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Masukan Parameter logic" })
  }
  try {
    //let result = await AI(messages)
    let result = await gptlogic(q, logic)
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    })
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
})

// Endpoint untuk ai chat
app.get('/ai/chat', async (req, res) => {
  let { q } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", msg: "Parameter 'q' tidak ditemukan" })
  }
  try {
    const baseUrl = "https://hercai.onrender.com"
    let { data } = await axios({
      "method": "GET",
      "url": baseUrl + "/v3/hercai",
      "params": {
        "question": q
      }
    })

    let result = data
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    })
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
})


//Port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





