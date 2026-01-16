# Guide d'utilisation - Planning de Repas

Bienvenue dans votre application de planification de repas ! Ce guide vous explique comment utiliser toutes les fonctionnalités.

---

## Sommaire

1. [Aperçu de l'interface](#aperçu-de-linterface)
2. [Gérer vos recettes](#gérer-vos-recettes)
3. [Créer votre planning](#créer-votre-planning)
4. [Générer une liste de courses](#générer-une-liste-de-courses)
5. [Personnaliser votre liste](#personnaliser-votre-liste)
6. [Consulter l'historique](#consulter-lhistorique)
7. [Utiliser le chatbot](#utiliser-le-chatbot)
8. [Astuces et conseils](#astuces-et-conseils)

---

## Aperçu de l'interface

L'application est divisée en **3 sections principales** :

### 1. Sidebar gauche : Recettes
- Liste de toutes vos recettes disponibles
- Barre de recherche pour trouver rapidement une recette
- Bouton de rafraîchissement (↻) pour recharger les recettes
- Bouton masquer/afficher (◀/▶) pour gagner de l'espace

### 2. Centre : Planning de la semaine
- Grille de 7 jours (Lundi à Dimanche)
- 3 moments par jour : Petit-déjeuner, Déjeuner, Dîner
- Navigation entre semaines (← Précédent / Suivant →)
- Affichage de la semaine actuelle (numéro + année)

### 3. Sidebar droite : Bot & Liste de courses
Deux onglets disponibles :
- **Bot** : Chat avec l'assistant pour créer des recettes
- **Liste de courses** : Génération et gestion de votre liste

---

## Gérer vos recettes

### Consulter une recette

1. Cliquez sur le nom d'une recette dans la sidebar gauche
2. Une popup s'ouvre avec les détails :
   - Ingrédients complets
   - Informations nutritionnelles (calories, protéines, glucides, lipides)
   - Tags (catégories)

### Rechercher une recette

1. Utilisez la barre de recherche en haut de la sidebar gauche
2. Tapez le nom de la recette
3. La liste se filtre automatiquement en temps réel

### Rafraîchir les recettes

Si vous avez ajouté une nouvelle recette dans Airtable :
1. Cliquez sur le bouton ↻ en haut de la sidebar
2. Les recettes se rechargent automatiquement

### Masquer la sidebar recettes

Pour gagner de l'espace :
1. Cliquez sur le bouton ◀ en haut de la sidebar
2. La sidebar se masque
3. Cliquez sur le bouton ▶ Recettes pour la réafficher

---

## Créer votre planning

### Naviguer entre les semaines

1. Utilisez les boutons **← Précédent** et **Suivant →**
2. Le numéro de semaine et l'année s'affichent au centre
3. Le planning se charge automatiquement

### Ajouter un repas au planning

Méthode glisser-déposer :
1. Dans la sidebar gauche, cliquez et maintenez sur une recette
2. Glissez la recette vers une case du planning
3. Relâchez sur le moment souhaité (Petit-déjeuner, Déjeuner ou Dîner)
4. La recette s'ajoute automatiquement avec :
   - Nom de la recette
   - Icône ❌ pour supprimer

**Conseil** : Vous pouvez ajouter plusieurs recettes pour le même repas si vous cuisinez pour plusieurs jours.

### Supprimer un repas du planning

1. Cliquez sur l'icône ❌ à côté du nom de la recette
2. Une confirmation apparaît
3. Cliquez sur OK pour confirmer la suppression

---

## Générer une liste de courses

### Première génération

1. Planifiez vos repas pour la semaine (voir section précédente)
2. Cliquez sur l'onglet **Liste de courses** dans la sidebar droite
3. Cliquez sur le bouton **🔄 Rafraîchir**
4. La liste se génère automatiquement en quelques secondes

### Contenu de la liste

La liste affiche :
- Tous les ingrédients nécessaires pour les repas planifiés
- Quantités agrégées (si vous utilisez 200g de farine dans 2 recettes, cela affiche 400g)
- Organisation par catégories :
  - Fruits & Légumes
  - Viandes
  - Poissons
  - Produits laitiers
  - Epicerie
  - Autre

### Rafraîchir la liste

Si vous modifiez votre planning :
1. Cliquez sur **🔄 Rafraîchir**
2. La liste se régénère avec les nouveaux repas

### Vider la liste

Pour archiver la liste actuelle :
1. Cliquez sur l'icône **🗑️** (Vider la liste)
2. La liste passe en statut "Archivée"
3. Elle apparaît dans l'historique (section "Listes précédentes")

---

## Personnaliser votre liste

### Ouvrir les paramètres

1. Dans l'onglet "Liste de courses", cliquez sur l'icône **⚙️** (Paramètres)
2. Une popup s'ouvre avec deux colonnes :
   - **Gauche** : Planning de la semaine
   - **Droite** : Liste de courses éditable

### Inclure/Exclure des repas

**Code couleur** :
- **Vert** : Repas inclus dans la liste
- **Rouge** : Repas exclu de la liste

**Actions** :
1. Cliquez sur un repas pour le passer de vert (inclus) à rouge (exclu) ou vice-versa
2. La liste à droite se met à jour automatiquement
3. Le titre affiche "Modifié" si vous avez fait des changements

**Boutons rapides** :
- **Tout inclure** : Passe tous les repas de la semaine en vert
- **Tout exclure** : Passe tous les repas de la semaine en rouge

### Ajouter des repas d'autres semaines

Vous pouvez ajouter des repas de la semaine suivante ou précédente :

1. Dans la popup Paramètres, utilisez les boutons **←** et **→** pour naviguer entre semaines
2. Cliquez sur un repas d'une autre semaine pour le passer en vert
3. Il s'ajoute automatiquement à votre liste de la semaine actuelle
4. Le titre affiche "Modifié"

**Exemple** : Vous êtes semaine 48, vous pouvez ajouter un repas de la semaine 49 à votre liste de la semaine 48.

### Modifier les quantités et unités

1. Dans la liste éditable (colonne de droite), chaque ingrédient a :
   - **Quantité** : Nombre modifiable
   - **Unité** : Menu déroulant (g, kg, ml, L, pièce, cuillère, etc.)
   - **Nom** : Nom de l'ingrédient

2. Modifiez les quantités selon vos besoins
3. Changez les unités si nécessaire (ex: 1000g → 1kg)

### Enregistrer vos modifications

1. Cliquez sur **Appliquer et fermer**
2. Les modifications sont sauvegardées dans Airtable
3. Le nom de la liste change automatiquement en "Liste semaine X - Modifié"
4. La popup se ferme et la liste mise à jour s'affiche

### Réinitialiser la liste

Pour revenir à la liste par défaut :

1. Dans la popup Paramètres, cliquez sur **🔄 Réinitialiser**
2. Une confirmation apparaît
3. Cliquez sur OK
4. La liste revient à l'état par défaut :
   - Tous les repas de la semaine actuelle inclus
   - Tous les repas des autres semaines exclus
   - Quantités d'origine restaurées
   - Nom de la liste sans "- Modifié"

---

## Consulter l'historique

### Voir les listes précédentes

1. Dans l'onglet "Liste de courses", descendez jusqu'à la section **📋 Listes précédentes**
2. Toutes vos listes archivées s'affichent avec :
   - Nom de la liste (avec "- Modifié" si elle a été personnalisée)
   - Nombre d'articles

### Ouvrir une liste archivée

1. Cliquez sur une liste dans l'historique
2. Une popup s'ouvre avec le contenu complet de la liste
3. Affichez les ingrédients organisés par catégories
4. Fermez la popup avec le bouton ×

**Astuce** : Pratique pour retrouver ce que vous avez acheté les semaines précédentes !

---

## Utiliser le chatbot

### Accéder au chat

1. Cliquez sur l'onglet **Bot** dans la sidebar droite
2. L'interface de chat s'affiche

### Envoyer un message

1. Tapez votre message dans le champ en bas
2. Appuyez sur Entrée ou cliquez sur le bouton ➤
3. Le bot répond en quelques secondes

### Exemples de questions

- "Crée-moi une recette de pâtes carbonara"
- "Propose-moi un dessert rapide"
- "J'ai des tomates, du poulet et du riz, que puis-je faire ?"
- "Donne-moi une recette végétarienne"

**Note** : Le chatbot est connecté à n8n et peut créer de nouvelles recettes directement dans votre base Airtable.

---

## Astuces et conseils

### Planifier efficacement

1. **Commencez par le dimanche** : Planifiez votre semaine à venir
2. **Variez les recettes** : Utilisez les tags pour alterner (végétarien, viande, poisson)
3. **Pensez aux restes** : Planifiez des recettes en double pour les déjeuners du lendemain
4. **Utilisez la recherche** : Trouvez rapidement une recette par nom ou ingrédient

### Optimiser vos listes

1. **Vérifiez avant de générer** : Assurez-vous que tous vos repas sont planifiés
2. **Personnalisez les quantités** : Adaptez selon vos besoins réels
3. **Excluez ce que vous avez** : Si vous avez déjà un ingrédient, excluez le repas puis re-incluez-le
4. **Archivez régulièrement** : Videz votre liste en fin de semaine pour garder un historique

### Gérer plusieurs semaines

1. **Planifiez à l'avance** : Vous pouvez naviguer jusqu'à la semaine suivante
2. **Cross-semaines** : Ajoutez des repas de la semaine 49 à votre liste de la semaine 48 si vous faites vos courses pour 2 semaines
3. **Gardez l'historique** : Les listes archivées restent consultables indéfiniment

### Navigation rapide

- **Ctrl + F** : Rechercher dans la page
- **Ctrl + Shift + R** : Rafraîchir et vider le cache
- **Glisser-déposer** : Plus rapide que des clics multiples
- **Onglets** : Basculez entre Bot et Liste de courses avec les boutons en haut

### Résolution de problèmes

**La liste ne se génère pas** :
- Vérifiez que vous avez planifié au moins un repas
- Cliquez sur 🔄 Rafraîchir
- Vérifiez que vos recettes ont des ingrédients dans Airtable

**Une recette n'apparaît pas** :
- Cliquez sur le bouton ↻ pour rafraîchir les recettes
- Vérifiez dans Airtable que la recette existe bien

**Les modifications ne s'enregistrent pas** :
- Vérifiez votre connexion Internet
- Attendez quelques secondes et réessayez
- Videz le cache du navigateur (Ctrl + Shift + R)

**Le planning est vide** :
- Vérifiez que vous êtes sur la bonne semaine
- Naviguez entre les semaines avec les flèches
- Ajoutez des recettes par glisser-déposer

---

## Raccourcis et fonctionnalités cachées

### Raccourcis clavier

- **Entrée** : Envoyer un message dans le chat
- **Echap** : Fermer une popup
- **Ctrl + Shift + R** : Rafraîchir l'application

### Fonctionnalités avancées

1. **Multi-sélection** : Vous pouvez ajouter la même recette plusieurs fois au planning
2. **Édition rapide** : Double-cliquez sur une quantité dans la liste éditable pour la modifier rapidement
3. **Catégories automatiques** : Le système détecte automatiquement la catégorie de chaque ingrédient
4. **Agrégation intelligente** : Si 2 recettes utilisent des tomates, elles sont automatiquement additionnées

---

## Version et mises à jour

La version actuelle de l'application s'affiche en bas à droite de l'écran : **v3.3.2**

### Nouveautés v3.3

- Personnalisation complète des listes de courses
- Support des repas cross-semaines
- Indicateur de modification sur les listes
- Bouton de réinitialisation
- Affichage du nom de liste partout

### Futures fonctionnalités

- Thème pastel doux
- Export PDF des listes
- Partage de planning
- Suggestions de recettes IA

---

## Support

Pour toute question ou problème :
- Consultez ce guide en premier
- Vérifiez que votre connexion Internet fonctionne
- Essayez de rafraîchir la page (Ctrl + Shift + R)
- Consultez la documentation technique si vous êtes développeur

---

Bon appétit et bonne planification ! 🍽️
