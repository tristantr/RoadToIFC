const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'communities_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

// Initialisation de la base de données
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Activer PostGIS
    console.log('Activation de l\'extension PostGIS...');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    
    // Créer la table communities avec géographie
    console.log('Création de la table communities...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS communities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        location GEOGRAPHY(Point, 4326) NOT NULL
      )
    `);
    
    // Vérifier si on a déjà des données
    const result = await client.query('SELECT COUNT(*) FROM communities');
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
      console.log('Insertion des données de test...');
      await seedDatabase(client);
      console.log(`Base de données initialisée avec ${seedCommunities.length} communautés.`);
    } else {
      console.log(`Base de données déjà initialisée avec ${count} communautés.`);
    }
    
    client.release();
    console.log('Base de données PostgreSQL + PostGIS prête !');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base :', err);
    process.exit(1);
  }
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

// Fonction pour insérer les données de test
async function seedDatabase(client) {
  for (const community of seedCommunities) {
    await client.query(
      'INSERT INTO communities (name, city, country, location) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::GEOGRAPHY)',
      [community.name, community.city, community.country, community.lon, community.lat]
    );
  }
}

// GET /api/communities - Obtenir toutes les communautés
app.get('/api/communities', async (req, res) => {
  console.log('GET /api/communities appelé');
  
  try {
    const result = await pool.query(`
      SELECT id, name, city, country, 
             ST_Y(location::geometry) as lat, 
             ST_X(location::geometry) as lon
      FROM communities 
      ORDER BY id
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des communautés:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/communities - Créer une nouvelle communauté
app.post('/api/communities', async (req, res) => {
  console.log('POST /api/communities appelé:', req.body);
  
  const { name, city, country, lat, lon } = req.body;
  
  if (!name || !city || !country || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO communities (name, city, country, location) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::GEOGRAPHY) RETURNING id',
      [name, city, country, lon, lat]
    );
    
    res.status(201).json({
      id: result.rows[0].id,
      name,
      city,
      country,
      lat,
      lon
    });
  } catch (err) {
    console.error('Erreur lors de la création de la communauté:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la communauté' });
  }
});

// GET /api/communities/near - Chercher des communautés à proximité
app.get('/api/communities/near', async (req, res) => {
  console.log('GET /api/communities/near appelé:', req.query);
  
  const { lat, lon, radiusKm = 30 } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude et longitude sont requises' });
  }
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const radius = parseFloat(radiusKm);
  
  if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    return res.status(400).json({ error: 'Paramètres numériques invalides' });
  }
  
  try {
    const result = await pool.query(`
      SELECT id, name, city, country,
             ST_Y(location::geometry) as lat,
             ST_X(location::geometry) as lon,
             ST_DistanceSphere(location, ST_MakePoint($2, $1)) / 1000 AS distance_km
      FROM communities
      WHERE ST_DWithin(location, ST_MakePoint($2, $1)::GEOGRAPHY, $3 * 1000)
      ORDER BY distance_km ASC
    `, [latitude, longitude, radius]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la recherche de proximité:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Proxy Nominatim pour éviter les problèmes CORS
app.get('/api/nominatim', async (req, res) => {
  console.log('GET /api/nominatim appelé:', req.query);
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Paramètre q (query) requis' });
  }

  try {
    const https = require('https'); // Using https module for Node.js 16 compatibility
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&accept-language=fr&countrycodes=fr&q=${encodeURIComponent(q)}`;
    console.log('Requête Nominatim:', url);

    const rawData = await new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'RoadToIFC-App/1.0 (contact@example.com)'
        }
      }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(body)); } catch (err) { reject(new Error('Erreur parsing JSON: ' + err.message)); }
        });
      });
      req.on('error', (err) => { reject(new Error('Erreur requête: ' + err.message)); });
      req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout requête Nominatim')); });
    });

    console.log(`Nominatim retourne ${rawData.length} résultats bruts`);
    
    // Debug: display all raw results
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

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all handler pour servir index.html pour toutes les routes non-API
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint API non trouvé' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\nArrêt du serveur...');
  try {
    await pool.end();
    console.log('Connexions PostgreSQL fermées.');
  } catch (err) {
    console.error('Erreur lors de la fermeture:', err);
  }
  process.exit(0);
});

// Démarrage du serveur
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log('🏘️ Application Communautés Locales avec PostgreSQL + PostGIS');
    console.log(`📍 Accès: http://localhost:${PORT}`);
  });
});
