#!/bin/bash

# Define the host and port
HOST="http://localhost"  # Replace with your server's IP or hostname
PORT="3000"                      # Replace with your application's port

# Define the base URL
BASE_URL="$HOST:$PORT"

# 1. Trigger the AI Groq Endpoint
echo "Triggering AI Groq GET endpoint..."
curl -X GET "$BASE_URL/ai/groq?q=Hello&userId=12345"
echo -e "\n"

echo "Triggering AI Groq POST endpoint..."
curl -X POST "$BASE_URL/ai/groq" \
-H "Content-Type: application/json" \
-d '{"q": "Hello", "userId": "12345"}'
echo -e "\n"

# 2. Trigger the AI GPTWeb Endpoint
echo "Triggering AI GPTWeb GET endpoint..."
curl -X GET "$BASE_URL/ai/gptweb?q=Hello"
echo -e "\n"

echo "Triggering AI GPTWeb POST endpoint..."
curl -X POST "$BASE_URL/ai/gptweb" \
-H "Content-Type: application/json" \
-d '{"q": "Hello"}'
echo -e "\n"

# 3. Trigger the AI Gemini Endpoint
echo "Triggering AI Gemini GET endpoint..."
curl -X GET "$BASE_URL/ai/gemini?q=Hello"
echo -e "\n"

echo "Triggering AI Gemini POST endpoint..."
curl -X POST "$BASE_URL/ai/gemini" \
-H "Content-Type: application/json" \
-d '{"q": "Hello"}'
echo -e "\n"

# 4. Trigger the AI Logic Endpoint
echo "Triggering AI Logic GET endpoint..."
curl -X GET "$BASE_URL/ai/logic?q=Hello&logic=someLogic"
echo -e "\n"

echo "Triggering AI Logic POST endpoint..."
curl -X POST "$BASE_URL/ai/logic" \
-H "Content-Type: application/json" \
-d '{"q": "Hello", "logic": "someLogic"}'
echo -e "\n"

# 5. Trigger the AI Chat Endpoint
echo "Triggering AI Chat GET endpoint..."
curl -X GET "$BASE_URL/ai/chat?q=Hello"
echo -e "\n"

echo "Triggering AI Chat POST endpoint..."
curl -X POST "$BASE_URL/ai/chat" \
-H "Content-Type: application/json" \
-d '{"q": "Hello"}'
echo -e "\n"

echo "All API calls completed."


