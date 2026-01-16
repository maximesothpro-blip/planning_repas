# Planning de Repas - Documentation Développeur

## Sommaire

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Développement local](#développement-local)
6. [Structure du projet](#structure-du-projet)
7. [API Reference](#api-reference)
8. [Déploiement](#déploiement)
9. [Debugging](#debugging)
10. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

Application web de planification de repas permettant de :
- Gérer un planning hebdomadaire de repas
- Glisser-déposer des recettes sur le planning
- Générer automatiquement des listes de courses
- Personnaliser les listes (quantités, ingrédients, repas inclus)
- Consulter l'historique des listes de courses
- Discuter avec un chatbot pour créer des recettes

**Stack** : Vanilla JS + Express.js + Airtable + n8n

---

## Prérequis

### Système
- Node.js v18 ou supérieur
- npm v9 ou supérieur
- Git

### Services externes
- Compte Airtable avec base configurée
- Serveur n8n avec workflow chatbot
- Hébergement backend (VPS, Hostinger, etc.)
- GitHub account pour hébergement frontend

### Optionnel
- PM2 pour gestion des process
- Cloudflare Tunnel pour exposition HTTPS

---

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/maximesothpro-blip/telegram-chat-site.git
cd telegram-chat-site
```

### 2. Installation backend

```bash
cd backend
npm install
```

### 3. Configuration Airtable

Créer une base Airtable avec 3 tables :

#### Table "Recettes"
| Champ | Type | Description |
|-------|------|-------------|
| Nom | Single line text | Nom de la recette |
| Ingrédients JSON | Long text | JSON des ingrédients (optionnel) |
| Ingrédients Brut | Long text | Texte brut des ingrédients |
| Calories (totales) | Number | Calories totales |
| Protéines (g) | Number | Protéines en grammes |
| Glucides (g) | Number | Glucides en grammes |
| Lipides (g) | Number | Lipides en grammes |
| Nombre de personnes (base) | Number | Nombre de portions |
| Tags | Multiple select | Tags catégories |

#### Table "Plannings Hebdomadaires"
| Champ | Type | Description |
|-------|------|-------------|
| Jour | Single line text | Nom du jour |
| Date | Date | Date complète |
| Moment | Single select | Petit-déjeuner / Déjeuner / Dîner |
| Recette | Link to Recettes | Lien vers la recette |
| Statut | Single select | Planifié / Réalisé / Annulé |
| Semaine | Number | Numéro semaine ISO |
| Annee | Number | Année |

#### Table "Liste de Courses"
| Champ | Type | Description |
|-------|------|-------------|
| Nom | Single line text | Nom de la liste |
| Semaine | Number | Numéro semaine ISO |
| Annee | Number | Année |
| Date Création | Date | Date de création |
| Date Modification | Date | Date de modification |
| Ingrédients JSON | Long text | JSON des ingrédients |
| Repas Inclus JSON | Long text | JSON des repas inclus |
| Statut | Single select | Active / Archivée |
| Nb Items | Number | Nombre d'articles |
| Notes | Long text | Notes utilisateur |

---

## Configuration

### Backend (.env)

Créer un fichier `.env` dans `/backend` :

```env
# Airtable
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Server
PORT=3000

# n8n (optionnel, hardcodé dans server.js)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat
```

**Obtenir les clés Airtable** :
1. Aller sur https://airtable.com/account
2. Générer une Personal Access Token
3. Copier le token dans `AIRTABLE_API_KEY`
4. Récupérer le Base ID depuis l'URL de votre base

### Frontend (config.js)

Modifier `/frontend/config.js` :

```javascript
// URL du backend
window.BACKEND_API_URL = 'http://localhost:3000'; // Développement local
// window.BACKEND_API_URL = 'https://your-tunnel-url.com'; // Production
```

---

## Développement local

### Lancer le backend

```bash
cd backend
node server.js
```

Le serveur démarre sur http://localhost:3000

### Tester les endpoints

```bash
# Health check
curl http://localhost:3000/health

# Récupérer les recettes
curl http://localhost:3000/api/recipes

# Récupérer le planning
curl "http://localhost:3000/api/planning?week=48&year=2025"
```

### Développement frontend

Deux options :

#### Option 1 : Serveur HTTP simple
```bash
cd frontend
python3 -m http.server 8000
# Ouvrir http://localhost:8000/planning.html
```

#### Option 2 : Live Server (VS Code)
1. Installer l'extension "Live Server"
2. Clic droit sur `planning.html` → "Open with Live Server"

### Workflow de développement

1. Modifier les fichiers frontend (`planning.js`, `planning.css`, `planning.html`)
2. Rafraîchir le navigateur (Ctrl+Shift+R pour vider le cache)
3. Vérifier la console DevTools pour les erreurs
4. Tester les fonctionnalités modifiées

---

## Structure du projet

```
telegram-chat-site/
├── frontend/
│   ├── planning.html       # Page principale
│   ├── planning.js         # Logique métier (2000+ lignes)
│   ├── planning.css        # Styles
│   └── config.js           # Configuration API URL
├── backend/
│   ├── server.js           # Express API
│   ├── package.json        # Dépendances
│   ├── package-lock.json
│   └── .env                # Variables d'environnement (non versionné)
├── docs/
│   ├── README.md           # Ce fichier
│   ├── ARCHITECTURE.md     # Documentation technique
│   ├── CHANGELOG.md        # Historique des versions
│   └── GUIDE_UTILISATEUR.md # Guide utilisateur
└── .gitignore
```

---

## API Reference

### Recettes

#### GET /api/recipes
Récupère toutes les recettes.

**Réponse** :
```json
{
  "success": true,
  "recipes": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "name": "Pâtes carbonara",
      "ingredients": "200g de pâtes\n100g de lardons\n...",
      "calories": 650,
      "proteins": 25,
      "carbs": 80,
      "fats": 20,
      "servings": 2,
      "tags": ["Italien", "Rapide"]
    }
  ]
}
```

---

### Planning

#### GET /api/planning
Récupère le planning filtré par semaine/année.

**Query params** :
- `week` (optionnel) : Numéro de semaine ISO
- `year` (optionnel) : Année

**Exemple** :
```bash
GET /api/planning?week=48&year=2025
```

**Réponse** :
```json
{
  "success": true,
  "planning": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "day": "Lundi",
      "date": "2025-11-25",
      "meal": "Déjeuner",
      "recipe": ["recYYYYYYYYYYYYYY"],
      "status": "Planifié"
    }
  ]
}
```

#### POST /api/planning
Ajoute un repas au planning.

**Body** :
```json
{
  "day": "Lundi",
  "date": "2025-11-25",
  "meal": "Déjeuner",
  "recipeId": "recXXXXXXXXXXXXXX",
  "week": 48,
  "year": 2025
}
```

**Réponse** :
```json
{
  "success": true,
  "record": { /* Airtable record */ }
}
```

#### DELETE /api/planning/:id
Supprime un repas du planning.

**Réponse** :
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### Listes de courses

#### GET /api/shopping-lists
Récupère toutes les listes de courses.

**Query params** :
- `status` (optionnel) : "Active" ou "Archivée"

**Réponse** :
```json
{
  "success": true,
  "shoppingLists": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "nom": "Liste semaine 48 - 2025",
      "semaine": 48,
      "annee": 2025,
      "dateCreation": "2025-12-01T10:00:00.000Z",
      "dateModification": "2025-12-01T12:00:00.000Z",
      "ingredientsJSON": "[...]",
      "repasInclusJSON": "{...}",
      "statut": "Active",
      "nbItems": 15,
      "notes": ""
    }
  ]
}
```

#### GET /api/shopping-list/:id
Récupère une liste spécifique.

#### POST /api/shopping-list
Crée une nouvelle liste.

**Body** :
```json
{
  "nom": "Liste semaine 48 - 2025",
  "semaine": 48,
  "annee": 2025,
  "ingredients": [
    {
      "name": "Tomates",
      "quantity": 500,
      "unit": "g",
      "category": "Fruits & Légumes"
    }
  ],
  "repasInclus": {
    "48-2025-0": true,
    "48-2025-1": false
  },
  "statut": "Active",
  "notes": ""
}
```

#### PATCH /api/shopping-list/:id
Met à jour une liste existante.

**Body** :
```json
{
  "ingredients": [...],
  "repasInclus": {...},
  "statut": "Archivée",
  "notes": "Liste complétée",
  "nom": "Liste semaine 48 - 2025 - Modifié"
}
```

#### DELETE /api/shopping-list/:id
Supprime une liste.

---

### Chat

#### POST /api/send-message
Envoie un message au chatbot via n8n.

**Body** :
```json
{
  "message": "Crée-moi une recette de pâtes",
  "userId": "web_user_123"
}
```

**Réponse** :
```json
{
  "success": true,
  "response": "Voici une recette de pâtes carbonara...",
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

---

## Déploiement

### Frontend (GitHub Pages)

1. **Pusher le code** :
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
```

2. **Activer GitHub Pages** :
- Aller dans Settings > Pages
- Source : Deploy from branch
- Branch : main
- Folder : / (root)

3. **Configurer l'URL** :
- L'URL sera : `https://username.github.io/repository-name/`
- Mettre à jour `config.js` avec l'URL du backend

4. **Cache busting** :
- GitHub Pages met en cache les fichiers
- Forcer le refresh : Ctrl+Shift+R
- Ou ajouter un query param : `planning.js?v=1.0.0`

---

### Backend (Hostinger VPS)

1. **Connexion SSH** :
```bash
ssh user@your-hostinger-server.com
```

2. **Cloner le projet** :
```bash
cd /home/user
git clone https://github.com/username/telegram-chat-site.git
cd telegram-chat-site/backend
```

3. **Installer les dépendances** :
```bash
npm install
```

4. **Configurer .env** :
```bash
nano .env
# Ajouter AIRTABLE_API_KEY et AIRTABLE_BASE_ID
```

5. **Installer PM2** :
```bash
npm install -g pm2
```

6. **Démarrer avec PM2** :
```bash
pm2 start server.js --name telegram-bot
pm2 save
pm2 startup
```

7. **Configurer Cloudflare Tunnel** :
```bash
# Installer cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Lancer le tunnel
cloudflared tunnel --url localhost:3000
```

8. **Mettre à jour le frontend** :
- Récupérer l'URL du tunnel (ex: `https://xxx.trycloudflare.com`)
- Mettre à jour `config.js` dans le frontend
- Pusher sur GitHub

---

### Déploiement de mises à jour

#### Frontend
```bash
# 1. Modifier les fichiers
# 2. Commit et push
cd frontend
git add .
git commit -m "Update: description des changements"
git push origin main

# 3. Attendre 1-2 minutes (GitHub Actions)
# 4. Vider le cache navigateur : Ctrl+Shift+R
```

#### Backend
```bash
# 1. SSH vers le serveur
ssh user@hostinger

# 2. Pull les changements
cd telegram-chat-site/backend
git pull origin main

# 3. Installer nouvelles dépendances si nécessaire
npm install

# 4. Redémarrer PM2
pm2 restart telegram-bot

# 5. Vérifier les logs
pm2 logs telegram-bot
```

---

## Debugging

### Frontend

#### Console DevTools
```javascript
// Activer les logs détaillés
console.log('Variable:', variable);

// Breakpoints
debugger;

// Network tab : vérifier les requêtes API
// Console tab : voir les erreurs JavaScript
```

#### Erreurs courantes

**CORS Error** :
```
Access to fetch has been blocked by CORS policy
```
Solution : Vérifier que le backend a `app.use(cors())`

**Tunnel expiré** :
```
Failed to fetch
```
Solution : Redémarrer le tunnel Cloudflare et mettre à jour `config.js`

**Cache navigateur** :
```
Les modifications ne s'affichent pas
```
Solution : Ctrl+Shift+R ou vider le cache complet

---

### Backend

#### PM2 Logs
```bash
# Logs en temps réel
pm2 logs telegram-bot

# Dernières 100 lignes
pm2 logs telegram-bot --lines 100

# Erreurs uniquement
pm2 logs telegram-bot --err
```

#### Test manuel des endpoints
```bash
# Health check
curl http://localhost:3000/health

# Recipes avec logs
curl -v http://localhost:3000/api/recipes

# POST avec body
curl -X POST http://localhost:3000/api/planning \
  -H "Content-Type: application/json" \
  -d '{"day":"Lundi","date":"2025-12-01","meal":"Déjeuner","recipeId":"recXXX","week":48,"year":2025}'
```

#### Erreurs courantes

**Airtable API Error 401** :
```
Error: Request failed with status code 401
```
Solution : Vérifier `AIRTABLE_API_KEY` dans `.env`

**Airtable Base Not Found** :
```
Error: Could not find table Recettes in application
```
Solution : Vérifier `AIRTABLE_BASE_ID` et les noms de tables

**Port déjà utilisé** :
```
Error: listen EADDRINUSE: address already in use :::3000
```
Solution : `pm2 stop telegram-bot` ou changer le port

---

## Troubleshooting

### Le planning ne s'affiche pas

1. Vérifier la console DevTools
2. Vérifier que `/api/planning` retourne des données
3. Vérifier que la semaine actuelle existe dans Airtable
4. Vérifier le format des dates

### Les recettes ne se drag & drop pas

1. Vérifier que `initializeDragAndDrop()` est appelée
2. Vérifier les attributs `draggable="true"` dans le HTML
3. Vérifier les event listeners sur les meal boxes

### La liste de courses est vide

1. Vérifier que le planning a des recettes assignées
2. Vérifier le champ "Ingrédients Brut" dans Airtable
3. Vérifier la console pour les erreurs de parsing
4. Tester `parseRecipeIngredients()` avec un ingrédient simple

### Le chatbot ne répond pas

1. Vérifier que le webhook n8n est actif
2. Tester le webhook directement avec curl :
```bash
curl -X POST https://n8n-url.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"debug"}'
```
3. Vérifier les logs backend : `pm2 logs telegram-bot`

### Le tunnel Cloudflare s'arrête

**Problème** : Le tunnel temporaire s'arrête après quelques heures.

**Solutions** :
- Utiliser un tunnel permanent (nécessite compte Cloudflare)
- Relancer le tunnel : `cloudflared tunnel --url localhost:3000`
- Mettre à jour `config.js` avec la nouvelle URL

---

## Bonnes pratiques

### Code

- Utiliser `const` par défaut, `let` si nécessaire
- Préfixer les fonctions async avec `async`
- Toujours gérer les erreurs avec try/catch
- Logger les erreurs importantes
- Commenter les sections complexes

### Git

- Commits fréquents et atomiques
- Messages descriptifs : "Fix: description" ou "Feature: description"
- Ne jamais commit `.env`
- Tester avant de commit

### Sécurité

- Ne jamais exposer les clés API au frontend
- Valider tous les inputs utilisateur
- Utiliser HTTPS en production
- Limiter le CORS aux domaines autorisés

---

## Contribuer

1. Fork le projet
2. Créer une branche : `git checkout -b feature/nouvelle-feature`
3. Commit : `git commit -m 'Add: nouvelle feature'`
4. Push : `git push origin feature/nouvelle-feature`
5. Ouvrir une Pull Request

---

## Support

Pour toute question ou problème :
- Consulter `ARCHITECTURE.md` pour comprendre le fonctionnement
- Consulter `CHANGELOG.md` pour l'historique des versions
- Consulter `GUIDE_UTILISATEUR.md` pour l'utilisation

---

## Licence

Projet personnel - Tous droits réservés
