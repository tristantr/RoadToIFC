# 🐘 Configuration PostgreSQL + PostGIS

## 📋 Prérequis

### 1. Installation PostgreSQL
```bash
# macOS (avec Homebrew)
brew install postgresql postgis

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib postgis

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

### 2. Démarrage des services
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🗄️ Configuration de la base de données

### 1. Créer la base de données
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE communities_db;

# Se connecter à la nouvelle base
\c communities_db

# Activer PostGIS
CREATE EXTENSION postgis;

# Vérifier l'installation
SELECT PostGIS_Version();

# Quitter
\q
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env` à la racine du projet :
```env
PGUSER=postgres
PGHOST=localhost
PGDATABASE=communities_db
PGPASSWORD=votre_mot_de_passe
PGPORT=5432
PORT=3001
```

## 🚀 Démarrage de l'application

```bash
# Installation des dépendances
npm install

# Démarrage (PostgreSQL doit être actif)
npm start
```

## 🗺️ Avantages de PostgreSQL + PostGIS

### ✅ **Améliorations par rapport à SQLite :**

1. **🌍 Calculs géographiques natifs** 
   - Utilise `ST_DistanceSphere()` au lieu de Haversine manuel
   - Précision et performance optimales

2. **📍 Types géographiques intégrés**
   - `GEOGRAPHY(Point, 4326)` pour coordonnées GPS
   - Gestion automatique des projections

3. **⚡ Requêtes spatiales optimisées**
   - Index spatiaux automatiques
   - `ST_DWithin()` pour recherche par rayon ultra-rapide

4. **🔄 Scalabilité**
   - Gestion de millions de points géographiques
   - Support des connexions concurrentes

### 🔧 **Nouvelles requêtes SQL :**

#### Insertion avec géolocalisation :
```sql
INSERT INTO communities (name, city, country, location)
VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::GEOGRAPHY);
```

#### Recherche par proximité :
```sql
SELECT id, name, city, country,
       ST_DistanceSphere(location, ST_MakePoint($2, $1)) / 1000 AS distance_km
FROM communities
WHERE ST_DWithin(location, ST_MakePoint($2, $1)::GEOGRAPHY, $3 * 1000)
ORDER BY distance_km ASC;
```

## 🛠️ Dépannage

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL fonctionne
pg_isready -h localhost -p 5432

# Redémarrer PostgreSQL
brew services restart postgresql  # macOS
sudo systemctl restart postgresql # Linux
```

### Erreur PostGIS
```bash
# Vérifier les extensions disponibles
psql -U postgres -d communities_db -c "SELECT * FROM pg_available_extensions WHERE name = 'postgis';"

# Réinstaller PostGIS si nécessaire
psql -U postgres -d communities_db -c "DROP EXTENSION IF EXISTS postgis CASCADE; CREATE EXTENSION postgis;"
```

## 📊 Migration depuis SQLite

Les données SQLite existantes seront automatiquement migrées au premier démarrage avec PostgreSQL.

La version SQLite est sauvegardée dans `server-sqlite.js`.
