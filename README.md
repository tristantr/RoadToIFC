# 🏘️ Communautés Locales

Une application web pour créer et découvrir des communautés près de chez vous.

## 🚀 Fonctionnalités

- **Créer une communauté** : Ajoutez une nouvelle communauté en renseignant un nom et une ville (avec autocomplétion Nominatim)
- **Rechercher des communautés** : Trouvez toutes les communautés autour d'une ville donnée dans un rayon personnalisable
- **Données de test** : 20 communautés fictives réparties dans différentes villes françaises
- **Interface responsive** : Design adaptatif pour mobile et desktop

## 🛠️ Technologies utilisées

### Backend
- **Node.js** + **Express** : Serveur API REST
- **PostgreSQL** + **PostGIS** : Base de données géospatiale professionnelle
- **CORS** : Gestion des requêtes cross-origin

### Frontend
- **HTML5** + **CSS3** + **JavaScript vanilla** : Interface utilisateur moderne et légère
- **CSS3** : Styles personnalisés avec animations et design responsive
- **API Nominatim** : Autocomplétion des villes

## 📦 Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm
- PostgreSQL + PostGIS

### 1. Installation de PostgreSQL (si nécessaire)

```bash
# Installation automatique (macOS/Linux)
npm run install:pg

# Ou suivez le guide détaillé
voir POSTGRESQL_SETUP.md
```

### 2. Installation des dépendances Node.js

```bash
# Installation des dépendances
npm install

# Test de PostgreSQL
npm run test:pg
```

### 3. Démarrage de l'application

#### Démarrage automatique (recommandé)

```bash
./start.sh
```

#### Ou démarrage manuel

```bash
npm start
```

### 4. Accès à l'application

- **Application complète** : http://localhost:3001
- **API Backend** : http://localhost:3001/api/

## 🗄️ Structure de la base de données PostgreSQL

### Table `communities`
- `id` (SERIAL PRIMARY KEY)
- `name` (TEXT) - Nom de la communauté
- `city` (TEXT) - Ville
- `country` (TEXT) - Code pays (ex: FR)
- `location` (GEOGRAPHY(Point, 4326)) - Coordonnées GPS avec PostGIS

## 🔌 API Endpoints

### `POST /api/communities`
Créer une nouvelle communauté

**Corps de la requête :**
```json
{
  "name": "Club des Stratèges",
  "city": "Paris",
  "country": "FR",
  "lat": 48.8566,
  "lon": 2.3522
}
```

### `GET /api/communities/near`
Rechercher des communautés à proximité

**Paramètres :**
- `lat` : Latitude de recherche
- `lon` : Longitude de recherche
- `radiusKm` : Rayon en kilomètres (défaut: 30)

**Exemple :** `/api/communities/near?lat=48.8566&lon=2.3522&radiusKm=50`

### `GET /api/communities`
Obtenir toutes les communautés (debug)

## 🧮 Calcul de distance

L'application utilise la **formule Haversine** pour calculer les distances entre les points géographiques :

```javascript
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
```

## 🎯 Données de test

Au démarrage, l'application initialise automatiquement 20 communautés fictives dans diverses villes françaises :

- Club des Stratèges (Paris)
- Team RocketFoot (Lyon)
- Les Rois du Smash (Marseille)
- BlitzSociety (Toulouse)
- Et 16 autres...

## 🌐 API Externe utilisée

**Nominatim OpenStreetMap** : https://nominatim.openstreetmap.org/
- Autocomplétion des villes
- Récupération des coordonnées GPS
- Filtrage par type de lieu (city, town, village)

## 📱 Fonctionnement de l'interface

### Section Création
1. Saisissez le nom de votre communauté
2. Tapez le nom d'une ville (autocomplétion après 3 caractères)
3. Sélectionnez une ville dans la liste
4. Cliquez sur "Créer la communauté"

### Section Recherche
1. Tapez le nom d'une ville de référence
2. Sélectionnez une ville dans la liste d'autocomplétion
3. Ajustez le rayon de recherche (10-100 km)
4. Les résultats s'affichent automatiquement triés par distance

## 🚀 Scripts disponibles

```bash
npm start              # Démarrer l'application
npm run dev            # Démarrer en mode développement (avec nodemon)
./start.sh             # Script de démarrage automatique
./clean.sh             # Nettoyer les processus en cas de conflit de port
```

## 📦 Production

L'application est prête pour la production dès le démarrage. Les fichiers statiques sont servis directement par Express.

## 🔧 Dépannage

### Erreur "EADDRINUSE: address already in use :::3001"

Si vous obtenez cette erreur, cela signifie que le port 3001 est déjà utilisé par un autre processus :

```bash
# Solution rapide
./clean.sh

# Ou manuellement
pkill -f "node server.js"
pkill -f "nodemon"
npm start
```

### L'application ne démarre pas

1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que le port 3001 est libre : `lsof -ti:3001`
3. Réinstallez les dépendances : `rm -rf node_modules && npm install`

## 🤝 Contribution

N'hésitez pas à contribuer en créant des issues ou des pull requests !

## 📄 Licence

MIT
