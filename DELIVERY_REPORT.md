# Delivery Report

**Outcome:** `partial`

## Completion metrics

- Implementation files: 340
- Expected implementation files: 227
- Blocking items: 44/46 done
- Failed items: 2
- Requirements: not measured
- Fidelity: not measured
- Abort reason: Retry budget exceeded for 27

## Outstanding findings

- relocated: reservas-service/reservas.service.ts->backend/reservas-service/src/reservas/reservas.service.ts
- relocated: pagos-service/pagos/pagos.service.ts->backend/pagos-service/src/pagos/pagos.service.ts
- relocated: auth-service/auth/google.strategy.ts->backend/auth-service/src/auth/google.strategy.ts
- relocated: auth-service/users/users.service.ts->backend/auth-service/src/users/users.service.ts
- relocated: sedes-service/sedes/agenda.service.ts->backend/sedes-service/src/sedes/agenda.service.ts
- relocated: clases-service/clases/clases.controller.ts->backend/clases-service/src/clases/clases.controller.ts
- relocated: clases-service/clases/clases.service.ts->backend/clases-service/src/clases/clases.service.ts
- Fidelity requirement not verifiable (no repair item created): TC001: Reserva de cancha y pago exitoso con Webpay Plus → La reserva se registra con estado 'Confirmada' y 'Pagada'. Se envía un correo de confirmación al jugador. La cancha seleccionada no aparece como disponible para otros jugadores.
- Fidelity requirement not verifiable (no repair item created): TC002: Prevención de doble reserva para la misma cancha y horario → Jugador B no puede ver la Cancha X a Hora Y como disponible o recibe un mensaje de error indicando que ya está ocupada/retenida. La reserva de Jugador A se confirma correctamente.
- Fidelity requirement not verifiable (no repair item created): TC003: Liberación automática de cancha por pago no confirmado en 10 minutos → La Cancha X a Hora Y vuelve a aparecer como disponible para otros jugadores. La reserva iniciada por el primer jugador no se registra como confirmada.
- Fidelity requirement not verifiable (no repair item created): TC004: Registro manual de pago por personal de sede → El estado de la reserva cambia a 'Pagada'. La reserva se refleja como pagada en los reportes de la sede y en la conciliación manual.
- Fidelity requirement not verifiable (no repair item created): TC005: Bloqueo automático de jugador por inasistencias reiteradas → El sistema bloquea automáticamente al jugador para realizar nuevas reservas por un período de 30 días. El administrador puede ver el estado de bloqueo del jugador en el panel.
- Fidelity requirement not verifiable (no repair item created): TC006: Cancelación de reserva con y sin derecho a devolución según política → Para Jugador A: Se procesa una devolución del 100% del monto pagado. La cancha se libera. Para Jugador B: No se procesa ninguna devolución. La cancha se libera.
- Fidelity requirement not verifiable (no repair item created): TC007: Acceso restringido por sede para el personal → El usuario de Ñuñoa solo puede ver y gestionar la agenda y configuraciones de la sede 'Ñuñoa'. Cualquier intento de acceso o modificación a la sede 'La Florida' es rechazado con un mensaje de error de permisos.
- Fidelity requirement not verifiable (no repair item created): TC008: Gestión de devolución/cambio de hora por cancha no apta debido a lluvia → Se procesa una devolución del 100% del monto pagado al jugador. La reserva se marca como cancelada por lluvia y la cancha queda liberada. Si el jugador elige cambio de hora, se le permite seleccionar una nueva hora sin…
- Fidelity requirement not verifiable (no repair item created): TC009: Verificación de que el personal de sede no puede autorizar devoluciones excepcionales → El personal de sede no tiene acceso a la función de autorizar devoluciones excepcionales. La opción no está visible o cualquier intento de acceso/modificación es rechazado con un mensaje de 'Permiso deneg…
- Fidelity requirement not verifiable (no repair item created): TC010: Envío de recordatorio de reserva por WhatsApp 3 horas antes del partido → El jugador recibe un mensaje de recordatorio de su reserva a través de WhatsApp Business API, indicando la fecha, hora y cancha reservada.
- Fidelity requirement not verifiable (no repair item created): TC011: Registro de nuevo usuario con aceptación de la Ley 19.628 y gestión de datos → El registro es rechazado si no se acepta el consentimiento de la Ley 19.628. Tras aceptar y registrarse, el usuario puede iniciar sesión y ver sus datos personales. El usuario puede corregir sus datos (ej. nombre,…
- Fidelity requirement not verifiable (no repair item created): TC012: Jugador organiza reserva y divide el pago con compañeros usando Webpay Plus → La reserva se mantiene en estado 'Pendiente' hasta que todos los pagos (Jugador A, B y C) sean confirmados por Webpay. Una vez que todos los pagos se confirman, la reserva cambia a estado 'Pagada' y 'Confirmada'. S…
- Fidelity requirement not verifiable (no repair item created): TC013: Personal de sede crea una reserva presencial para un jugador → La reserva presencial se crea exitosamente y se muestra en la agenda de la sede con el estado 'Confirmada' o 'Pendiente' (si el pago es manual). La cancha seleccionada deja de aparecer como disponible para reservas online o para…
- Fidelity requirement not verifiable (no repair item created): TC014: Personal de sede bloquea una cancha por mantenimiento → La Cancha de Pádel 1 no aparece como disponible para reservas online ni para la creación de reservas presenciales durante el rango de tiempo especificado. El motivo del bloqueo es visible en la agenda para el personal de sede.
- Fidelity requirement not verifiable (no repair item created): TC015: Conciliación automática de pagos de pasarela → La reserva pagada en el paso 1 se concilia automáticamente y su estado es 'Pagada'. La transacción simulada en el paso 2 no genera una doble reserva ni un pago duplicado, y se marca como anómala o no asociada.
- Fidelity requirement not verifiable (no repair item created): TC016: Administrador autoriza devolución excepcional → La devolución excepcional se procesa exitosamente, el monto es reembolsado al jugador y la acción queda registrada con el motivo y el usuario administrador que la autorizó.
- Fidelity requirement not verifiable (no repair item created): TC017: Administrador configura nueva cancha y horarios → La nueva 'Cancha de Pádel 7' aparece como disponible para reservas en la plataforma de jugadores, con los horarios y precios definidos por el administrador.
- Fidelity requirement not verifiable (no repair item created): TC018: Profesor publica una clase de pádel → La clase creada por el profesor aparece como disponible para inscripción en la plataforma de jugadores. El jugador puede inscribirse a la clase, reduciendo los cupos disponibles.
- Fidelity requirement not verifiable (no repair item created): TC019: Administrador consulta reportes de ingresos y ocupación → El reporte muestra los ingresos totales generados por la sede La Florida durante el período seleccionado, así como el porcentaje de ocupación de las canchas. Los datos son coherentes con las reservas y pagos registrados.
- Fidelity requirement not verifiable (no repair item created): TC020: Registro e inicio de sesión de jugador con Google Sign-In → El usuario se registra exitosamente con su cuenta de Google y puede acceder a la plataforma. Tras cerrar sesión, puede iniciar sesión nuevamente sin problemas usando Google Sign-In.
- Fidelity requirement not verifiable (no repair item created): TC021: Administrador gestiona cuentas de personal (crear/desactivar) → La nueva cuenta de encargado se crea exitosamente y puede iniciar sesión con los permisos correctos para su sede. Tras la desactivación, la cuenta no puede iniciar sesión y se muestra como 'desactivada' en el panel de administra…
- Fidelity requirement not verifiable (no repair item created): TC022: Jugador solicita eliminación de datos personales → El sistema registra la solicitud de eliminación de datos del jugador. Se envía una confirmación al correo del jugador sobre la recepción de su solicitud. Los datos del jugador son marcados para eliminación o anonimización según la política d…
- Fidelity requirement not verifiable (no repair item created): TC023: Personal de sede visualiza datos de jugadores de su sede → El personal de Ñuñoa puede ver el nombre, teléfono y correo de los jugadores con reservas en Ñuñoa. No puede ver datos de jugadores con reservas exclusivas en La Florida.
- Fidelity requirement not verifiable (no repair item created): TC024: Personal de sede no puede exportar datos → No existen opciones visibles para exportar datos (agenda, reportes, datos de jugadores) a Excel o cualquier otro formato. Si intenta acceder a una URL de exportación directamente, el sistema debe denegar el acceso.
- Fidelity requirement not verifiable (no repair item created): TC025: Administrador exporta reportes a Excel → Se descarga un archivo Excel que contiene los datos de la agenda o el reporte seleccionado, con la información correcta y legible.
- Fidelity requirement not verifiable (no repair item created): TC026: Recuperación de contraseña para personal de sede → El personal de sede recibe el correo de recuperación, puede restablecer su contraseña exitosamente y acceder a la plataforma con la nueva contraseña.
- Fidelity requirement not verifiable (no repair item created): TC027: Jugador invita a compañeros a una reserva sin dividir el pago → Jugador B y C reciben una notificación de invitación a la reserva de Jugador A. La reserva de Jugador A muestra los compañeros invitados.
- Fidelity requirement not verifiable (no repair item created): TC028: Manejo de pago rechazado por Webpay Plus → La plataforma muestra un mensaje indicando que el pago fue rechazado. La cancha se libera inmediatamente y la reserva no se confirma. El estado de la reserva es 'Rechazada'.
- Fidelity requirement not verifiable (no repair item created): TC029: Administrador consulta reporte específico de no-shows por sede → El reporte muestra el número total de no-shows para la sede 'Ñuñoa' en el período, incluyendo detalles de las reservas afectadas.
- Fidelity requirement not verifiable (no repair item created): TC030: Personal de sede registra el check-in de una reserva pagada → El estado de la reserva cambia a 'Check-in' o 'Realizada'. La acción queda registrada en el sistema.
- Fidelity requirement not verifiable (no repair item created): TC031: Jugador edita y guarda cambios en sus datos personales → Los cambios en los datos personales se guardan exitosamente y se reflejan en el perfil del jugador.
- Fidelity requirement not verifiable (no repair item created): TC032: Administrador desactiva una cuenta de profesor existente → La cuenta del profesor se desactiva exitosamente. El profesor no puede iniciar sesión y sus clases publicadas ya no son visibles o reservables.
- Fidelity requirement not verifiable (no repair item created): TC033: Jugador intenta reservar una cancha bloqueada por mantenimiento → La Cancha X no aparece como disponible para el jugador durante el horario bloqueado. Cualquier intento de reserva es rechazado con un mensaje claro.
- Fidelity requirement not verifiable (no repair item created): NFR001: Verificar tiempo de respuesta de reserva completa con pago online. → El proceso completo de reserva y pago se completa en menos de 2 minutos.
- Fidelity requirement not verifiable (no repair item created): NFR002: Evaluar el rendimiento del sistema bajo carga de 80 usuarios concurrentes. → El sistema mantiene tiempos de respuesta aceptables (ej. <3 segundos para operaciones críticas) y una tasa de error mínima (<0.5%) sin generar dobles reservas, escalando eficientemente en Cloud Run y sin cuellos de…
- Fidelity requirement not verifiable (no repair item created): NFR003: Validar el proceso de recuperación de la base de datos en caso de desastre. → La base de datos se restaura completamente, con todos los datos íntegros y operativa en menos de 4 horas.
- Fidelity requirement not verifiable (no repair item created): NFR004: Verificar el cumplimiento de la Ley 19.628 para datos personales. → Los datos personales son accesibles solo por el usuario propietario o administradores autorizados. La modificación y eliminación de datos funcionan según lo esperado. El acceso no autorizado es rechazado, y los datos se alm…
- Fidelity requirement not verifiable (no repair item created): NFR005: Asegurar la retención de cancha durante el pago y liberación por timeout. → Jugador B no puede reservar la cancha mientras Jugador A está en el proceso de pago (cancha retenida). Después de 10 minutos sin confirmación de pago, la cancha se libera automáticamente y está disponible para que J…
- Fidelity requirement not verifiable (no repair item created): NFR006: Validar la seguridad y robustez de la integración con Webpay Plus. → La transacción exitosa se registra correctamente. El sistema detecta y rechaza intentos de manipulación o duplicación de pagos a través del callback. El sistema maneja errores de credenciales de Webpay de forma segura, sin…
- Fidelity requirement not verifiable (no repair item created): NFR007: Comprobar la disponibilidad y resiliencia de los servicios críticos de la plataforma. → Todos los servicios críticos de reserva y pago están operativos y responden correctamente, contribuyendo a una disponibilidad general del 99.5%. Una falla en un servicio secundario no impacta la funciona…
- Fidelity requirement not verifiable (no repair item created): Crear reserva temporal con retención de 10 minutos
- Fidelity requirement not verifiable (no repair item created): Eliminar doble reserva (bloqueo de cancha a nivel DB)
- Fidelity requirement not verifiable (no repair item created): Pago online via Webpay Plus
- Fidelity requirement not verifiable (no repair item created): Pago dividido (split payment)
- Fidelity requirement not verifiable (no repair item created): Devoluciones
- Fidelity requirement not verifiable (no repair item created): Notificaciones WhatsApp 3 horas antes
- Fidelity requirement not verifiable (no repair item created): Notificaciones email (confirmación, pago, recuperación)
- Fidelity requirement not verifiable (no repair item created): Login con Google OAuth
- Fidelity requirement not verifiable (no repair item created): Consentimiento datos personales (Ley 19.628)
- Fidelity requirement not verifiable (no repair item created): Agenda visual por cancha y hora para encargado
- Fidelity requirement not verifiable (no repair item created): Marcar asistencia (asistió/no asistió)
- Fidelity requirement not verifiable (no repair item created): Contador de inasistencias (bloqueo automático >3)
- Fidelity requirement not verifiable (no repair item created): Reserva presencial por encargado
- Fidelity requirement not verifiable (no repair item created): Gestión de clases y profesores
- Fidelity requirement not verifiable (no repair item created): Panel admin (tarifas, usuarios, reportes)
- Fidelity requirement not verifiable (no repair item created): Exportar reportes Excel/CSV
- Fidelity requirement not verifiable (no repair item created): Diseño responsive (mobile-first jugador, desktop-first encargado)
- Fidelity requirement not verifiable (no repair item created): Estados de reserva con color+icono+etiqueta
- Fidelity requirement not verifiable (no repair item created): Navegación inferior para jugadores
- Fidelity requirement not verifiable (no repair item created): Navegación superior para staff
- Fidelity requirement not verifiable (no repair item created): Tiempo real disponibilidad
- Fidelity requirement not verifiable (no repair item created): Bloqueo de jugadores por encargado
- Fidelity requirement not verifiable (no repair item created): Autenticación JWT con refresh token
- Fidelity requirement not verifiable (no repair item created): Prometheus metrics
- Fidelity requirement not verifiable (no repair item created): Recuperación contraseña
- Fidelity requirement not verifiable (no repair item created): two-way SSL/secretos en Secret Manager
- Fidelity requirement not verifiable (no repair item created): Contenedores Docker en Cloud Run
- Fidelity requirement not verifiable (no repair item created): Availability
- Fidelity requirement not verifiable (no repair item created): Booking completion time
- Fidelity requirement not verifiable (no repair item created): Concurrent users
- Fidelity requirement not verifiable (no repair item created): Double booking incidents
- Fidelity requirement not verifiable (no repair item created): No-show rate
- Fidelity requirement not verifiable (no repair item created): Online payment adoption
- Fidelity requirement not verifiable (no repair item created): Staff time on reservations
- Fidelity requirement not verifiable (no repair item created): Disaster recovery time
- Fidelity requirement not verifiable (no repair item created): Infrastructure cost
- Fidelity requirement not verifiable (no repair item created): Compliance
- Fidelity verifier unavailable: Fidelity verifier unavailable: 
- Ítem no completado: Frontend Infrastructure Setup (React 18 + Vite)
- Ítem no completado: Fidelity verification unavailable
- [project] Functional requirement not implemented: **Crear reserva temporal con retención de 10 minutos**
Implementation approach: `reservas-service` creates `BloqueoCancha` with `reserva.estado = 'retenida'`, Cloud Task scheduled for 10 minutes to release if not paid
Missing file(s) that must be created/completed:
  - `reservas-service/reservas/entities/reserva.entity.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Eliminar doble reserva (bloqueo de cancha a nivel DB)**
Implementation approach: `SELECT FOR UPDATE` on `cancha_id + inicio/fin` before insert; transaction rollback on conflict
Missing file(s) that must be created/completed:
  - `reservas-service/disponibilidad/disponibilidad.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Pago online via Webpay Plus**
Implementation approach: `pagos-service` initiates transaction via Transbank SDK, stores `tokenTransbank`, handles IPN callback to confirm payment
Missing file(s) that must be created/completed:
  - `pagos-service/pagos/webpay.service.ts`
  - `pagos-service/pagos/pagos.controller.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Devoluciones**
Implementation approach: Admin can call `/pagos/:id/devolver` which creates `Devolucion` record and calls Webpay refund API
Missing file(s) that must be created/completed:
  - `admin-service/admin/admin.controller.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Notificaciones WhatsApp 3 horas antes**
Implementation approach: `pagos-service/notifications/whatsapp.service.ts` called via Pub/Sub `recordatorio.reserva` topic scheduled by Cloud Scheduler
Missing file(s) that must be created/completed:
  - `pagos-service/notifications/whatsapp.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Notificaciones email (confirmación, pago, recuperación)**
Implementation approach: `pagos-service/notifications/email.service.ts` uses SendGrid templates
Missing file(s) that must be created/completed:
  - `pagos-service/notifications/email.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Login con Google OAuth**
Implementation approach: `auth-service/auth/google.strategy.ts` validates ID token, maps to internal `Jugador` record
Missing file(s) that must be created/completed:
  - `auth-service/auth/auth.controller.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Consentimiento datos personales (Ley 19.628)**
Implementation approach: `Jugador` has `consentimientos[]` relation, user must accept current version before first booking
Missing file(s) that must be created/completed:
  - `auth-service/auth/consent.dto.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Marcar asistencia (asistió/no asistió)**
Implementation approach: `reservas-service/reservas/reservas.controller.ts` PUT `/:id/asistio` updates `estado` to `asistio` or `no_asistio`
Missing file(s) that must be created/completed:
  - `reservas-service/reservas/reservas.controller.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Contador de inasistencias (bloqueo automático >3)**
Implementation approach: `Jugador.inasistencias60Dias` incremented when `no_asistio`; blocking triggered at >3 in 60-day window
Missing file(s) that must be created/completed:
  - `auth-service/users/entities/jugador.entity.ts`
  - `reservas-service/reservas/reservas.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Reserva presencial por encargado**
Implementation approach: `reservas-service/reservas/reservas.controller.ts` accepts optional `jugadorId` (existing) or `contacto` (walk-in without account)
Missing file(s) that must be created/completed:
  - `reservas-service/reservas/reservas.controller.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Panel admin (tarifas, usuarios, reportes)**
Implementation approach: `admin-service/admin/admin.controller.ts` exposes tariff/user management; `reportes.service.ts` generates Excel/CSV
Missing file(s) that must be created/completed:
  - `admin-service/admin/admin.controller.ts`
  - `admin-service/admin/reportes.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Exportar reportes Excel/CSV**
Implementation approach: `reportes.service.ts` uses `exceljs` library; `/admin/reportes/reservas` and `/admin/reportes/pagos` endpoints
Missing file(s) that must be created/completed:
  - `admin-service/admin/reportes.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Diseño responsive (mobile-first jugador, desktop-first encargado)**
Implementation approach: CSS Modules with `tokens.ts`; breakpoints mobile/tablet/desktop defined in design tokens
Missing file(s) that must be created/completed:
  - `frontend/src/pages/BuscarCancha.tsx` (mobile)`
  - `frontend/src/pages/AgendaSede.tsx` (desktop)`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Tiempo real disponibilidad**
Implementation approach: `disponibilidad.service.ts` queries DB for non-overlapping `reserva` records where `estado IN ('retenida', 'pagada')`
Missing file(s) that must be created/completed:
  - `reservas-service/disponibilidad/disponibilidad.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Bloqueo de jugadores por encargado**
Implementation approach: `admin-service/admin/admin.controller.ts` POST `/bloqueo-jugador` creates `BloqueoJugador`; `reservas-service` checks before allowing new reservation
Missing file(s) that must be created/completed:
  - `admin-service/admin/admin.controller.ts`
  - `reservas-service/reservas/reservas.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Autenticación JWT con refresh token**
Implementation approach: `auth-service/auth/jwt.strategy.ts` validates access token; refresh via `/auth/refresh` endpoint
Missing file(s) that must be created/completed:
  - `auth-service/auth/jwt.strategy.ts`
  - `auth-service/auth/auth.service.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
- [project] Functional requirement not implemented: **Recuperación contraseña**
Implementation approach: `auth-service/auth/auth.controller.ts` POST `/password-reset` sends email via SendGrid
Missing file(s) that must be created/completed:
  - `auth-service/auth/auth.controller.ts`

Instructions:
1. Create each missing file with complete, production-ready implementation.
2. Wire it into the service that owns it (add imports, register routes, etc.).
3. Do NOT create stub or placeholder files — implement the full logic.
4. Verify the file exists on disk after writing.
