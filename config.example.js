// Configuration PostgreSQL - Copiez ce fichier vers config.js et adaptez les valeurs
module.exports = {
  database: {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'communities_db',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT || 5432,
  },
  server: {
    port: process.env.PORT || 3001
  }
};
