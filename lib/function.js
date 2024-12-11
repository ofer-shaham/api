const fs = require('fs');
const axios = require('axios');

// Path untuk file JSON yang menyimpan riwayat percakapan
const chatFilePath = './chat.json';

// Fungsi untuk membaca riwayat percakapan dari file
const loadConversationHistory = () => {
  try {
    if (fs.existsSync(chatFilePath)) {
      const data = fs.readFileSync(chatFilePath, 'utf-8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error("Error loading conversation history:", error);
    return {};
  }
};

// Fungsi untuk menyimpan riwayat percakapan ke file
const saveConversationHistory = (history) => {
  try {
    fs.writeFileSync(chatFilePath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving conversation history:", error);
  }
};

async function gptlogic(message, prompt) {
  try {
    let { data } = await axios.post("https://chateverywhere.app/api/chat/", {
      model: {
        id: "gpt-4",
        name: "GPT-4",
        maxLength: 32000,
        tokenLimit: 8000,
        completionTokenLimit: 5000,
        deploymentName: "gpt-4"
      },
      messages: [{
        pluginId: null,
        content: message,
        role: "user"
      }],
      prompt: prompt,
      temperature: 0.5
    }, {
      headers: {
        'Accept': "/*/",
        'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      }
    });
    return data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

module.exports = { gptlogic, loadConversationHistory, saveConversationHistory };
