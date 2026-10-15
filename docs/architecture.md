# Arquitectura Técnica - Sporty

## 1. Visión General

Sporty es una plataforma de reservas y pagos online para complejos deportivos. El sistema permite a jugadores reservar canchas de pádel y fútbol 7 con pago online a través de Webpay Plus, y al personal de sede gestionar la agenda de sus instalaciones.

## 2. Stack Tecnológico

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** NestJS 10
- **Base de Datos:** PostgreSQL 15
- **ORM:** TypeORM
- **Autenticación:** JWT + Google OAuth2

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Lenguaje:** TypeScript
- **Estilos:** CSS Modules + Design Tokens
- **Iconos:** Lucide React

### Infraestructura
- **Contenedores:** Docker + Docker Compose
- **Proxy:** nginx
- **Despliegue:** Google Cloud Run (producción)

## 3. Arquitectura de Microservicios

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Puerto 23007)                   │
│                    React 18 + Vite + nginx                      │
│                                                                   │
│  Proxies reversos:                                                │
│    /api/*  → auth-service:23001                                  │
│    /reservas/* → reservas-service:23002                          │
│    /pagos/*  → pagos-service:23003                              │
│    /sedes/*  → sedes-service:23004                              │
│    /clases/*  → clases-service:23005                             │
│    /admin/*  → admin-service:23006                               │
└─────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│  Auth Service   │    │ Reservas        │     │ Pagos Service   │
│  Puerto: 23001  │    │ Puerto: 23002   │     │ Puerto: 23003   │
│                 │    │                 │     │                 │
│ Módulos:        │    │ Módulos:        │     │ Módulos:        │
│ - JWT Auth      │    │ - Disponibilidad│     │ - Webpay Plus   │
│ - Google OAuth  │    │ - Reservas      │     │ - Split Payment │
│ - Consentimiento│    │ - Retención     │     │ - Devoluciones  │
│ - Password Rec. │    │ - 10min timeout │     │ - Notificaciones│
└─────────────────┘    └─────────────────┘     └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│ Sedes Service   │    │ Clases Service  │     │ Admin Service   │
│ Puerto: 23004   │    │ Puerto: 23005   │     │ Puerto: 23006   │
│                 │    │                 │     │                 │
│ Módulos:        │    │ Módulos:        │     │ Módulos:        │
│ - Sedes         │    │ - Clases CRUD   │     │ - Usuarios CRUD │
│ - Canchas       │    │ - Inscripciones │     │ - Tarifas       │
│ - Tarifas       │    │ - Profesores    │     │ - Bloqueos      │
│ - Agenda Grid   │    │                 │     │ - Reportes Excel│
└─────────────────┘    └─────────────────┘     └─────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │     PostgreSQL 15        │
                     │     Puerto: 5432         │
                     │                         │
                     │  Schema: sporty_db       │
                     │  Usuario: sporty         │
                     └─────────────────────────┘
```

## 4. Modelo de Datos

### Entidades Principales

```
SEDE
├── id (PK)
├── nombre
├── direccion
├── telefono
└── canchas (1:N)

CANCHA
├── id (PK)
├── sede_id (FK)
├── deporte (padel | futbol7)
├── techada (boolean)
├── estado (disponible | mantenimiento | bloqueada)
└── tarifas (1:N)

TARIFA
├── id (PK)
├── deporte
├── duracion_minutos
├── franja (manana | tarde | noche)
└── monto

JUGADOR
├── id (PK)
├── nombre
├── email
├── telefono
├── bloqueado (boolean)
├── inasistencias_60dias
└── consentimientos (1:N)

RESERVA
├── id (PK)
├── jugador_id (FK)
├── cancha_id (FK)
├── tarifa_id (FK)
├── inicio (datetime)
├── fin (datetime)
├── estado (retenida | pagada | cancelada | asistio | no_asistio)
├── creada_en
└── confirmada_en

PAGO
├── id (PK)
├── reserva_id (FK)
├── monto_total
├── estado (pendiente | completado | fallido | reembolsado)
├── token_transbank
├── referencia_transbank
├── pagado_en
└── es_parcial (boolean)

DEVOLUCION
├── id (PK)
├── pago_id (FK)
├── autorizado_por_id (FK)
├── monto
├── motivo
└── creada_en

USUARIO_PERSONAL
├── id (PK)
├── sede_id (FK)
├── nombre
├── email
├── password_hash
└── rol (encargado | profesor | administrador)

BLOQUEO_CANCHA
├── id (PK)
├── cancha_id (FK)
├── reserva_id (FK, nullable)
├── inicio
├── fin
└── estado (activo | liberado)

BLOQUEO_JUGADOR
├── id (PK)
├── jugador_id (FK)
├── creado_por_id (FK)
├── motivo
├── inicio
└── fin

CLASE
├── id (PK)
├── cancha_id (FK)
├── profesor_id (FK)
├── inicio
├── fin
├── nombre
├── cupos
└── precio

INSCRIPCION_CLASE
├── id (PK)
├── clase_id (FK)
├── jugador_id (FK)
├── inscrita_en
└── estado (activa | cancelada)
```

## 5. Flujos de Negocio

### 5.1 Reserva con Pago Online

```
Jugador                Frontend           Reservas Svc      Pagos Svc       Webpay
   │                      │                   │               │              │
   │──Selecciona fecha───▶│                   │               │              │
   │                      │──Verifica disp.──▶│               │              │
   │                      │◀─Slots disponibles─│               │              │
   │──Selecciona slot────▶│                   │               │              │
   │                      │──Crea reserva──────▶│               │              │
   │                      │   (estado=retenida) │               │              │
   │                      │◀─Reserva creada────│               │              │
   │                      │                   │──Inicia pago──▶│              │
   │                      │◀─Token Webpay─────│               │              │
   │──Redirect a Webpay──▶│                   │               │───HTTP──────▶│
   │                      │                   │               │◀─Form Webpay──│
   │──Ingresa datos───▶Webpay                 │               │              │
   │◀─Confirmación───────│                   │               │              │
   │                      │                   │◀─Callback OK──│              │
   │                      │                   │──Confirma───▶│              │
   │                      │◀─Reserva pagada──│               │              │
   │◀─Éxito──────────────│                   │               │              │
```

### 5.2 Retención de 10 Minutos

```
Reserva creada con estado='retenida'
       │
       ▼
Cloud Tasks programa tarea para 10 min
       │
       ├── Pago confirmado antes de 10 min
       │       │
       │       ▼
       │   Estado → 'pagada'
       │   Reservada se mantiene
       │
       └── Pago NO confirmado en 10 min
               │
               ▼
           Estado → 'cancelada'
           BloqueoCancha eliminado
           Cancha disponible
```

### 5.3 Bloqueo por Inasistencias

```
Después de cada reserva:
       │
       ▼
¿Pasó la hora de fin + 15 min?
       │
       ├── Sí: Encargado marca asistencia
       │       │
       │       ├── Asistió → Sin acción
       │       │
       │       └── No asistió → inasistencias_60dias++
       │                   │
       │                   ▼
       │           ¿inasistencias >= 3 en 60 días?
       │                   │
       │                   ├── Sí → bloqueado = true, 30 días
       │                   │
       │                   └── No → Sin acción
       │
       └── No: Esperar
```

## 6. Seguridad

### 6.1 Autenticación

- **Jugadores:** Google OAuth2 (Sign-In)
- **Personal:** Email + contraseña (bcrypt)
- **Tokens:** JWT con refresh token

### 6.2 Autorización por Sede

El personal de sede solo puede acceder a datos de su sede asignada:

```
Encargado Ñuñoa:
  - GET /sedes/1/* → OK
  - GET /sedes/2/* → 403 Forbidden

Encargado La Florida:
  - GET /sedes/2/* → OK
  - GET /sedes/1/* → 403 Forbidden
```

### 6.3 Cumplimiento Ley 19.628

- Consentimiento explícito requerido antes de primera reserva
- Datos personales cifrados en reposo
- Registro de consentimientos con versión y fecha

## 7. Integraciones Externas

### 7.1 Transbank Webpay Plus

- **Ambiente:** Sandbox para desarrollo
- **Operaciones:** Crear transacción, confirmar, reembolsar
- **Split Payment:** Soporte para pagos divididos (2-4 jugadores)

### 7.2 Google Sign-In

- OAuth2 flow standard
- Mapeo de email Google → usuario interno
- Consentimiento Ley 19.628 post-login

### 7.3 SendGrid

- Confirmación de reserva
- Confirmación de pago
- Recuperación de contraseña

### 7.4 WhatsApp Business API

- Recordatorio 3 horas antes de la reserva
- Notificaciones de cambio de horario

## 8. Despliegue Local (Docker)

```bash
# Levantar todos los servicios
./run.sh

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Escalar un servicio
docker compose up -d --scale reservas-service=2
```

## 9. Métricas de Rendimiento

| Métrica | Objetivo |
|---------|----------|
| Tiempo de reserva + pago | < 2 minutos |
| Disponibilidad | 99.5% |
| Usuarios concurrentes | 80 |
| Tiempo de recuperación DB | < 4 horas |
| Costo infraestructura | < $120 USD/mes |