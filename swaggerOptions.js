

// Swagger configuration
export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "AI Service API",
      version: "1.0.0",
      description: "API documentation for various AI services including Groq, GPTWeb, Gemini, and custom chat endpoints",
      contact: {
        name: "Lana X",
        url: "http://example.com",
        email: "contact@example.com"
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server"
      },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: {
              type: "integer",
              example: 500
            },
            creator: {
              type: "string",
              example: "Lana X"
            },
            error: {
              type: "string",
              example: "Internal server error"
            }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "integer",
              example: 200
            },
            creator: {
              type: "string",
              example: "Lana X"
            },
            result: {
              type: "object"
            }
          }
        }
      }
    },
    tags: [
      {
        name: "AI Services",
        description: "AI-related endpoints"
      },
      {
        name: "System",
        description: "System-related endpoints"
      }
    ]
  },
  apis: ["./index.js"],
};

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
