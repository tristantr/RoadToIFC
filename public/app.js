// Fonction Haversine pour calculer la distance entre deux points
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // distance en km
}

// Variables globales pour stocker l'état
let selectedCreateCity = null;
let selectedSearchCity = null;
let searchTimeout = null;

// API Nominatim via notre proxy (évite les problèmes CORS)
const NOMINATIM_API = '/api/nominatim';

// Fonction pour rechercher des villes via Nominatim
async function searchCities(query) {
    console.log('🔍 Recherche pour:', query);
    
    if (!query || query.length < 3) {
        console.log('❌ Requête trop courte:', query);
        return [];
    }

    try {
        const url = `${NOMINATIM_API}?q=${encodeURIComponent(query)}`;
        console.log('🌐 URL Nominatim:', url);
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erreur lors de la recherche de villes');
        }

        const data = await response.json();
        console.log('📊 Données brutes Nominatim:', data);
        
        // Le serveur fait déjà le filtrage, on prend tous les résultats
        const cities = data;

        console.log('🏙️ Villes filtrées:', cities);

        // Formater les suggestions
        const formatted = cities.map(place => {
            const parts = place.display_name.split(',').map(p => p.trim());
            const cityName = parts[0]; // Premier élément = nom de la ville
            
            // Extraire département, région, pays des derniers éléments
            const country = place.address?.country || 'France';
            const region = place.address?.state || parts[parts.length - 3] || '';
            const department = place.address?.county || place.address?.state_district || parts[parts.length - 4] || '';
            
            // Construire l'affichage simplifié
            let displayParts = [cityName];
            if (department && department !== region) displayParts.push(department);
            if (region) displayParts.push(region);
            if (country) displayParts.push(country);
            
            return {
                id: place.place_id,
                name: cityName,
                fullName: displayParts.join(', '),
                country: country,
                countryCode: place.address?.country_code?.toUpperCase() || 'FR',
                lat: parseFloat(place.lat),
                lon: parseFloat(place.lon)
            };
        });
        
        // Supprimer les doublons basés sur le nom de ville et les coordonnées
        const uniqueCities = formatted.filter((city, index, array) => {
            return array.findIndex(c => 
                c.name === city.name && 
                Math.abs(c.lat - city.lat) < 0.001 && 
                Math.abs(c.lon - city.lon) < 0.001
            ) === index;
        });
        
        console.log('✨ Suggestions formatées (uniques):', uniqueCities);
        return uniqueCities;
    } catch (error) {
        console.error('❌ Erreur de recherche Nominatim:', error);
        return [];
    }
}

// Fonction pour afficher les suggestions
function showSuggestions(suggestions, containerId, loadingId, selectCallback) {
    console.log('📋 Affichage des suggestions:', suggestions, 'dans', containerId);
    
    const container = document.getElementById(containerId);
    const loading = document.getElementById(loadingId);
    
    loading.classList.add('hidden');
    
    if (suggestions.length === 0) {
        console.log('❌ Aucune suggestion à afficher');
        container.classList.add('hidden');
        return;
    }

    container.innerHTML = suggestions.map(city => `
        <div class="suggestion-item" data-city='${JSON.stringify(city)}'>
            <div class="suggestion-name">${city.name}</div>
            <div class="suggestion-full">${city.fullName}</div>
        </div>
    `).join('');

    console.log('✅ HTML des suggestions généré');

    // Ajouter les événements de clic
    container.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const city = JSON.parse(item.dataset.city);
            console.log('🖱️ Ville sélectionnée:', city);
            selectCallback(city);
        });
    });

    container.classList.remove('hidden');
    console.log('👁️ Suggestions affichées');
}

// Fonction pour masquer les suggestions
function hideSuggestions(containerId) {
    document.getElementById(containerId).classList.add('hidden');
}

// Fonction pour gérer l'autocomplétion
function setupAutocomplete(inputId, suggestionsId, loadingId, selectCallback) {
    const input = document.getElementById(inputId);
    console.log('🎛️ Configuration autocomplétion pour:', inputId);
    
    input.addEventListener('input', async (e) => {
        const query = e.target.value;
        console.log('⌨️ Saisie utilisateur:', query, 'dans', inputId);
        
        // Annuler la recherche précédente
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            console.log('⏰ Timeout précédent annulé');
        }
        
        if (query.length < 3) {
            console.log('📏 Requête trop courte, masquer suggestions');
            hideSuggestions(suggestionsId);
            return;
        }

        console.log('⏳ Affichage du loading...');
        // Afficher le loading
        document.getElementById(loadingId).classList.remove('hidden');
        
        // Délai pour éviter trop de requêtes
        console.log('⏰ Démarrage du timeout de 300ms');
        searchTimeout = setTimeout(async () => {
            console.log('🚀 Exécution de la recherche après timeout');
            const suggestions = await searchCities(query);
            showSuggestions(suggestions, suggestionsId, loadingId, selectCallback);
        }, 300);
    });

    // Masquer les suggestions quand on clique ailleurs
    input.addEventListener('blur', () => {
        setTimeout(() => hideSuggestions(suggestionsId), 200);
    });

    input.addEventListener('focus', () => {
        if (input.value.length >= 3) {
            document.getElementById(suggestionsId).classList.remove('hidden');
        }
    });
}

// Fonction pour sélectionner une ville (création)
function selectCreateCity(city) {
    selectedCreateCity = city;
    document.getElementById('city').value = city.name;
    hideSuggestions('citySuggestions');
    
    const selectedDiv = document.getElementById('selectedCity');
    selectedDiv.innerHTML = `
        <strong>Ville sélectionnée :</strong> ${city.name}, ${city.country}
        <br />
        <small>Coordonnées : ${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}</small>
    `;
    selectedDiv.classList.remove('hidden');
}

// Fonction pour sélectionner une ville (recherche)
function selectSearchCity(city) {
    selectedSearchCity = city;
    document.getElementById('searchCity').value = city.name;
    hideSuggestions('searchCitySuggestions');
    
    const selectedDiv = document.getElementById('selectedSearchCity');
    const radius = document.getElementById('radius').value;
    selectedDiv.innerHTML = `
        <strong>Recherche autour de :</strong> ${city.name}, ${city.country}
        <br />
        <small>Rayon : ${radius} km</small>
    `;
    selectedDiv.classList.remove('hidden');
    
    // Déclencher la recherche automatiquement
    searchNearby();
}

// Fonction pour afficher un message
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.classList.remove('hidden');
    
    // Masquer le message après 5 secondes pour les succès
    if (type === 'success') {
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }
}

// Fonction pour créer une communauté
async function createCommunity(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const btn = document.getElementById('createBtn');
    
    if (!name) {
        showMessage('createMessage', 'Le nom de la communauté est requis', 'error');
        return;
    }
    
    if (!selectedCreateCity) {
        showMessage('createMessage', 'Veuillez sélectionner une ville dans la liste', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Création...';

    try {
        const response = await fetch('/api/communities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                city: selectedCreateCity.name,
                country: selectedCreateCity.countryCode,
                lat: selectedCreateCity.lat,
                lon: selectedCreateCity.lon
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de la communauté');
        }

        const newCommunity = await response.json();
        
        showMessage('createMessage', 'Communauté créée avec succès !', 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('createForm').reset();
        selectedCreateCity = null;
        document.getElementById('selectedCity').classList.add('hidden');
        
        // Mettre à jour la recherche si une ville est sélectionnée
        if (selectedSearchCity) {
            searchNearby();
        }
        
    } catch (error) {
        showMessage('createMessage', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Créer la communauté';
    }
}

// Fonction pour rechercher des communautés à proximité
async function searchNearby() {
    if (!selectedSearchCity) {
        return;
    }

    const radius = document.getElementById('radius').value;
    const loading = document.getElementById('searchLoading');
    const error = document.getElementById('searchError');
    const noResults = document.getElementById('noResults');
    const results = document.getElementById('results');

    // Masquer tous les éléments de résultat
    [error, noResults, results].forEach(el => el.classList.add('hidden'));
    loading.classList.remove('hidden');

    try {
        const response = await fetch(
            `/api/communities/near?lat=${selectedSearchCity.lat}&lon=${selectedSearchCity.lon}&radiusKm=${radius}`
        );

        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des communautés');
        }

        const communities = await response.json();
        
        loading.classList.add('hidden');
        
        if (communities.length === 0) {
            noResults.innerHTML = `
                Aucune communauté trouvée dans un rayon de ${radius} km autour de ${selectedSearchCity.name}.
            `;
            noResults.classList.remove('hidden');
            return;
        }

        // Calculer les distances côté frontend pour l'affichage
        const communitiesWithDistance = communities.map(community => ({
            ...community,
            displayDistance: haversine(selectedSearchCity.lat, selectedSearchCity.lon, community.lat, community.lon)
        }));

        // Afficher les résultats
        document.getElementById('resultsTitle').textContent = `Communautés trouvées (${communities.length})`;
        
        const listContainer = document.getElementById('communitiesList');
        listContainer.innerHTML = communitiesWithDistance.map(community => `
            <div class="community-item">
                <div class="community-header">
                    <h4>${community.name}</h4>
                    <span class="distance">
                        ${community.displayDistance.toFixed(1)} km
                    </span>
                </div>
                <div class="community-location">
                    📍 ${community.city}, ${community.country}
                </div>
                <div class="community-coords">
                    <small>
                        Coordonnées : ${community.lat.toFixed(4)}, ${community.lon.toFixed(4)}
                    </small>
                </div>
            </div>
        `).join('');

        results.classList.remove('hidden');
        
    } catch (err) {
        loading.classList.add('hidden');
        error.textContent = err.message;
        error.classList.remove('hidden');
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation de l\'application...');
    
    // Configuration de l'autocomplétion pour la création
    console.log('🏗️ Configuration autocomplétion création...');
    setupAutocomplete('city', 'citySuggestions', 'cityLoading', selectCreateCity);
    
    // Configuration de l'autocomplétion pour la recherche
    console.log('🔍 Configuration autocomplétion recherche...');
    setupAutocomplete('searchCity', 'searchCitySuggestions', 'searchCityLoading', selectSearchCity);
    
    // Gestion du formulaire de création
    document.getElementById('createForm').addEventListener('submit', createCommunity);
    
    // Gestion du slider de rayon - mise à jour temps réel
    const radiusSlider = document.getElementById('radius');
    const radiusValue = document.getElementById('radiusValue');
    
    // Mise à jour de l'affichage de la valeur en temps réel
    radiusSlider.addEventListener('input', () => {
        radiusValue.textContent = radiusSlider.value;
        
        if (selectedSearchCity) {
            // Mettre à jour l'affichage du rayon sélectionné
            const selectedDiv = document.getElementById('selectedSearchCity');
            selectedDiv.innerHTML = `
                <strong>Recherche autour de :</strong> ${selectedSearchCity.name}, ${selectedSearchCity.country}
                <br />
                <small>Rayon : ${radiusSlider.value} km</small>
            `;
        }
    });
    
    // Recherche automatique quand on relâche le slider
    radiusSlider.addEventListener('change', () => {
        if (selectedSearchCity) {
            searchNearby();
        }
    });
    
    // Réinitialiser la sélection de ville quand on tape dans le champ
    document.getElementById('city').addEventListener('input', () => {
        selectedCreateCity = null;
        document.getElementById('selectedCity').classList.add('hidden');
    });
    
    document.getElementById('searchCity').addEventListener('input', () => {
        selectedSearchCity = null;
        document.getElementById('selectedSearchCity').classList.add('hidden');
        // Masquer les résultats
        ['searchError', 'noResults', 'results'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
    });
});

console.log('🏘️ Application Communautés Locales chargée!');
