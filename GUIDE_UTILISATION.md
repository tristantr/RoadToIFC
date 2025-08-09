# 📖 Guide d'utilisation - Communautés Locales

## 🚀 Démarrage rapide

### Option 1 : Script automatique
```bash
./start.sh
```

### Option 2 : Démarrage manuel
```bash
npm start
```

## 🔗 Accès à l'application

- **Application complète** : http://localhost:3001
- **API Backend** : http://localhost:3001/api/

## 🧪 Test de l'application

### 1. Vérification du backend
```bash
# Tester que l'API répond
curl http://localhost:3001/api/communities

# Tester la recherche par proximité (autour de Paris)
curl "http://localhost:3001/api/communities/near?lat=48.8566&lon=2.3522&radiusKm=50"
```

### 2. Utilisation de l'interface

#### Créer une communauté
1. 📝 Renseignez le nom de votre communauté (ex: "Mon Super Club")
2. 🌍 Tapez le nom d'une ville dans le champ "Ville" 
3. 📍 Sélectionnez une ville dans la liste d'autocomplétion qui apparaît
4. ✅ Cliquez sur "Créer la communauté"

#### Rechercher des communautés
1. 🌍 Tapez le nom d'une ville de référence
2. 📍 Sélectionnez une ville dans la liste d'autocomplétion 
3. 📏 Ajustez le rayon de recherche (10 à 100 km)
4. 📋 Les résultats s'affichent automatiquement, triés par distance

## 📊 Données pré-remplies

L'application contient 20 communautés fictives réparties dans les villes françaises :

- **Paris** : Club des Stratèges
- **Lyon** : Team RocketFoot  
- **Marseille** : Les Rois du Smash
- **Toulouse** : BlitzSociety
- **Bordeaux** : Les As du Panier
- **Lille** : Gardiens des Buts
- **Nantes** : Escrime Élite
- **Strasbourg** : Les Cavaliers du Roi
- **Montpellier** : Volley Titans
- **Nice** : Rugby Lions
- **Rennes** : Karting Fury
- **Grenoble** : Gladiateurs de la Neige
- **Reims** : Pionniers de l'Échiquier
- **Dijon** : Les Maîtres de la Balle
- **Angers** : Angers Warriors
- **Clermont-Ferrand** : Clermont Eagles
- **Saint-Étienne** : Sainté Futbol Club
- **Toulon** : Toulon Mariners
- **Le Havre** : Le Havre Vikings
- **Metz** : Metz Blasters

## 💡 Exemples de tests

### Test de recherche géographique
1. Dans "Chercher des communautés", tapez **"Lyon"**
2. Sélectionnez Lyon dans la liste
3. Vous devriez voir "Team RocketFoot" à 0 km
4. Augmentez le rayon à 100 km pour voir d'autres communautés

### Test de création
1. Dans "Créer une communauté", entrez **"Mon Club Test"**
2. Tapez **"Toulouse"** dans le champ ville
3. Sélectionnez Toulouse dans la liste
4. Cliquez sur "Créer"
5. Vérifiez dans la section recherche que votre communauté apparaît

## 🔧 Résolution de problèmes

### Le backend ne démarre pas
- Vérifiez que le port 3001 n'est pas déjà utilisé
- Vérifiez que Node.js est installé : `node --version`
- Réinstallez les dépendances : `rm -rf node_modules && npm install`

### L'interface ne s'affiche pas  
- Vérifiez que le port 3001 n'est pas déjà utilisé par une autre application
- Assurez-vous que les fichiers dans le dossier `public/` sont présents
- Vérifiez les logs du serveur pour d'éventuelles erreurs

### L'autocomplétion ne fonctionne pas
- Vérifiez votre connexion Internet (utilise l'API Nominatim)
- Tapez au moins 3 caractères dans le champ ville
- Attendez quelques secondes pour que l'API réponde

### Les communautés ne s'affichent pas
- Vérifiez que le backend est démarré (http://localhost:3001/api/communities)
- Vérifiez que vous avez bien sélectionné une ville (pas juste tapé)
- Essayez d'augmenter le rayon de recherche

## 📱 Fonctionnalités avancées

### Calcul de distance
L'application utilise la formule Haversine pour calculer les distances réelles entre les points géographiques, en tenant compte de la courbure de la Terre.

### Recherche intelligente
- La recherche est automatique dès qu'une ville est sélectionnée
- Les résultats sont triés par distance croissante
- Le changement de rayon met à jour les résultats instantanément

### Interface responsive
- Design adaptatif mobile/desktop
- Autocomplétion tactile optimisée
- Animations fluides

## 🎯 Utilisation en production

Pour déployer l'application :

1. **Installation** : `npm install`
2. **Démarrage** : `npm start`

L'application est prête pour la production. Le serveur Express sert directement les fichiers statiques HTML/CSS/JS.
