# Structure du Projet

```
telegram-chat-site/
│
├── backend/                      # Backend API (à déployer sur Hostinger)
│   ├── server.js                # Serveur Express principal
│   ├── package.json             # Dépendances Node.js
│   ├── .env.example             # Template pour les variables d'environnement
│   └── .gitignore               # Fichiers à ignorer (node_modules, .env)
│
├── frontend/                     # Interface web (à déployer sur GitHub Pages)
│   ├── index.html               # Page HTML du chat
│   ├── style.css                # Styles CSS
│   ├── script.js                # Logique JavaScript du chat
│   └── config.js                # Configuration (URL du backend)
│
├── README.md                     # Documentation complète
├── QUICK_START.md               # Guide de démarrage rapide
├── N8N_SETUP.md                 # Guide de configuration n8n
├── STRUCTURE.md                 # Ce fichier - structure du projet
└── .gitignore                   # Fichiers à ignorer globalement
```

## Description des Fichiers

### Backend (Node.js/Express)

#### `backend/server.js`
Serveur API qui :
- Reçoit les messages du frontend
- Envoie les messages au bot Telegram
- Attend et récupère les réponses du bot
- Renvoie les réponses au frontend

**Endpoints :**
- `GET /health` - Vérifier que le backend fonctionne
- `POST /api/send-message` - Envoyer un message au bot

#### `backend/package.json`
Dépendances nécessaires :
- `express` - Framework web
- `axios` - Client HTTP pour l'API Telegram
- `cors` - Gérer les requêtes cross-origin
- `dotenv` - Variables d'environnement

#### `backend/.env.example`
Template pour créer votre fichier `.env` avec :
- `TELEGRAM_BOT_TOKEN` - Token de votre bot
- `TELEGRAM_CHAT_ID` - Votre ID de chat Telegram
- `PORT` - Port du serveur (3000 par défaut)

### Frontend (HTML/CSS/JS)

#### `frontend/index.html`
Interface du chat avec :
- Zone de messages
- Zone de saisie
- Indicateur de statut (en ligne/hors ligne)
- Indicateur de saisie (quand le bot tape)

#### `frontend/style.css`
Design moderne et responsive :
- Dégradé violet/bleu
- Animations fluides
- Bulles de chat
- Responsive mobile

#### `frontend/script.js`
Logique du chat :
- Envoi des messages au backend
- Affichage des réponses
- Gestion des erreurs
- Vérification du statut du backend

#### `frontend/config.js`
Configuration simple :
- URL du backend à modifier selon votre déploiement

### Documentation

#### `README.md`
Documentation complète avec :
- Architecture du système
- Installation détaillée
- Configuration backend et frontend
- Résolution de problèmes
- Conseils de sécurité

#### `QUICK_START.md`
Guide rapide pour :
- Obtenir les identifiants Telegram
- Déployer rapidement
- Tester le système
- Résoudre les problèmes courants

#### `N8N_SETUP.md`
Guide spécifique n8n :
- Configuration du workflow
- Exemples de workflows
- Intégration avec l'API Telegram
- Gestion des erreurs

## Flux de Données

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│             │         │             │         │              │
│   Site Web  │────────▶│  Backend    │────────▶│   Telegram   │
│  (GitHub)   │         │ (Hostinger) │         │     API      │
│             │         │             │         │              │
└─────────────┘         └─────────────┘         └──────────────┘
      ▲                       ▲                         │
      │                       │                         │
      │                       └─────────────────────────┘
      │                              (Réponse)
      │
      └────────────────────────────────────────────────────────
                         (Affichage)
```

### Étapes du flux :

1. **Utilisateur → Site Web** : L'utilisateur tape un message
2. **Site Web → Backend** : Le frontend envoie le message via POST /api/send-message
3. **Backend → Telegram API** : Le backend envoie le message au bot via sendMessage
4. **Telegram → n8n** : Le message déclenche le workflow n8n (trigger)
5. **n8n → Actions** : n8n traite le message et fait ses actions
6. **n8n → Telegram** : Le bot répond via Telegram
7. **Telegram → Backend** : Le backend récupère la réponse via getUpdates
8. **Backend → Site Web** : Le backend renvoie la réponse au frontend
9. **Site Web → Utilisateur** : Le message du bot s'affiche

## Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Axios** - Client HTTP
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variables d'environnement

### Frontend
- **HTML5** - Structure
- **CSS3** - Styles et animations
- **Vanilla JavaScript** - Logique (pas de framework)
- **Fetch API** - Requêtes HTTP

### Infrastructure
- **GitHub Pages** - Hébergement frontend (gratuit)
- **Hostinger** - Hébergement backend
- **Telegram Bot API** - Communication avec le bot
- **n8n** - Automatisation et workflows

## Prochaines Améliorations Possibles

### Fonctionnalités
- [ ] Authentification utilisateur
- [ ] Historique des conversations (localStorage)
- [ ] Support markdown dans les messages
- [ ] Envoi de fichiers/images
- [ ] Mode sombre/clair
- [ ] Notifications desktop
- [ ] Indicateurs de lecture
- [ ] Réponses suggérées

### Technique
- [ ] WebSocket pour temps réel
- [ ] Rate limiting sur le backend
- [ ] Cache Redis pour les réponses
- [ ] Tests automatisés (Jest/Mocha)
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring et logs (Winston)
- [ ] Analytics (Google Analytics)

### Sécurité
- [ ] Authentification JWT
- [ ] Chiffrement des messages
- [ ] Validation des inputs
- [ ] Protection CSRF
- [ ] Limitation de débit
- [ ] Whitelist d'IPs

## Commandes Utiles

### Backend (Hostinger)
```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Démarrer en production
npm start

# Avec PM2
pm2 start server.js --name telegram-bot
pm2 logs telegram-bot
pm2 restart telegram-bot
pm2 stop telegram-bot
```

### Frontend (Local)
```bash
# Serveur local simple
python3 -m http.server 8000

# Ou avec Node.js
npx serve

# Ou avec PHP
php -S localhost:8000
```

### Git (Déploiement)
```bash
# Initialiser le repo
git init
git add .
git commit -m "Initial commit"

# Pousser vers GitHub
git remote add origin https://github.com/USERNAME/repo.git
git push -u origin main
```

## Support et Contribution

Pour toute question ou amélioration :
1. Créez une issue sur GitHub
2. Consultez la documentation
3. Testez les endpoints individuellement

Bonne chance avec votre projet ! 🚀
