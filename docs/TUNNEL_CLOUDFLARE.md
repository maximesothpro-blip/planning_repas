# Configuration Tunnel Permanent Cloudflare

## Informations du Tunnel

**Tunnel ID** : `35f6678f-4572-4d8c-8450-af8dc2c4e3c1`
**Nom du tunnel** : `telegram-bot`
**Domaine** : `msnew.cloud`
**URL API** : `https://api.msnew.cloud`
**Date de création** : 2025-12-05

---

## Architecture

```
Frontend (GitHub Pages)
  https://maximesothpro-blip.github.io/telegram-chat/
    ↓ Appelle https://api.msnew.cloud
Cloudflare DNS + Tunnel
    ↓ Route via tunnel permanent
Serveur Hostinger (srv1081620)
  localhost:3000 (Node.js Express)
    ↓ Backend API
Airtable
```

---

## Configuration Serveur (Hostinger)

### Emplacement des fichiers

**Certificat Cloudflare** :
```
/root/.cloudflared/cert.pem
```

**Credentials du tunnel** :
```
/root/.cloudflared/35f6678f-4572-4d8c-8450-af8dc2c4e3c1.json
```

**Configuration du tunnel** :
```
/root/.cloudflared/config.yml
```

### Contenu de config.yml

```yaml
tunnel: 35f6678f-4572-4d8c-8450-af8dc2c4e3c1
credentials-file: /root/.cloudflared/35f6678f-4572-4d8c-8450-af8dc2c4e3c1.json

ingress:
  - hostname: api.msnew.cloud
    service: http://localhost:3000
  - service: http_status:404
```

---

## Service Systemd

Le tunnel tourne en permanence via systemd.

### Commandes utiles

**Statut du service** :
```bash
systemctl status cloudflared
```

**Redémarrer le service** :
```bash
systemctl restart cloudflared
```

**Arrêter le service** :
```bash
systemctl stop cloudflared
```

**Démarrer le service** :
```bash
systemctl start cloudflared
```

**Voir les logs en temps réel** :
```bash
journalctl -u cloudflared -f
```

**Voir les 100 dernières lignes de logs** :
```bash
journalctl -u cloudflared -n 100
```

---

## DNS Cloudflare

**Enregistrement créé** :
- Type : `CNAME`
- Nom : `api.msnew.cloud`
- Cible : `35f6678f-4572-4d8c-8450-af8dc2c4e3c1.cfargotunnel.com`
- Proxy : ✅ Activé (orange cloud)

**Commande de création** :
```bash
cloudflared tunnel route dns 35f6678f-4572-4d8c-8450-af8dc2c4e3c1 api.msnew.cloud
```

---

## Configuration Frontend

**Fichier** : `/telegram-chat/config.js`

```javascript
window.BACKEND_API_URL = 'https://api.msnew.cloud';
```

---

## Tests

### Vérifier que le tunnel fonctionne

**Test basique** :
```bash
curl https://api.msnew.cloud/health
```

**Réponse attendue** :
```json
{"status":"ok","message":"Backend is running"}
```

**Tester les recettes** :
```bash
curl https://api.msnew.cloud/api/recipes
```

**Tester le planning** :
```bash
curl "https://api.msnew.cloud/api/planning?week=48&year=2025"
```

---

## Troubleshooting

### Le tunnel ne répond pas

1. **Vérifier le service** :
```bash
systemctl status cloudflared
```

2. **Vérifier les logs** :
```bash
journalctl -u cloudflared -n 50
```

3. **Redémarrer le service** :
```bash
systemctl restart cloudflared
```

### Le backend ne répond pas

1. **Vérifier PM2** :
```bash
pm2 status
```

2. **Vérifier que le backend écoute sur le port 3000** :
```bash
netstat -tulpn | grep 3000
```

3. **Redémarrer le backend** :
```bash
pm2 restart telegram-bot
```

### DNS ne résout pas

1. **Vérifier la propagation DNS** :
```bash
nslookup api.msnew.cloud
```

2. **Vérifier dans le dashboard Cloudflare** :
   - https://dash.cloudflare.com
   - DNS → Enregistrements
   - Chercher `api.msnew.cloud`

---

## Recréer le tunnel (en cas de problème)

Si vous devez recréer le tunnel :

### 1. Supprimer l'ancien tunnel
```bash
cloudflared tunnel delete telegram-bot
```

### 2. Créer un nouveau tunnel
```bash
cloudflared tunnel create telegram-bot-new
```

### 3. Noter le nouveau Tunnel ID

### 4. Mettre à jour config.yml
```bash
nano ~/.cloudflared/config.yml
```

### 5. Recréer la route DNS
```bash
cloudflared tunnel route dns NOUVEAU_TUNNEL_ID api.msnew.cloud
```

### 6. Redémarrer le service
```bash
systemctl restart cloudflared
```

---

## Sécurité

### Protections actives

- ✅ SSL/TLS automatique (Cloudflare)
- ✅ DDoS protection (Cloudflare)
- ✅ Web Application Firewall disponible
- ✅ Rate limiting disponible

### Recommandations

- Ne jamais exposer directement le port 3000
- Toujours passer par le tunnel Cloudflare
- Activer le WAF dans Cloudflare pour plus de sécurité
- Monitorer les logs du tunnel régulièrement

---

## Coûts

- **Cloudflare Tunnel** : Gratuit ✅
- **Cloudflare DNS** : Gratuit ✅
- **SSL/TLS** : Gratuit ✅
- **DDoS Protection** : Gratuit ✅

---

## Liens utiles

- **Dashboard Cloudflare** : https://dash.cloudflare.com
- **Documentation Cloudflare Tunnel** : https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Site frontend** : https://maximesothpro-blip.github.io/telegram-chat/
- **API backend** : https://api.msnew.cloud

---

## Historique des modifications

| Date | Version | Modifications |
|------|---------|---------------|
| 2025-12-05 | v1.0 | Création du tunnel permanent avec api.msnew.cloud |

---

## Contact & Support

En cas de problème :
1. Vérifier les logs : `journalctl -u cloudflared -f`
2. Vérifier PM2 : `pm2 logs telegram-bot`
3. Tester l'API : `curl https://api.msnew.cloud/health`
