#!/bin/bash

set -e

# =============================================================================
# Sporty - Script de inicio rápido
# =============================================================================

echo "=============================================="
echo "  Sporty - Plataforma de Reservas Deportivas"
echo "=============================================="
echo ""

# Verificar que Docker este instalado
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no esta instalado."
    echo "Por favor instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "ERROR: Docker Compose no esta instalado."
    echo "Por favor instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

# Detectar docker-compose (v1 vs v2)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "Docker: $(docker --version)"
echo "Docker Compose: $(${DOCKER_COMPOSE} version)"
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "Creando archivo .env desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Archivo .env creado"
        echo ""
        echo "ATENCION: Por favor edita el archivo .env y completa las credenciales"
        echo ""
    else
        echo "ERROR: No se encontro el archivo .env.example"
        exit 1
    fi
else
    echo "✓ Archivo .env ya existe"
fi
echo ""

# Funcion para verificar si un servicio esta healthy
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    echo "Esperando que $service_name este disponible..."

    while [ $attempt -le $max_attempts ]; do
        if docker exec sporty_${service_name} wget -q --spider http://localhost:${port}/health 2>/dev/null || \
           docker exec sporty_${service_name} curl -sf http://localhost:${port}/health 2>/dev/null; then
            echo "✓ $service_name esta listo"
            return 0
        fi
        echo "  Intento $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "ERROR: $service_name no respondio despues de $max_attempts intentos"
    return 1
}

# Construir e iniciar los servicios
echo "=============================================="
echo "  Construyendo e iniciando servicios..."
echo "=============================================="
echo ""

${DOCKER_COMPOSE} down --remove-orphans 2>/dev/null || true
${DOCKER_COMPOSE} build --no-cache
${DOCKER_COMPOSE} up -d

echo ""
echo "=============================================="
echo "  Verificando servicios..."
echo "=============================================="
echo ""

# Esperar por postgres
echo "Esperando que PostgreSQL este disponible..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if docker exec sporty_postgres pg_isready -U sporty &>/dev/null; then
        echo "✓ PostgreSQL esta listo"
        break
    fi
    echo "  Intento $attempt/$max_attempts..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "ERROR: PostgreSQL no respondio"
    exit 1
fi

# Esperar por cada servicio
wait_for_service "auth_service" 23001 || exit 1
wait_for_service "reservas_service" 23002 || exit 1
wait_for_service "pagos_service" 23003 || exit 1
wait_for_service "sedes_service" 23004 || exit 1
wait_for_service "clases_service" 23005 || exit 1
wait_for_service "admin_service" 23006 || exit 1

# Esperar por frontend
echo "Esperando que Frontend este disponible..."
attempt=1
while [ $attempt -le $max_attempts ]; do
    if docker exec sporty_frontend curl -sf http://localhost:80/health 2>/dev/null; then
        echo "✓ Frontend esta listo"
        break
    fi
    echo "  Intento $attempt/$max_attempts..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "WARNING: Frontend pudo no estar completamente listo"
fi

echo ""
echo "=============================================="
echo "  ✓ Todos los servicios estan operativos"
echo "=============================================="
echo ""
echo "URLs de acceso:"
echo "  Frontend:     http://localhost:23007"
echo "  Auth API:     http://localhost:23001"
echo "  Reservas API: http://localhost:23002"
echo "  Pagos API:    http://localhost:23003"
echo "  Sedes API:    http://localhost:23004"
echo "  Clases API:   http://localhost:23005"
echo "  Admin API:    http://localhost:23006"
echo "  PostgreSQL:    localhost:5432"
echo ""
echo "Comandos utiles:"
echo "  Ver logs:     ${DOCKER_COMPOSE} logs -f"
echo "  Detener:      ${DOCKER_COMPOSE} down"
echo "  Reiniciar:    ${DOCKER_COMPOSE} restart"
echo ""
echo "=============================================="
echo ""

# Mostrar estado de los servicios
echo "Estado de los contenedores:"
docker ps --filter "name=sporty_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"