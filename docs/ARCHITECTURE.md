# Architecture Technique - Planning de Repas

## Vue d'ensemble

Application web de planification de repas avec génération automatique de listes de courses, intégrant un chatbot intelligent et une gestion complète des recettes.

### Stack Technologique

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Node.js, Express.js
- **Base de données** : Airtable
- **Hébergement Frontend** : GitHub Pages
- **Hébergement Backend** : Hostinger VPS
- **Tunnel HTTPS** : Cloudflare Tunnel (temporaire)
- **Chatbot** : n8n Workflow Engine
- **Process Manager** : PM2

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR (Navigateur)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (GitHub Pages)                         │
│  https://maximesothpro-blip.github.io/telegram-chat-site/   │
│                                                              │
│  - planning.html : Interface principale                     │
│  - planning.js : Logique métier (2000+ lignes)              │
│  - planning.css : Styles                                    │
│  - config.js : Configuration API                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS (Fetch API)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           CLOUDFLARE TUNNEL (Temporaire)                     │
│  https://athletic-every-systems-appreciated.trycloudflare.com│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Hostinger VPS)                         │
│  - Express.js REST API (server.js)                          │
│  - Port: 3000                                               │
│  - Géré par PM2 (process: telegram-bot)                     │
│                                                              │
│  Endpoints:                                                  │
│  - GET  /api/recipes                                        │
│  - GET  /api/planning                                       │
│  - POST /api/planning                                       │
│  - DELETE /api/planning/:id                                 │
│  - GET  /api/shopping-lists                                 │
│  - GET  /api/shopping-list/:id                              │
│  - POST /api/shopping-list                                  │
│  - PATCH /api/shopping-list/:id                             │
│  - DELETE /api/shopping-list/:id                            │
│  - POST /api/send-message (n8n)                             │
└────────────────────────┬───────────────┬────────────────────┘
                         │               │
                         │               │ Webhook HTTPS
                         │               ↓
                         │      ┌─────────────────────────┐
                         │      │   n8n WORKFLOW          │
                         │      │  (Chatbot Logic)        │
                         │      └─────────────────────────┘
                         │
                         │ Airtable REST API
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    AIRTABLE (Base de données)                │
│                                                              │
│  Tables:                                                     │
│  1. Recettes                                                │
│  2. Plannings Hebdomadaires                                 │
│  3. Liste de Courses                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Structure des Données Airtable

### Table 1 : Recettes

| Champ | Type | Description |
|-------|------|-------------|
| Nom | Texte | Nom de la recette |
| Ingrédients JSON | Texte long | Ingrédients structurés (JSON) |
| Ingrédients Brut | Texte long | Ingrédients au format texte |
| Calories (totales) | Nombre | Calories totales de la recette |
| Protéines (g) | Nombre | Protéines en grammes |
| Glucides (g) | Nombre | Glucides en grammes |
| Lipides (g) | Nombre | Lipides en grammes |
| Nombre de personnes (base) | Nombre | Portions de base |
| Tags | Multi-sélection | Catégories (végétarien, rapide, etc.) |

### Table 2 : Plannings Hebdomadaires

| Champ | Type | Description |
|-------|------|-------------|
| Jour | Texte | Nom du jour (Lundi, Mardi, etc.) |
| Date | Date | Date complète |
| Moment | Sélection | Petit-déjeuner, Déjeuner, Dîner |
| Recette | Lien vers table | Lien vers Recettes |
| Statut | Sélection | Planifié, Réalisé, Annulé |
| Semaine | Nombre | Numéro de semaine ISO |
| Annee | Nombre | Année |

### Table 3 : Liste de Courses

| Champ | Type | Description |
|-------|------|-------------|
| Nom | Texte | Nom de la liste |
| Semaine | Nombre | Numéro de semaine ISO |
| Annee | Nombre | Année |
| Date Création | Date | Date de création |
| Date Modification | Date | Dernière modification |
| Ingrédients JSON | Texte long | Liste des ingrédients (JSON) |
| Repas Inclus JSON | Texte long | Repas inclus dans la liste (JSON) |
| Statut | Sélection | Active, Archivée |
| Nb Items | Nombre | Nombre d'articles |
| Notes | Texte long | Notes utilisateur |

---

## Frontend : planning.js

### Variables Globales Principales

```javascript
// Configuration
const API_URL = window.BACKEND_API_URL;

// Données
let recipes = [];                    // Toutes les recettes
let planning = [];                   // Planning de la semaine actuelle
let allWeeksPlanning = {};          // Planning multi-semaines (cache)

// Navigation
let currentWeek = 0;                 // Semaine ISO actuelle
let currentYear = 0;                 // Année actuelle

// Shopping List
let currentShoppingListId = null;    // ID de la liste actuelle
let mealInclusions = {};            // État inclusion/exclusion des repas
let isListModified = false;         // Flag de modification

// Chat
let currentChatId = null;           // ID de conversation
```

### Architecture des Fonctions

#### 1. Initialisation
```javascript
initializePlanning()
├── loadRecipes()                    // Charge les recettes depuis Airtable
├── getCurrentWeek()                 // Calcule semaine ISO
├── loadPlanning()                   // Charge le planning
└── initializeEventListeners()       // Configure les événements
    ├── initializeDragAndDrop()     // Drag & drop recettes
    ├── initializeWeekNavigation()  // Navigation semaines
    ├── initializeChat()            // Chat bot
    ├── initializeTabs()            // Onglets sidebar droite
    └── initializeShoppingList()    // Liste de courses
```

#### 2. Gestion du Planning
```javascript
// Chargement
loadPlanning()
└── loadPlanningForWeek(week, year)
    └── Fetch GET /api/planning?week=X&year=Y

// Affichage
displayPlanning(weekPlanning)
└── Génère la grille 7 jours × 3 repas

// Ajout de recette
assignRecipeToSlot(recipeId, day, meal)
└── Fetch POST /api/planning

// Suppression
removeMeal(planningId)
└── Fetch DELETE /api/planning/:id
```

#### 3. Gestion de la Liste de Courses

##### Architecture Airtable-Centric (v3.0+)
```javascript
// Génération de liste
generateShoppingList()
├── parseRecipeIngredients()        // Parse ingrédients recette
├── mergeIngredients()              // Agrège et déduplique
├── categorizeIngredient()          // Catégorise automatiquement
└── createShoppingListInAirtable()  // Sauvegarde Airtable
    └── Fetch POST /api/shopping-list

// Affichage
displayShoppingListFromAirtable()
└── Fetch GET /api/shopping-list/:id
    └── Parse JSON et affiche par catégories

// Historique
displayShoppingHistory()
└── Fetch GET /api/shopping-lists?status=Archivée
    └── Affiche listes précédentes
```

##### Popup Paramètres (v3.2+)
```javascript
initializeSettingsPopup()
├── loadMealInclusionsFromAirtable()    // Charge état inclusion
├── displaySettingsCalendar()           // Affiche planning
│   └── Toggle inclusion/exclusion → mealInclusions[globalKey]
└── displayEditableShoppingListFromAirtable()
    └── updateEditableListPreview()     // Agrège tous les repas inclus
        └── Support cross-semaines via globalKey parsing
```

##### Système de clés globales (v3.3+)
```javascript
// Format : "semaine-année-index"
const globalKey = `${week}-${year}-${index}`;

// Permet de tracker les repas de n'importe quelle semaine
mealInclusions = {
    "48-2025-0": true,   // Lundi Petit-déj semaine 48
    "48-2025-1": false,  // Lundi Déjeuner semaine 48 (exclu)
    "49-2025-15": true   // Repas de la semaine 49 ajouté à la liste
}
```

##### Modification et Reset
```javascript
// Sauvegarde modifications
applySettingsAndSave()
├── Collecte ingrédients modifiés (quantités/unités)
├── Construit nouveau nom ("- Modifié" si modifié)
└── updateShoppingListInAirtable(id, ingredients, inclusions, name)
    └── Fetch PATCH /api/shopping-list/:id

// Réinitialisation
resetShoppingListToDefault()
├── Reset mealInclusions (semaine actuelle only)
├── Régénère ingrédients depuis recettes
└── updateShoppingListInAirtable() avec nom original
```

#### 4. Parsing d'Ingrédients

```javascript
parseRecipeIngredients(recipe)
└── Regex: /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/
    ├── Groupe 1 : Quantité (ex: "200", "1.5")
    ├── Groupe 2 : Unité (ex: "g", "ml", "cuillère")
    └── Groupe 3 : Nom (ex: "farine", "tomates")

Exemple:
"200g de farine"
→ { quantity: 200, unit: "g", name: "farine", category: "Epicerie" }
```

#### 5. Catégorisation Automatique

```javascript
categorizeIngredient(name)
// Mapping par mots-clés
const categories = {
    'Fruits & Légumes': ['tomate', 'carotte', 'pomme', ...],
    'Viandes': ['poulet', 'boeuf', 'porc', ...],
    'Poissons': ['saumon', 'thon', 'cabillaud', ...],
    'Produits laitiers': ['lait', 'beurre', 'fromage', ...],
    'Epicerie': ['farine', 'sucre', 'huile', ...],
    'Autre': [...]
}
```

#### 6. Chat Bot

```javascript
sendMessage(message)
└── Fetch POST /api/send-message
    └── Backend → n8n webhook
        └── Réponse chatbot affichée
```

---

## Backend : server.js

### Configuration

```javascript
const PORT = 3000;
const N8N_WEBHOOK_URL = 'https://n8n.srv1081620.hstgr.cloud/webhook-test/chat-web';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
```

### Middleware

```javascript
app.use(cors());              // CORS pour GitHub Pages
app.use(express.json());      // Parse JSON body
```

### Endpoints Principaux

#### Recettes
```javascript
GET /api/recipes
→ Liste toutes les recettes depuis Airtable
→ Simplifie les champs pour le frontend
```

#### Planning
```javascript
GET /api/planning?week=X&year=Y
→ Récupère le planning filtré par semaine/année

POST /api/planning
Body: { day, date, meal, recipeId, week, year }
→ Ajoute un repas au planning

DELETE /api/planning/:id
→ Supprime un repas du planning
```

#### Listes de Courses
```javascript
GET /api/shopping-lists?status=Active
→ Récupère toutes les listes (avec filtre optionnel)

GET /api/shopping-list/:id
→ Récupère une liste spécifique

POST /api/shopping-list
Body: { nom, semaine, annee, ingredients, repasInclus, statut, notes }
→ Crée une nouvelle liste

PATCH /api/shopping-list/:id
Body: { ingredients, repasInclus, statut, notes, nom }
→ Met à jour une liste existante
→ Supporte modification du nom (v3.3.1+)

DELETE /api/shopping-list/:id
→ Supprime une liste
```

#### Chat Bot
```javascript
POST /api/send-message
Body: { message, userId }
→ Envoie le message au webhook n8n
→ Retourne la réponse du bot
→ Timeout: 30 secondes
```

---

## Déploiement

### Frontend (GitHub Pages)

```bash
# Branche : main
# Dossier : /frontend
# URL : https://maximesothpro-blip.github.io/telegram-chat-site/

# Cache busting
# Modification des fichiers → commit → push
# GitHub Actions déploie automatiquement
# Délai propagation : 1-2 minutes
```

### Backend (Hostinger)

```bash
# SSH vers VPS Hostinger
ssh user@hostinger

# Localisation
cd /path/to/telegram-chat-site/backend

# Installation dépendances
npm install

# Configuration .env
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
PORT=3000

# Démarrage avec PM2
pm2 start server.js --name telegram-bot

# Redémarrage
pm2 restart telegram-bot

# Logs
pm2 logs telegram-bot

# Statut
pm2 status
```

### Cloudflare Tunnel (Temporaire)

```bash
# Depuis Hostinger
cloudflared tunnel --url localhost:3000

# Génère une URL aléatoire
# Exemple : https://athletic-every-systems-appreciated.trycloudflare.com

# Mettre à jour config.js avec la nouvelle URL
# Déployer frontend sur GitHub Pages
```

---

## Sécurité

### CORS
```javascript
// Backend autorise GitHub Pages
app.use(cors());
// TODO : Restreindre aux origines autorisées en production
```

### Variables d'environnement
```javascript
// Clés API jamais exposées au frontend
// Stockées dans .env sur le serveur
// Non versionnées (gitignore)
```

### Validation
```javascript
// Backend valide tous les paramètres requis
if (!message) {
  return res.status(400).json({ error: 'Message is required' });
}
```

---

## Performance

### Cache Frontend
```javascript
// Pas de localStorage depuis v3.0
// Toutes les données depuis Airtable (source unique de vérité)
// Cache multi-semaines : allWeeksPlanning{}
```

### Optimisations
- Chargement à la demande des semaines
- Agrégation côté client pour la liste de courses
- Debounce sur la recherche de recettes (300ms)
- Lazy loading des listes archivées

### Limites actuelles
- Pas de pagination (toutes les recettes chargées)
- Pas de cache HTTP (à implémenter)
- Tunnel temporaire (latence variable)

---

## Évolution Future

### Court terme
- Tunnel Cloudflare permanent
- Thème pastel doux
- Monitoring du trafic (Analytics)

### Moyen terme
- Authentification utilisateur
- Multi-utilisateurs avec comptes séparés
- Export PDF des listes de courses
- Suggestions IA de recettes

### Long terme
- Application mobile (PWA)
- Partage de plannings
- Intégration courses en ligne
- Notifications repas

---

## Dépendances

### Frontend
```json
{
  "dependencies": "Aucune (Vanilla JS)"
}
```

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### Infrastructure
- Node.js v18+
- PM2 (process manager)
- Cloudflare Tunnel
- Git

---

## Maintenance

### Logs
```bash
# Backend logs
pm2 logs telegram-bot

# Erreurs uniquement
pm2 logs telegram-bot --err

# Dernières 100 lignes
pm2 logs telegram-bot --lines 100
```

### Monitoring
```bash
# Statut des process
pm2 status

# Monitoring temps réel
pm2 monit

# Redémarrage auto en cas de crash
pm2 startup
pm2 save
```

### Backup
- Base Airtable : Export automatique quotidien
- Code : Git + GitHub
- Configuration : Versionné (sauf .env)

---

## Support & Documentation

- **Changelog** : docs/CHANGELOG.md
- **Guide utilisateur** : docs/GUIDE_UTILISATEUR.md
- **README développeur** : docs/README.md
- **Architecture** : Ce document
