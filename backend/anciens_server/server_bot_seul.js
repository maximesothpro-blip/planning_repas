const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const N8N_WEBHOOK_URL = 'https://n8n.srv1081620.hstgr.cloud/webhook-test/chat-web';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Endpoint pour envoyer un message au bot via n8n
app.post('/api/send-message', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Sending message to n8n: ${message}`);

    // Envoyer le message au webhook n8n
    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, {
      message: message,
      userId: userId || 'web_user',
      timestamp: new Date().toISOString()
    }, {
      timeout: 30000 // 30 secondes de timeout
    });

    console.log('n8n response received:', n8nResponse.data);

    // Récupérer la réponse de n8n
    // n8n peut renvoyer la réponse dans différents formats, on essaie plusieurs possibilités
    let botResponse;

    if (typeof n8nResponse.data === 'string') {
      botResponse = n8nResponse.data;
    } else if (n8nResponse.data.response) {
      botResponse = n8nResponse.data.response;
    } else if (n8nResponse.data.message) {
      botResponse = n8nResponse.data.message;
    } else if (n8nResponse.data.text) {
      botResponse = n8nResponse.data.text;
    } else {
      // Si n8n renvoie un objet, on le stringify
      botResponse = JSON.stringify(n8nResponse.data);
    }

    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending message to n8n:', error.response?.data || error.message);

    // Erreur plus détaillée
    let errorMessage = 'Failed to send message to n8n';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'n8n timeout - le workflow met trop de temps à répondre';
    } else if (error.response) {
      errorMessage = `n8n error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'Impossible de contacter n8n - vérifiez que le workflow est actif';
    }

    res.status(500).json({
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`n8n Webhook URL: ${N8N_WEBHOOK_URL}`);
  console.log('Ready to accept messages from the web chat!');
});
