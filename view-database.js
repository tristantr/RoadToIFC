#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();

console.log('🗄️  VISUALISATION DE LA BASE DE DONNÉES');
console.log('==========================================\n');

const db = new sqlite3.Database('./communities.db', (err) => {
  if (err) {
    console.error('❌ Erreur ouverture base:', err.message);
    return;
  }
  console.log('✅ Connexion à la base SQLite réussie\n');
});

// Statistiques générales
db.get(`SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT city) as cities,
  COUNT(DISTINCT country) as countries,
  MIN(lat) as min_lat, MAX(lat) as max_lat,
  MIN(lon) as min_lon, MAX(lon) as max_lon
FROM communities`, (err, stats) => {
  if (err) {
    console.error('❌ Erreur stats:', err);
    return;
  }
  
  console.log('📊 STATISTIQUES GÉNÉRALES');
  console.log('─'.repeat(25));
  console.log(`📍 Total communautés: ${stats.total}`);
  console.log(`🏙️  Villes uniques: ${stats.cities}`);
  console.log(`🌍 Pays: ${stats.countries}`);
  console.log(`📐 Latitude: ${stats.min_lat.toFixed(2)} → ${stats.max_lat.toFixed(2)}`);
  console.log(`📐 Longitude: ${stats.min_lon.toFixed(2)} → ${stats.max_lon.toFixed(2)}\n`);
});

// Répartition par pays
db.all(`SELECT country, COUNT(*) as count 
        FROM communities 
        GROUP BY country 
        ORDER BY count DESC`, (err, countries) => {
  if (err) {
    console.error('❌ Erreur pays:', err);
    return;
  }
  
  console.log('🌍 RÉPARTITION PAR PAYS');
  console.log('─'.repeat(22));
  countries.forEach(c => {
    const flag = c.country === 'FR' ? '🇫🇷' : c.country === 'IN' ? '🇮🇳' : '🏳️';
    console.log(`${flag} ${c.country}: ${c.count} communautés`);
  });
  console.log();
});

// Top 10 des villes
db.all(`SELECT city, COUNT(*) as count, country
        FROM communities 
        GROUP BY city, country
        HAVING count > 1
        ORDER BY count DESC, city`, (err, cities) => {
  if (err) {
    console.error('❌ Erreur villes:', err);
    return;
  }
  
  if (cities.length > 0) {
    console.log('🏙️  VILLES AVEC PLUSIEURS COMMUNAUTÉS');
    console.log('─'.repeat(35));
    cities.forEach((c, i) => {
      console.log(`${i + 1}. ${c.city} (${c.country}): ${c.count} communautés`);
    });
    console.log();
  }
});

// Liste complète des communautés
db.all(`SELECT id, name, city, country, 
        ROUND(lat, 4) as lat, ROUND(lon, 4) as lon
        FROM communities 
        ORDER BY country, city, name`, (err, communities) => {
  if (err) {
    console.error('❌ Erreur communautés:', err);
    return;
  }
  
  console.log('📋 LISTE COMPLÈTE DES COMMUNAUTÉS');
  console.log('─'.repeat(35));
  console.log('ID | Nom                     | Ville            | Pays | Coordonnées');
  console.log('─'.repeat(75));
  
  communities.forEach(c => {
    const name = c.name.length > 23 ? c.name.substring(0, 20) + '...' : c.name;
    const city = c.city.length > 16 ? c.city.substring(0, 13) + '...' : c.city;
    console.log(`${c.id.toString().padStart(2)} | ${name.padEnd(23)} | ${city.padEnd(16)} | ${c.country}   | ${c.lat},${c.lon}`);
  });
  
  console.log('\n✨ Visualisation terminée !');
  db.close();
});
