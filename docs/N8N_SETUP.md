# Configuration n8n avec le Bot Telegram

Ce guide explique comment configurer votre workflow n8n pour qu'il fonctionne avec le chat web.

## Architecture Actuelle

```
Site Web → Backend API → Bot Telegram → n8n Workflow → Bot répond
```

## Comment ça fonctionne

1. L'utilisateur tape un message sur le site web
2. Le backend envoie le message au bot Telegram via l'API
3. Le bot reçoit le message, ce qui déclenche votre workflow n8n
4. n8n traite le message et fait ses actions
5. Le bot répond via n8n
6. Le backend récupère la réponse et la renvoie au site web

## Configuration du Workflow n8n

### Option 1 : Webhook Telegram (Recommandé)

Votre workflow n8n devrait commencer par un nœud **Telegram Trigger** :

1. **Ajouter un nœud Telegram Trigger**
   - Type : `Message`
   - Bot Token : Votre token de bot

2. **Traiter le message**
   - Ajoutez vos nœuds personnalisés (API calls, base de données, etc.)

3. **Répondre via Telegram**
   - Ajoutez un nœud **Telegram** à la fin
   - Action : `Send Message`
   - Chat ID : `{{$json["message"]["chat"]["id"]}}`
   - Text : Votre réponse

### Option 2 : Polling (Alternative)

Si vous utilisez le polling au lieu du webhook :

1. n8n utilise `getUpdates` pour récupérer les messages
2. Configurez l'intervalle de polling dans n8n
3. Le reste fonctionne de la même manière

## Exemple de Workflow Simple

```
[Telegram Trigger]
    → [Function] (Traiter le message)
    → [HTTP Request] (Appel API externe - optionnel)
    → [Telegram] (Répondre)
```

### Code exemple pour le nœud Function

```javascript
// Récupérer le message de l'utilisateur
const userMessage = $input.item.json.message.text;

// Traiter le message (exemple simple)
let response = '';

if (userMessage.toLowerCase().includes('bonjour')) {
  response = 'Bonjour ! Comment puis-je vous aider ?';
} else if (userMessage.toLowerCase().includes('aide')) {
  response = 'Je suis votre assistant virtuel. Posez-moi vos questions !';
} else {
  response = `Vous avez dit : ${userMessage}`;
}

// Retourner la réponse
return {
  json: {
    chatId: $input.item.json.message.chat.id,
    response: response
  }
};
```

## Configuration du Bot sur BotFather

Si ce n'est pas déjà fait, configurez votre bot :

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot` (si nouveau) ou `/mybots` (si existant)
3. Suivez les instructions pour créer votre bot
4. Récupérez le **token** fourni par BotFather
5. Configurez les commandes du bot avec `/setcommands` :
   ```
   start - Démarrer la conversation
   help - Obtenir de l'aide
   ```

## Webhook vs Polling

### Webhook (Recommandé pour la production)

**Avantages :**
- Réponses en temps réel
- Moins de charge serveur
- Plus efficace

**Configuration :**
```bash
curl -X POST https://api.telegram.org/bot<VOTRE_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://votre-n8n.com/webhook/telegram"}'
```

### Polling (Plus simple pour débuter)

**Avantages :**
- Plus simple à configurer
- Fonctionne partout
- Pas besoin de domaine public

**Configuration :**
Dans n8n, le nœud Telegram Trigger en mode polling gère tout automatiquement.

## Tester le Workflow

### Test 1 : Directement sur Telegram

1. Ouvrez Telegram
2. Cherchez votre bot (@votre_bot)
3. Envoyez un message
4. Vérifiez que le bot répond

### Test 2 : Via le Site Web

1. Ouvrez votre site GitHub Pages
2. Tapez un message
3. Vérifiez dans n8n que le workflow s'est déclenché
4. Vérifiez que la réponse apparaît sur le site

### Test 3 : Vérifier les Logs n8n

Dans n8n, allez dans **Executions** pour voir :
- Les messages reçus
- Les actions effectuées
- Les réponses envoyées
- Les erreurs éventuelles

## Workflow Avancé avec n8n

### Exemple : Bot avec Intelligence Artificielle

```
[Telegram Trigger]
    → [Function] (Extraire le message)
    → [OpenAI] (Générer une réponse IA)
    → [Function] (Formater la réponse)
    → [Telegram] (Envoyer la réponse)
```

### Exemple : Bot avec Base de Données

```
[Telegram Trigger]
    → [Function] (Extraire user et message)
    → [MySQL/Postgres] (Sauvegarder le message)
    → [MySQL/Postgres] (Récupérer l'historique)
    → [Function] (Générer réponse contextuelle)
    → [Telegram] (Envoyer la réponse)
```

### Exemple : Bot avec Notifications

```
[Telegram Trigger]
    → [Switch] (Selon le type de message)
        → Cas "urgent": [Slack/Email] (Notifier l'équipe)
        → Cas "normal": [Telegram] (Réponse automatique)
        → Cas "question": [HTTP Request] (Appel API externe)
```

## Gestion des Erreurs

Ajoutez un nœud **Error Trigger** dans votre workflow :

```
[Error Trigger]
    → [Function] (Logger l'erreur)
    → [Telegram] (Envoyer message d'erreur)
```

Code pour le Function :
```javascript
return {
  json: {
    chatId: $json.message.chat.id,
    response: "Désolé, une erreur s'est produite. Veuillez réessayer."
  }
};
```

## Sécurité

### Valider les Messages

Ajoutez un nœud **Function** au début pour valider :

```javascript
const message = $input.item.json.message;

// Vérifier que le message vient d'un utilisateur autorisé
const allowedUsers = [123456789, 987654321]; // Vos IDs Telegram

if (!allowedUsers.includes(message.from.id)) {
  throw new Error('Utilisateur non autorisé');
}

return $input.item;
```

### Limiter le Débit (Rate Limiting)

Utilisez un nœud **Function** avec stockage :

```javascript
const userId = $input.item.json.message.from.id;
const now = Date.now();

// Récupérer l'historique (utiliser un nœud de stockage si possible)
// Pour l'exemple, on limite à 5 messages par minute

// Logique de rate limiting ici...

return $input.item;
```

## Dépannage

### Le workflow ne se déclenche pas

1. Vérifiez que le workflow est **activé** dans n8n
2. Vérifiez que le bot token est correct
3. Vérifiez les logs n8n : **Executions**
4. Testez directement sur Telegram

### Le bot ne répond pas

1. Vérifiez que le nœud Telegram de réponse est configuré
2. Vérifiez que le Chat ID est correct : `{{$json["message"]["chat"]["id"]}}`
3. Vérifiez les logs d'erreur dans n8n

### Réponses lentes

1. Optimisez vos nœuds (évitez trop de HTTP requests)
2. Utilisez le webhook au lieu du polling
3. Ajoutez un timeout dans le backend si nécessaire

## Ressources

- [Documentation n8n](https://docs.n8n.io/)
- [Documentation Telegram Bot API](https://core.telegram.org/bots/api)
- [Exemples de Workflows n8n](https://n8n.io/workflows)

## Support

Si vous avez des questions :
1. Vérifiez les **Executions** dans n8n
2. Vérifiez les logs du backend : `pm2 logs telegram-bot`
3. Testez chaque composant individuellement
4. Consultez la documentation n8n pour des workflows similaires

Bon développement ! 🤖
