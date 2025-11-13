// Configuration
const API_URL = window.BACKEND_API_URL || 'http://localhost:3000';

// État global
let recipes = [];
let planning = [];
let shoppingList = [];
let currentWeek = getCurrentWeek();
let currentYear = new Date().getFullYear();

// Éléments DOM
const recipesList = document.getElementById('recipesList');
const calendar = document.getElementById('calendar');
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const showSidebar = document.getElementById('showSidebar');
const refreshRecipes = document.getElementById('refreshRecipes');
const recipePopup = document.getElementById('recipePopup');
const closePopup = document.getElementById('closePopup');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const prevWeek = document.getElementById('prevWeek');
const nextWeek = document.getElementById('nextWeek');
const weekDisplay = document.getElementById('weekDisplay');
const searchRecipes = document.getElementById('searchRecipes');
const generateListBtn = document.getElementById('generateList');
const exportListBtn = document.getElementById('exportList');
const shoppingContent = document.getElementById('shoppingContent');

// Jours de la semaine
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MEALS = ['Déjeuner', 'Dîner'];

// ===== INITIALISATION =====
async function init() {
    updateWeekDisplay();
    await loadRecipes();
    await loadPlanning();
    createCalendar();
    displayPlanning();
    setupEventListeners();
    setupTabs();
}

// ===== METTRE À JOUR L'AFFICHAGE DE LA SEMAINE =====
function updateWeekDisplay() {
    weekDisplay.textContent = `Semaine ${currentWeek} - ${currentYear}`;
}

// ===== CHARGER LES RECETTES =====
async function loadRecipes() {
    try {
        const response = await fetch(`${API_URL}/api/recipes`);
        const data = await response.json();

        if (data.success) {
            recipes = data.recipes;
            displayRecipes();
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipesList.innerHTML = '<div class="loading">Erreur de chargement</div>';
    }
}

// ===== CHARGER LE PLANNING =====
async function loadPlanning() {
    try {
        const response = await fetch(`${API_URL}/api/planning?week=${currentWeek}&year=${currentYear}`);
        const data = await response.json();

        if (data.success) {
            planning = data.planning;
            console.log(`Loaded ${planning.length} planned meals for week ${currentWeek}`);
        }
    } catch (error) {
        console.error('Error loading planning:', error);
    }
}

// ===== METTRE À JOUR LE RÉSUMÉ NUTRITIONNEL D'UN JOUR =====
function updateDaySummary(day) {
    const daySummary = document.querySelector(`.day-summary[data-day="${day}"]`);
    if (!daySummary) return;

    // Trouver toutes les recettes de ce jour
    const daySlots = document.querySelectorAll(`[data-day="${day}"]`);
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    daySlots.forEach(slot => {
        if (slot.classList.contains('meal-slot')) {
            const plannedRecipe = slot.querySelector('.planned-recipe');
            if (plannedRecipe) {
                const recipeId = plannedRecipe.dataset.recipeId;
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    totalCalories += recipe.calories || 0;
                    totalProteins += recipe.proteins || 0;
                    totalCarbs += recipe.carbs || 0;
                    totalFats += recipe.fats || 0;
                }
            }
        }
    });

    // Mettre à jour l'affichage
    daySummary.querySelector('.calories-total').textContent = Math.round(totalCalories);
    daySummary.querySelector('.protein-total').textContent = Math.round(totalProteins);

    // Stocker les totaux pour le popup
    daySummary.dataset.calories = totalCalories;
    daySummary.dataset.proteins = totalProteins;
    daySummary.dataset.carbs = totalCarbs;
    daySummary.dataset.fats = totalFats;
}

// ===== AFFICHER LE POPUP DE RÉSUMÉ DU JOUR =====
function showDaySummaryPopup(day) {
    const daySummary = document.querySelector(`.day-summary[data-day="${day}"]`);
    if (!daySummary) return;

    const calories = Math.round(parseFloat(daySummary.dataset.calories) || 0);
    const proteins = Math.round(parseFloat(daySummary.dataset.proteins) || 0);
    const carbs = Math.round(parseFloat(daySummary.dataset.carbs) || 0);
    const fats = Math.round(parseFloat(daySummary.dataset.fats) || 0);

    const popupTitle = document.getElementById('popupTitle');
    const popupBody = document.getElementById('popupBody');

    popupTitle.textContent = `Résumé nutritionnel - ${day}`;

    popupBody.innerHTML = `
        <div class="popup-section">
            <strong>Totaux de la journée :</strong>
            <ul>
                <li>🔥 Calories : ${calories} kcal</li>
                <li>💪 Protéines : ${proteins}g</li>
                <li>🍞 Glucides : ${carbs}g</li>
                <li>🥑 Lipides : ${fats}g</li>
            </ul>
        </div>
    `;

    recipePopup.classList.add('active');
}

// ===== AFFICHER LE PLANNING =====
function displayPlanning() {
    planning.forEach(item => {
        // Trouver le slot correspondant dans le calendrier
        const slot = document.querySelector(`[data-day="${item.day}"][data-meal="${item.meal}"]`);
        if (!slot) return;

        // Trouver le nom de la recette
        let recipeName = 'Recette inconnue';
        let recipeData = null;

        if (item.recipe && item.recipe.length > 0) {
            const recipeId = item.recipe[0];
            recipeData = recipes.find(r => r.id === recipeId);
            if (recipeData) {
                recipeName = recipeData.name;
            }
        }

        // Afficher la recette dans le slot
        const mealContent = slot.querySelector('.meal-content');
        mealContent.innerHTML = `
            <div class="planned-recipe" data-record-id="${item.id}" data-recipe-id="${item.recipe[0] || ''}">
                <span class="recipe-name-text">${recipeName}</span>
                <button class="delete-recipe-btn" data-record-id="${item.id}">×</button>
            </div>
        `;

        // Ajouter l'event listener pour la suppression
        const deleteBtn = mealContent.querySelector('.delete-recipe-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecipeFromPlanning(item.id, slot);
        });

        // Ajouter l'event listener pour afficher le popup
        const plannedRecipeDiv = mealContent.querySelector('.planned-recipe');
        plannedRecipeDiv.addEventListener('click', () => {
            if (recipeData) {
                showRecipePopup(recipeData);
            }
        });
    });

    // Mettre à jour tous les résumés nutritionnels
    DAYS.forEach(day => updateDaySummary(day));
}

// ===== AFFICHER LES RECETTES =====
function displayRecipes() {
    recipesList.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeEl = document.createElement('div');
        recipeEl.className = 'recipe-item';
        recipeEl.draggable = true;
        recipeEl.dataset.recipeId = recipe.id;
        recipeEl.dataset.recipeName = recipe.name;

        recipeEl.innerHTML = `
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-tags">${recipe.tags.join(', ') || 'Sans tag'}</div>
        `;

        // Click pour voir détails
        recipeEl.addEventListener('click', () => showRecipePopup(recipe));

        // Drag events
        recipeEl.addEventListener('dragstart', handleDragStart);
        recipeEl.addEventListener('dragend', handleDragEnd);

        recipesList.appendChild(recipeEl);
    });
}

// ===== CRÉER LE CALENDRIER =====
function createCalendar() {
    calendar.innerHTML = '';

    DAYS.forEach((day, index) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        dayColumn.appendChild(dayHeader);

        MEALS.forEach(meal => {
            const mealSlot = document.createElement('div');
            mealSlot.className = 'meal-slot';
            mealSlot.dataset.day = day;
            mealSlot.dataset.meal = meal;

            mealSlot.innerHTML = `
                <div class="meal-label">${meal}</div>
                <div class="meal-content">
                    <div class="empty-slot">Glissez une recette ici</div>
                </div>
            `;

            // Drop events
            mealSlot.addEventListener('dragover', handleDragOver);
            mealSlot.addEventListener('dragleave', handleDragLeave);
            mealSlot.addEventListener('drop', handleDrop);

            dayColumn.appendChild(mealSlot);
        });

        // Ajouter le résumé nutritionnel du jour
        const daySummary = document.createElement('div');
        daySummary.className = 'day-summary';
        daySummary.dataset.day = day;
        daySummary.innerHTML = `
            <div class="summary-content">
                <div class="summary-line">🔥 <span class="calories-total">0</span> kcal</div>
                <div class="summary-line">💪 <span class="protein-total">0</span>g prot</div>
            </div>
        `;
        daySummary.addEventListener('click', () => showDaySummaryPopup(day));
        dayColumn.appendChild(daySummary);

        calendar.appendChild(dayColumn);
    });
}

// ===== DRAG & DROP =====
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('recipeId', e.target.dataset.recipeId);
    e.dataTransfer.setData('recipeName', e.target.dataset.recipeName);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    const slot = e.target.closest('.meal-slot');
    if (slot) {
        slot.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const slot = e.target.closest('.meal-slot');
    if (slot) {
        slot.classList.remove('drag-over');
    }
}

async function handleDrop(e) {
    e.preventDefault();

    const slot = e.target.closest('.meal-slot');
    if (!slot) return;

    slot.classList.remove('drag-over');

    const recipeId = e.dataTransfer.getData('recipeId');
    const recipeName = e.dataTransfer.getData('recipeName');
    const day = slot.dataset.day;
    const meal = slot.dataset.meal;

    // Afficher immédiatement dans l'UI (sans bouton delete pour l'instant, on attend la réponse)
    const mealContent = slot.querySelector('.meal-content');
    mealContent.innerHTML = `<div class="planned-recipe">${recipeName}</div>`;

    // Sauvegarder dans Airtable
    try {
        const date = getDateForDay(day);

        const response = await fetch(`${API_URL}/api/planning`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                day: day,
                date: date,
                meal: meal,
                recipeId: recipeId,
                week: currentWeek,
                year: currentYear
            })
        });

        const data = await response.json();

        if (data.success && data.record) {
            // Mettre à jour avec le bouton delete
            const recordId = data.record.id;
            mealContent.innerHTML = `
                <div class="planned-recipe" data-record-id="${recordId}" data-recipe-id="${recipeId}">
                    <span class="recipe-name-text">${recipeName}</span>
                    <button class="delete-recipe-btn" data-record-id="${recordId}">×</button>
                </div>
            `;

            // Ajouter l'event listener pour la suppression
            const deleteBtn = mealContent.querySelector('.delete-recipe-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteRecipeFromPlanning(recordId, slot);
            });

            // Ajouter l'event listener pour afficher le popup
            const plannedRecipeDiv = mealContent.querySelector('.planned-recipe');
            plannedRecipeDiv.addEventListener('click', () => {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    showRecipePopup(recipe);
                }
            });

            // Mettre à jour le résumé nutritionnel du jour
            updateDaySummary(day);
        } else {
            console.error('Failed to save to Airtable');
        }
    } catch (error) {
        console.error('Error saving to Airtable:', error);
    }
}

// ===== SUPPRIMER UNE RECETTE DU PLANNING =====
async function deleteRecipeFromPlanning(recordId, slot) {
    if (!confirm('Supprimer cette recette du planning ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/planning/${recordId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            // Vider le slot
            const mealContent = slot.querySelector('.meal-content');
            mealContent.innerHTML = '<div class="empty-slot">Glissez une recette ici</div>';

            // Mettre à jour le résumé nutritionnel du jour
            const day = slot.dataset.day;
            updateDaySummary(day);

            console.log('Recipe deleted successfully');
        } else {
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Erreur lors de la suppression');
    }
}

// ===== POPUP RECETTE =====
function showRecipePopup(recipe) {
    const popupTitle = document.getElementById('popupTitle');
    const popupBody = document.getElementById('popupBody');

    popupTitle.textContent = recipe.name;

    popupBody.innerHTML = `
        <div class="popup-section">
            <strong>Tags:</strong>
            ${recipe.tags.join(', ') || 'Aucun'}
        </div>
        <div class="popup-section">
            <strong>Informations nutritionnelles:</strong>
            <ul>
                <li>Protéines: ${recipe.proteins}g</li>
                <li>Glucides: ${recipe.carbs}g</li>
                <li>Lipides: ${recipe.fats}g</li>
            </ul>
        </div>
        <div class="popup-section">
            <strong>Portions:</strong>
            ${recipe.servings} personne(s)
        </div>
    `;

    recipePopup.classList.add('active');
}

closePopup.addEventListener('click', () => {
    recipePopup.classList.remove('active');
});

recipePopup.addEventListener('click', (e) => {
    if (e.target === recipePopup) {
        recipePopup.classList.remove('active');
    }
});

// ===== CHAT BOT =====
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Ajouter le message utilisateur
    addChatMessage(message, 'user');
    messageInput.value = '';

    try {
        const response = await fetch(`${API_URL}/api/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.success) {
            addChatMessage(data.response, 'bot');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('Erreur de connexion au bot', 'bot');
    }
});

function addChatMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== TOGGLE SIDEBAR =====
toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleSidebar.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';

    // Afficher/cacher le bouton fixe
    if (sidebar.classList.contains('collapsed')) {
        showSidebar.classList.add('visible');
    } else {
        showSidebar.classList.remove('visible');
    }
});

// Bouton pour rouvrir la sidebar
showSidebar.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    toggleSidebar.textContent = '◀';
    showSidebar.classList.remove('visible');
});

// ===== REFRESH RECIPES =====
refreshRecipes.addEventListener('click', async () => {
    refreshRecipes.style.opacity = '0.5';
    refreshRecipes.disabled = true;

    await loadRecipes();

    refreshRecipes.style.opacity = '1';
    refreshRecipes.disabled = false;
});

// ===== NAVIGATION DE SEMAINE =====
prevWeek.addEventListener('click', async () => {
    currentWeek--;
    if (currentWeek < 1) {
        currentWeek = 52;
        currentYear--;
    }
    await reloadWeek();
});

nextWeek.addEventListener('click', async () => {
    currentWeek++;
    if (currentWeek > 52) {
        currentWeek = 1;
        currentYear++;
    }
    await reloadWeek();
});

async function reloadWeek() {
    updateWeekDisplay();
    planning = [];
    await loadPlanning();
    createCalendar();
    displayPlanning();
}

// ===== RECHERCHE DE RECETTES =====
searchRecipes.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const recipeItems = document.querySelectorAll('.recipe-item');

    recipeItems.forEach(item => {
        const recipeName = item.dataset.recipeName.toLowerCase();
        const recipeTags = item.querySelector('.recipe-tags').textContent.toLowerCase();

        if (recipeName.includes(searchTerm) || recipeTags.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// ===== UTILS =====
function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
}

function getDateForDay(dayName) {
    // Retourne la date au format YYYY-MM-DD pour le jour de la semaine courante
    const today = new Date();
    const currentDay = today.getDay(); // 0 = dimanche
    const dayIndex = DAYS.indexOf(dayName);

    // Calculer la différence (lundi = 0 dans DAYS, mais lundi = 1 dans getDay)
    const diff = (dayIndex + 1) - currentDay;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    return targetDate.toISOString().split('T')[0];
}

function setupEventListeners() {
    // Déjà fait dans le code ci-dessus
}

// ===== GESTION DES ONGLETS =====
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Retirer l'active de tous les boutons et contenus
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activer le bouton et contenu sélectionné
            btn.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });
}

// ===== LISTE DE COURSES =====

// Générer la liste de courses
generateListBtn.addEventListener('click', () => {
    generateShoppingList();
});

function generateShoppingList() {
    shoppingList = [];

    // Parcourir tous les repas planifiés de la semaine
    planning.forEach(item => {
        if (item.recipe && item.recipe.length > 0) {
            const recipeId = item.recipe[0];
            const recipe = recipes.find(r => r.id === recipeId);

            if (recipe && recipe.ingredients) {
                // Parser les ingrédients (JSON ou texte brut)
                const ingredients = parseIngredients(recipe.ingredients, recipe.name);
                ingredients.forEach(ing => {
                    shoppingList.push({
                        ...ing,
                        recipeId: recipe.id,
                        recipeName: recipe.name,
                        day: item.day,
                        meal: item.meal
                    });
                });
            }
        }
    });

    // Regrouper les ingrédients identiques
    shoppingList = groupIngredients(shoppingList);

    // Afficher la liste
    displayShoppingList();
}

// Parser les ingrédients (JSON ou texte)
function parseIngredients(ingredientsData, recipeName) {
    const ingredients = [];

    // Essayer de parser comme JSON d'abord
    try {
        if (typeof ingredientsData === 'string' && ingredientsData.trim().startsWith('[')) {
            const parsed = JSON.parse(ingredientsData);
            return parsed.map(ing => ({
                name: ing.ingredient || ing.nom || ing.name || 'Ingrédient inconnu',
                quantity: parseFloat(ing.quantity || ing.quantite || 0),
                unit: ing.unit || ing.unite || ''
            }));
        }
    } catch (e) {
        // Pas du JSON valide, on continue
    }

    // Sinon, parser comme texte brut (ligne par ligne)
    if (typeof ingredientsData === 'string') {
        const lines = ingredientsData.split('\n').filter(l => l.trim());
        lines.forEach(line => {
            // Essayer d'extraire quantité, unité et nom
            // Format attendu : "200g de farine" ou "2 oeufs" ou "sel"
            const match = line.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Zéè]+)?\s+(?:de\s+)?(.+)$/i);
            if (match) {
                ingredients.push({
                    name: match[3].trim(),
                    quantity: parseFloat(match[1]),
                    unit: match[2] || ''
                });
            } else {
                // Pas de quantité détectée, ajouter tel quel
                ingredients.push({
                    name: line.trim(),
                    quantity: 0,
                    unit: ''
                });
            }
        });
    }

    return ingredients;
}

// Regrouper les ingrédients identiques et additionner les quantités
function groupIngredients(list) {
    const grouped = {};

    list.forEach(item => {
        const key = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`;

        if (grouped[key]) {
            grouped[key].quantity += item.quantity;
            grouped[key].recipes.push({
                name: item.recipeName,
                day: item.day,
                meal: item.meal
            });
        } else {
            grouped[key] = {
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: categorizeIngredient(item.name),
                recipes: [{
                    name: item.recipeName,
                    day: item.day,
                    meal: item.meal
                }]
            };
        }
    });

    return Object.values(grouped);
}

// Catégoriser automatiquement un ingrédient
function categorizeIngredient(name) {
    const nameLower = name.toLowerCase();

    // Fruits et légumes
    if (nameLower.match(/(tomate|carotte|salade|oignon|ail|poivron|courgette|aubergine|pomme|banane|orange|citron|fraise|raisin|concombre|haricot|petit pois|épinard|brocoli)/)) {
        return 'Fruits & Légumes';
    }

    // Viandes et poissons
    if (nameLower.match(/(poulet|boeuf|porc|agneau|veau|dinde|canard|saumon|thon|cabillaud|crevette|jambon|steak|escalope|filet)/)) {
        return 'Viandes & Poissons';
    }

    // Produits laitiers
    if (nameLower.match(/(lait|fromage|yaourt|crème|beurre|œuf|oeuf)/)) {
        return 'Produits laitiers';
    }

    // Féculents
    if (nameLower.match(/(pain|pâte|riz|pomme de terre|farine|semoule|quinoa|blé|pates)/)) {
        return 'Féculents';
    }

    // Épices et condiments
    if (nameLower.match(/(sel|poivre|huile|vinaigre|moutarde|mayonnaise|ketchup|sauce|épice|herbe|basilic|thym|persil|coriandre)/)) {
        return 'Épices & Condiments';
    }

    return 'Autres';
}

// Afficher la liste de courses
function displayShoppingList() {
    if (shoppingList.length === 0) {
        shoppingContent.innerHTML = '<p class="empty-shopping">Aucun repas planifié pour cette semaine.</p>';
        return;
    }

    // Regrouper par catégorie
    const byCategory = {};
    shoppingList.forEach(item => {
        if (!byCategory[item.category]) {
            byCategory[item.category] = [];
        }
        byCategory[item.category].push(item);
    });

    // Générer le HTML
    let html = '<div class="shopping-list">';

    Object.keys(byCategory).sort().forEach(category => {
        html += `
            <div class="category-section">
                <h3 class="category-title">${category}</h3>
                <div class="ingredients-list">
        `;

        byCategory[category].forEach(item => {
            const quantityText = item.quantity > 0 ? `${item.quantity}${item.unit}` : '';
            html += `
                <div class="ingredient-item" data-name="${item.name}" data-unit="${item.unit}">
                    <div class="ingredient-info">
                        <span class="ingredient-name">${item.name}</span>
                        <span class="ingredient-quantity">${quantityText}</span>
                    </div>
                    <div class="ingredient-actions">
                        <button class="edit-ingredient-btn" title="Modifier">✏️</button>
                        <button class="delete-ingredient-btn" title="Supprimer">🗑️</button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';

    shoppingContent.innerHTML = html;

    // Ajouter les event listeners
    attachShoppingListeners();
}

// Attacher les event listeners pour la liste de courses
function attachShoppingListeners() {
    // Boutons de modification
    document.querySelectorAll('.edit-ingredient-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.ingredient-item');
            editIngredient(item);
        });
    });

    // Boutons de suppression
    document.querySelectorAll('.delete-ingredient-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.ingredient-item');
            deleteIngredient(item);
        });
    });
}

// Modifier un ingrédient (quantité)
function editIngredient(itemElement) {
    const name = itemElement.dataset.name;
    const unit = itemElement.dataset.unit;
    const item = shoppingList.find(i => i.name.toLowerCase() === name.toLowerCase() && i.unit.toLowerCase() === unit.toLowerCase());

    if (!item) return;

    const newQuantity = prompt(`Modifier la quantité pour "${name}" :\n\nQuantité actuelle : ${item.quantity}${item.unit}\n\nExemple : Si vous avez déjà 100g, entrez -100`, item.quantity);

    if (newQuantity !== null) {
        const adjusted = parseFloat(newQuantity);
        if (!isNaN(adjusted)) {
            item.quantity = adjusted;
            if (item.quantity <= 0) {
                // Supprimer si quantité nulle ou négative
                shoppingList = shoppingList.filter(i => i !== item);
            }
            displayShoppingList();
        }
    }
}

// Supprimer un ingrédient
function deleteIngredient(itemElement) {
    const name = itemElement.dataset.name;
    const unit = itemElement.dataset.unit;

    if (confirm(`Supprimer "${name}" de la liste ?`)) {
        shoppingList = shoppingList.filter(i => !(i.name.toLowerCase() === name.toLowerCase() && i.unit.toLowerCase() === unit.toLowerCase()));
        displayShoppingList();
    }
}

// ===== DÉMARRAGE =====
init();
