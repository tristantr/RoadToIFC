const { Pool } = require('pg');

// Configuration PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'communities_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

async function testPostgreSQL() {
  console.log('🐘 Test de connexion PostgreSQL + PostGIS');
  console.log('=============================================');
  
  try {
    // Test de connexion
    console.log('1️⃣ Test de connexion...');
    const client = await pool.connect();
    console.log('   ✅ Connexion PostgreSQL réussie');
    
    // Test PostGIS
    console.log('2️⃣ Test de l\'extension PostGIS...');
    const postgisResult = await client.query('SELECT PostGIS_Version()');
    console.log(`   ✅ PostGIS installé: ${postgisResult.rows[0].postgis_version}`);
    
    // Test de création de table
    console.log('3️⃣ Test de création de table...');
    await client.query(`
      DROP TABLE IF EXISTS test_communities;
      CREATE TABLE test_communities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location GEOGRAPHY(Point, 4326) NOT NULL
      )
    `);
    console.log('   ✅ Table de test créée');
    
    // Test d'insertion avec géolocalisation
    console.log('4️⃣ Test d\'insertion avec géolocalisation...');
    await client.query(
      'INSERT INTO test_communities (name, location) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::GEOGRAPHY)',
      ['Test Paris', 2.3522, 48.8566]
    );
    await client.query(
      'INSERT INTO test_communities (name, location) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::GEOGRAPHY)',
      ['Test Lyon', 4.8357, 45.7640]
    );
    console.log('   ✅ Insertion avec coordonnées GPS réussie');
    
    // Test de requête spatiale
    console.log('5️⃣ Test de requête spatiale...');
    const spatialResult = await client.query(`
      SELECT name,
             ST_Y(location::geometry) as lat,
             ST_X(location::geometry) as lon,
             ST_DistanceSphere(location, ST_MakePoint(2.3522, 48.8566)) / 1000 AS distance_km
      FROM test_communities
      WHERE ST_DWithin(location, ST_MakePoint(2.3522, 48.8566)::GEOGRAPHY, 500 * 1000)
      ORDER BY distance_km ASC
    `);
    
    console.log('   ✅ Requête spatiale réussie:');
    spatialResult.rows.forEach(row => {
      console.log(`     - ${row.name}: ${row.distance_km.toFixed(1)} km de Paris`);
    });
    
    // Nettoyage
    console.log('6️⃣ Nettoyage...');
    await client.query('DROP TABLE test_communities');
    console.log('   ✅ Table de test supprimée');
    
    client.release();
    
    console.log('');
    console.log('🎉 TOUS LES TESTS POSTGRESQL + POSTGIS RÉUSSIS !');
    console.log('');
    console.log('🚀 Vous pouvez maintenant lancer l\'application:');
    console.log('   npm start');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('');
    console.log('🔧 Solutions possibles:');
    console.log('1. Installer PostgreSQL: ./install-postgresql.sh');
    console.log('2. Vérifier que PostgreSQL fonctionne: pg_isready');
    console.log('3. Créer la base: createdb communities_db');
    console.log('4. Activer PostGIS: psql -d communities_db -c "CREATE EXTENSION postgis;"');
    console.log('');
    console.log('📖 Documentation: ./POSTGRESQL_SETUP.md');
  } finally {
    await pool.end();
  }
}

// Exécuter le test
testPostgreSQL();
