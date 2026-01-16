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
      ingredients: record.fields['Ingrédients JSON'] || record.fields['Ingrédients Brut'] || '',
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

// DELETE : Supprimer un repas du planning
app.delete('/api/planning/:id', async (req, res) => {
  try {
    const recordId = req.params.id;

    console.log(`Deleting planning record: ${recordId}`);

    await axios.delete(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Plannings%20Hebdomadaires/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      }
    );

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting from planning:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to delete from planning',
      details: error.response?.data || error.message
    });
  }
});

// ===== ENDPOINTS SHOPPING LISTS =====

// GET : Récupérer toutes les listes de courses (historique)
app.get('/api/shopping-lists', async (req, res) => {
  try {
    const { status } = req.query;

    console.log('Fetching shopping lists from Airtable...');

    let filterFormula = '';
    if (status) {
      filterFormula = `{Statut} = '${status}'`;
    }

    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Liste%20de%20Courses`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        },
        params: filterFormula ? { filterByFormula: filterFormula } : {}
      }
    );

    console.log(`Retrieved ${response.data.records.length} shopping lists`);

    const shoppingLists = response.data.records.map(record => ({
      id: record.id,
      nom: record.fields.Nom || '',
      semaine: record.fields.Semaine || 0,
      annee: record.fields.Annee || 0,
      dateCreation: record.fields['Date Création'] || '',
      dateModification: record.fields['Date Modification'] || '',
      ingredientsJSON: record.fields['Ingrédients JSON'] || '[]',
      repasInclusJSON: record.fields['Repas Inclus JSON'] || '{}',
      statut: record.fields.Statut || 'Brouillon',
      nbItems: record.fields['Nb Items'] || 0,
      notes: record.fields.Notes || ''
    }));

    res.json({
      success: true,
      shoppingLists: shoppingLists
    });

  } catch (error) {
    console.error('Error fetching shopping lists:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch shopping lists from Airtable',
      details: error.response?.data || error.message
    });
  }
});

// GET : Récupérer une liste de courses spécifique
app.get('/api/shopping-list/:id', async (req, res) => {
  try {
    const listId = req.params.id;

    console.log(`Fetching shopping list: ${listId}`);

    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Liste%20de%20Courses/${listId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      }
    );

    const record = response.data;
    const shoppingList = {
      id: record.id,
      nom: record.fields.Nom || '',
      semaine: record.fields.Semaine || 0,
      annee: record.fields.Annee || 0,
      dateCreation: record.fields['Date Création'] || '',
      dateModification: record.fields['Date Modification'] || '',
      ingredientsJSON: record.fields['Ingrédients JSON'] || '[]',
      repasInclusJSON: record.fields['Repas Inclus JSON'] || '{}',
      statut: record.fields.Statut || 'Brouillon',
      nbItems: record.fields['Nb Items'] || 0,
      notes: record.fields.Notes || ''
    };

    res.json({
      success: true,
      shoppingList: shoppingList
    });

  } catch (error) {
    console.error('Error fetching shopping list:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch shopping list from Airtable',
      details: error.response?.data || error.message
    });
  }
});

// POST : Créer une nouvelle liste de courses
app.post('/api/shopping-list', async (req, res) => {
  try {
    const { nom, semaine, annee, ingredients, repasInclus, statut, notes } = req.body;

    console.log(`Creating shopping list: ${nom} (Week ${semaine}-${annee})`);

    // Convert ingredients array to JSON string
    const ingredientsJSON = JSON.stringify(ingredients || []);
    const repasInclusJSON = JSON.stringify(repasInclus || {});
    const nbItems = (ingredients || []).length;

    const response = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Liste%20de%20Courses`,
      {
        fields: {
          'Nom': nom || `Liste semaine ${semaine} - ${annee}`,
          'Semaine': semaine,
          'Annee': annee,
          'Date Création': new Date().toISOString(),
          'Ingrédients JSON': ingredientsJSON,
          'Repas Inclus JSON': repasInclusJSON,
          'Statut': statut || 'Active',
          'Nb Items': nbItems,
          'Notes': notes || ''
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
      shoppingList: {
        id: response.data.id,
        ...response.data.fields
      }
    });

  } catch (error) {
    console.error('Error creating shopping list:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create shopping list',
      details: error.response?.data || error.message
    });
  }
});

// PATCH : Mettre à jour une liste de courses existante
app.patch('/api/shopping-list/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    const { ingredients, repasInclus, statut, notes, nom } = req.body;

    console.log(`Updating shopping list: ${listId}`);

    const fields = {};

    if (ingredients !== undefined) {
      fields['Ingrédients JSON'] = JSON.stringify(ingredients);
      fields['Nb Items'] = ingredients.length;
    }

    if (repasInclus !== undefined) {
      fields['Repas Inclus JSON'] = JSON.stringify(repasInclus);
    }

    if (statut !== undefined) {
      fields['Statut'] = statut;
    }

    if (notes !== undefined) {
      fields['Notes'] = notes;
    }

    if (nom !== undefined) {
      fields['Nom'] = nom;
    }

    const response = await axios.patch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Liste%20de%20Courses/${listId}`,
      {
        fields: fields
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
      shoppingList: {
        id: response.data.id,
        ...response.data.fields
      }
    });

  } catch (error) {
    console.error('Error updating shopping list:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to update shopping list',
      details: error.response?.data || error.message
    });
  }
});

// DELETE : Supprimer une liste de courses
app.delete('/api/shopping-list/:id', async (req, res) => {
  try {
    const listId = req.params.id;

    console.log(`Deleting shopping list: ${listId}`);

    await axios.delete(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Liste%20de%20Courses/${listId}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      }
    );

    res.json({
      success: true,
      message: 'Shopping list deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting shopping list:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to delete shopping list',
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
