#!/bin/bash

echo "🚀 Démarrage de l'application Communautés Locales..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo ""
echo "🎯 L'application va démarrer sur:"
echo "   Application: http://localhost:3001"
echo ""
echo "💡 Pour arrêter l'application, utilisez Ctrl+C"
echo ""

# Démarrer l'application
echo "🔧 Démarrage du serveur..."
npm start