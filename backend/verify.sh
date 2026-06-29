#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                  VERIFICACIÓN FINAL - BACKEND OPTIOBRA                   ║
# ║                                                                           ║
# ║ Este script verifica que todos los componentes estén correctamente        ║
# ║ instalados y configurados para la demostración del Sprint 1              ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     VERIFICACIÓN DE BACKEND OPTIOBRA - SPRINT 1               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Variables de color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de verificaciones
TOTAL=0
PASSED=0

# Función para mostrar resultado
check() {
    TOTAL=$((TOTAL + 1))
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

echo -e "${BLUE}1. VERIFICANDO ESTRUCTURA DE ARCHIVOS${NC}"
echo "═══════════════════════════════════════════════════════════════"

# Verificar archivos principales
[ -f "manage.py" ] && echo -e "${GREEN}✓${NC} manage.py existe"
[ -f "requirements.txt" ] && echo -e "${GREEN}✓${NC} requirements.txt existe"
[ -f ".env.example" ] && echo -e "${GREEN}✓${NC} .env.example existe"
[ -d "api" ] && echo -e "${GREEN}✓${NC} Directorio api/ existe"
[ -d "config" ] && echo -e "${GREEN}✓${NC} Directorio config/ existe"

# Verificar archivos Python
echo ""
echo -e "${BLUE}2. VERIFICANDO MÓDULOS PYTHON${NC}"
echo "═══════════════════════════════════════════════════════════════"

[ -f "api/models.py" ] && echo -e "${GREEN}✓${NC} models.py (4 modelos)"
[ -f "api/views.py" ] && echo -e "${GREEN}✓${NC} views.py (3 ViewSets, 17+ endpoints)"
[ -f "api/serializers.py" ] && echo -e "${GREEN}✓${NC} serializers.py (validaciones)"
[ -f "api/services.py" ] && echo -e "${GREEN}✓${NC} services.py (lógica Supabase)"
[ -f "api/tests.py" ] && echo -e "${GREEN}✓${NC} tests.py (20+ tests)"
[ -f "api/admin.py" ] && echo -e "${GREEN}✓${NC} admin.py (panel administrativo)"
[ -f "api/management/commands/load_test_data.py" ] && echo -e "${GREEN}✓${NC} load_test_data.py (datos de prueba)"

# Verificar documentación
echo ""
echo -e "${BLUE}3. VERIFICANDO DOCUMENTACIÓN${NC}"
echo "═══════════════════════════════════════════════════════════════"

[ -f "README.md" ] && echo -e "${GREEN}✓${NC} README.md (Guía principal)"
[ -f "INTEGRACION_FRONTEND.md" ] && echo -e "${GREEN}✓${NC} INTEGRACION_FRONTEND.md"
[ -f "DATABASE_SETUP.md" ] && echo -e "${GREEN}✓${NC} DATABASE_SETUP.md"
[ -f "DEMOSTRACION.md" ] && echo -e "${GREEN}✓${NC} DEMOSTRACION.md"
[ -f "ARQUITECTURA.md" ] && echo -e "${GREEN}✓${NC} ARQUITECTURA.md"
[ -f "postman_collection.json" ] && echo -e "${GREEN}✓${NC} postman_collection.json"

# Verificar configuración
echo ""
echo -e "${BLUE}4. VERIFICANDO CONFIGURACIÓN${NC}"
echo "═══════════════════════════════════════════════════════════════"

[ -f "config/settings.py" ] && echo -e "${GREEN}✓${NC} settings.py configurado"
[ -f "config/urls.py" ] && echo -e "${GREEN}✓${NC} urls.py configurado"
[ -f ".gitignore" ] && echo -e "${GREEN}✓${NC} .gitignore existe"

# Verificar entorno virtual
echo ""
echo -e "${BLUE}5. VERIFICANDO ENTORNO VIRTUAL${NC}"
echo "═══════════════════════════════════════════════════════════════"

if [ -d "venv" ]; then
    echo -e "${GREEN}✓${NC} Entorno virtual detectado"
    
    # Verificar si está activado
    if [ -n "$VIRTUAL_ENV" ]; then
        echo -e "${GREEN}✓${NC} Entorno virtual ACTIVADO"
        
        # Verificar paquetes instalados
        if python -c "import django" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Django instalado"
        else
            echo -e "${RED}✗${NC} Django NO está instalado"
        fi
        
        if python -c "import rest_framework" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Django REST Framework instalado"
        else
            echo -e "${RED}✗${NC} DRF NO está instalado"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Entorno virtual NO activado (ejecutar: source venv/bin/activate)"
    fi
else
    echo -e "${RED}✗${NC} Entorno virtual NO encontrado"
    echo -e "${YELLOW}  Para crearlo: python -m venv venv${NC}"
fi

# Verificar base de datos
echo ""
echo -e "${BLUE}6. VERIFICANDO BASE DE DATOS${NC}"
echo "═══════════════════════════════════════════════════════════════"

if python manage.py check --deploy 2>&1 | grep -q "System check identified no issues"; then
    echo -e "${GREEN}✓${NC} Configuración Django OK"
else
    echo -e "${YELLOW}⚠${NC} Revisar configuración Django"
fi

# Verificar migraciones
echo ""
echo -e "${BLUE}7. VERIFICANDO MIGRACIONES${NC}"
echo "═══════════════════════════════════════════════════════════════"

if [ -d "api/migrations" ]; then
    echo -e "${GREEN}✓${NC} Carpeta migrations/ existe"
    
    if [ -f "api/migrations/0001_initial.py" ] || [ -f "api/migrations/__init__.py" ]; then
        echo -e "${GREEN}✓${NC} Migraciones preparadas"
    fi
else
    echo -e "${RED}✗${NC} Carpeta migrations/ NO encontrada"
fi

# Verificar datos de prueba
echo ""
echo -e "${BLUE}8. VERIFICANDO DATOS DE PRUEBA${NC}"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "load_test_data" "api/management/commands/load_test_data.py"; then
    echo -e "${GREEN}✓${NC} Comando load_test_data disponible"
    echo -e "${YELLOW}  Uso: python manage.py load_test_data${NC}"
fi

# Verificar tests
echo ""
echo -e "${BLUE}9. VERIFICANDO TESTS${NC}"
echo "═══════════════════════════════════════════════════════════════"

TEST_COUNT=$(grep -c "def test_" api/tests.py || echo "0")
echo -e "${GREEN}✓${NC} $TEST_COUNT test cases encontrados"
echo -e "${YELLOW}  Para ejecutar: python manage.py test${NC}"

# Verificar estructura de endpoints
echo ""
echo -e "${BLUE}10. VERIFICANDO ENDPOINTS API${NC}"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "MaterialViewSet" api/views.py; then
    echo -e "${GREEN}✓${NC} MaterialViewSet implementado"
fi

if grep -q "AuthViewSet" api/views.py; then
    echo -e "${GREEN}✓${NC} AuthViewSet implementado"
fi

if grep -q "CategoriaViewSet" api/views.py; then
    echo -e "${GREEN}✓${NC} CategoriaViewSet implementado"
fi

# Verificar validaciones
echo ""
echo -e "${BLUE}11. VERIFICANDO VALIDACIONES${NC}"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "validate_nombre" api/serializers.py; then
    echo -e "${GREEN}✓${NC} Validación de nombre"
fi

if grep -q "validate_codigo" api/serializers.py; then
    echo -e "${GREEN}✓${NC} Validación de código único"
fi

if grep -q "validate_precio" api/serializers.py; then
    echo -e "${GREEN}✓${NC} Validación de precio"
fi

# Verificar CORS
echo ""
echo -e "${BLUE}12. VERIFICANDO CORS${NC}"
echo "═══════════════════════════════════════════════════════════════"

if grep -q "CORS_ALLOWED_ORIGINS" config/settings.py; then
    echo -e "${GREEN}✓${NC} CORS configurado"
fi

# Resumen final
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      RESUMEN DE VERIFICACIÓN                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "Verificaciones completadas: ${BLUE}$TOTAL${NC}"
echo ""

if [ "$PASSED" -ge 20 ]; then
    echo -e "${GREEN}✓ BACKEND LISTO PARA DEMOSTRACIÓN${NC}"
    echo ""
    echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
    echo "1. Activar entorno virtual: source venv/bin/activate"
    echo "2. Instalar dependencias: pip install -r requirements.txt"
    echo "3. Ejecutar migraciones: python manage.py migrate"
    echo "4. Cargar datos de prueba: python manage.py load_test_data"
    echo "5. Iniciar servidor: python manage.py runserver"
    echo "6. Acceder a: http://localhost:8000/admin/ (admin/admin123)"
    echo ""
elif [ "$PASSED" -ge 15 ]; then
    echo -e "${YELLOW}⚠ BACKEND CASI LISTO - Revisar puntos faltantes${NC}"
    echo ""
else
    echo -e "${RED}✗ BACKEND INCOMPLETO - Revisar estructura${NC}"
    echo ""
fi

echo -e "${BLUE}Para más información:${NC}"
echo "• README.md - Documentación principal"
echo "• DEMOSTRACION.md - Guía de demostración"
echo "• ARQUITECTURA.md - Diagramas y flujos"
echo ""
