```markdown
# SPEC.md — Sporty: Plataforma de Reservas Deportivas

## 1. TECHNOLOGY STACK

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** NestJS 10
- **Database:** PostgreSQL 15 (Google Cloud SQL)
- **ORM:** TypeORM (PostgreSQL driver)
- **Authentication:** Google Identity Services (OAuth2)
- **Task Queue:** Google Cloud Tasks / Google Cloud Pub/Sub
- **Container Runtime:** Docker
- **Deployment:** Google Cloud Run (Santiago region: southamerica-west1)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context + useReducer (no external state library)
- **Styling:** CSS Modules + Design Tokens (no Tailwind)
- **Icons:** Lucide React (line icons, 1.75px stroke)

### Integrations
- **Payment Gateway:** Transbank Webpay Plus SDK
- **Email:** SendGrid API
- **SMS/WhatsApp:** WhatsApp Business API
- **Social Auth:** Google Identity Services

### Infrastructure
- **Secrets Management:** Google Secret Manager
- **CI/CD:** Google Cloud Build
- **Monitoring:** Google Cloud Logging + custom Prometheus-compatible /metrics endpoints

---

## 2. DATA CONTRACTS

### Backend Models (NestJS / TypeORM)

```typescript
// sede.entity.ts
export class Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  canchas: Cancha[];
  usuarios: UsuarioPersonal[];
}

// cancha.entity.ts
export class Cancha {
  id: number;
  sedeId: number;
  deporte: 'padel' | 'futbol7';
  techada: boolean;
  estado: 'disponible' | 'mantenimiento' | 'bloqueada';
  sede: Sede;
  reservas: Reserva[];
  bloques: BloqueoCancha[];
  clases: Clase[];
}

// tarifa.entity.ts
export class Tarifa {
  id: number;
  deporte: 'padel' | 'futbol7';
  duracionMinutos: number;
  franja: 'manana' | 'tarde' | 'noche';
  monto: number;
  reservas: Reserva[];
}

// jugador.entity.ts
export class Jugador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  inasistencias60Dias: number;
  consentimientos: ConsentimientoDatos[];
  reservas: Reserva[];
  inscripciones: InscripcionClase[];
  bloqueos: BloqueoJugador[];
}

// consentimiento_datos.entity.ts
export class ConsentimientoDatos {
  id: number;
  jugadorId: number;
  version: string;
  fechaConsentimiento: Date;
  aceptado: boolean;
  jugador: Jugador;
}

// usuario_personal.entity.ts
export class UsuarioPersonal {
  id: number;
  sedeId: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'encargado' | 'profesor' | 'administrador';
  sede: Sede;
  devolucionesAutorizadas: Devolucion[];
  bloqueosCreados: BloqueoJugador[];
  clasesImpartidas: Clase[];
}

// reserva.entity.ts
export class Reserva {
  id: number;
  jugadorId: number;
  canchaId: number;
  tarifaId: number;
  inicio: Date;
  fin: Date;
  estado: 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';
  creadaEn: Date;
  confirmadaEn: Date | null;
  jugador: Jugador;
  cancha: Cancha;
  tarifa: Tarifa;
  pago: Pago | null;
  bloqueo: BloqueoCancha | null;
}

// pago.entity.ts
export class Pago {
  id: number;
  reservaId: number;
  montoTotal: number;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  tokenTransbank: string | null;
  referenciaTransbank: string | null;
  pagadoEn: Date | null;
  esParcial: boolean;
  reserva: Reserva;
  devolucion: Devolucion | null;
}

// devolucion.entity.ts
export class Devolucion {
  id: number;
  pagoId: number;
  autorizadoPorId: number;
  monto: number;
  motivo: string;
  creadaEn: Date;
  pago: Pago;
  autorizadoPor: UsuarioPersonal;
}

// bloqueo_cancha.entity.ts
export class BloqueoCancha {
  id: number;
  canchaId: number;
  reservaId: number | null;
  inicio: Date;
  fin: Date;
  estado: 'activo' | 'liberado';
  cancha: Cancha;
  reserva: Reserva | null;
}

// bloqueo_jugador.entity.ts
export class BloqueoJugador {
  id: number;
  jugadorId: number;
  creadoPorId: number;
  motivo: string;
  inicio: Date;
  fin: Date;
  jugador: Jugador;
  creadoPor: UsuarioPersonal;
}

// clase.entity.ts
export class Clase {
  id: number;
  canchaId: number;
  profesorId: number;
  inicio: Date;
  fin: Date;
  nombre: string;
  cupos: number;
  precio: number;
  cancha: Cancha;
  profesor: UsuarioPersonal;
  inscripciones: InscripcionClase[];
}

// inscripcion_clase.entity.ts
export class InscripcionClase {
  id: number;
  claseId: number;
  jugadorId: number;
  inscritaEn: Date;
  estado: 'activa' | 'cancelada';
  clase: Clase;
  jugador: Jugador;
}
```

### Frontend TypeScript Interfaces

```typescript
// types/models.ts
export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Cancha {
  id: number;
  sedeId: number;
  deporte: 'padel' | 'futbol7';
  techada: boolean;
  estado: 'disponible' | 'mantenimiento' | 'bloqueada';
}

export interface Tarifa {
  id: number;
  deporte: 'padel' | 'futbol7';
  duracionMinutos: number;
  franja: 'manana' | 'tarde' | 'noche';
  monto: number;
}

export interface Jugador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  inasistencias60Dias: number;
}

export interface Reserva {
  id: number;
  jugadorId: number;
  canchaId: number;
  tarifaId: number;
  inicio: string; // ISO 8601
  fin: string;   // ISO 8601
  estado: 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';
  creadaEn: string;
  confirmadaEn: string | null;
  jugador?: Jugador;
  cancha?: Cancha;
  tarifa?: Tarifa;
  pago?: Pago;
}

export interface Pago {
  id: number;
  reservaId: number;
  montoTotal: number;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  tokenTransbank: string | null;
  referenciaTransbank: string | null;
  pagadoEn: string | null;
  esParcial: boolean;
}

export interface Clase {
  id: number;
  canchaId: number;
  profesorId: number;
  inicio: string;
  fin: string;
  nombre: string;
  cupos: number;
  precio: number;
  cancha?: Cancha;
  profesor?: UsuarioPersonal;
  inscripciones?: InscripcionClase[];
}

export interface InscripcionClase {
  id: number;
  claseId: number;
  jugadorId: number;
  inscritaEn: string;
  estado: 'activa' | 'cancelada';
}

export interface UsuarioPersonal {
  id: number;
  sedeId: number;
  nombre: string;
  email: string;
  rol: 'encargado' | 'profesor' | 'administrador';
}

export type ReservationStatus = 'retenida' | 'pagada' | 'cancelada' | 'asistio' | 'no_asistio';

export type UserRole = 'jugador' | 'encargado' | 'profesor' | 'administrador';

export interface Filters {
  sedeId?: number;
  deporte?: 'padel' | 'futbol7';
  fecha: Date;
  rangoHorario?: 'manana' | 'tarde' | 'noche';
}
```

---

## 3. API ENDPOINTS

### Authentication Service (Port 23001)

| Method | Path | Request Body | Response | Description |
|--------|------|--------------|----------|-------------|
| POST | /auth/google | `{ idToken: string }` | `{ accessToken: string, refreshToken: string, usuario: Jugador }` | Google OAuth login/register |
| POST | /auth/refresh | `{ refreshToken: string }` | `{ accessToken: string, refreshToken: string }` | Refresh JWT tokens |
| POST | /auth/logout | `{ refreshToken: string }` | `{ success: boolean }` | Invalidate refresh token |
| POST | /auth/password-reset | `{ email: string }` | `{ message: string }` | Send password reset email |
| POST | /auth/consent | `{ version: string, aceptado: boolean }` | `{ success: boolean }` | Record data consent acceptance |

### Reservas Service (Port 23002)

| Method | Path | Request Body | Response | Description |
|--------|------|--------------|----------|-------------|
| GET | /reservas | Query: `{ jugadorId?, estado?, desde?, hasta? }` | `Reserva[]` | List reservations with filters |
| GET | /reservas/:id | - | `Reserva` | Get single reservation details |
| POST | /reservas | `{ canchaId, tarifaId, inicio, fin, contacto: { nombre, telefono, email } }` | `{ reserva: Reserva, retencionMinutos: 10 }` | Create temporary reservation (hold) |
| PUT | /reservas/:id | `{ estado?, contacto?: { nombre, telefono, email } }` | `Reserva` | Update reservation status |
| DELETE | /reservas/:id | - | `{ success: boolean }` | Cancel reservation (player) |
| GET | /reservas/disponibilidad | Query: `{ sedeId, deporte, fecha, duracion? }` | `AvailabilitySlot[]` | Get available time slots |
| POST | /reservas/:id/asistio | `{ asistio: boolean }` | `Reserva` | Mark attendance (encargado) |

**AvailabilitySlot Interface:**
```typescript
interface AvailabilitySlot {
  canchaId: number;
  canchaNombre: string;
  tarifaId: number;
  inicio: string;
  fin: string;
  precio: number;
  disponible: boolean;
}
```

### Pagos Service (Port 23003)

| Method | Path | Request Body | Response | Description |
|--------|------|--------------|----------|-------------|
| POST | /pagos/initiate | `{ reservaId, splitCantidad? }` | `{ webpayUrl: string, token: string, pagos?: Pago[] }` | Initiate Webpay transaction |
| POST | /pagos/webpay/callback | `{ TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA }` | `{ success: boolean, reserva: Reserva }` | Webpay return URL handler |
| POST | /pagos/webpay/notify | `{ TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA }` | `{ acknowledged: boolean }` | Webpay IPN notification |
| GET | /pagos/:id | - | `Pago` | Get payment details |
| GET | /pagos/reserva/:reservaId | - | `Pago[]` | Get all payments for reservation |
| POST | /pagos/:id/devolver | `{ monto: number, motivo: string }` | `Devolucion` | Process refund (admin) |

### Sedes Service (Port 23004)

| Method | Path | Request Body | Response | Description |
|--------|------|--------------|----------|-------------|
| GET | /sedes | - | `Sede[]` | List all sedes |
| GET | /sedes/:id | - | `Sede & { canchas: Cancha[] }` | Get sede with courts |
| GET | /sedes/:id/agenda | Query: `{ fecha, deporte? }` | `AgendaRow[]` | Get agenda grid data |
| GET | /sedes/:id/ocupacion | Query: `{ mes, ano }` | `{ ocupacion: number, pagadas: number, retenidas: number, noShow: number }` | Dashboard stats |

**AgendaRow Interface:**
```typescript
interface AgendaRow {
  hora: string; // "08:00"
  slots: Array<{
    canchaId: number;
    canchaNombre: string;
    reservaId: number | null;
    estado: ReservationStatus | null;
    jugadorNombre: string | null;
    deporte: 'padel' | 'futbol7';
  }>;
}
```

### Clases Service (Port 23005)

| Method | Path | Request Body | Response | Description |
|--------|------|--------------|----------|-------------|
| GET | /clases | Query: `{ profesorId?, jugadorId?, sedeId?, fecha? }` | `Clase[]` | List classes with filters |
| GET | /clases/:id | - | `Clase & { inscripciones: InscripcionClase[] }` | Get class details |
| POST | /clases | `{ canchaId, profesorId, inicio, fin, nombre, cupos, precio }` | `Clase` | Create class (profesor/admin) |
| PUT | /clases/:id | `{ nombre?, cupos?, precio? }` | `Clase` | Update class |
| DELETE | /clases/:id | - | `{ success: boolean }` | Cancel class |
| POST | /clases/:id/inscribir | `{ jugadorId }` | `InscripcionClase` | Enroll player in class |
| DELETE | /clases/:id/inscribir/:jugadorId | - | `{ success: boolean }` | Remove enrollment |

### Admin Service (Port 23006)

| Method | Path | Request Body | Response | Description |
|--------|------|--------------|----------|-------------|
| GET | /admin/usuarios | - | `UsuarioPersonal[]` | List staff users |
| POST | /admin/usuarios | `{ sedeId, nombre, email, password, rol }` | `UsuarioPersonal` | Create staff user |
| PUT | /admin/usuarios/:id | `{ nombre?, email?, rol?, password? }` | `UsuarioPersonal` | Update staff user |
| DELETE | /admin/usuarios/:id | - | `{ success: boolean }` | Deactivate staff user |
| GET | /admin/tarifas | Query: `{ deporte? }` | `Tarifa[]` | List tariffs |
| POST | /admin/tarifas | `{ deporte, duracionMinutos, franja, monto }` | `Tarifa` | Create tariff |
| PUT | /admin/tarifas/:id | `{ monto? }` | `Tarifa` | Update tariff |
| POST | /admin/bloqueo-jugador | `{ jugadorId, motivo, inicio, fin }` | `BloqueoJugador` | Block player |
| DELETE | /admin/bloqueo-jugador/:id | - | `{ success: boolean }` | Remove player block |
| GET | /admin/reportes/reservas | Query: `{ sedeId?, desde, hasta, formato }` | `Blob | ReportData` | Export reservations Excel/CSV |
| GET | /admin/reportes/pagos | Query: `{ sedeId?, desde, hasta, formato }` | `Blob | ReportData` | Export payments Excel/CSV |

### Internal/Service-to-Service Events (Pub/Sub)

| Topic | Payload | Description |
|-------|---------|-------------|
| `reserva.creada` | `{ reservaId, jugadorId, canchaId, inicio, fin }` | Trigger retention timer |
| `reserva.pagada` | `{ reservaId, pagoId }` | Trigger confirmation notifications |
| `reserva.cancelada` | `{ reservaId, motivo }` | Cleanup and notifications |
| `reserva.expirada` | `{ reservaId }` | Release court hold |
| `reserva.asistencia` | `{ reservaId, asistio }` | Update player no-show counter |
| `clase.creada` | `{ claseId, profesorId }` | Notify enrolled players |
| `recordatorio.reserva` | `{ reservaId, jugadorId, horasAntes: 3 }` | Trigger WhatsApp reminder |

### Health & Observability (All Services)

| Method | Path | Response | Description |
|--------|------|----------|-------------|
| GET | /health | `{ status: 'ok', service: string }` | Kubernetes liveness probe |
| GET | /health/ready | `{ status: 'ok', db: boolean, cache: boolean }` | Readiness probe |
| GET | /metrics | Prometheus format | Metrics endpoint |

---

## 4. FILE STRUCTURE

```
sporty/
├── backend/
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── google.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── google-login.dto.ts
│   │   │   │       └── consent.dto.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── entities/
│   │   │   │       ├── jugador.entity.ts
│   │   │   │       └── usuario-personal.entity.ts
│   │   │   ├── database/
│   │   │   │   └── database.module.ts
│   │   │   └── common/
│   │   │       ├── guards/
│   │   │       │   ├── jwt-auth.guard.ts
│   │   │       │   └── roles.guard.ts
│   │   │       └── decorators/
│   │   │           └── roles.decorator.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── reservas-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── reservas/
│   │   │   │   ├── reservas.controller.ts
│   │   │   │   ├── reservas.service.ts
│   │   │   │   ├── reservas.module.ts
│   │   │   │   └── entities/
│   │   │   │       ├── reserva.entity.ts
│   │   │   │       ├── bloqueo-cancha.entity.ts
│   │   │   │       └── bloqueo-jugador.entity.ts
│   │   │   ├── disponibilidad/
│   │   │   │   ├── disponibilidad.service.ts
│   │   │   │   └── disponibilidad.module.ts
│   │   │   ├──球场/
│   │   │   │   ├── cancha.entity.ts
│   │   │   │   ├── sede.entity.ts
│   │   │   │   └── tarifas.entity.ts
│   │   │   └── common/
│   │   │       └── guards/
│   │   │           └── jwt-auth.guard.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── pagos-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── pagos/
│   │   │   │   ├── pagos.controller.ts
│   │   │   │   ├── pagos.service.ts
│   │   │   │   ├── webpay.service.ts
│   │   │   │   └── entities/
│   │   │   │       ├── pago.entity.ts
│   │   │   │       └── devolucion.entity.ts
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   └── whatsapp.service.ts
│   │   │   └── common/
│   │   │       └── guards/
│   │   │           └── jwt-auth.guard.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── sedes-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── sedes/
│   │   │   │   ├── sedes.controller.ts
│   │   │   │   ├── sedes.service.ts
│   │   │   │   └── agenda.service.ts
│   │   │   ├──球场/
│   │   │   │   ├── cancha.entity.ts
│   │   │   │   └── sede.entity.ts
│   │   │   └── common/
│   │   │       └── guards/
│   │   │           └── jwt-auth.guard.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── clases-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── clases/
│   │   │   │   ├── clases.controller.ts
│   │   │   │   ├── clases.service.ts
│   │   │   │   └── entities/
│   │   │   │       ├── clase.entity.ts
│   │   │   │       └── inscripcion-clase.entity.ts
│   │   │   ├──球场/
│   │   │   │   └── cancha.entity.ts
│   │   │   └── common/
│   │   │       └── guards/
│   │   │           └── jwt-auth.guard.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── admin/
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   ├── reportes.service.ts
│   │   │   │   └── entities/
│   │   │   │       ├── usuario-personal.entity.ts
│   │   │   │       ├── tarifa.entity.ts
│   │   │   │       └── bloqueo-jugador.entity.ts
│   │   │   ├──球场/
│   │   │   │   ├── sede.entity.ts
│   │   │   │   └── reserva.entity.ts
│   │   │   └── common/
│   │   │       └── guards/
│   │   │           └── jwt-auth.guard.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── shared/
│       ├── types/
│       │   ├── reserva.types.ts
│       │   ├── pago.types.ts
│       │   └── usuario.types.ts
│       ├── constants/
│       │   ├── reservation-status.ts
│       │   └── user-roles.ts
│       └── utils/
│           ├── date.utils.ts
│           └── validation.utils.ts
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── styles/
│   │   │   └── tokens.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── BuscarCancha.tsx
│   │   │   ├── Pago.tsx
│   │   │   ├── MisReservas.tsx
│   │   │   ├── AgendaSede.tsx
│   │   │   ├── ReservaPresencial.tsx
│   │   │   ├── MisClases.tsx
│   │   │   └── PanelAdmin.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── NavegacionPrincipal.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── BottomNav.tsx
│   │   │   ├── ui/
│   │   │   │   ├── BotonAccionPrincipal.tsx
│   │   │   │   ├── TarjetaResumen.tsx
│   │   │   │   ├── BadgeEstado.tsx
│   │   │   │   ├── SelectorDeporteFecha.tsx
│   │   │   │   ├── FilaDisponibilidad.tsx
│   │   │   │   ├── AgendaGrilla.tsx
│   │   │   │   ├── ContadorRetencion.tsx
│   │   │   │   └── ModalConfirmacion.tsx
│   │   │   ├── reserva/
│   │   │   │   ├── ReservaForm.tsx
│   │   │   │   ├── DisponibilidadList.tsx
│   │   │   │   └── RetentionTimer.tsx
│   │   │   ├── pago/
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   ├── SplitPaymentOptions.tsx
│   │   │   │   └── PaymentStatus.tsx
│   │   │   └── admin/
│   │   │       ├── TariffEditor.tsx
│   │   │       ├── UserManager.tsx
│   │   │       └── ReportExporter.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useReservas.ts
│   │   │   ├── useSedes.ts
│   │   │   ├── usePagos.ts
│   │   │   └── useClases.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── reservas.service.ts
│   │   │   ├── pagos.service.ts
│   │   │   ├── sedes.service.ts
│   │   │   └── clases.service.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ReservationContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── utils/
│   │   │   ├── date.utils.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       ├── models.ts
│   │       └── api.ts
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

### PORT TABLE

| Service | Listening Port | Path | Description |
|---------|---------------|------|-------------|
| auth-service | 23001 | backend/auth-service/ | Authentication & user management |
| reservas-service | 23002 | backend/reservas-service/ | Reservation CRUD & availability |
| pagos-service | 23003 | backend/pagos-service/ | Webpay integration & refunds |
| sedes-service | 23004 | backend/sedes-service/ | Venues & agenda management |
| clases-service | 23005 | backend/clases-service/ | Classes & enrollments |
| admin-service | 23006 | backend/admin-service/ | Admin panel & reports |
| frontend | 23007 | frontend/ | React SPA |

### SHARED MODULES

| Shared path | Imported by services |
|-------------|---------------------|
| backend/shared/ | auth-service, reservas-service, pagos-service, sedes-service, clases-service, admin-service |

---

## 5. ENVIRONMENT VARIABLES

### Backend (All Services)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `PORT` | number | Service listening port | `23001` |
| `DATABASE_HOST` | string | PostgreSQL host | `34.67.x.x` |
| `DATABASE_PORT` | number | PostgreSQL port | `25432` |
| `DATABASE_NAME` | string | Database name | `sporty_prod` |
| `DATABASE_USER` | string | Database user | `sporty_user` |
| `DATABASE_PASSWORD` | string | Database password | `***` |
| `JWT_SECRET` | string | JWT signing secret | `***` |
| `JWT_EXPIRES_IN` | string | Token expiry | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | string | Refresh token expiry | `7d` |
| `GOOGLE_CLIENT_ID` | string | Google OAuth client ID | `***.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | string | Google OAuth secret | `***` |
| `REDIS_URL` | string | Redis for session/cache | `redis://34.67.x.x:26379` |

### Pagos Service Specific

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `WEBPAY_COMMERCE_CODE` | string | Transbank commerce code | `***` |
| `WEBPAY_API_KEY` | string | Transbank API key | `***` |
| `WEBPAY_ENV` | string | `integration` or `production` | `integration` |
| `WEBPAY_RETURN_URL` | string | Success callback URL | `https://sporty.cl/pago/exito` |
| `WEBPAY_NOTIFY_URL` | string | IPN callback URL | `https://api.sporty.cl/pagos/webpay/notify` |

### Notifications (Pagos Service)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `SENDGRID_API_KEY` | string | SendGrid API key | `SG.***` |
| `SENDGRID_FROM_EMAIL` | string | Sender email | `noreply@sporty.cl` |
| `WHATSAPP_BUSINESS_ID` | string | WhatsApp Business Account ID | `***` |
| `WHATSAPP_ACCESS_TOKEN` | string | WhatsApp API token | `***` |
| `WHATSAPP_TEMPLATE_BOOKING` | string | Booking reminder template | `booking_reminder` |

### Frontend

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `VITE_API_BASE_URL` | string | Backend API base URL | `https://api.sporty.cl` |
| `VITE_AUTH_SERVICE_URL` | string | Auth service URL | `https://auth.sporty.cl` |
| `VITE_GOOGLE_CLIENT_ID` | string | Google Sign-In client ID | `***.apps.googleusercontent.com` |
| `VITE_WEBPAY_RETURN_URL` | string | Webpay return URL | `/pago/exito` |

---

## 6. IMPORT CONTRACTS

### Backend Shared Module Exports

```typescript
// backend/shared/types/reserva.types.ts
export { AvailabilitySlot, AgendaRow, ReservationStatus } from '@shared/types/reserva.types';

// backend/shared/types/pago.types.ts
export { PaymentStatus, WebpayTransaction } from '@shared/types/pago.types';

// backend/shared/types/usuario.types.ts
export { UserRole, Jugador, UsuarioPersonal } from '@shared/types/usuario.types';

// backend/shared/constants/reservation-status.ts
export const RESERVATION_STATUS = {
  RETENIDA: 'retenida',
  PAGADA: 'pagada',
  CANCELADA: 'cancelada',
  ASISTIO: 'asistio',
  NO_ASISTIO: 'no_asistio'
} as const;

// backend/shared/constants/user-roles.ts
export const USER_ROLES = {
  JUGADOR: 'jugador',
  ENCARGADO: 'encargado',
  PROFESOR: 'profesor',
  ADMINISTRADOR: 'administrador'
} as const;

// backend/shared/utils/date.utils.ts
export { formatTime, formatDate, isSlotAvailable, addMinutes, startOfDay, endOfDay } from '@shared/utils/date.utils';

// backend/shared/utils/validation.utils.ts
export { isValidEmail, isValidPhone, isValidRUT } from '@shared/utils/validation.utils';
```

### Frontend Service Exports

```typescript
// frontend/src/services/api.ts
export { apiClient, authApi, reservasApi, pagosApi, sedesApi, clasesApi } from './api';

// frontend/src/services/auth.service.ts
export { loginWithGoogle, refreshToken, logout, requestPasswordReset } from './auth.service';

// frontend/src/services/reservas.service.ts
export { getReservas, getReserva, createReserva, updateReserva, cancelReserva, getDisponibilidad, markAttendance } from './reservas.service';

// frontend/src/services/pagos.service.ts
export { initiatePayment, getPaymentStatus, processRefund } from './pagos.service';

// frontend/src/services/sedes.service.ts
export { getSedes, getSedeAgenda, getOcupacion } from './sedes.service';

// frontend/src/services/clases.service.ts
export { getClases, getClase, createClase, enrollInClase, unenrollFromClase } from './clases.service';
```

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### React Context Exports

```typescript
// AuthContext
interface AuthContextValue {
  user: Jugador | UsuarioPersonal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  accessToken: string | null;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
useAuth() → AuthContextValue

// ReservationContext
interface ReservationContextValue {
  currentReservation: Reserva | null;
  retencionExpiry: Date | null;
  availableSlots: AvailabilitySlot[];
  isLoading: boolean;
  error: string | null;
  createReservation: (data: CreateReservationInput) => Promise<Reserva>;
  releaseRetention: () => void;
  setCurrentReservation: (reserva: Reserva | null) => void;
}
useReservas() → ReservationContextValue

// NotificationContext
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  sendReminder: (reservaId: number) => Promise<void>;
  markAsRead: (notificationId: string) => void;
}
useNotifications() → NotificationContextValue
```

### Reusable Components — Props Interfaces

```typescript
// NavegacionPrincipal
interface NavegacionPrincipalProps {
  items: Array<{
    label: string;
    icon: string;
    route: string;
  }>;
  activeRoute: string;
  role: 'jugador' | 'encargado' | 'profesor' | 'administrador';
  onSelect: (route: string) => void;
}

// BotonAccionPrincipal
interface BotonAccionPrincipalProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// TarjetaResumen
interface TarjetaResumenProps {
  title: string;
  subtitle?: string;
  status?: ReservationStatus;
  image?: string;
  price?: number;
  meta?: string[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

// BadgeEstado
interface BadgeEstadoProps {
  status: ReservationStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

// SelectorDeporteFecha
interface SelectorDeporteFechaProps {
  sedes: Sede[];
  deportes: Array<'padel' | 'futbol7'>;
  fecha: Date;
  rangoHorario?: 'manana' | 'tarde' | 'noche';
  onChange: (filters: Filters) => void;
}

// FilaDisponibilidad
interface FilaDisponibilidadProps {
  courtName: string;
  time: string;
  price: number;
  available: boolean;
  onSelect: () => void;
}

// AgendaGrilla
interface AgendaGrillaProps {
  date: Date;
  sede: Sede;
  courts: Cancha[];
  reservations: AgendaRow[];
  onSelectReservation: (id: string) => void;
}

// ContadorRetencion
interface ContadorRetencionProps {
  minutes: number;
  seconds: number;
  variant?: 'compact' | 'full';
}

// ModalConfirmacion
interface ModalConfirmacionProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'success' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}
```

### Page Components — Props Interfaces

```typescript
// Login
// No props - uses AuthContext internally

// BuscarCancha
interface BuscarCanchaProps {
  // Uses ReservationContext
}

// Pago
interface PagoProps {
  // Reads currentReservation from ReservationContext
  // Uses retencionExpiry for ContadorRetencion
}

// MisReservas
interface MisReservasProps {
  // Uses AuthContext.user.id to filter reservas
}

// AgendaSede
interface AgendaSedeProps {
  // Uses AuthContext to determine sede of encargado
}

// ReservaPresencial
interface ReservaPresencialProps {
  // Uses AuthContext.role === 'encargado' guard
}

// MisClases
interface MisClasesProps {
  // Uses AuthContext to filter by profesorId
}

// PanelAdmin
interface PanelAdminProps {
  // Uses AuthContext.role === 'administrador' guard
}
```

---

## 8. FILE EXTENSION CONVENTION

- **Language:** TypeScript (all source files)
- **Frontend Files:** `.tsx` for React components with JSX, `.ts` for utilities/hooks/services
- **Backend Files:** `.ts` (NestJS with TypeScript)
- **Entry Point:** `/src/main.tsx` (React Vite app)
- **HTML Entry:** `frontend/public/index.html`

---

## 9. DESIGN TOKENS

```typescript
// frontend/src/styles/tokens.ts
export const tokens = {
  colors: {
    brand: {
      green_950: '#06281A',
      green_900: '#0B3B22',
      green_800: '#0F4C2C',
      green_700: '#0F6B3C',
      green_600: '#14804A',
      green_500: '#1C9A58',
      green_300: '#7DD3A4',
      green_100: '#D9F4E3',
      green_50: '#EDF9F1'
    },
    neutral: {
      white: '#FFFFFF',
      surface: '#FFFFFF',
      background: '#F4F8F5',
      surface_subtle: '#F7FAF8',
      border: '#DCE7E0',
      border_strong: '#C3D3CA',
      text_primary: '#10241A',
      text_secondary: '#40564A',
      text_muted: '#647A6F',
      overlay: 'rgba(6, 40, 26, 0.45)'
    },
    semantic: {
      success: '#1C9A58',
      warning: '#F2A900',
      danger: '#C62828',
      info: '#1565C0',
      focus: '#1C9A58'
    },
    reservation_status: {
      retenida: {
        label: 'Retenida',
        fill: '#FFF4D6',
        border: '#F2A900',
        text: '#8A5A00',
        icon: 'clock'
      },
      pagada: {
        label: 'Pagada',
        fill: '#D9F4E3',
        border: '#1C9A58',
        text: '#0B3B22',
        icon: 'check_circle'
      },
      cancelada: {
        label: 'Cancelada',
        fill: '#FDE7E7',
        border: '#C62828',
        text: '#7A1F1F',
        icon: 'x_circle'
      },
      asistio: {
        label: 'Asistió',
        fill: '#DCEFE2',
        border: '#2E7D4F',
        text: '#0B3B22',
        icon: 'user_check'
      },
      no_asistio: {
        label: 'No asistió',
        fill: '#ECEFF1',
        border: '#5A6460',
        text: '#303A35',
        icon: 'user_x'
      }
    }
  },
  typography: {
    families: {
      display: "'Barlow Condensed', 'Oswald', sans-serif",
      body: "'Inter', 'Roboto', system-ui, sans-serif",
      numeric: "'Inter', 'Roboto Mono', monospace"
    },
    scale: [
      {
        name: 'display',
        family: 'display',
        size: '40px',
        line_height: '44px',
        weight: '700',
        letter_spacing: '0.01em'
      },
      {
        name: 'h1',
        family: 'display',
        size: '28px',
        line_height: '32px',
        weight: '700',
        letter_spacing: '0.01em'
      },
      {
        name: 'h2',
        family: 'display',
        size: '22px',
        line_height: '28px',
        weight: '700',
        letter_spacing: '0.01em'
      },
      {
        name: 'h3',
        family: 'body',
        size: '18px',
        line_height: '24px',
        weight: '600',
        letter_spacing: '0'
      },
      {
        name: 'body_large',
        family: 'body',
        size: '16px',
        line_height: '24px',
        weight: '400',
        letter_spacing: '0'
      },
      {
        name: 'body',
        family: 'body',
        size: '14px',
        line_height: '20px',
        weight: '400',
        letter_spacing: '0'
      },
      {
        name: 'body_small',
        family: 'body',
        size: '12px',
        line_height: '16px',
        weight: '400',
        letter_spacing: '0'
      },
      {
        name: 'label',
        family: 'body',
        size: '12px',
        line_height: '14px',
        weight: '600',
        letter_spacing: '0.06em'
      },
      {
        name: 'button',
        family: 'body',
        size: '16px',
        line_height: '20px',
        weight: '700',
        letter_spacing: '0'
      },
      {
        name: 'numeric_agenda',
        family: 'numeric',
        size: '12px',
        line_height: '16px',
        weight: '600',
        letter_spacing: '0'
      }
    ]
  },
  spacing: {
    space_1: '4px',
    space_2: '8px',
    space_3: '12px',
    space_4: '16px',
    space_5: '20px',
    space_6: '24px',
    space_8: '32px',
    space_10: '40px',
    space_12: '48px',
    space_16: '64px',
    page_gutter_mobile: '16px',
    page_gutter_desktop: '32px'
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '999px'
  },
  shadows: {
    card: '0 1px 2px rgba(16, 36, 26, 0.06), 0 8px 24px rgba(16, 36, 26, 0.08)',
    card_hover: '0 4px 8px rgba(16, 36, 26, 0.08), 0 16px 32px rgba(16, 36, 26, 0.12)',
    sticky_header: '0 2px 8px rgba(16, 36, 26, 0.08)',
    modal: '0 12px 32px rgba(16, 36, 26, 0.22)',
    focus_ring: '0 0 0 3px rgba(28, 154, 88, 0.28)'
  },
  breakpoints: {
    mobile: '0-639px',
    tablet: '640-1023px',
    desktop: '1024px+'
  },
  iconography: {
    style: 'íconos de línea redondeados, trazo 1.75px, tamaño estándar 24px en 24px de zona táctil; en agendas densas tamaño 16px.',
    color: 'heredan tono de texto; estados ocupan color semántico con etiqueta.',
    usage: 'usar iconos para deporte, sede, horario, pago, estado y acciones repetidas.'
  },
  imagery: {
    style: 'fotografía deportiva real, luz natural, alto contraste, foco en canchas, jugadores en acción y superficies verdes; evitar archivos genéricos de banco.',
    ratio_primary: '16:9',
    ratio_card: '4:3',
    overlay: 'opcional degradado verde 900 a transparente para legibilidad del texto sobre imagen.'
  },
  motion: {
    micro_interaction: '150-200ms ease-out',
    page_transition: '250ms ease-out',
    loading: 'skeleton con pulso de opacidad 1.0 a 0.55',
    agenda_update: 'el cambio de estado usa un pulso de color de 300ms para dirigir la atención del encargado.',
    reduce_motion: 'respetar prefers-reduced-motion y desactivar desplazamientos y pulsos.'
  },
  accessibility: {
    contrast: 'contraste mínimo 4.5:1 para texto normal y 3:1 para texto grande; validar en verde y ámbar sobre blanco.',
    touch_target: 'mínimo 48x48px para acciones táctiles móviles.',
    focus: 'anillo de foco visible de 3px verde en todos los controles interactivos.',
    status_communication: 'ningún estado se comunica solo con color; siempre incluye etiqueta e icono.',
    density: 'en grilla de agenda, mantener filas de al menos 44px y textos de 12px mínimo.'
  }
};
```

---

## 10. FUNCTIONAL REQUIREMENTS COVERAGE

| Requirement | Implementation | Files |
|-------------|----------------|-------|
| Crear reserva temporal con retención de 10 minutos | `reservas-service` creates `BloqueoCancha` with `reserva.estado = 'retenida'`, Cloud Task scheduled for 10 minutes to release if not paid | `reservas-service/reservas.service.ts`, `reservas-service/reservas/entities/reserva.entity.ts` |
| Eliminar doble reserva (bloqueo de cancha a nivel DB) | `SELECT FOR UPDATE` on `cancha_id + inicio/fin` before insert; transaction rollback on conflict | `reservas-service/disponibilidad/disponibilidad.service.ts` |
| Pago online via Webpay Plus | `pagos-service` initiates transaction via Transbank SDK, stores `tokenTransbank`, handles IPN callback to confirm payment | `pagos-service/pagos/webpay.service.ts`, `pagos-service/pagos/pagos.controller.ts` |
| Pago dividido (split payment) | `initiatePayment` accepts `splitCantidad`, creates multiple `Pago` records with `es_parcial=true`, each with own Webpay token | `pagos-service/pagos/pagos.service.ts` |
| Devoluciones | Admin can call `/pagos/:id/devolver` which creates `Devolucion` record and calls Webpay refund API | `admin-service/admin/admin.controller.ts`, `pagos-service/pagos/pagos.service.ts` |
| Notificaciones WhatsApp 3 horas antes | `pagos-service/notifications/whatsapp.service.ts` called via Pub/Sub `recordatorio.reserva` topic scheduled by Cloud Scheduler | `pagos-service/notifications/whatsapp.service.ts` |
| Notificaciones email (confirmación, pago, recuperación) | `pagos-service/notifications/email.service.ts` uses SendGrid templates | `pagos-service/notifications/email.service.ts` |
| Login con Google OAuth | `auth-service/auth/google.strategy.ts` validates ID token, maps to internal `Jugador` record | `auth-service/auth/google.strategy.ts`, `auth-service/auth/auth.controller.ts` |
| Consentimiento datos personales (Ley 19.628) | `Jugador` has `consentimientos[]` relation, user must accept current version before first booking | `auth-service/auth/consent.dto.ts`, `auth-service/users/users.service.ts` |
| Agenda visual por cancha y hora para encargado | `sedes-service/sedes/agenda.service.ts` returns `AgendaRow[]` grid structure; `AgendaGrilla.tsx` renders desktop-first grid | `sedes-service/sedes/agenda.service.ts`, `frontend/src/components/ui/AgendaGrilla.tsx` |
| Marcar asistencia (asistió/no asistió) | `reservas-service/reservas/reservas.controller.ts` PUT `/:id/asistio` updates `estado` to `asistio` or `no_asistio` | `reservas-service/reservas/reservas.controller.ts` |
| Contador de inasistencias (bloqueo automático >3) | `Jugador.inasistencias60Dias` incremented when `no_asistio`; blocking triggered at >3 in 60-day window | `auth-service/users/entities/jugador.entity.ts`, `reservas-service/reservas/reservas.service.ts` |
| Reserva presencial por encargado | `reservas-service/reservas/reservas.controller.ts` accepts optional `jugadorId` (existing) or `contacto` (walk-in without account) | `frontend/src/pages/ReservaPresencial.tsx`, `reservas-service/reservas/reservas.controller.ts` |
| Gestión de clases y profesores | `clases-service/clases/clases.service.ts` CRUD for `Clase` and `InscripcionClase` | `clases-service/clases/clases.controller.ts`, `clases-service/clases/clases.service.ts` |
| Panel admin (tarifas, usuarios, reportes) | `admin-service/admin/admin.controller.ts` exposes tariff/user management; `reportes.service.ts` generates Excel/CSV | `admin-service/admin/admin.controller.ts`, `admin-service/admin/reportes.service.ts` |
| Exportar reportes Excel/CSV | `reportes.service.ts` uses `exceljs` library; `/admin/reportes/reservas` and `/admin/reportes/pagos` endpoints | `admin-service/admin/reportes.service.ts` |
| Diseño responsive (mobile-first jugador, desktop-first encargado) | CSS Modules with `tokens.ts`; breakpoints mobile/tablet/desktop defined in design tokens | `frontend/src/pages/BuscarCancha.tsx` (mobile), `frontend/src/pages/AgendaSede.tsx` (desktop) |
| Estados de reserva con color+icono+etiqueta | `BadgeEstado.tsx` renders based on `tokens.colors.reservation_status`, always shows label and icon | `frontend/src/components/ui/BadgeEstado.tsx` |
| Navegación inferior para jugadores | `BottomNav.tsx` renders `NavegacionPrincipal` with 4 items (Inicio, Buscar, Reservas, Perfil) | `frontend/src/components/layout/BottomNav.tsx` |
| Navegación superior para staff | `Header.tsx` renders full navigation bar with all 8 pages visible | `frontend/src/components/layout/Header.tsx` |
| Tiempo real disponibilidad | `disponibilidad.service.ts` queries DB for non-overlapping `reserva` records where `estado IN ('retenida', 'pagada')` | `reservas-service/disponibilidad/disponibilidad.service.ts` |
| Bloqueo de jugadores por encargado | `admin-service/admin/admin.controller.ts` POST `/bloqueo-jugador` creates `BloqueoJugador`; `reservas-service` checks before allowing new reservation | `admin-service/admin/admin.controller.ts`, `reservas-service/reservas/reservas.service.ts` |
| Autenticación JWT con refresh token | `auth-service/auth/jwt.strategy.ts` validates access token; refresh via `/auth/refresh` endpoint | `auth-service/auth/jwt.strategy.ts`, `auth-service/auth/auth.service.ts` |
| Prometheus metrics | Each service exposes `/metrics` endpoint with `prom-client` library (request counts, latencies, db pool stats) | `backend/*/src/main.ts` |
| Health checks | `/health` liveness and `/health/ready` readiness probes on all services | `backend/*/src/main.ts` |
| Recuperación contraseña | `auth-service/auth/auth.controller.ts` POST `/password-reset` sends email via SendGrid | `auth-service/auth/auth.controller.ts` |
| two-way SSL/secretos en Secret Manager | All secrets loaded from Google Secret Manager via environment injection | `backend/*/Dockerfile`, `docker-compose.yml` |
| Cloud SQL PostgreSQL con backup diario | PostgreSQL 15 on Cloud SQL with `backup` enabled; point-in-time recovery configured | Infrastructure (not code) |
| Contenedores Docker en Cloud Run | Each service has `Dockerfile` with multi-stage build; deployed as Cloud Run service | `backend/*/Dockerfile` |
| CI/CD con Cloud Build | `cloudbuild.yaml` with build, test, deploy stages | Infrastructure (not code) |

---

## APPENDIX: Business Rules Summary

### Reservation Flow
1. Jugador selects sede → deporte → fecha → time slot
2. System checks availability (no overlapping `retenida` or `pagada` for same `cancha_id` in time range)
3. If available: create `Reserva` with `estado='retenida'`, create `BloqueoCancha`, schedule Cloud Task for 10 minutes
4. Jugador redirected to Webpay checkout
5. On Webpay success: update `Reserva.estado='pagada'`, `confirmadaEn=now`, publish `reserva.pagada` event
6. On Webpay failure: keep as `retenida`, allow retry
7. On timeout: Cloud Task fires `reserva.expirada`, delete `BloqueoCancha`, update `Reserva.estado='cancelada'`

### Attendance Flow
1. After `fin` time passes, encargado sees reservation in agenda
2. Encargado clicks reservation → selects "Asistió" or "No asistió"
3. If "No asistió": increment `Jugador.inasistencias60Dias`; if >3 in 60 days, set `Jugador.bloqueado=true`
4. Blocked players cannot create new reservations until unblocked by admin

### Split Payment Flow
1. Jugador selects "Dividir pago" option on Pago page
2. Jugador enters number of players (2-4)
3. System creates N `Pago` records with `es_parcial=true`, each with unique Webpay token
4. Each player receives payment link via WhatsApp/email
5. Reservation only confirmed when all partial payments complete

### Data Consent (Ley 19.628)
1. New `Jugador` record created on first Google login
2. `CONSENTIMIENTO_DATOS` required before creating first reservation
3. Consent version tracked; re-prompt if version increments
4. Admin can export data only for users with `aceptado=true` consent

---

## APPENDIX: Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Availability | 99.5% uptime |
| Booking completion time | < 2 minutes end-to-end |
| Concurrent users | 80 users |
| Double booking incidents | 0 per month |
| No-show rate | < 5% within 4 months |
| Online payment adoption | 80% within 3 months |
| Staff time on reservations | < 30 minutes/day |
| Disaster recovery time | < 4 hours |
| Infrastructure cost | < 120 USD/month |
| Compliance | Ley 19.628 (data protection) |
```