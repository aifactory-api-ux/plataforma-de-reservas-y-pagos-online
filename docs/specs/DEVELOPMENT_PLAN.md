# DEVELOPMENT PLAN: Sporty — Plataforma de Reservas Deportivas

## 1. ARCHITECTURE OVERVIEW

### System Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Port 23007)                           │
│                        React 18 + Vite + CSS Modules                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐          ┌─────────────────┐
│  Auth Service   │        │ Reservas        │          │ Pagos Service   │
│  (Port 23001)   │        │ Service         │          │ (Port 23003)    │
│  - JWT Auth     │        │ (Port 23002)    │          │ - Webpay Plus   │
│  - Google OAuth │        │ - Availability   │          │ - Split Pay     │
│  - Consentimiento│       │ - Retention     │          │ - Refunds       │
└─────────────────┘        └─────────────────┘          └─────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐          ┌─────────────────┐
│ Sedes Service   │        │ Clases Service  │          │ Admin Service   │
│ (Port 23004)    │        │ (Port 23005)    │          │ (Port 23006)    │
│ - Agenda Grid   │        │ - CRUD Clases   │          │ - Users CRUD    │
│ - Occupation    │        │ - Enrollment    │          │ - Tariffs       │
└─────────────────┘        └─────────────────┘          │ - Reports Excel │
                                      │                 └─────────────────┘
                                      ▼                            │
                         ┌─────────────────────────────────────────────┐
                         │           Google Cloud Pub/Sub              │
                         │  Topics: reserva.creada, reserva.pagada,   │
                         │  recordatorio.reserva, reserva.expirada    │
                         └─────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐          ┌─────────────────┐
│   Cloud SQL     │        │  Cloud Tasks   │          │   SendGrid      │
│   PostgreSQL 15 │        │  (10min hold)  │          │   WhatsApp API  │
└─────────────────┘        └─────────────────┘          └─────────────────┘
```

### Data Model (Core Entities)
```
Jugador ──────┬────── Reserva ──────┬────── Pago ──────┬────── Devolucion
              │                     │                  │
              └─── BloqueoJugador   │     Cancha ──────┴─── BloqueoCancha
                                   │
ConsentimientoDatos                └─── Tarifa
```

### Frontend File Structure
```
frontend/src/
├── pages/           → 8 pages (Login, BuscarCancha, Pago, MisReservas, AgendaSede, ReservaPresencial, MisClases, PanelAdmin)
├── components/      → Layout (3), UI (10), Reserva (3), Pago (3), Admin (3)
├── hooks/           → 5 custom hooks
├── services/        → 6 API services
├── context/         → 3 React contexts
└── styles/tokens.ts → Design tokens verbatim
```

### Backend Service Structure (6 microservices)
- **auth-service**: JWT + Google OAuth + Consentimiento (Ley 19.628)
- **reservas-service**: Reservas + Disponibilidad + Retencion 10min
- **pagos-service**: Webpay Plus + Split Payment + Devoluciones + Notificaciones
- **sedes-service**: Sedes + Agenda Grid + Ocupacion
- **clases-service**: Clases + Inscripciones
- **admin-service**: Usuarios + Tarifas + Bloqueos + Reportes Excel

---

## 2. ACCEPTANCE CRITERIA

1. TC001: Reserva de cancha y pago exitoso con Webpay Plus → La reserva se registra con estado 'Confirmada' y 'Pagada'. Se envía un correo de confirmación al jugador. La cancha seleccionada no aparece como disponible para otros jugadores.
2. TC002: Prevención de doble reserva para la misma cancha y horario → Jugador B no puede ver la Cancha X a Hora Y como disponible o recibe un mensaje de error indicando que ya está ocupada/retenida. La reserva de Jugador A se confirma correctamente.
3. TC003: Liberación automática de cancha por pago no confirmado en 10 minutos → La Cancha X a Hora Y vuelve a aparecer como disponible para otros jugadores. La reserva iniciada por el primer jugador no se registra como confirmada.
4. TC004: Registro manual de pago por personal de sede → El estado de la reserva cambia a 'Pagada'. La reserva se refleja como pagada en los reportes de la sede y en la conciliación manual.
5. TC005: Bloqueo automático de jugador por inasistencias reiteradas → El sistema bloquea automáticamente al jugador para realizar nuevas reservas por un período de 30 días. El administrador puede ver el estado de bloqueo del jugador en el panel.
6. TC006: Cancelación de reserva con y sin derecho a devolución según política → Para Jugador A: Se procesa una devolución del 100% del monto pagado. La cancha se libera. Para Jugador B: No se procesa ninguna devolución. La cancha se libera.
7. TC007: Acceso restringido por sede para el personal → El usuario de Ñuñoa solo puede ver y gestionar la agenda y configuraciones de la sede 'Ñuñoa'. Cualquier intento de acceso o modificación a la sede 'La Florida' es rechazado con un mensaje de error de permisos.
8. TC008: Gestión de devolución/cambio de hora por cancha no apta debido a lluvia → Se procesa una devolución del 100% del monto pagado al jugador. La reserva se marca como cancelada por lluvia y la cancha queda liberada. Si el jugador elige cambio de hora, se le permite seleccionar una nueva hora sin…
9. TC009: Verificación de que el personal de sede no puede autorizar devoluciones excepcionales → El personal de sede no tiene acceso a la función de autorizar devoluciones excepcionales. La opción no está visible o cualquier intento de acceso/modificación es rechazado con un mensaje de 'Permiso denegado'.
10. TC010: Envío de recordatorio de reserva por WhatsApp 3 horas antes del partido → El jugador recibe un mensaje de recordatorio de su reserva a través de WhatsApp Business API, indicando la fecha, hora y cancha reservada.
11. TC011: Registro de nuevo usuario con aceptación de la Ley 19.628 y gestión de datos → El registro es rechazado si no se acepta el consentimiento de la Ley 19.628. Tras aceptar y registrarse, el usuario puede iniciar sesión y ver sus datos personales. El usuario puede corregir sus datos (ej. nombre,…
12. TC012: Jugador organiza reserva y divide el pago con compañeros usando Webpay Plus → La reserva se mantiene en estado 'Pendiente' hasta que todos los pagos (Jugador A, B y C) sean confirmados por Webpay. Una vez que todos los pagos se confirman, la reserva cambia a estado 'Pagada' y 'Confirmada'. S…
13. TC013: Personal de sede crea una reserva presencial para un jugador → La reserva presencial se crea exitosamente y se muestra en la agenda de la sede con el estado 'Confirmada' o 'Pendiente' (si el pago es manual). La cancha seleccionada deja de aparecer como disponible para reservas online o para…
14. TC014: Personal de sede bloquea una cancha por mantenimiento → La Cancha de Pádel 1 no aparece como disponible para reservas online ni para la creación de reservas presenciales durante el rango de tiempo especificado. El motivo del bloqueo es visible en la agenda para el personal de sede.
15. TC015: Conciliación automática de pagos de pasarela → La reserva pagada en el paso 1 se concilia automáticamente y su estado es 'Pagada'. La transacción simulada en el paso 2 no genera una doble reserva ni un pago duplicado, y se marca como anómala o no asociada.
16. TC016: Administrador autoriza devolución excepcional → La devolución excepcional se procesa exitosamente, el monto es reembolsado al jugador y la acción queda registrada con el motivo y el usuario administrador que la autorizó.
17. TC017: Administrador configura nueva cancha y horarios → La nueva 'Cancha de Pádel 7' aparece como disponible para reservas en la plataforma de jugadores, con los horarios y precios definidos por el administrador.
18. TC018: Profesor publica una clase de pádel → La clase creada por el profesor aparece como disponible para inscripción en la plataforma de jugadores. El jugador puede inscribirse a la clase, reduciendo los cupos disponibles.
19. TC019: Administrador consulta reportes de ingresos y ocupación → El reporte muestra los ingresos totales generados por la sede La Florida durante el período seleccionado, así como el porcentaje de ocupación de las canchas. Los datos son coherentes con las reservas y pagos registrados.
20. TC020: Registro e inicio de sesión de jugador con Google Sign-In → El usuario se registra exitosamente con su cuenta de Google y puede acceder a la plataforma. Tras cerrar sesión, puede iniciar sesión nuevamente sin problemas usando Google Sign-In.
21. TC021: Administrador gestiona cuentas de personal (crear/desactivar) → La nueva cuenta de encargado se crea exitosamente y puede iniciar sesión con los permisos correctos para su sede. Tras la desactivación, la cuenta no puede iniciar sesión y se muestra como 'desactivada' en el panel de administra…
22. TC022: Jugador solicita eliminación de datos personales → El sistema registra la solicitud de eliminación de datos del jugador. Se envía una confirmación al correo del jugador sobre la recepción de su solicitud. Los datos del jugador son marcados para eliminación o anonimización según la política d…
23. TC023: Personal de sede visualiza datos de jugadores de su sede → El personal de Ñuñoa puede ver el nombre, teléfono y correo de los jugadores con reservas en Ñuñoa. No puede ver datos de jugadores con reservas exclusivas en La Florida.
24. TC024: Personal de sede no puede exportar datos → No existen opciones visibles para exportar datos (agenda, reportes, datos de jugadores) a Excel o cualquier otro formato. Si intenta acceder a una URL de exportación directamente, el sistema debe denegar el acceso.
25. TC025: Administrador exporta reportes a Excel → Se descarga un archivo Excel que contiene los datos de la agenda o el reporte seleccionado, con la información correcta y legible.
26. TC026: Recuperación de contraseña para personal de sede → El personal de sede recibe el correo de recuperación, puede restablecer su contraseña exitosamente y acceder a la plataforma con la nueva contraseña.
27. NFR001: Verificar tiempo de respuesta de reserva completa con pago online. → El proceso completo de reserva y pago se completa en menos de 2 minutos.
28. NFR002: Evaluar el rendimiento del sistema bajo carga de 80 usuarios concurrentes. → El sistema mantiene tiempos de respuesta aceptables (ej. <3 segundos para operaciones críticas) y una tasa de error mínima (<0.5%) sin generar dobles reservas, escalando eficientemente en Cloud Run y sin cuellos de…
29. NFR003: Validar el proceso de recuperación de la base de datos en caso de desastre. → La base de datos se restaura completamente, con todos los datos íntegros y operativa en menos de 4 horas.
30. NFR004: Verificar el cumplimiento de la Ley 19.628 para datos personales. → Los datos personales son accesibles solo por el usuario propietario o administradores autorizados. La modificación y eliminación de datos funcionan según lo esperado. El acceso no autorizado es rechazado, y los datos se alm…
31. NFR005: Asegurar la retención de cancha durante el pago y liberación por timeout. → Jugador B no puede reservar la cancha mientras Jugador A está en el proceso de pago (cancha retenida). Después de 10 minutos sin confirmación de pago, la cancha se libera automáticamente y está disponible para que J…
32. NFR006: Validar la seguridad y robustez de la integración con Webpay Plus. → La transacción exitosa se registra correctamente. El sistema detecta y rechaza intentos de manipulación o duplicación de pagos a través del callback. El sistema maneja errores de credenciales de Webpay de forma segura, sin…
33. NFR007: Comprobar la disponibilidad y resiliencia de los servicios críticos de la plataforma. → Todos los servicios críticos de reserva y pago están operativos y responden correctamente, contribuyendo a una disponibilidad general del 99.5%. Una falla en un servicio secundario no impacta la funciona…
34. NFR008: Verificar RBAC para encargados de sede y administradores, incluyendo acceso a datos de jugadores y exportación de reportes. → El encargado de Ñuñoa no puede ver ni modificar la agenda/reportes de La Florida, ni iniciar/autorizar devoluciones. Solo puede ver los datos personales de los jugad…
35. NFR009: Verificar la gestión de cuentas de personal y recuperación de contraseña. → El administrador puede crear y desactivar cuentas de personal. Las cuentas desactivadas no permiten el inicio de sesión. El flujo de recuperación de contraseña por correo funciona correctamente, permitiendo al perso…

---

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — Shared Types, Constants, Utilities y Database Schema
**Goal:** Crear toda la infraestructura compartida que los demás servicios importarán: tipos TypeScript, constantes, utilities de fecha/validación, y esquema de base de datos PostgreSQL con migraciones.
**Files to create:**
- backend/shared/types/reserva.types.ts (create) - AvailabilitySlot, AgendaRow, ReservationStatus
- backend/shared/types/pago.types.ts (create) - PaymentStatus, WebpayTransaction, Devolucion
- backend/shared/types/usuario.types.ts (create) - UserRole, Jugador, UsuarioPersonal
- backend/shared/constants/reservation-status.ts (create) - RESERVATION_STATUS enum
- backend/shared/constants/user-roles.ts (create) - USER_ROLES enum
- backend/shared/utils/date.utils.ts (create) - formatTime, formatDate, isSlotAvailable, addMinutes, startOfDay, endOfDay
- backend/shared/utils/validation.utils.ts (create) - isValidEmail, isValidPhone, isValidRUT
- backend/database/schema.sql (create) - Complete PostgreSQL schema con todas las tablas, foreign keys e índices
- backend/database/migrations/001_initial_schema.sql (create) - Migración inicial con tablas: sede, cancha, tarifa, jugador, consentimiento_datos, usuario_personal, reserva, pago, devolucion, bloqueo_cancha, bloqueo_jugador, clase, inscripcion_clase
- backend/database/seed.sql (create) - Datos de prueba: 2 sedes (Ñuñoa, La Florida), 4 canchas, tarifas, 1 admin
- backend/tsconfig.shared.json (create) - TypeScript config para shared module
**Dependencies:** None
**Validation:** `psql -f backend/database/schema.sql` ejecuta sin errores. Los tipos se importan correctamente en los servicios.
**Role:** role-tl (technical_lead)

### ITEM 2: Auth Service — JWT Authentication, Google OAuth y Consentimiento Ley 19.628
**Goal:** Implementar auth-service (port 23001) con login Google OAuth, JWT con refresh tokens, consentimiento de datos personales y recuperación de contraseña para personal.
**Files to create:**
- backend/auth-service/src/main.ts (create) - NestJS bootstrap, health endpoints (/health, /health/ready, /metrics)
- backend/auth-service/src/app.module.ts (create) - AppModule con TypeORM, JwtModule, PassportModule
- backend/auth-service/src/auth/auth.controller.ts (create) - POST /auth/google, /auth/refresh, /auth/logout, /auth/password-reset, /auth/consent
- backend/auth-service/src/auth/auth.service.ts (create) - Lógica de JWT, refresh tokens, validación Google ID token
- backend/auth-service/src/auth/jwt.strategy.ts (create) - Passport JWT strategy
- backend/auth-service/src/auth/google.strategy.ts (create) - Google OAuth validation
- backend/auth-service/src/auth/dto/google-login.dto.ts (create) - GoogleLoginDto
- backend/auth-service/src/auth/dto/consent.dto.ts (create) - ConsentDto
- backend/auth-service/src/users/users.module.ts (create) - UsersModule
- backend/auth-service/src/users/users.service.ts (create) - CRUD Jugador y UsuarioPersonal, búsqueda por email, bloqueo de jugadores
- backend/auth-service/src/users/entities/jugador.entity.ts (create) - Jugador entity con consentimientos relation
- backend/auth-service/src/users/entities/usuario-personal.entity.ts (create) - UsuarioPersonal entity
- backend/auth-service/src/database/database.module.ts (create) - TypeORM configuration
- backend/auth-service/src/common/guards/jwt-auth.guard.ts (create) - JwtAuthGuard
- backend/auth-service/src/common/guards/roles.guard.ts (create) - RolesGuard para RBAC
- backend/auth-service/src/common/decorators/roles.decorator.ts (create) - @Roles() decorator
- backend/auth-service/package.json (create) - Dependencias: @nestjs/core, @nestjs/typeorm, typeorm, pg, @nestjs/passport, passport-jwt, passport-google-oauth20, jsonwebtoken, bcrypt
- backend/auth-service/tsconfig.json (create) - strict: true, experimentalDecorators: true
- backend/auth-service/nest-cli.json (create) - { sourceRoot: 'src', compilerOptions: { deleteOutDir: true } }
- backend/auth-service/Dockerfile (create) - Multi-stage build, USER node, EXPOSE 23001
**Dependencies:** Item 1
**Validation:** POST /auth/google con idToken válido retorna accessToken. Health check responde {status: 'ok', service: 'auth-service'}.
**Role:** role-be (backend_developer)

### ITEM 3: Reservas Service — Reservas, Disponibilidad y Retención de 10 minutos
**Goal:** Implementar reservas-service (port 23002) con CRUD de reservas, cálculo de disponibilidad con bloqueo de doble reserva, y liberación automática por timeout de 10 minutos via Cloud Tasks.
**Files to create:**
- backend/reservas-service/src/main.ts (create) - NestJS bootstrap, health endpoints
- backend/reservas-service/src/app.module.ts (create) - AppModule con TypeORM, HttpModule para Cloud Tasks
- backend/reservas-service/src/reservas/reservas.controller.ts (create) - GET/POST/PUT/DELETE /reservas, GET /reservas/disponibilidad, POST /reservas/:id/asistio
- backend/reservas-service/src/reservas/reservas.service.ts (create) - Lógica de creación de reserva con SELECT FOR UPDATE, actualización de estado, marcado de asistencia, contador de inasistencias
- backend/reservas-service/src/reservas/reservas.module.ts (create) - ReservasModule
- backend/reservas-service/src/reservas/entities/reserva.entity.ts (create) - Reserva entity
- backend/reservas-service/src/reservas/entities/bloqueo-cancha.entity.ts (create) - BloqueoCancha entity
- backend/reservas-service/src/reservas/entities/bloqueo-jugador.entity.ts (create) - BloqueoJugador entity
- backend/reservas-service/src/disponibilidad/disponibilidad.service.ts (create) - Lógica de disponibilidad con query de reservas overlapping, SELECT FOR UPDATE para prevenir race conditions
- backend/reservas-service/src/disponibilidad/disponibilidad.module.ts (create) - DisponibilidadModule
- backend/reservas-service/src/球场/cancha.entity.ts (create) - Cancha entity
- backend/reservas-service/src/球场/sede.entity.ts (create) - Sede entity
- backend/reservas-service/src/球场/tarifas.entity.ts (create) - Tarifa entity
- backend/reservas-service/src/common/guards/jwt-auth.guard.ts (create) - JwtAuthGuard
- backend/reservas-service/package.json (create) - Dependencias NestJS, typeorm, pg, @google-cloud/tasks
- backend/reservas-service/tsconfig.json (create) - Config TypeScript
- backend/reservas-service/nest-cli.json (create) - Config NestJS CLI
- backend/reservas-service/Dockerfile (create) - Multi-stage build, EXPOSE 23002
**Dependencies:** Item 1
**Validation:** Crear reserva -> GET /reservas/disponibilidad para misma cancha/hora retorna no disponible. Health check responde correctamente.
**Role:** role-be (backend_developer)

### ITEM 4: Pagos Service — Webpay Plus, Split Payment, Devoluciones y Notificaciones
**Goal:** Implementar pagos-service (port 23003) con integración Webpay Plus, split payment para dividir entre jugadores, devoluciones, y servicios de email/WhatsApp para notificaciones.
**Files to create:**
- backend/pagos-service/src/main.ts (create) - NestJS bootstrap, health endpoints
- backend/pagos-service/src/app.module.ts (create) - AppModule con TypeORM, HttpModule
- backend/pagos-service/src/pagos/pagos.controller.ts (create) - POST /pagos/initiate, POST /pagos/webpay/callback, POST /pagos/webpay/notify, GET /pagos/:id, GET /pagos/reserva/:reservaId, POST /pagos/:id/devolver
- backend/pagos-service/src/pagos/pagos.service.ts (create) - Lógica de pagos, split payment (múltiples Pago records), validación de tokens Webpay
- backend/pagos-service/src/pagos/webpay.service.ts (create) - Integración Transbank Webpay Plus SDK, creación de transacción, manejo de callbacks
- backend/pagos-service/src/pagos/entities/pago.entity.ts (create) - Pago entity
- backend/pagos-service/src/pagos/entities/devolucion.entity.ts (create) - Devolucion entity
- backend/pagos-service/src/notifications/notifications.service.ts (create) - Orquestación de notificaciones
- backend/pagos-service/src/notifications/email.service.ts (create) - SendGrid API para confirmación de pago, recuperación de contraseña
- backend/pagos-service/src/notifications/whatsapp.service.ts (create) - WhatsApp Business API para recordatorio 3h antes
- backend/pagos-service/src/common/guards/jwt-auth.guard.ts (create) - JwtAuthGuard
- backend/pagos-service/package.json (create) - Dependencias incluyendo transbank-webpay-plus-sdk, @sendgrid/mail, axios
- backend/pagos-service/tsconfig.json (create) - Config TypeScript
- backend/pagos-service/nest-cli.json (create) - Config NestJS CLI
- backend/pagos-service/Dockerfile (create) - Multi-stage build, EXPOSE 23003
**Dependencies:** Item 1
**Validation:** POST /pagos/initiate retorna webpayUrl válido. Webpay callback actualiza estado de reserva a 'pagada'.
**Role:** role-be (backend_developer)

### ITEM 5: Sedes Service — Sedes, Agenda Grid y Ocupación
**Goal:** Implementar sedes-service (port 23004) con consulta de sedes, agenda visual por cancha y hora para encargado, y estadísticas de ocupación.
**Files to create:**
- backend/sedes-service/src/main.ts (create) - NestJS bootstrap, health endpoints
- backend/sedes-service/src/app.module.ts (create) - AppModule con TypeORM
- backend/sedes-service/src/sedes/sedes.controller.ts (create) - GET /sedes, GET /sedes/:id, GET /sedes/:id/agenda, GET /sedes/:id/ocupacion
- backend/sedes-service/src/sedes/sedes.service.ts (create) - Lógica de consulta de sedes
- backend/sedes-service/src/sedes/agenda.service.ts (create) - Generación de AgendaRow[] para grilla de agenda
- backend/sedes-service/src/球场/cancha.entity.ts (create) - Cancha entity
- backend/sedes-service/src/球场/sede.entity.ts (create) - Sede entity
- backend/sedes-service/src/common/guards/jwt-auth.guard.ts (create) - JwtAuthGuard con validación RBAC por sede
- backend/sedes-service/package.json (create) - Dependencias NestJS, typeorm, pg
- backend/sedes-service/tsconfig.json (create) - Config TypeScript
- backend/sedes-service/nest-cli.json (create) - Config NestJS CLI
- backend/sedes-service/Dockerfile (create) - Multi-stage build, EXPOSE 23004
**Dependencies:** Item 1
**Validation:** GET /sedes/:id/agenda?fecha=YYYY-MM-DD retorna estructura AgendaRow con todas las canchas. Encargado de Ñuñoa no puede acceder a agenda de La Florida.
**Role:** role-be (backend_developer)

### ITEM 6: Clases Service — Clases y Inscripciones de Jugadores
**Goal:** Implementar clases-service (port 23005) con CRUD completo de clases de pádel/fútbol, inscripción de jugadores y gestión de cupos.
**Files to create:**
- backend/clases-service/src/main.ts (create) - NestJS bootstrap, health endpoints
- backend/clases-service/src/app.module.ts (create) - AppModule con TypeORM
- backend/clases-service/src/clases/clases.controller.ts (create) - GET/POST/PUT/DELETE /clases, GET /clases/:id, POST /clases/:id/inscribir, DELETE /clases/:id/inscribir/:jugadorId
- backend/clases-service/src/clases/clases.service.ts (create) - Lógica de CRUD clases, validación de cupos, inscripción/desinscripción
- backend/clases-service/src/clases/entities/clase.entity.ts (create) - Clase entity
- backend/clases-service/src/clases/entities/inscripcion-clase.entity.ts (create) - InscripcionClase entity
- backend/clases-service/src/球场/cancha.entity.ts (create) - Cancha entity
- backend/clases-service/src/common/guards/jwt-auth.guard.ts (create) - JwtAuthGuard
- backend/clases-service/package.json (create) - Dependencias NestJS, typeorm, pg
- backend/clases-service/tsconfig.json (create) - Config TypeScript
- backend/clases-service/nest-cli.json (create) - Config NestJS CLI
- backend/clases-service/Dockerfile (create) - Multi-stage build, EXPOSE 23005
**Dependencies:** Item 1
**Validation:** POST /clases crea clase con cupos. POST /clases/:id/inscribir decrementa cupos disponibles. DELETE desinscripcion incrementa cupos.
**Role:** role-be (backend_developer)

### ITEM 7: Admin Service — Usuarios, Tarifas, Bloqueos y Reportes Excel
**Goal:** Implementar admin-service (port 23006) con gestión de usuarios personal, tarifas, bloqueos de jugadores, y exportación de reportes a Excel/CSV.
**Files to create:**
- backend/admin-service/src/main.ts (create) - NestJS bootstrap, health endpoints
- backend/admin-service/src/app.module.ts (create) - AppModule con TypeORM
- backend/admin-service/src/admin/admin.controller.ts (create) - GET/POST/PUT/DELETE /admin/usuarios, GET/POST/PUT /admin/tarifas, POST/DELETE /admin/bloqueo-jugador, GET /admin/reportes/reservas, GET /admin/reportes/pagos
- backend/admin-service/src/admin/admin.service.ts (create) - Lógica de usuarios, tarifas, bloqueos
- backend/admin-service/src/admin/reportes.service.ts (create) - Generación de Excel con exceljs, exportación CSV
- backend/admin-service/src/admin/entities/usuario-personal.entity.ts (create) - UsuarioPersonal entity
- backend/admin-service/src/admin/entities/tarifa.entity.ts (create) - Tarifa entity
- backend/admin-service/src/admin/entities/bloqueo-jugador.entity.ts (create) - BloqueoJugador entity
- backend/admin-service/src/球场/sede.entity.ts (create) - Sede entity
- backend/admin-service/src/球场/reserva.entity.ts (create) - Reserva entity
- backend/admin-service/src/common/guards/jwt-auth.guard.ts (create) - JwtAuthGuard con rol administrador
- backend/admin-service/package.json (create) - Dependencias NestJS, typeorm, pg, exceljs
- backend/admin-service/tsconfig.json (create) - Config TypeScript
- backend/admin-service/nest-cli.json (create) - Config NestJS CLI
- backend/admin-service/Dockerfile (create) - Multi-stage build, EXPOSE 23006
**Dependencies:** Item 1
**Validation:** POST /admin/usuarios crea usuario. GET /admin/reportes/reservas?formato=excel retorna Blob válido. Encargado no puede acceder a estos endpoints.
**Role:** role-be (backend_developer)

### ITEM 8: Frontend Foundation — Design Tokens, Base Styles y Componentes UI Base
**Goal:** Implementar la base del frontend React con tokens de diseño verbatim, estilos CSS Modules base, y componentes UI reutilizables según el contrato UI/UX.
**Files to create:**
- frontend/src/styles/tokens.ts (create) - Design tokens verbatim del contrato UI/UX (colors, typography, spacing, radii, shadows, breakpoints, motion, accessibility)
- frontend/src/index.css (create) - Reset CSS, imports de fuentes (Barlow Condensed, Inter), variables CSS
- frontend/src/main.tsx (create) - Entry point React con ReactDOM.createRoot
- frontend/src/App.tsx (create) - Router principal con React Router v6
- frontend/src/types/models.ts (create) - Todas las interfaces TypeScript: Sede, Cancha, Tarifa, Jugador, Reserva, Pago, Clase, InscripcionClase, UsuarioPersonal
- frontend/src/types/api.ts (create) - Tipos de requests/responses API
- frontend/src/components/ui/BotonAccionPrincipal.tsx (create) - Botón principal con variantes, estados loading/disabled
- frontend/src/components/ui/TarjetaResumen.tsx (create) - Tarjeta de resumen de reserva
- frontend/src/components/ui/BadgeEstado.tsx (create) - Badge con color, icono y label según estado
- frontend/src/components/ui/SelectorDeporteFecha.tsx (create) - Selector de deporte, sede, fecha y rango horario
- frontend/src/components/ui/FilaDisponibilidad.tsx (create) - Fila de disponibilidad de cancha
- frontend/src/components/ui/AgendaGrilla.tsx (create) - Grilla de agenda desktop
- frontend/src/components/ui/ContadorRetencion.tsx (create) - Timer de retención 10 minutos
- frontend/src/components/ui/ModalConfirmacion.tsx (create) - Modal de confirmación genérico
- frontend/src/components/layout/NavegacionPrincipal.tsx (create) - Navegación con items por rol
- frontend/src/components/layout/Header.tsx (create) - Header desktop para staff
- frontend/src/components/layout/BottomNav.tsx (create) - Bottom nav mobile para jugadores
- frontend/package.json (create) - Dependencias: react, react-dom, react-router-dom, axios, lucide-react
- frontend/tsconfig.json (create) - Config TypeScript strict
- frontend/vite.config.ts (create) - Vite config con proxy para API
- frontend/public/index.html (create) - HTML entry con Google Fonts
- frontend/Dockerfile (create) - Multi-stage: node:20-alpine build -> nginx:alpine serve, ARG VITE_API_URL
**Dependencies:** Item 1
**Validation:** npm run dev inicia sin errores. Los tokens se renderizan correctamente. Componentes UI responden según variants.
**Role:** role-fe (frontend_developer)

### ITEM 9: Frontend Player Flow — Login, BuscarCancha, Pago y MisReservas
**Goal:** Implementar flujo de jugador: Login con Google OAuth, búsqueda de disponibilidad, proceso de reserva con retención de 10min, pago Webpay (incluyendo split payment), y vista de mis reservas.
**Files to create:**
- frontend/src/pages/Login.tsx (create) - Página de login con Google Sign-In button, consentimiento Ley 19.628
- frontend/src/pages/BuscarCancha.tsx (create) - Selector sede/deporte/fecha, lista de disponibilidad, selección de horario
- frontend/src/pages/Pago.tsx (create) - Resumen reserva, opciones de pago (normal/split), timer de retención, redirección Webpay, estado de pago
- frontend/src/pages/MisReservas.tsx (create) - Lista de reservas del jugador con filtros, acciones (cancelar)
- frontend/src/components/reserva/ReservaForm.tsx (create) - Formulario de contacto para reserva
- frontend/src/components/reserva/DisponibilidadList.tsx (create) - Lista de slots disponibles
- frontend/src/components/reserva/RetentionTimer.tsx (create) - Timer con countdown visual
- frontend/src/components/pago/PaymentForm.tsx (create) - Formulario de pago con Webpay
- frontend/src/components/pago/SplitPaymentOptions.tsx (create) - Opciones para dividir pago entre 2-4 jugadores
- frontend/src/components/pago/PaymentStatus.tsx (create) - Estados de pago (pendiente/pagado/fallido)
- frontend/src/context/AuthContext.tsx (create) - Contexto de autenticación con useAuth hook
- frontend/src/context/ReservationContext.tsx (create) - Contexto de reserva con useReservas hook
- frontend/src/hooks/useAuth.ts (create) - Hook useAuth → AuthContextValue
- frontend/src/hooks/useReservas.ts (create) - Hook useReservas → ReservationContextValue
- frontend/src/services/api.ts (create) - Configuración Axios con interceptors, URLs de servicios
- frontend/src/services/auth.service.ts (create) - loginWithGoogle, refreshToken, logout, requestPasswordReset
- frontend/src/services/reservas.service.ts (create) - getReservas, createReserva, cancelReserva, getDisponibilidad
- frontend/src/services/pagos.service.ts (create) - initiatePayment, getPaymentStatus, processRefund
**Dependencies:** Item 8
**Validation:** Login Google redirecciona a BuscarCancha. Reserva creada muestra timer de 10min. Pago exitoso cambia estado a 'pagada'.
**Role:** role-fe (frontend_developer)

### ITEM 10: Frontend Staff Flow — AgendaSede, ReservaPresencial y MisClases
**Goal:** Implementar flujo de personal de sede: agenda visual desktop, creación de reservas presenciales, y gestión de clases para profesores.
**Files to create:**
- frontend/src/pages/AgendaSede.tsx (create) - Grilla de agenda con todas las canchas, slots por hora, acciones de reservado (ver/cambiar estado)
- frontend/src/pages/ReservaPresencial.tsx (create) - Formulario para crear reserva presencial para jugador existente o nuevo
- frontend/src/pages/MisClases.tsx (create) - Lista de clases del profesor, creación/edición de clases, lista de inscritos
- frontend/src/context/NotificationContext.tsx (create) - Contexto de notificaciones con useNotifications hook
- frontend/src/hooks/useSedes.ts (create) - Hook useSedes → SedesContextValue
- frontend/src/hooks/useClases.ts (create) - Hook useClases → ClasesContextValue
- frontend/src/services/sedes.service.ts (create) - getSedes, getSedeAgenda, getOcupacion
- frontend/src/services/clases.service.ts (create) - getClases, createClase, enrollInClase, unenrollFromClase
- frontend/src/utils/date.utils.ts (create) - formatTime, formatDate, isSlotAvailable, addMinutes
- frontend/src/utils/formatters.ts (create) - formateadores de moneda, fecha, teléfono
- frontend/src/utils/validators.ts (create) - isValidEmail, isValidPhone
**Dependencies:** Item 8, Item 9
**Validation:** AgendaSede muestra todas las canchas con reservas. ReservaPresencial crea reserva visible en agenda. MisClases permite crear clase con cupos.
**Role:** role-fe (frontend_developer)

### ITEM 11: Frontend Admin Flow — PanelAdmin, Reportes y Gestión de Usuarios
**Goal:** Implementar flujo de administrador: panel con tabs para usuarios, tarifas, reportes, y funcionalidad de exportar a Excel.
**Files to create:**
- frontend/src/pages/PanelAdmin.tsx (create) - Tabs: Usuarios, Tarifas, Bloqueos, Reportes
- frontend/src/components/admin/TariffEditor.tsx (create) - Editor de tarifas por deporte, franja, duración
- frontend/src/components/admin/UserManager.tsx (create) - Lista de usuarios, crear/desactivar, ver estado de bloqueo
- frontend/src/components/admin/ReportExporter.tsx (create) - Selector de reporte, período, formato, botón exportar
- frontend/src/components/layout/AdminLayout.tsx (create) - Layout con sidebar de navegación admin
- frontend/src/hooks/usePagos.ts (create) - Hook usePagos → PagosContextValue
- frontend/src/services/admin.service.ts (create) - CRUD usuarios, tarifas, bloqueos, reportes
**Dependencies:** Item 8, Item 10
**Validation:** PanelAdmin solo accesible para rol administrador. Exportar reportes genera descarga de Excel válido.
**Role:** role-fe (frontend_developer)

### ITEM 12: Infrastructure — Docker Orchestration, Environment Config y Scripts
**Goal:** Completar orquestación Docker con todos los servicios, healthchecks, scripts de ejecución y documentación.
**Files to create:**
- docker-compose.yml (create) - Todos los servicios con healthcheck, depends_on service_healthy, networks
- .env.example (create) - TODAS las variables de entorno documentadas: DATABASE_*, JWT_*, GOOGLE_*, WEBPAY_*, SENDGRID_*, WHATSAPP_*, REDIS_*, VITE_*
- .gitignore (create) - node_modules, dist, .env, __pycache__, *.pyc, .DS_Store, logs/
- .dockerignore (create) - node_modules, .git, *.log, dist, .env
- run.sh (create) - Valida Docker, docker-compose up --build, espera servicios healthy, imprime URLs
- README.md (create) - Prerequisites | Clone | Run (./run.sh) | Test | Endpoints | Architecture
- docs/architecture.md (create) - Diagrama del sistema, descripción de componentes, flujos de datos
- docs/api.md (create) - Especificación de API endpoints
**Dependencies:** Item 2, Item 3, Item 4, Item 5, Item 6, Item 7, Item 8, Item 9, Item 10, Item 11
**Validation:** ./run.sh completa sin errores, todos los servicios reportan healthy, frontend accesible en http://localhost:23007, APIs responden correctamente.
**Role:** role-devops (devops_support)