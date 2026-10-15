# Sporty - Plataforma de Reservas Deportivas

Plataforma web para gestión de reservas y pagos online de canchas de pádel y fútbol 7 en dos sedes (Ñuñoa y La Florida, Santiago).

## Requisitos Previos

- **Docker** 20.10+ [Instalar](https://docs.docker.com/get-docker/)
- **Docker Compose** v2.0+ [Instalar](https://docs.docker.com/compose/install/)
- **Git** para clonar el repositorio

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sporty
```

### 2. Configurar variables de entorno

El script de inicio会自动mente crea el archivo `.env` desde `.env.example`:

```bash
./run.sh
```

**Importante:** Edita el archivo `.env` y completa las credenciales reales:
- `DB_PASSWORD` - Contraseña de la base de datos
- `JWT_SECRET` y `JWT_REFRESH_SECRET` - Secretos JWT (mín. 32 caracteres)
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` - Credenciales de Google OAuth
- `WEBPAY_COMMERCE_CODE` y `WEBPAY_API_KEY` - Credenciales de Transbank Webpay
- `SENDGRID_API_KEY` - API key de SendGrid para emails
- `WHATSAPP_API_TOKEN` - Token de WhatsApp Business API

### 3. Iniciar la aplicación

```bash
./run.sh
```

El script verificará Docker, creará el archivo `.env`, construirá las imágenes y levantará todos los servicios.

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 23007 | Aplicación React (nginx) |
| Auth API | 23001 | Autenticación, JWT, Google OAuth |
| Reservas API | 23002 | Gestión de reservas y disponibilidad |
| Pagos API | 23003 | Webpay, splits, devoluciones |
| Sedes API | 23004 | Sedes, canchas, tarifas |
| Clases API | 23005 | Clases y inscripciones |
| Admin API | 23006 | Panel administrativo |
| PostgreSQL | 5432 | Base de datos |

## URLs de Acceso

- **Aplicación:** http://localhost:23007
- **Auth API:** http://localhost:23001
- **Reservas API:** http://localhost:23002
- **Pagos API:** http://localhost:23003
- **Sedes API:** http://localhost:23004
- **Clases API:** http://localhost:23005
- **Admin API:** http://localhost:23006

## Comandos Docker Compose

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio especifico
docker compose logs -f auth-service

# Detener todos los servicios
docker compose down

# Reiniciar un servicio especifico
docker compose restart reservas-service

# Reconstruir un servicio
docker compose build auth-service
docker compose up -d auth-service

# Ver estado de los servicios
docker compose ps

# Ejecutar comandos dentro de un contenedor
docker compose exec auth-service sh
```

## Endpoints de la API

### Auth Service (Puerto 23001)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro de jugador |
| POST | `/auth/login` | Inicio de sesión |
| POST | `/auth/google` | Login con Google |
| POST | `/auth/refresh` | Refrescar token |
| POST | `/auth/password-reset` | Solicitar recuperación de contraseña |
| GET | `/auth/consent` | Obtener versión actual de consentimiento |
| POST | `/auth/consent` | Aceptar consentimiento Ley 19.628 |

### Reservas Service (Puerto 23002)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reservas/availability` | Consultar disponibilidad |
| POST | `/reservas` | Crear reserva (con retención de 10 min) |
| GET | `/reservas/:id` | Obtener detalle de reserva |
| DELETE | `/reservas/:id` | Cancelar reserva |
| GET | `/reservas/jugador/:id` | Reservas de un jugador |

### Pagos Service (Puerto 23003)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pagos/init` | Iniciar transacción Webpay |
| POST | `/pagos/callback` | Callback de Webpay |
| POST | `/pagos/split` | Crear pago dividido |
| GET | `/pagos/:reservaId` | Estado del pago |
| POST | `/pagos/:id/refund` | Solicitar devolución |

### Sedes Service (Puerto 23004)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/sedes` | Listar sedes |
| GET | `/sedes/:id` | Detalle de sede |
| GET | `/sedes/:id/canchas` | Canchas de una sede |
| GET | `/sedes/:id/tarifas` | Tarifas de una sede |
| GET | `/sedes/:id/agenda` | Agenda de una sede |

### Clases Service (Puerto 23005)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/clases` | Listar clases |
| POST | `/clases` | Crear clase (profesor) |
| GET | `/clases/:id` | Detalle de clase |
| POST | `/clases/:id/enroll` | Inscribirse a clase |
| DELETE | `/clases/:id/enroll/:jugadorId` | Cancelar inscripción |

### Admin Service (Puerto 23006)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/admin/usuarios` | Listar usuarios personal |
| POST | `/admin/usuarios` | Crear usuario |
| PUT | `/admin/usuarios/:id` | Actualizar usuario |
| DELETE | `/admin/usuarios/:id` | Desactivar usuario |
| POST | `/admin/tarifas` | Crear tarifa |
| GET | `/admin/reportes/ingresos` | Reporte de ingresos |
| GET | `/admin/reportes/ocupacion` | Reporte de ocupación |
| POST | `/admin/bloqueo-jugador` | Bloquear jugador |
| GET | `/admin/bloqueo-jugador/:id` | Estado de bloqueo |

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Puerto 23007)                   │
│                    React 18 + Vite + CSS Modules                │
└─────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│  Auth Service   │    │ Reservas        │     │ Pagos Service   │
│  (Puerto 23001) │    │ Service         │     │ (Puerto 23003)  │
│  - JWT Auth     │    │ (Puerto 23002)  │     │ - Webpay Plus  │
│  - Google OAuth │    │ - Availability   │     │ - Split Pay     │
│  - Consentimiento│   │ - Retention 10min│     │ - Refunds      │
└─────────────────┘    └─────────────────┘     └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│ Sedes Service   │    │ Clases Service  │     │ Admin Service  │
│ (Puerto 23004)  │    │ (Puerto 23005)   │     │ (Puerto 23006)  │
│ - Agenda Grid   │    │ - CRUD Clases    │     │ - Users CRUD   │
│ - Occupation    │    │ - Enrollment     │     │ - Tariffs      │
└─────────────────┘    └─────────────────┘     │ - Reports Excel │
                                                └─────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │     PostgreSQL 15       │
                     │     (Puerto 5432)       │
                     └─────────────────────────┘
```

## Base de Datos

La base de datos PostgreSQL se inicializa automáticamente con el schema desde `backend/database/schema.sql`.

Entidades principales:
- **Sede** - Complejos deportivos (Ñuñoa, La Florida)
- **Cancha** - Canchas de pádel y fútbol 7
- **Tarifa** - Precios por deporte, duración y franja horaria
- **Jugador** - Usuarios de la plataforma
- **Reserva** - Reservas de canchas
- **Pago** - Pagos de reservas (Webpay)
- **Devolucion** - Reembolsos
- **BloqueoCancha** - Bloqueos por mantenimiento
- **BloqueoJugador** - Bloqueos por inasistencias
- **Clase** - Clases de pádel/fútbol
- **InscripcionClase** - Inscripciones a clases

## Resolución de Problemas

### Los servicios no inician

```bash
# Ver logs de un servicio especifico
docker compose logs auth-service

# Ver todos los logs
docker compose logs

# Reconstruir desde cero
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esta corriendo
docker compose ps postgres

# Ver logs de PostgreSQL
docker compose logs postgres

# Conectar a PostgreSQL directamente
docker compose exec postgres psql -U sporty -d sporty_db
```

### Error de credenciales inválidas

1. Verifica que el archivo `.env` tiene los valores correctos
2. Regenera los secretos JWT:
   ```bash
   openssl rand -base64 32
   ```

## Licencia

Propiedad de Sporty - Uso interno