# Configuration Cloudflare Tunnel (HTTPS Gratuit)

Ce guide vous permet d'obtenir une URL HTTPS gratuite pour votre backend sans avoir besoin d'un nom de domaine.

## Avantages de Cloudflare Tunnel

- ✅ **HTTPS automatique et gratuit**
- ✅ **Pas besoin de domaine personnel**
- ✅ **Pas de configuration firewall**
- ✅ **Protection DDoS incluse**
- ✅ **URL publique du type : `https://xxx-xxx-xxx.trycloudflare.com`**

## Étape 1 : Créer un compte Cloudflare (si nécessaire)

1. Allez sur **https://dash.cloudflare.com/sign-up**
2. Créez un compte gratuit (email + mot de passe)
3. Pas besoin d'ajouter de domaine !

## Étape 2 : Installer cloudflared sur votre serveur

Connectez-vous à votre serveur en SSH et exécutez ces commandes :

```bash
# Se connecter à votre serveur
ssh root@72.61.0.124

# Télécharger cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Installer cloudflared
sudo dpkg -i cloudflared-linux-amd64.deb

# Vérifier l'installation
cloudflared --version
```

Vous devriez voir quelque chose comme : `cloudflared version 2024.x.x`

## Étape 3 : Authentifier cloudflared

```bash
# Lancer l'authentification
cloudflared tunnel login
```

**Cette commande va :**
1. Afficher une URL dans votre terminal (quelque chose comme `https://dash.cloudflare.com/...`)
2. **Copiez cette URL** et ouvrez-la dans votre navigateur
3. Connectez-vous à Cloudflare si demandé
4. **Autorisez cloudflared** en cliquant sur le bouton

Une fois autorisé, vous verrez un message de confirmation dans le terminal.

## Étape 4 : Créer le tunnel

```bash
# Créer un tunnel nommé "telegram-bot"
cloudflared tunnel create telegram-bot
```

**Notez l'UUID du tunnel** qui s'affiche (quelque chose comme `12345678-1234-1234-1234-123456789abc`).

## Étape 5 : Créer le fichier de configuration

```bash
# Créer le dossier de config si nécessaire
mkdir -p ~/.cloudflared

# Créer le fichier de configuration
nano ~/.cloudflared/config.yml
```

**Copiez-collez cette configuration dans le fichier :**

```yaml
tunnel: telegram-bot
credentials-file: /root/.cloudflared/<VOTRE_TUNNEL_UUID>.json

ingress:
  - hostname: "*"
    service: http://localhost:3000
  - service: http_status:404
```

**⚠️ IMPORTANT :** Remplacez `<VOTRE_TUNNEL_UUID>` par l'UUID que vous avez noté à l'étape 4.

**Exemple :**
```yaml
tunnel: telegram-bot
credentials-file: /root/.cloudflared/12345678-1234-1234-1234-123456789abc.json

ingress:
  - hostname: "*"
    service: http://localhost:3000
  - service: http_status:404
```

Sauvegardez avec `Ctrl+X`, puis `Y`, puis `Enter`.

## Étape 6 : Créer une route (DNS)

```bash
# Créer une route pour le tunnel
cloudflared tunnel route dns telegram-bot bot.cfargotunnel.com
```

**Note :** Vous pouvez choisir n'importe quel sous-domaine, par exemple :
- `monbot.cfargotunnel.com`
- `api.cfargotunnel.com`
- `telegram.cfargotunnel.com`

## Étape 7 : Démarrer le tunnel

### Option A : Test rapide (arrête quand vous fermez le terminal)

```bash
cloudflared tunnel run telegram-bot
```

Si tout fonctionne, vous verrez :
```
Connection registered: connIndex=0 ip=xxx.xxx.xxx.xxx
```

**Gardez cette fenêtre ouverte** et ouvrez un nouvel onglet SSH pour tester.

### Option B : Démarrage automatique avec systemd (recommandé)

```bash
# Installer le service
sudo cloudflared service install

# Démarrer le service
sudo systemctl start cloudflared

# Vérifier le statut
sudo systemctl status cloudflared

# Activer au démarrage
sudo systemctl enable cloudflared
```

## Étape 8 : Obtenir votre URL publique

Il y a 2 façons d'obtenir votre URL HTTPS :

### Méthode 1 : Via le Dashboard Cloudflare

1. Allez sur **https://one.dash.cloudflare.com/**
2. Cliquez sur **Zero Trust** dans le menu de gauche
3. Cliquez sur **Networks** → **Tunnels**
4. Vous verrez votre tunnel "telegram-bot" avec son URL

### Méthode 2 : Via la ligne de commande

```bash
cloudflared tunnel info telegram-bot
```

L'URL sera quelque chose comme :
- `https://bot.cfargotunnel.com`
- ou le sous-domaine que vous avez choisi

## Étape 9 : Tester votre tunnel

Testez que votre backend est accessible via HTTPS :

```bash
curl https://VOTRE_URL.cfargotunnel.com/health
```

Vous devriez voir :
```json
{"status":"ok","message":"Backend is running"}
```

## Étape 10 : Mettre à jour votre frontend

Maintenant que vous avez une URL HTTPS, mettez à jour votre `frontend/config.js` :

```javascript
// Remplacez par votre URL Cloudflare Tunnel
window.BACKEND_API_URL = 'https://bot.cfargotunnel.com';
```

Puis poussez les changements sur GitHub :

```bash
cd frontend/
git add config.js
git commit -m "Update backend URL to Cloudflare Tunnel"
git push
```

## Alternative : Quick Tunnel (Test Rapide)

Si vous voulez juste **tester rapidement** sans configuration :

```bash
cloudflared tunnel --url http://localhost:3000
```

Cette commande vous donnera **immédiatement** une URL temporaire comme :
```
https://random-words-1234.trycloudflare.com
```

**⚠️ Attention :** Cette URL change à chaque redémarrage et n'est pas permanente !

Utilisez cette méthode uniquement pour tester rapidement.

## Gestion du Tunnel

### Voir les tunnels actifs
```bash
cloudflared tunnel list
```

### Voir les logs
```bash
# Si installé comme service
sudo journalctl -u cloudflared -f

# Si lancé manuellement
# Les logs s'affichent directement dans le terminal
```

### Arrêter le tunnel
```bash
# Si service
sudo systemctl stop cloudflared

# Si lancé manuellement
Ctrl+C dans le terminal
```

### Redémarrer le tunnel
```bash
sudo systemctl restart cloudflared
```

### Supprimer un tunnel
```bash
# Arrêter le service d'abord
sudo systemctl stop cloudflared

# Supprimer le tunnel
cloudflared tunnel delete telegram-bot
```

## Résolution de Problèmes

### Le tunnel ne démarre pas

Vérifiez :
1. Que pm2 tourne bien : `pm2 status`
2. Que le backend répond sur localhost : `curl http://localhost:3000/health`
3. Les logs cloudflared : `sudo journalctl -u cloudflared -f`

### Erreur "tunnel credentials not found"

Le fichier de credentials est mal configuré dans `config.yml`. Vérifiez :
```bash
ls -la ~/.cloudflared/
```

Vous devriez voir un fichier `.json` avec l'UUID du tunnel.

### Le site web ne peut toujours pas se connecter

1. Vérifiez que l'URL dans `frontend/config.js` est correcte
2. Testez l'URL directement dans le navigateur : `https://VOTRE_URL.cfargotunnel.com/health`
3. Vérifiez la console du navigateur (F12) pour voir les erreurs

### Erreur 502 Bad Gateway

Le backend n'est pas accessible. Vérifiez :
```bash
pm2 status
pm2 logs telegram-bot
curl http://localhost:3000/health
```

## Sécurité

### Limiter l'accès au tunnel

Vous pouvez ajouter une authentification Cloudflare Access :

1. Allez sur **https://one.dash.cloudflare.com/**
2. **Zero Trust** → **Access** → **Applications**
3. **Add an application**
4. Configurez les règles d'accès (email, domaine, etc.)

### Whitelist d'IPs

Dans `config.yml`, vous pouvez limiter les IPs autorisées :

```yaml
ingress:
  - hostname: "*"
    service: http://localhost:3000
    originRequest:
      httpHostHeader: localhost
      noTLSVerify: false
```

## Coûts

- **Cloudflare Tunnel : GRATUIT** ✅
- **Bande passante : ILLIMITÉE** ✅
- **Protection DDoS : INCLUSE** ✅

## Commandes Récapitulatives

```bash
# Installation
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authentification
cloudflared tunnel login

# Créer le tunnel
cloudflared tunnel create telegram-bot

# Configurer (créer ~/.cloudflared/config.yml)
# Voir l'exemple plus haut

# Route DNS
cloudflared tunnel route dns telegram-bot VOTRE-SOUS-DOMAINE.cfargotunnel.com

# Démarrer comme service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Vérifier
sudo systemctl status cloudflared
curl https://VOTRE-URL.cfargotunnel.com/health
```

## Support

Documentation officielle : https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

Bon tunnel ! 🚀
