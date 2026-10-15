# Especificación de API - Sporty

## 1. Información General

Todas las APIs son RESTful y usan JSON para request/response.

### Headers Requeridos

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>  (para endpoints protegidos)
```

### Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request |
| 401 | No autorizado |
| 403 | Prohibido |
| 404 | No encontrado |
| 409 | Conflicto (ej. doble reserva) |
| 500 | Error interno |

### Formato de Fechas

Todas las fechas usan formato ISO 8601: `2024-01-15T10:30:00Z`

---

## 2. Auth Service (Puerto 23001)

### Autenticación

#### POST /auth/register
Registro de nuevo jugador.

```json
// Request
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "+56912345678",
  "password": "Password123"
}

// Response 201
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/login
Inicio de sesión con email y contraseña.

```json
// Request
{
  "email": "juan@email.com",
  "password": "Password123"
}

// Response 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "role": "jugador"
  }
}
```

#### POST /auth/google
Login con Google OAuth.

```json
// Request
{
  "idToken": "google_id_token_string"
}

// Response 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "role": "jugador"
  }
}
```

#### POST /auth/refresh
Refrescar access token.

```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/password-reset
Solicitar recuperación de contraseña (personal).

```json
// Request
{
  "email": "encargado@sporty.cl"
}

// Response 200
{
  "message": "Correo de recuperación enviado"
}
```

### Consentimiento

#### GET /auth/consent
Obtener versión actual de consentimiento.

```json
// Response 200
{
  "version": "1.0",
  "texto": "Texto completo de la política de privacidad...",
  "requerido": true
}
```

#### POST /auth/consent
Aceptar consentimiento (jugador).

```json
// Request
{
  "aceptado": true
}

// Headers
Authorization: Bearer <jwt_token>

// Response 200
{
  "id": 1,
  "jugadorId": 1,
  "version": "1.0",
  "fechaConsentimiento": "2024-01-15T10:30:00Z",
  "aceptado": true
}
```

---

## 3. Reservas Service (Puerto 23002)

### Disponibilidad

#### GET /reservas/availability
Consultar disponibilidad de canchas.

```json
// Query params
?cancha_id=1
&fecha=2024-01-15
&franja=tarde

// Response 200
{
  "cancha": {
    "id": 1,
    "nombre": "Cancha de Pádel 1",
    "deporte": "padel"
  },
  "fecha": "2024-01-15",
  "franja": "tarde",
  "slots": [
    {
      "inicio": "2024-01-15T14:00:00Z",
      "fin": "2024-01-15T15:00:00Z",
      "disponible": true,
      "tarifa": {
        "id": 1,
        "monto": 15000
      }
    },
    {
      "inicio": "2024-01-15T15:00:00Z",
      "fin": "2024-01-15T16:00:00Z",
      "disponible": false,
      "motivo": "reservada"
    }
  ]
}
```

### Reservas

#### POST /reservas
Crear nueva reserva (con retención de 10 min).

```json
// Headers
Authorization: Bearer <jwt_token>

// Request
{
  "canchaId": 1,
  "tarifaId": 1,
  "inicio": "2024-01-15T14:00:00Z",
  "fin": "2024-01-15T15:00:00Z"
}

// Response 201
{
  "id": 1,
  "jugadorId": 1,
  "canchaId": 1,
  "tarifaId": 1,
  "inicio": "2024-01-15T14:00:00Z",
  "fin": "2024-01-15T15:00:00Z",
  "estado": "retenida",
  "creadaEn": "2024-01-15T10:30:00Z",
  "confirmadaEn": null,
  "expiresAt": "2024-01-15T10:40:00Z"
}
```

#### GET /reservas/:id
Obtener detalle de reserva.

```json
// Response 200
{
  "id": 1,
  "jugadorId": 1,
  "jugador": {
    "nombre": "Juan Pérez",
    "telefono": "+56912345678"
  },
  "canchaId": 1,
  "cancha": {
    "nombre": "Cancha de Pádel 1",
    "deporte": "padel",
    "sede": "Ñuñoa"
  },
  "tarifaId": 1,
  "tarifa": {
    "monto": 15000,
    "duracionMinutos": 60
  },
  "inicio": "2024-01-15T14:00:00Z",
  "fin": "2024-01-15T15:00:00Z",
  "estado": "pagada",
  "creadaEn": "2024-01-15T10:30:00Z",
  "confirmadaEn": "2024-01-15T10:32:00Z",
  "pago": {
    "id": 1,
    "montoTotal": 15000,
    "estado": "completado"
  }
}
```

#### DELETE /reservas/:id
Cancelar reserva.

```json
// Headers
Authorization: Bearer <jwt_token>

// Response 200
{
  "id": 1,
  "estado": "cancelada",
  "mensaje": "Reserva cancelada. Se procesará devolución según política."
}
```

#### GET /reservas/jugador/:jugadorId
Reservas de un jugador.

```json
// Query params
?estado=pagada
&page=1
&limit=10

// Response 200
{
  "data": [
    {
      "id": 1,
      "cancha": "Cancha de Pádel 1",
      "sede": "Ñuñoa",
      "inicio": "2024-01-15T14:00:00Z",
      "fin": "2024-01-15T15:00:00Z",
      "estado": "pagada"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

## 4. Pagos Service (Puerto 23003)

### Transacciones Webpay

#### POST /pagos/init
Iniciar transacción Webpay.

```json
// Headers
Authorization: Bearer <jwt_token>

// Request
{
  "reservaId": 1,
  "returnUrl": "http://localhost:23007/pagos/return"
}

// Response 200
{
  "token": "02a8e8d0a8b5...",
  "url": "https://webpay3gint.transbank.cl/webpayserver/v1.2.0/transaccion"
}
```

#### POST /pagos/callback
Callback de Webpay (llamado por Transbank).

```json
// Request (TBK)
{
  "token_ws": "02a8e8d0a8b5...",
  "tbk_token": "...",
  "tbk_id_sesion": "...",
  "tbk_orden_compra": "..."
}

// Response 200 (éxito)
{
  "success": true,
  "reservaId": 1,
  "estado": "pagada"
}

// Response 400 (fallido)
{
  "success": false,
  "reservaId": 1,
  "mensaje": "Pago rechazado por Webpay"
}
```

### Pago Dividido

#### POST /pagos/split
Crear pago dividido entre varios jugadores.

```json
// Headers
Authorization: Bearer <jwt_token>

// Request
{
  "reservaId": 1,
  "jugadores": [
    {"email": "jugador1@email.com"},
    {"email": "jugador2@email.com"},
    {"email": "jugador3@email.com"}
  ]
}

// Response 201
{
  "reservaId": 1,
  "pagos": [
    {"jugadorId": 1, "monto": 3750, "estado": "pendiente", "token": "..."},
    {"jugadorId": 2, "monto": 3750, "estado": "pendiente", "token": "..."},
    {"jugadorId": 3, "monto": 3750, "estado": "pendiente", "token": "..."}
  ],
  "total": 11250
}
```

#### GET /pagos/:reservaId
Estado del pago de una reserva.

```json
// Response 200
{
  "reservaId": 1,
  "pagos": [
    {
      "id": 1,
      "jugadorId": 1,
      "monto": 5000,
      "estado": "completado",
      "pagadoEn": "2024-01-15T10:32:00Z"
    },
    {
      "id": 2,
      "jugadorId": 2,
      "monto": 5000,
      "estado": "pendiente",
      "pagadoEn": null
    }
  ],
  "total": 10000,
  "completo": false
}
```

### Reembolsos

#### POST /pagos/:pagoId/refund
Solicitar devolución (solo administrador).

```json
// Headers
Authorization: Bearer <jwt_token> (admin only)

// Request
{
  "motivo": "Lluvia - cancha no apta",
  "monto": 10000
}

// Response 200
{
  "id": 1,
  "pagoId": 1,
  "monto": 10000,
  "motivo": "Lluvia - cancha no apta",
  "estado": "procesado",
  "autorizadoPor": "admin@sporty.cl",
  "creadaEn": "2024-01-15T12:00:00Z"
}
```

---

## 5. Sedes Service (Puerto 23004)

#### GET /sedes
Listar todas las sedes.

```json
// Response 200
{
  "data": [
    {
      "id": 1,
      "nombre": "Ñuñoa",
      "direccion": "Av. Príncipe de Gales 1234, Ñuñoa",
      "telefono": "+56212345678",
      "canchas": [
        {"id": 1, "nombre": "Cancha de Pádel 1", "deporte": "padel", "techada": true},
        {"id": 2, "nombre": "Cancha de Pádel 2", "deporte": "padel", "techada": false}
      ]
    },
    {
      "id": 2,
      "nombre": "La Florida",
      "direccion": "Av. La Florida 1234, La Florida",
      "telefono": "+56212345679",
      "canchas": [...]
    }
  ]
}
```

#### GET /sedes/:id
Detalle de una sede.

```json
// Response 200
{
  "id": 1,
  "nombre": "Ñuñoa",
  "direccion": "Av. Príncipe de Wales 1234, Ñuñoa",
  "telefono": "+56212345678",
  "horario": {
    "apertura": "06:00",
    "cierre": "23:00"
  }
}
```

#### GET /sedes/:id/canchas
Cancha de una sede.

```json
// Query params
?deporte=padel

// Response 200
{
  "data": [
    {
      "id": 1,
      "nombre": "Cancha de Pádel 1",
      "deporte": "padel",
      "techada": true,
      "estado": "disponible"
    }
  ]
}
```

#### GET /sedes/:id/tarifas
Tarifas de una sede.

```json
// Query params
?deporte=padel

// Response 200
{
  "data": [
    {
      "id": 1,
      "deporte": "padel",
      "duracionMinutos": 60,
      "franja": "manana",
      "monto": 12000
    },
    {
      "id": 2,
      "deporte": "padel",
      "duracionMinutos": 60,
      "franja": "tarde",
      "monto": 15000
    }
  ]
}
```

#### GET /sedes/:id/agenda
Agenda de una sede por fecha.

```json
// Query params
?fecha=2024-01-15

// Response 200
{
  "sede": {
    "id": 1,
    "nombre": "Ñuñoa"
  },
  "fecha": "2024-01-15",
  "canchas": [
    {
      "id": 1,
      "nombre": "Cancha de Pádel 1",
      "bloques": [
        {
          "inicio": "14:00",
          "fin": "15:00",
          "estado": "disponible"
        },
        {
          "inicio": "15:00",
          "fin": "16:00",
          "reserva": {
            "id": 1,
            "jugador": "Juan Pérez",
            "estado": "pagada"
          }
        }
      ]
    }
  ]
}
```

---

## 6. Clases Service (Puerto 23005)

#### GET /clases
Listar clases disponibles.

```json
// Query params
?sede_id=1&fecha=2024-01-15

// Response 200
{
  "data": [
    {
      "id": 1,
      "nombre": "Clase de Pádel Iniciantes",
      "profesor": "Carlos Mendoza",
      "cancha": "Cancha de Pádel 1",
      "inicio": "2024-01-15T10:00:00Z",
      "fin": "2024-01-15T11:00:00Z",
      "cupos": 4,
      "inscritos": 2,
      "precio": 8000,
      "disponible": true
    }
  ]
}
```

#### POST /clases
Crear clase (solo profesores).

```json
// Headers
Authorization: Bearer <jwt_token> (profesor)

// Request
{
  "canchaId": 1,
  "nombre": "Clase de Pádel Avanzados",
  "inicio": "2024-01-15T16:00:00Z",
  "fin": "2024-01-15T17:00:00Z",
  "cupos": 4,
  "precio": 10000
}

// Response 201
{
  "id": 2,
  "canchaId": 1,
  "profesorId": 5,
  "nombre": "Clase de Pádel Avanzados",
  "inicio": "2024-01-15T16:00:00Z",
  "fin": "2024-01-15T17:00:00Z",
  "cupos": 4,
  "precio": 10000,
  "estado": "publicada"
}
```

#### POST /clases/:id/enroll
Inscribirse a una clase.

```json
// Headers
Authorization: Bearer <jwt_token>

// Response 201
{
  "id": 1,
  "claseId": 1,
  "jugadorId": 1,
  "inscritaEn": "2024-01-14T10:00:00Z",
  "estado": "activa"
}
```

#### DELETE /clases/:id/enroll/:jugadorId
Cancelar inscripción.

```json
// Headers
Authorization: Bearer <jwt_token>

// Response 200
{
  "mensaje": "Inscripción cancelada"
}
```

---

## 7. Admin Service (Puerto 23006)

### Usuarios Personal

#### GET /admin/usuarios
Listar usuarios del personal.

```json
// Query params
?sede_id=1&rol=encargado

// Response 200
{
  "data": [
    {
      "id": 1,
      "nombre": "María González",
      "email": "maria@sporty.cl",
      "rol": "encargado",
      "sede": "Ñuñoa",
      "activo": true
    }
  ]
}
```

#### POST /admin/usuarios
Crear usuario.

```json
// Headers
Authorization: Bearer <jwt_token> (admin only)

// Request
{
  "nombre": "Pedro Ramírez",
  "email": "pedro@sporty.cl",
  "password": "Password123",
  "rol": "encargado",
  "sedeId": 2
}

// Response 201
{
  "id": 5,
  "nombre": "Pedro Ramírez",
  "email": "pedro@sporty.cl",
  "rol": "encargado",
  "sedeId": 2,
  "activo": true
}
```

#### PUT /admin/usuarios/:id
Actualizar usuario.

```json
// Request
{
  "nombre": "Pedro Ramírez Updated",
  "rol": "profesor"
}

// Response 200
{
  "id": 5,
  "nombre": "Pedro Ramírez Updated",
  "rol": "profesor"
}
```

#### DELETE /admin/usuarios/:id
Desactivar usuario.

```json
// Response 200
{
  "id": 5,
  "activo": false
}
```

### Tarifas

#### POST /admin/tarifas
Crear tarifa.

```json
// Request
{
  "deporte": "padel",
  "duracionMinutos": 60,
  "franja": "noche",
  "monto": 18000
}

// Response 201
{
  "id": 5,
  "deporte": "padel",
  "duracionMinutos": 60,
  "franja": "noche",
  "monto": 18000
}
```

### Bloqueos

#### POST /admin/bloqueo-jugador
Bloquear jugador (por inasistencias o manualmente).

```json
// Request
{
  "jugadorId": 1,
  "motivo": "3 inasistencias en 60 días",
  "duracionDias": 30
}

// Response 201
{
  "id": 1,
  "jugadorId": 1,
  "motivo": "3 inasistencias en 60 días",
  "inicio": "2024-01-15T00:00:00Z",
  "fin": "2024-02-14T23:59:59Z"
}
```

### Reportes

#### GET /admin/reportes/ingresos
Reporte de ingresos por sede.

```json
// Query params
?sede_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-01-31

// Response 200
{
  "sede": "Ñuñoa",
  "periodo": {
    "inicio": "2024-01-01",
    "fin": "2024-01-31"
  },
  "ingresos": {
    "total": 1500000,
    "padel": 900000,
    "futbol7": 600000
  },
  "reservas": {
    "total": 100,
    "padel": 60,
    "futbol7": 40
  },
  "promedioPorReserva": 15000
}
```

#### GET /admin/reportes/ocupacion
Reporte de ocupación de canchas.

```json
// Query params
?sede_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-01-31

// Response 200
{
  "sede": "Ñuñoa",
  "periodo": {
    "inicio": "2024-01-01",
    "fin": "2024-01-31"
  },
  "canchas": [
    {
      "id": 1,
      "nombre": "Cancha de Pádel 1",
      "deporte": "padel",
      "horasTotales": 240,
      "horasOcupadas": 180,
      "ocupacion": 75.0
    }
  ],
  "promedioGeneral": 68.5
}
```

#### GET /admin/reportes/noshows
Reporte de no-shows (inasistencias).

```json
// Query params
?sede_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-01-31

// Response 200
{
  "sede": "Ñuñoa",
  "periodo": {
    "inicio": "2024-01-01",
    "fin": "2024-01-31"
  },
  "totalReservas": 100,
  "totalNoShows": 5,
  "porcentajeNoShows": 5.0,
  "detalle": [
    {
      "jugador": "Juan Pérez",
      "cantidad": 2,
      "ultimaInasistencia": "2024-01-15T14:00:00Z"
    }
  ]
}
```

#### GET /admin/reportes/export
Exportar reporte a Excel.

```json
// Query params
?tipo=ingresos&sede_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-01-31

// Response 200
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="reporte_ingresos_2024-01.xlsx"
```

---

## 8. Endpoints Públicos (sin auth)

| Método | Endpoint | Servicio | Descripción |
|--------|----------|----------|-------------|
| GET | `/health` | Todos | Health check |
| GET | `/auth/consent` | Auth | Obtener consentimiento |
| POST | `/auth/google` | Auth | Login Google |
| POST | `/auth/register` | Auth | Registro jugador |
| POST | `/auth/login` | Auth | Login jugador |
| GET | `/sedes` | Sedes | Listar sedes |
| GET | `/sedes/:id` | Sedes | Detalle sede |
| GET | `/sedes/:id/canchas` | Sedes | Canchas de sede |
| GET | `/sedes/:id/tarifas` | Sedes | Tarifas de sede |
| GET | `/clases` | Clases | Listar clases |
| POST | `/pagos/init` | Pagos | Iniciar Webpay |
| POST | `/pagos/callback` | Pagos | Callback Webpay |