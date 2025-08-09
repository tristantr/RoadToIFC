#!/bin/bash

echo "🐘 Installation de PostgreSQL + PostGIS"
echo "======================================"

# Vérifier le système d'exploitation
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Détecté: macOS"
    
    # Vérifier si Homebrew est installé
    if command -v brew &> /dev/null; then
        echo "🍺 Homebrew détecté, installation de PostgreSQL..."
        brew install postgresql postgis
        
        echo "🚀 Démarrage des services PostgreSQL..."
        brew services start postgresql
        
        # Attendre que PostgreSQL soit prêt
        echo "⏳ Attente du démarrage de PostgreSQL..."
        sleep 3
        
        echo "🗄️ Création de la base de données..."
        createdb communities_db
        
        echo "🌍 Activation de PostGIS..."
        psql -d communities_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
        
        echo "✅ Installation terminée!"
        echo ""
        echo "🔧 Pour tester l'installation:"
        echo "   npm start"
        
    else
        echo "❌ Homebrew non installé. Installer Homebrew d'abord:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Détecté: Linux"
    
    # Vérifier la distribution
    if command -v apt-get &> /dev/null; then
        echo "📦 Installation via apt-get..."
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib postgis postgresql-*-postgis-*
        
        echo "🚀 Démarrage des services..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        echo "👤 Configuration de l'utilisateur PostgreSQL..."
        sudo -u postgres createdb communities_db
        sudo -u postgres psql -d communities_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
        
        echo "✅ Installation terminée!"
        echo ""
        echo "🔧 Pour tester l'installation:"
        echo "   PGUSER=postgres npm start"
        
    elif command -v yum &> /dev/null; then
        echo "📦 Installation via yum..."
        sudo yum install -y postgresql postgresql-server postgis
        
        # Configuration spécifique à CentOS/RHEL
        sudo postgresql-setup initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        echo "✅ Installation terminée!"
        
    else
        echo "❌ Distribution Linux non supportée automatiquement"
        echo "📖 Consultez: https://www.postgresql.org/download/linux/"
    fi
    
else
    echo "❌ Système d'exploitation non supporté: $OSTYPE"
    echo "📖 Consultez: https://www.postgresql.org/download/"
fi

echo ""
echo "📚 Documentation complète: ./POSTGRESQL_SETUP.md"
