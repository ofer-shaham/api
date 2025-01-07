#!/bin/bash

# Define the host and port
HOST="http://localhost"  # Replace with your server's IP or hostname
PORT="3000"              # Replace with your application's port

# Define the base URL
BASE_URL="$HOST:$PORT"

# Memory word to test
MEMORY_WORD="apple"
USER_ID="12345"  # Example user ID

# Function to test memory for a specific endpoint
test_memory() {
    local endpoint=$1

    echo "Testing memory for endpoint: $endpoint"

    # First request: Tell the AI to remember a word
    case $endpoint in
        "ai/groq")
            echo "Requesting to remember the word '$MEMORY_WORD'..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"Remember the word '$MEMORY_WORD'.\", \"userId\": \"$USER_ID\"}"
            echo -e "\n"

            echo "Asking what word was remembered..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"What word did you remember?\", \"userId\": \"$USER_ID\"}"
            ;;

        "ai/gptweb")
            echo "Requesting to remember the word '$MEMORY_WORD'..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"Remember the word '$MEMORY_WORD'.\"}"
            echo -e "\n"

            echo "Asking what word was remembered..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"What word did you remember?\"}"
            ;;

        "ai/gemini")
            echo "Requesting to remember the word '$MEMORY_WORD'..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"Remember the word '$MEMORY_WORD'.\"}"
            echo -e "\n"

            echo "Asking what word was remembered..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"What word did you remember?\"}"
            ;;

        "ai/logic")
            echo "Requesting to remember the word '$MEMORY_WORD'..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"Remember the word '$MEMORY_WORD'.\", \"logic\": \"someLogic\"}"
            echo -e "\n"

            echo "Asking what word was remembered..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"What word did you remember?\", \"logic\": \"someLogic\"}"
            ;;

        "ai/chat")
            echo "Requesting to remember the word '$MEMORY_WORD'..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"Remember the word '$MEMORY_WORD'.\"}"
            echo -e "\n"

            echo "Asking what word was remembered..."
            curl -X POST "$BASE_URL/$endpoint" \
            -H "Content-Type: application/json" \
            -d "{\"q\": \"What word did you remember?\"}"
            ;;
        
        *)
            echo "Unknown endpoint: $endpoint"
            ;;
    esac
    echo -e "\n"
}

# Test memory for each endpoint
endpoints=("ai/groq" "ai/gptweb" "ai/gemini" "ai/logic" "ai/chat")

for endpoint in "${endpoints[@]}"; do
    test_memory "$endpoint"
done

echo "Memory tests completed for all endpoints."