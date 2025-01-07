const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;
const { gptlogic, loadConversationHistory, saveConversationHistory } = require('./lib/function');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configure API keys
const config = {
  ApiGroq: ["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", "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"]
};
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to log requests
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  console.log(`Request #${requestCount}: ${req.method} ${req.url}`);
  next();
});

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "AI Service API",
      version: "1.0.0",
      description: "API documentation for AI services",
      contact: {
        name: "Lana X",
        url: "http://example.com",
        email: "contact@example.com"
      },
    },
    servers: [
      {
        url: `http://0.0.0.0:${PORT}`, // Use 0.0.0.0 for the server URL
        description: "Development server"
      },
    ],
  },
  apis: ["./index.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', cors(), swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Serve Swagger UI at /docs

// Function to get dynamic feature list
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

// Endpoint for HTML
app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Endpoint to check available features
app.get('/cek', async (req, res) => {
  try {
    var list_fitur = [
      domen + "/ai/chat?q=halo",
      domen + "/ai/logic?q=haloo&logic=",
    ];
    res.status(200).json({
      list_fitur,
      total_fitur: list_fitur.length
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// Endpoint to get request count
app.get('/request-count', (req, res) => {
  res.status(200).json({ creator: "Lana Api", count: requestCount, msg: `Total requests received: ${requestCount}` });
});

// Endpoint for AI Groq using GET
/**
 * @swagger
 * /ai/groq:
 *   get:
 *     summary: Get response from AI Groq
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: The question to ask the AI
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
app.get('/ai/groq', async (req, res) => {
  const { q, userId } = req.query;

  // Validate parameters
  if (!q || !userId) {
    return res.status(400).json({
      status: 400,
      creator: "Lana X",
      message: "Please provide parameters q and userId",
    });
  }

  // Model to use
  const model = "llama-3.1-70b-versatile";
  // Load conversation history from file
  let conversationHistories = loadConversationHistory();
  // Maximum message limit
  const MAX_MESSAGES = 100;

  // Randomly select API key
  const word = Math.floor(Math.random() * config.ApiGroq.length);
  const apiKey = config.ApiGroq[word];

  // Request headers
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    // Ensure conversation history exists for this user
    if (!conversationHistories[userId]) {
      conversationHistories[userId] = [];
    }

    // Check if history has reached the maximum limit
    if (conversationHistories[userId].length >= MAX_MESSAGES) {
      conversationHistories[userId] = []; // Reset conversation history
    }

    // Add new message to user's conversation history
    conversationHistories[userId].push({
      role: "user", // Role according to API standard
      content: q, // Content taken from parameter q
    });

    // Request body with user's conversation history
    const requestBody = {
      model,
      messages: conversationHistories[userId],
    };

    // Send request to Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      requestBody,
      { headers }
    );

    // Get AI response and add to user's conversation history
    const replyMessage = response.data.choices[0].message.content;
    conversationHistories[userId].push({
      role: "assistant", // Response from AI
      content: replyMessage,
    });

    // Save conversation history to file
    saveConversationHistory(conversationHistories);

    // Send response back to client
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      reply: replyMessage,
      history: conversationHistories[userId], // Optional: Show user's conversation history
    });
  } catch (error) {
    // Handle errors
    const errorMessage = error.response?.data || error.message;
    res.status(500).json({
      status: 500,
      creator: "Lana X",
      error: errorMessage,
    });
  }
});

// POST endpoint for AI Groq
/**
 * @swagger
 * /ai/groq:
 *   post:
 *     summary: Get response from AI Groq via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 description: The question to ask the AI
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
app.post('/ai/groq', async (req, res) => {
  const { q, userId } = req.body;

  // Validate parameters
  if (!q || !userId) {
    return res.status(400).json({
      status: 400,
      creator: "Lana X",
      message: "Please provide parameters q and userId",
    });
  }

  // Model to use
  const model = "llama-3.1-70b-versatile";
  // Load conversation history from file
  let conversationHistories = loadConversationHistory();
  // Maximum message limit
  const MAX_MESSAGES = 100;

  // Randomly select API key
  const word = Math.floor(Math.random() * config.ApiGroq.length);
  const apiKey = config.ApiGroq[word];

  // Request headers
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    // Ensure conversation history exists for this user
    if (!conversationHistories[userId]) {
      conversationHistories[userId] = [];
    }

    // Check if history has reached the maximum limit
    if (conversationHistories[userId].length >= MAX_MESSAGES) {
      conversationHistories[userId] = []; // Reset conversation history
    }

    // Add new message to user's conversation history
    conversationHistories[userId].push({
      role: "user", // Role according to API standard
      content: q, // Content taken from parameter q
    });

    // Request body with user's conversation history
    const requestBody = {
      model,
      messages: conversationHistories[userId],
    };

    // Send request to Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      requestBody,
      { headers }
    );

    // Get AI response and add to user's conversation history
    const replyMessage = response.data.choices[0].message.content;
    conversationHistories[userId].push({
      role: "assistant", // Response from AI
      content: replyMessage,
    });

    // Save conversation history to file
    saveConversationHistory(conversationHistories);

    // Send response back to client
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      reply: replyMessage,
      history: conversationHistories[userId], // Optional: Show user's conversation history
    });
  } catch (error) {
    // Handle errors
    const errorMessage = error.response?.data || error.message;
    res.status(500).json({
      status: 500,
      creator: "Lana X",
      error: errorMessage,
    });
  }
});

// Endpoint for AI GPTWeb using GET
/**
 * @swagger
 * /ai/gptweb:
 *   get:
 *     summary: Get response from AI GPTWeb
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: The question to ask the AI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.get('/ai/gptweb', async (req, res) => {
  let { q } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter q" });
  }

  try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gptweb?text=+${q}`);
    let result = data.data;
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// POST endpoint for AI GPTWeb
/**
 * @swagger
 * /ai/gptweb:
 *   post:
 *     summary: Get response from AI GPTWeb via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 description: The question to ask the AI
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.post('/ai/gptweb', async (req, res) => {
  let { q } = req.body;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter q" });
  }

  try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gptweb?text=+${q}`);
    let result = data.data;
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// Endpoint for AI Gemini using GET
/**
 * @swagger
 * /ai/gemini:
 *   get:
 *     summary: Get response from AI Gemini
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: The question to ask the AI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.get('/ai/gemini', async (req, res) => {
  let { q } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter q" });
  }

  try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gemini?query=+${q}`);
    let result = data.message;
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// POST endpoint for AI Gemini
/**
 * @swagger
 * /ai/gemini:
 *   post:
 *     summary: Get response from AI Gemini via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 description: The question to ask the AI
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.post('/ai/gemini', async (req, res) => {
  let { q } = req.body;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter q" });
  }

  try {
    let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gemini?query=+${q}`);
    let result = data.message;
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// Endpoint for AI logic using GET
/**
 * @swagger
 * /ai/logic:
 *   get:
 *     summary: Get response from AI logic
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: The question to ask the AI
 *         schema:
 *           type: string
 *       - name: logic
 *         in: query
 *         required: true
 *         description: The logic parameter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.get('/ai/logic', async (req, res) => {
  let { q, logic } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter q" });
  }
  if (!logic) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter logic" });
  }
  try {
    let result = await gptlogic(q, logic);
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// POST endpoint for AI logic
/**
 * @swagger
 * /ai/logic:
 *   post:
 *     summary: Get response from AI logic via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 description: The question to ask the AI
 *               logic:
 *                 type: string
 *                 description: The logic parameter
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.post('/ai/logic', async (req, res) => {
  let { q, logic } = req.body;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter q" });
  }
  if (!logic) {
    return res.status(404).json({ status: 404, creator: "Lana X", message: "Please provide parameter logic" });
  }
  try {
    let result = await gptlogic(q, logic);
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// Endpoint for AI chat using GET
/**
 * @swagger
 * /ai/chat:
 *   get:
 *     summary: Get response from AI chat
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: The question to ask the AI
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
app.get('/ai/chat', async (req, res) => {
  let { q } = req.query;
  if (!q) {
    return res.status(404).json({ status: 404, creator: "Lana X", msg: "Parameter 'q' not found" });
  }
  try {
    const baseUrl = "https://hercai.onrender.com";
    let { data } = await axios({
      method: "GET",
      url: baseUrl + "/v3/hercai",
      params: {
        question: q
      }
    });

    let result = data;
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// POST endpoint for AI chat
/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Get response from AI chat via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *                 description: The question to ask the AI
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
app.post('/ai/chat', async (req, res) => {
  const { q } = req.body; // Expecting 'q' in the request body
  if (!q) {
    return res.status(400).json({ status: 400, creator: "Lana X", message: "Parameter 'q' is required" });
  }
  
  try {
    const baseUrl = "https://hercai.onrender.com";
    let { data } = await axios({
      method: "POST",
      url: baseUrl + "/v3/hercai",
      data: {
        question: q
      }
    });

    let result = data;
    res.status(200).json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// Start the server and listen on all interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
