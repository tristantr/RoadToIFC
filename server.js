const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialisation de la base de données
const db = new sqlite3.Database('communities.db');

// Création de la table communities si elle n'existe pas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL
  )`);
});

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

// Données de test
const seedCommunities = [
  { name: "Club des Stratèges", city: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
  { name: "Team RocketFoot", city: "Lyon", country: "FR", lat: 45.7640, lon: 4.8357 },
  { name: "Les Rois du Smash", city: "Marseille", country: "FR", lat: 43.2965, lon: 5.3698 },
  { name: "BlitzSociety", city: "Toulouse", country: "FR", lat: 43.6045, lon: 1.4440 },
  { name: "Les As du Panier", city: "Bordeaux", country: "FR", lat: 44.8378, lon: -0.5792 },
  { name: "Gardiens des Buts", city: "Lille", country: "FR", lat: 50.6292, lon: 3.0573 },
  { name: "Escrime Élite", city: "Nantes", country: "FR", lat: 47.2184, lon: -1.5536 },
  { name: "Les Cavaliers du Roi", city: "Strasbourg", country: "FR", lat: 48.5734, lon: 7.7521 },
  { name: "Volley Titans", city: "Montpellier", country: "FR", lat: 43.6119, lon: 3.8777 },
  { name: "Rugby Lions", city: "Nice", country: "FR", lat: 43.7102, lon: 7.2620 },
  { name: "Karting Fury", city: "Rennes", country: "FR", lat: 48.1173, lon: -1.6778 },
  { name: "Gladiateurs de la Neige", city: "Grenoble", country: "FR", lat: 45.1885, lon: 5.7245 },
  { name: "Pionniers de l'Échiquier", city: "Reims", country: "FR", lat: 49.2583, lon: 4.0317 },
  { name: "Les Maîtres de la Balle", city: "Dijon", country: "FR", lat: 47.3220, lon: 5.0415 },
  { name: "Angers Warriors", city: "Angers", country: "FR", lat: 47.4784, lon: -0.5632 },
  { name: "Clermont Eagles", city: "Clermont-Ferrand", country: "FR", lat: 45.7772, lon: 3.0870 },
  { name: "Sainté Futbol Club", city: "Saint-Étienne", country: "FR", lat: 45.4397, lon: 4.3872 },
  { name: "Toulon Mariners", city: "Toulon", country: "FR", lat: 43.1242, lon: 5.9280 },
  { name: "Le Havre Vikings", city: "Le Havre", country: "FR", lat: 49.4944, lon: 0.1079 },
  { name: "Metz Blasters", city: "Metz", country: "FR", lat: 49.1193, lon: 6.1757 }
];

// Fonction pour initialiser les données de test
function initializeSeedData() {
  db.get("SELECT COUNT(*) as count FROM communities", (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des données:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Initialisation des données de test...');
      const stmt = db.prepare("INSERT INTO communities (name, city, country, lat, lon) VALUES (?, ?, ?, ?, ?)");
      
      seedCommunities.forEach(community => {
        stmt.run([community.name, community.city, community.country, community.lat, community.lon]);
      });
      
      stmt.finalize();
      console.log('20 communautés de test ajoutées avec succès!');
    } else {
      console.log(`Base de données déjà initialisée avec ${row.count} communautés.`);
    }
  });
}

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API

// GET /api/nominatim - Proxy pour l'API Nominatim (éviter CORS)
app.get('/api/nominatim', async (req, res) => {
  console.log('GET /api/nominatim appelé:', req.query);
  
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Paramètre q (query) requis' });
  }
  
  try {
    const https = require('https');
    // Prioriser la France avec countrycodes=fr sans ajouter "France" à la recherche
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&accept-language=fr&countrycodes=fr&q=${encodeURIComponent(q)}`;
    
    console.log('Requête Nominatim:', url);
    
    // Promisifier la requête https
    const rawData = await new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'RoadToIFC-App/1.0 (contact@example.com)'
        }
      }, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (err) {
            reject(new Error('Erreur parsing JSON: ' + err.message));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(new Error('Erreur requête: ' + err.message));
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout requête Nominatim'));
      });
    });
    
    console.log(`Nominatim retourne ${rawData.length} résultats bruts`);
    
    // Debug : afficher tous les résultats
    rawData.forEach((place, index) => {
      console.log(`${index}: ${place.display_name} - Type: ${place.type} - Classe: ${place.class}`);
    });
    
    // Filtrer pour ne garder que les lieux pertinents (villes, villages, etc.)
    const filteredData = rawData.filter(place => {
      const isRelevantPlace = 
        place.type === 'city' ||
        place.type === 'town' || 
        place.type === 'village' ||
        place.type === 'municipality' ||
        place.type === 'administrative' ||
        (place.class === 'place' && ['city', 'town', 'village', 'municipality'].includes(place.type)) ||
        (place.class === 'boundary' && place.type === 'administrative' && place.place_rank <= 16);
      
      // Exclure les routes, tourisme, etc.
      const isNotExcluded = 
        place.class !== 'highway' &&
        place.class !== 'tourism' &&
        place.class !== 'historic' &&
        place.type !== 'neighbourhood' &&
        place.type !== 'protected_area' &&
        place.type !== 'artwork';
      
      console.log(`${place.display_name} - Pertinent: ${isRelevantPlace} - Non exclu: ${isNotExcluded}`);
      
      return isRelevantPlace && isNotExcluded;
    });
    
    // Supprimer les doublons basés sur le nom et les coordonnées
    const uniqueData = filteredData.filter((place, index, array) => {
      const placeName = place.display_name.split(',')[0].trim();
      return array.findIndex(p => {
        const pName = p.display_name.split(',')[0].trim();
        return pName === placeName && 
               Math.abs(parseFloat(p.lat) - parseFloat(place.lat)) < 0.001 && 
               Math.abs(parseFloat(p.lon) - parseFloat(place.lon)) < 0.001;
      }) === index;
    });
    
    console.log(`${filteredData.length} lieux pertinents trouvés`);
    console.log(`${uniqueData.length} lieux uniques après déduplication`);
    res.json(uniqueData);
  } catch (error) {
    console.error('Erreur proxy Nominatim:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche de villes' });
  }
});

// POST /api/communities - Créer une nouvelle communauté
app.post('/api/communities', (req, res) => {
  console.log('POST /api/communities appelé:', req.body);
  
  const { name, city, country, lat, lon } = req.body;
  
  if (!name || !city || !country || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  const stmt = db.prepare("INSERT INTO communities (name, city, country, lat, lon) VALUES (?, ?, ?, ?, ?)");
  stmt.run([name, city, country, lat, lon], function(err) {
    if (err) {
      console.error('Erreur lors de l\'insertion:', err);
      return res.status(500).json({ error: 'Erreur lors de la création de la communauté' });
    }
    
    res.status(201).json({
      id: this.lastID,
      name,
      city,
      country,
      lat,
      lon
    });
  });
  stmt.finalize();
});

// GET /api/communities/near - Chercher des communautés à proximité
app.get('/api/communities/near', (req, res) => {
  console.log('GET /api/communities/near appelé:', req.query);
  
  const { lat, lon, radiusKm = 30 } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude et longitude sont requises' });
  }
  
  const searchLat = parseFloat(lat);
  const searchLon = parseFloat(lon);
  const radius = parseFloat(radiusKm);
  
  db.all("SELECT * FROM communities", (err, rows) => {
    if (err) {
      console.error('Erreur lors de la recherche:', err);
      return res.status(500).json({ error: 'Erreur lors de la recherche' });
    }
    
    // Calculer la distance pour chaque communauté et filtrer
    const nearbyCommunities = rows
      .map(community => ({
        ...community,
        distance: haversine(searchLat, searchLon, community.lat, community.lon)
      }))
      .filter(community => community.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyCommunities);
  });
});

// GET /api/communities - Obtenir toutes les communautés
app.get('/api/communities', (req, res) => {
  console.log('GET /api/communities appelé');
  
  db.all("SELECT * FROM communities", (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des communautés' });
    }
    
    res.json(rows);
  });
});

// Route pour la page d'accueil (catch-all)
app.get('*', (req, res) => {
  // Ne pas intercepter les routes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route API non trouvée' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  
  // Initialiser les données de test
  setTimeout(() => {
    initializeSeedData();
  }, 1000);
});

// Gestion de la fermeture propre de la base de données
process.on('SIGINT', () => {
  console.log('\nFermeture de la base de données...');
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base:', err);
    } else {
      console.log('Base de données fermée.');
    }
    process.exit(0);
  });
});
