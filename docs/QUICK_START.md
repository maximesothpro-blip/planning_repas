# Guide de Démarrage Rapide

## Étape 1 : Obtenir vos identifiants Telegram

### Récupérer votre Chat ID

1. Envoyez un message à votre bot Telegram
2. Ouvrez cette URL dans votre navigateur (remplacez `VOTRE_TOKEN` par votre token) :
   ```
   https://api.telegram.org/botVOTRE_TOKEN/getUpdates
   ```
3. Cherchez dans la réponse JSON : `"chat":{"id":123456789}`
4. Le nombre `123456789` est votre Chat ID

**Exemple de réponse :**
```json
{
  "ok": true,
  "result": [{
    "update_id": 123456,
    "message": {
      "message_id": 1,
      "from": {"id": 987654321, "is_bot": false, "first_name": "John"},
      "chat": {"id": 987654321, "first_name": "John", "type": "private"},
      "text": "Hello"
    }
  }]
}
```
Dans cet exemple, le Chat ID est `987654321`.

## Étape 2 : Configuration Backend (Hostinger)

### Méthode A : Via FTP + SSH

1. **Connectez-vous en FTP** à votre Hostinger
2. **Créez un dossier** (ex: `telegram-bot-api`) dans `public_html/`
3. **Uploadez tous les fichiers** du dossier `backend/`
4. **Connectez-vous en SSH** à votre serveur
5. **Naviguez** vers le dossier :
   ```bash
   cd public_html/telegram-bot-api
   ```
6. **Installez les dépendances** :
   ```bash
   npm install
   ```
7. **Créez le fichier .env** :
   ```bash
   cp .env.example .env
   nano .env
   ```
8. **Ajoutez vos informations** dans `.env` :
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID=987654321
   PORT=3000
   ```
   Sauvegardez avec `Ctrl+X`, puis `Y`, puis `Enter`

9. **Démarrez le serveur** :
   ```bash
   npm install -g pm2
   pm2 start server.js --name telegram-bot
   pm2 save
   pm2 startup
   ```

### Méthode B : Via File Manager Hostinger

1. Accédez au **File Manager** de Hostinger
2. Créez un dossier `telegram-bot-api`
3. Uploadez tous les fichiers du dossier `backend/`
4. Utilisez le **Terminal** intégré pour exécuter les commandes ci-dessus

## Étape 3 : Tester le Backend

Testez que votre backend fonctionne :

```bash
curl http://localhost:3000/health
```

Ou dans un navigateur (si vous avez configuré un sous-domaine) :
```
https://api.votre-domaine.com/health
```

Vous devriez voir :
```json
{"status":"ok","message":"Backend is running"}
```

## Étape 4 : Configuration Frontend (GitHub Pages)

1. **Créez un nouveau repository** sur GitHub (ex: `telegram-chat`)

2. **Clonez-le localement** :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/telegram-chat.git
   cd telegram-chat
   ```

3. **Copiez les fichiers frontend** :
   ```bash
   cp -r /chemin/vers/telegram-chat-site/frontend/* .
   ```

4. **Modifiez `config.js`** avec l'URL de votre backend :
   ```javascript
   window.BACKEND_API_URL = 'https://api.votre-domaine.com';
   ```

5. **Commitez et poussez** :
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

6. **Activez GitHub Pages** :
   - Allez dans **Settings** > **Pages**
   - Source : **Deploy from a branch**
   - Branch : **main** / **/ (root)**
   - Cliquez sur **Save**

7. Attendez 1-2 minutes et votre site sera disponible à :
   ```
   https://VOTRE_USERNAME.github.io/telegram-chat/
   ```

## Étape 5 : Tester le Chat

1. Ouvrez votre site GitHub Pages
2. Tapez un message dans le chat (ex: "Bonjour")
3. Le message devrait être envoyé à votre bot Telegram
4. Votre workflow n8n se déclenche
5. Le bot répond
6. La réponse apparaît dans le chat web

## Problèmes Fréquents

### ❌ "Backend is offline"

**Solutions :**
- Vérifiez que le backend est démarré : `pm2 status`
- Vérifiez les logs : `pm2 logs telegram-bot`
- Testez : `curl http://localhost:3000/health`

### ❌ Erreur CORS

**Solution :**
Dans `backend/server.js`, modifiez la ligne CORS :
```javascript
app.use(cors({
  origin: 'https://VOTRE_USERNAME.github.io'
}));
```

### ❌ "Chat ID is required"

**Solution :**
Vérifiez que `TELEGRAM_CHAT_ID` est bien défini dans votre fichier `.env`

### ❌ Le bot ne répond pas

**Solutions :**
- Testez votre bot directement sur Telegram
- Vérifiez que le token est correct
- Vérifiez que votre workflow n8n est actif
- Vérifiez les logs du backend : `pm2 logs telegram-bot`

## Configuration d'un sous-domaine (Optionnel)

Pour avoir une URL propre comme `https://api.votre-domaine.com` :

1. Dans **Hostinger** > **Domains** > **Subdomains**
2. Créez un sous-domaine : `api.votre-domaine.com`
3. Pointez-le vers le dossier : `public_html/telegram-bot-api`
4. Configurez un **proxy** pour rediriger vers le port 3000

**Fichier .htaccess** (dans le dossier du sous-domaine) :
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Prochaines Étapes

- Personnalisez le design dans `style.css`
- Ajoutez des fonctionnalités dans `script.js`
- Sécurisez avec une authentification si nécessaire
- Ajoutez Google Analytics pour suivre l'utilisation

## Commandes Utiles

```bash
# Voir les processus PM2
pm2 status

# Voir les logs
pm2 logs telegram-bot

# Redémarrer le backend
pm2 restart telegram-bot

# Arrêter le backend
pm2 stop telegram-bot

# Supprimer le processus
pm2 delete telegram-bot
```

Bon développement ! 🚀
