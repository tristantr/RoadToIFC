#!/bin/bash

echo "🧹 Nettoyage des processus Node.js..."

# Arrêter tous les processus liés à l'application
pkill -f "node server.js" 2>/dev/null
pkill -f "nodemon" 2>/dev/null

# Attendre un peu
sleep 2

# Vérifier si le port est libre
if lsof -ti:3001 >/dev/null 2>&1; then
    echo "⚠️  Le port 3001 est encore occupé. Tentative de libération..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Nettoyage terminé. Le port 3001 devrait être libre."

# Optionnel : redémarrer l'application
read -p "Voulez-vous redémarrer l'application ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Redémarrage de l'application..."
    npm start
fi
