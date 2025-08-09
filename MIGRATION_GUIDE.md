# 🔄 Guide de Migration SQLite → PostgreSQL

## 📋 État Actuel

Cette branche `feature/postgresql-postgis` contient deux versions du serveur :

### 🟢 **Version SQLite** (Actuellement Active)
- ✅ **Fonctionne immédiatement** - Aucune installation requise
- ✅ **Compatible** avec Node.js 16+
- ✅ **Calculs Haversine** en JavaScript
- 📄 **Fichier** : `server-sqlite.js`

### 🔵 **Version PostgreSQL + PostGIS** (En Développement)
- 🚀 **Performance supérieure** pour les calculs géographiques
- 🌍 **Fonctions natives** PostGIS (`ST_DistanceSphere`, `ST_DWithin`)
- ⚙️ **Nécessite installation** PostgreSQL + PostGIS
- 📄 **Fichier** : `server-postgresql.js`

---

## 🚀 Commandes Disponibles

### **Mode SQLite** (Prêt à l'emploi)
```bash
# Démarrer avec SQLite
npm run start:sqlite

# Ou simplement
npm start  # (utilise SQLite par défaut actuellement)
```

### **Mode PostgreSQL** (Après configuration)
```bash
# 1. Installer les outils Xcode (si pas fait)
xcode-select --install

# 2. Configurer PostgreSQL + PostGIS
npm run setup:pg

# 3. Tester la configuration
npm run test:pg

# 4. Démarrer avec PostgreSQL
npm run start:pg
```

---

## 🔧 Configuration PostgreSQL

### Prérequis
1. **Xcode Command Line Tools** installés
2. **Homebrew** (sur macOS)

### Installation Automatique
```bash
# Configuration complète en une commande
npm run setup:pg
```

### Installation Manuelle
```bash
# 1. Installer PostgreSQL + PostGIS
brew install postgresql@14 postgis
brew services start postgresql@14

# 2. Créer la base de données
createdb communities_db

# 3. Activer PostGIS
psql -d communities_db -c "CREATE EXTENSION postgis;"

# 4. Tester
npm run test:pg
```

---

## 📊 Comparaison des Versions

| Fonctionnalité | SQLite | PostgreSQL + PostGIS |
|---|---|---|
| **Installation** | ✅ Aucune | ⚙️ Configuration requise |
| **Performance** | 🟡 Correcte | 🟢 Optimale |
| **Calculs géographiques** | JavaScript | Natif PostGIS |
| **Scalabilité** | 🟡 Limitée | 🟢 Excellente |
| **Portabilité** | ✅ Maximum | 🟡 Dépendances |
| **Fonctions spatiales** | Basiques | 🌍 Avancées |

---

## 🧪 Tests et Validation

### Tester SQLite
```bash
npm run start:sqlite
curl "http://localhost:3001/api/communities"
```

### Tester PostgreSQL
```bash
npm run test:pg        # Test de connexion
npm run start:pg       # Démarrage
curl "http://localhost:3001/api/communities"
```

---

## 🎯 Recommandations

### **Pour le Développement Local**
- 🟢 **Utilisez SQLite** : Simple, rapide à mettre en place
- ✅ **Commande** : `npm run start:sqlite`

### **Pour la Production**
- 🔵 **Utilisez PostgreSQL** : Performance et fonctionnalités avancées
- ✅ **Commande** : `npm run start:pg`

### **Pour les Contributions**
- 📝 **Testez les deux versions** avant de commiter
- 🔄 **Documentez** les changements dans les deux fichiers serveur

---

## 🐛 Dépannage

### Problèmes Courants

#### ❌ "Extension PostGIS introuvable"
```bash
# Réinstaller PostGIS
brew reinstall postgis
npm run setup:pg
```

#### ❌ "Role 'postgres' does not exist"
```bash
# Créer l'utilisateur
createuser -s postgres
npm run setup:pg
```

#### ❌ "EADDRINUSE: port 3001 already in use"
```bash
# Nettoyer les processus
./clean.sh
npm start
```

### Support
- 📖 **Documentation PostgreSQL** : `./POSTGRESQL_SETUP.md`
- 🔧 **Scripts utilitaires** : `./clean.sh`
- 🧪 **Tests** : `npm run test:pg`
