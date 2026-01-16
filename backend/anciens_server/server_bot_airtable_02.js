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
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

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

// ===== ENDPOINTS AIRTABLE =====

// GET : Récupérer toutes les recettes
app.get('/api/recipes', async (req, res) => {
  try {
    console.log('Fetching recipes from Airtable...');

    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Recettes`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      }
    );

    console.log(`Retrieved ${response.data.records.length} recipes`);

    // Simplifier les données pour le frontend
    const recipes = response.data.records.map(record => ({
      id: record.id,
      name: record.fields.Nom || 'Sans nom',
      ingredients: record.fields.Ingrédients || '',
      calories: record.fields['Calories (totales)'] || 0,
      proteins: record.fields['Protéines (g)'] || 0,
      carbs: record.fields['Glucides (g)'] || 0,
      fats: record.fields['Lipides (g)'] || 0,
      servings: record.fields['Nombre de personnes (base)'] || 1,
      tags: record.fields.Tags || []
    }));

    res.json({
      success: true,
      recipes: recipes
    });

  } catch (error) {
    console.error('Error fetching recipes:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch recipes from Airtable',
      details: error.response?.data || error.message
    });
  }
});

// GET : Récupérer le planning de la semaine
app.get('/api/planning', async (req, res) => {
  try {
    const { week, year } = req.query;

    console.log(`Fetching planning for week ${week}, year ${year}`);

    let filterFormula = '';
    if (week && year) {
      filterFormula = `AND({Semaine} = ${week}, {Annee} = ${year})`;
    }

    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Plannings%20Hebdomadaires`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        },
        params: filterFormula ? { filterByFormula: filterFormula } : {}
      }
    );

    const planning = response.data.records.map(record => ({
      id: record.id,
      day: record.fields.Jour || '',
      date: record.fields.Date || '',
      meal: record.fields.Moment || '',
      recipe: record.fields.Recette || [],
      status: record.fields.Statut || 'Planifié'
    }));

    res.json({
      success: true,
      planning: planning
    });

  } catch (error) {
    console.error('Error fetching planning:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch planning from Airtable',
      details: error.response?.data || error.message
    });
  }
});

// POST : Ajouter un repas au planning
app.post('/api/planning', async (req, res) => {
  try {
    const { day, date, meal, recipeId, week, year } = req.body;

    console.log(`Adding recipe ${recipeId} to planning: ${day} ${meal} (Week ${week}, Year ${year})`);

    const response = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Plannings%20Hebdomadaires`,
      {
        fields: {
          'Jour': day,
          'Date': date,
          'Moment': meal,
          'Recette': [recipeId],
          'Statut': 'Planifié',
          'Semaine': week,
          'Annee': year
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      record: response.data
    });

  } catch (error) {
    console.error('Error adding to planning:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to add to planning',
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
