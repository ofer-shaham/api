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
app.use(express.json());

// Request counter middleware
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  console.log(`Request #${requestCount}: ${req.method} ${req.url}`);
  next();
});

// Swagger setup
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
        url: `http://0.0.0.0:${PORT}`,
        description: "Development server"
      },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: { type: "integer", example: 500 },
            creator: { type: "string", example: "Lana X" },
            error: { type: "string" }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 200 },
            creator: { type: "string", example: "Lana X" },
            result: { type: "object" }
          }
        }
      }
    }
  },
  apis: ["./index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Helper functions
const handleError = (res, message) => {
  res.status(500).json({ status: 500, creator: "Lana X", error: message });
};

const validateParams = (req, res, params) => {
  for (let param of params) {
    if (!req[req.method === 'GET' ? 'query' : 'body'][param]) {
      res.status(400).json({
        status: 400,
        creator: "Lana X",
        message: `Please provide parameter ${param}`
      });
      return false;
    }
  }
  return true;
};

// Routes
/**
 * @swagger
 * /request-count:
 *   get:
 *     tags: [System]
 *     summary: Get total request count
 *     description: Returns the total number of requests made to the API
 *     responses:
 *       200:
 *         description: Successfully retrieved request count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 creator:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 msg:
 *                   type: string
 *
 * /ai/groq:
 *   get:
 *     tags: [AI Services]
 *     summary: Get response from Groq AI
 *     description: Interact with Groq AI model with conversation history support
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: The question or prompt for the AI
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Unique identifier for the user to maintain conversation history
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully received AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 creator:
 *                   type: string
 *                   example: "Lana X"
 *                 reply:
 *                   type: string
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                       content:
 *                         type: string
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error or AI service error
 *
 *   post:
 *     tags: [AI Services]
 *     summary: Get response from Groq AI via POST
 *     description: Interact with Groq AI model with conversation history support using POST method
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *               - userId
 *             properties:
 *               q:
 *                 type: string
 *                 description: The question or prompt for the AI
 *               userId:
 *                 type: string
 *                 description: Unique identifier for the user
 *     responses:
 *       200:
 *         description: Successfully received AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error or AI service error
 *
 * /ai/gptweb:
 *   get:
 *     tags: [AI Services]
 *     summary: Get response from GPTWeb
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags: [AI Services]
 *     summary: Get response from GPTWeb via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *             properties:
 *               q:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *
 * /ai/gemini:
 *   get:
 *     tags: [AI Services]
 *     summary: Get response from Gemini AI
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags: [AI Services]
 *     summary: Get response from Gemini AI via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *             properties:
 *               q:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *
 * /ai/logic:
 *   get:
 *     tags: [AI Services]
 *     summary: Get response from AI logic service
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: logic
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags: [AI Services]
 *     summary: Get response from AI logic service via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *               - logic
 *             properties:
 *               q:
 *                 type: string
 *               logic:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *
 * /ai/chat:
 *   get:
 *     tags: [AI Services]
 *     summary: Get response from AI chat service
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags: [AI Services]
 *     summary: Get response from AI chat service via POST
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *             properties:
 *               q:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

app.get('/request-count', (req, res) => {
  res.json({ creator: "Lana Api", count: requestCount });
});

// AI routes handler
const handleAIRoute = async (type, req, res) => {
  const input = req.method === 'GET' ? req.query : req.body;

  try {
    let result;
    switch(type) {
      case 'groq':
        if (!validateParams(req, res, ['q', 'userId'])) return;
        result = await handleGroqRequest(input.q, input.userId);
        break;
      case 'gptweb':
        if (!validateParams(req, res, ['q'])) return;
        const gptwebResponse = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gptweb?text=+${input.q}`);
        result = gptwebResponse.data.data;
        break;
      case 'gemini':
        if (!validateParams(req, res, ['q'])) return;
        const geminiResponse = await axios.get(`https://deliriussapi-oficial.vercel.app/ia/gemini?query=+${input.q}`);
        result = geminiResponse.data.message;
        break;
      case 'logic':
        if (!validateParams(req, res, ['q', 'logic'])) return;
        result = await gptlogic(input.q, input.logic);
        break;
      case 'chat':
        if (!validateParams(req, res, ['q'])) return;
        const chatResponse = await axios({
          method: req.method,
          url: "https://hercai.onrender.com/v3/hercai",
          [req.method === 'GET' ? 'params' : 'data']: { question: input.q }
        });
        result = chatResponse.data;
        break;
    }

    res.json({
      status: 200,
      creator: "Lana X",
      result
    });
  } catch (error) {
    handleError(res, error.message);
  }
};

// Handle Groq requests
async function handleGroqRequest(q, userId) {
  const model = "llama-3.1-70b-versatile";
  let conversationHistories = loadConversationHistory();
  const MAX_MESSAGES = 100;
  const apiKey = config.ApiGroq[Math.floor(Math.random() * config.ApiGroq.length)];

  if (!conversationHistories[userId]) {
    conversationHistories[userId] = [];
  }

  if (conversationHistories[userId].length >= MAX_MESSAGES) {
    conversationHistories[userId] = [];
  }

  conversationHistories[userId].push({ role: "user", content: q });

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages: conversationHistories[userId],
    },
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }
    }
  );

  const replyMessage = response.data.choices[0].message.content;
  conversationHistories[userId].push({ role: "assistant", content: replyMessage });
  saveConversationHistory(conversationHistories);

  return replyMessage;
}

// Route definitions
for (const type of ['groq', 'gptweb', 'gemini', 'logic', 'chat']) {
  app.get(`/ai/${type}`, (req, res) => handleAIRoute(type, req, res));
  app.post(`/ai/${type}`, (req, res) => handleAIRoute(type, req, res));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
