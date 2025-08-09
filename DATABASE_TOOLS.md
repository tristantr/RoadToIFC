# 🔍 Outils de Visualisation de Base de Données

## 🛠️ **Outils Intégrés au Projet**

### 1. **Script Node.js personnalisé** ⭐ (Recommandé)
```bash
npm run view:db
```
**Avantages :**
- ✅ Formatage coloré et lisible
- ✅ Statistiques détaillées
- ✅ Aucune installation supplémentaire
- ✅ Fonctionne sur tous les OS

### 2. **API REST via navigateur**
```
http://localhost:3001/api/communities
```
**Avantages :**
- ✅ JSON formaté
- ✅ Données en temps réel
- ✅ Accessible depuis n'importe où

### 3. **SQLite CLI**
```bash
sqlite3 communities.db
.tables
.schema
SELECT * FROM communities LIMIT 5;
```

---

## 🖥️ **Applications GUI Externes**

### 1. **DB Browser for SQLite** 🏆 (Le plus populaire)
```bash
# Installation macOS
brew install --cask db-browser-for-sqlite

# Ou téléchargement direct
https://sqlitebrowser.org/
```

**Fonctionnalités :**
- ✅ Interface graphique intuitive
- ✅ Éditeur de requêtes SQL
- ✅ Visualisation des données en tableaux
- ✅ Modification directe des données
- ✅ Export vers CSV, SQL
- ✅ Gratuit et open-source

### 2. **TablePlus** 💎 (Premium mais excellent)
```bash
# Installation macOS
brew install --cask tableplus
```
**Fonctionnalités :**
- ✅ Interface moderne et élégante
- ✅ Support multi-bases (SQLite, PostgreSQL, MySQL...)
- ✅ Autocomplétion SQL avancée
- ✅ Thèmes sombres/clairs
- ❌ Version gratuite limitée

### 3. **DBeaver** 🦫 (Gratuit, très puissant)
```bash
# Installation macOS
brew install --cask dbeaver-community
```
**Fonctionnalités :**
- ✅ Support de toutes les bases de données
- ✅ Éditeur SQL avec coloration syntaxique
- ✅ Diagrammes ER
- ✅ Totalement gratuit
- ❌ Interface un peu lourde

### 4. **SQLiteStudio** (Léger et gratuit)
```bash
# Installation macOS
brew install --cask sqlitestudio
```

---

## 🌐 **Outils Web**

### 1. **SQLite Viewer Online**
- 📎 https://sqliteviewer.app/
- ✅ Pas d'installation
- ✅ Glisser-déposer le fichier `.db`

### 2. **Adminer** (Pour PostgreSQL aussi)
```bash
# Installation via PHP
php -S localhost:8080 adminer.php
```

---

## 📊 **Visualisation Géographique**

### Script de génération GeoJSON
```bash
# Exporter vers GeoJSON pour visualisation sur cartes
node export-geojson.js > communities.geojson
```

Puis utiliser :
- **QGIS** (gratuit)
- **Google My Maps**
- **Leaflet** dans le navigateur

---

## 🎯 **Recommandations par Usage**

### **Développement quotidien** 🏃‍♂️
```bash
npm run view:db  # Script intégré
```

### **Exploration approfondie** 🔍
- **DB Browser for SQLite** (gratuit)
- **TablePlus** (premium)

### **Édition/Modification** ✏️
- **DB Browser for SQLite**
- **DBeaver**

### **Visualisation géographique** 🗺️
- Export GeoJSON + QGIS
- Interface web custom

### **Démo/Présentation** 🎨
- Interface web : `http://localhost:3001`
- **TablePlus** (le plus beau)

---

## 🚀 **Installation Rapide Recommandée**

```bash
# Pour macOS (le plus simple)
brew install --cask db-browser-for-sqlite

# Puis ouvrir
open -a "DB Browser for SQLite" communities.db
```

**🎯 DB Browser for SQLite est parfait pour votre usage !**
