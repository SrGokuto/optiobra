#!/bin/bash
# Script de inicialización rápida del backend

echo "🚀 OptiObra Backend - Inicialización Rápida"
echo "==========================================="
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi

echo "✓ Python 3 detectado"

# Crear venv
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
    echo "✓ Entorno virtual creado"
else
    echo "✓ Entorno virtual ya existe"
fi

# Activar venv
echo "🔄 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "📥 Instalando dependencias..."
pip install -q -r requirements.txt
echo "✓ Dependencias instaladas"

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "⚙️  Creando archivo .env..."
    cp .env.example .env
    echo "✓ Archivo .env creado (verificar configuración)"
else
    echo "✓ Archivo .env ya existe"
fi

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
python manage.py migrate --noinput

# Crear datos de prueba
echo "📊 Cargando datos de prueba..."
python manage.py load_test_data

echo ""
echo "✅ ¡Inicialización completada!"
echo ""
echo "📚 Para iniciar el servidor:"
echo "   python manage.py runserver"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   Admin: admin / admin123"
echo "   Usuario: usuario@optiobra.local / prueba123"
echo ""
echo "📖 Acceso al panel administrativo:"
echo "   http://localhost:8000/admin"
echo ""
echo "🧪 Para ejecutar pruebas:"
echo "   python manage.py test"
echo ""
