#!/bin/bash

echo "🐘 Démarrage en mode PostgreSQL"
echo "==============================="

# Vérifier si PostgreSQL est configuré
if ! psql -U postgres -d communities_db -c "SELECT 1;" &>/dev/null; then
    echo "❌ PostgreSQL non configuré. Lancez d'abord :"
    echo "   ./setup-postgresql.sh"
    exit 1
fi

# Vérifier si des processus Node.js sont déjà en cours
if pgrep -f "node server" > /dev/null; then
    echo "🛑 Arrêt des processus Node.js existants..."
    pkill -f "node server.js"
    sleep 2
fi

# Basculer vers la version PostgreSQL
echo "📁 Utilisation de server-postgresql.js..."
if [ -f server-postgresql.js ]; then
    cp server.js server-sqlite.js    # Sauvegarder SQLite
    cp server-postgresql.js server.js # Utiliser PostgreSQL
else
    echo "❌ Fichier server-postgresql.js introuvable"
    exit 1
fi

echo "🚀 Démarrage du serveur PostgreSQL..."
npm start
