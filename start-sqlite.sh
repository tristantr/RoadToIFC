#!/bin/bash

echo "🚀 Démarrage en mode SQLite (temporaire)"
echo "========================================"

# Vérifier si des processus Node.js sont déjà en cours
if pgrep -f "node server" > /dev/null; then
    echo "🛑 Arrêt des processus Node.js existants..."
    pkill -f "node server.js"
    sleep 2
fi

# Basculer vers la version SQLite
echo "📁 Utilisation de server-sqlite.js..."
cp server.js server-postgresql.js  # Sauvegarder la version PostgreSQL
cp server-sqlite.js server.js      # Utiliser SQLite temporairement

echo "🚀 Démarrage du serveur..."
npm start
