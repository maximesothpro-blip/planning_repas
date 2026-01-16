#!/bin/bash

# Script d'installation automatique de Cloudflare Tunnel
# Pour Ubuntu/Debian

set -e

echo "=================================="
echo "Installation de Cloudflare Tunnel"
echo "=================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que le script est exécuté en tant que root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Ce script doit être exécuté en tant que root${NC}"
    echo "Utilisez: sudo bash install-cloudflare-tunnel.sh"
    exit 1
fi

# Étape 1 : Télécharger cloudflared
echo -e "${YELLOW}[1/7] Téléchargement de cloudflared...${NC}"
cd /tmp
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
echo -e "${GREEN}✓ Téléchargement terminé${NC}"
echo ""

# Étape 2 : Installer cloudflared
echo -e "${YELLOW}[2/7] Installation de cloudflared...${NC}"
dpkg -i cloudflared-linux-amd64.deb
echo -e "${GREEN}✓ Installation terminée${NC}"
echo ""

# Vérifier la version
VERSION=$(cloudflared --version)
echo -e "${GREEN}Version installée : $VERSION${NC}"
echo ""

# Étape 3 : Authentification
echo -e "${YELLOW}[3/7] Authentification avec Cloudflare${NC}"
echo -e "${YELLOW}Une URL va s'afficher. Copiez-la et ouvrez-la dans votre navigateur.${NC}"
echo -e "${YELLOW}Puis autorisez cloudflared.${NC}"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

cloudflared tunnel login

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Authentification réussie${NC}"
else
    echo -e "${RED}✗ Échec de l'authentification${NC}"
    exit 1
fi
echo ""

# Étape 4 : Créer le tunnel
echo -e "${YELLOW}[4/7] Création du tunnel...${NC}"
TUNNEL_NAME="telegram-bot"

# Vérifier si le tunnel existe déjà
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo -e "${YELLOW}Le tunnel '$TUNNEL_NAME' existe déjà.${NC}"
    read -p "Voulez-vous le supprimer et le recréer ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        cloudflared tunnel delete $TUNNEL_NAME
        cloudflared tunnel create $TUNNEL_NAME
    fi
else
    cloudflared tunnel create $TUNNEL_NAME
fi

# Récupérer l'UUID du tunnel
TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
echo -e "${GREEN}✓ Tunnel créé avec l'UUID: $TUNNEL_UUID${NC}"
echo ""

# Étape 5 : Créer le fichier de configuration
echo -e "${YELLOW}[5/7] Création du fichier de configuration...${NC}"
mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_NAME
credentials-file: /root/.cloudflared/$TUNNEL_UUID.json

ingress:
  - hostname: "*"
    service: http://localhost:3000
  - service: http_status:404
EOF

echo -e "${GREEN}✓ Configuration créée${NC}"
echo ""

# Étape 6 : Demander le sous-domaine
echo -e "${YELLOW}[6/7] Configuration de la route DNS...${NC}"
echo "Choisissez un nom pour votre sous-domaine (sans espaces) :"
read -p "Exemple: monbot, api, telegram, etc. : " SUBDOMAIN

if [ -z "$SUBDOMAIN" ]; then
    SUBDOMAIN="bot"
    echo -e "${YELLOW}Utilisation du nom par défaut: $SUBDOMAIN${NC}"
fi

FULL_DOMAIN="$SUBDOMAIN.cfargotunnel.com"

cloudflared tunnel route dns $TUNNEL_NAME $FULL_DOMAIN

echo -e "${GREEN}✓ Route DNS créée${NC}"
echo -e "${GREEN}Votre URL HTTPS sera : https://$FULL_DOMAIN${NC}"
echo ""

# Étape 7 : Installer et démarrer le service
echo -e "${YELLOW}[7/7] Installation du service systemd...${NC}"

# Installer le service
cloudflared service install

# Démarrer le service
systemctl start cloudflared

# Activer au démarrage
systemctl enable cloudflared

# Vérifier le statut
sleep 2
if systemctl is-active --quiet cloudflared; then
    echo -e "${GREEN}✓ Service démarré avec succès${NC}"
else
    echo -e "${RED}✗ Échec du démarrage du service${NC}"
    echo "Vérifiez les logs avec: sudo journalctl -u cloudflared -f"
    exit 1
fi
echo ""

# Résumé
echo "=================================="
echo -e "${GREEN}Installation terminée !${NC}"
echo "=================================="
echo ""
echo -e "${GREEN}Votre URL HTTPS :${NC} https://$FULL_DOMAIN"
echo ""
echo "Testez votre backend avec :"
echo -e "${YELLOW}curl https://$FULL_DOMAIN/health${NC}"
echo ""
echo "Mettez à jour votre frontend/config.js avec :"
echo -e "${YELLOW}window.BACKEND_API_URL = 'https://$FULL_DOMAIN';${NC}"
echo ""
echo "Commandes utiles :"
echo "  - Voir le statut : sudo systemctl status cloudflared"
echo "  - Voir les logs  : sudo journalctl -u cloudflared -f"
echo "  - Redémarrer     : sudo systemctl restart cloudflared"
echo "  - Arrêter        : sudo systemctl stop cloudflared"
echo ""
echo -e "${GREEN}Tunnel configuré avec succès ! 🚀${NC}"
