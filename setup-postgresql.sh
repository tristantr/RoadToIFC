#!/bin/bash

echo "🐘 Configuration PostgreSQL complète"
echo "===================================="

# Vérifier que PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL non trouvé. Installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install postgresql@14
        brew services start postgresql@14
    else
        echo "⚠️  Veuillez installer PostgreSQL manuellement"
        exit 1
    fi
fi

# Installer PostGIS
echo "🌍 Installation de PostGIS..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install postgis
else
    echo "⚠️  Veuillez installer PostGIS manuellement"
    exit 1
fi

# Créer un utilisateur postgres si nécessaire
echo "👤 Configuration de l'utilisateur PostgreSQL..."
if ! psql -U postgres -c "\\q" 2>/dev/null; then
    createuser -s postgres 2>/dev/null || true
fi

# Créer la base de données
echo "🗄️  Création de la base de données..."
createdb -U postgres communities_db 2>/dev/null || echo "Base déjà existante"

# Activer PostGIS
echo "🌍 Activation de PostGIS..."
psql -U postgres -d communities_db -c "CREATE EXTENSION IF NOT EXISTS postgis;" || echo "Extension déjà installée"

# Tester la connexion
echo "🧪 Test de la configuration..."
if psql -U postgres -d communities_db -c "SELECT PostGIS_Version();" &>/dev/null; then
    echo "✅ PostgreSQL + PostGIS configuré avec succès !"
    echo ""
    echo "🚀 Pour basculer vers PostgreSQL :"
    echo "   ./start-postgresql.sh"
    echo ""
    echo "📊 Pour tester :"
    echo "   npm run test:pg"
else
    echo "❌ Erreur de configuration PostgreSQL"
    exit 1
fi
