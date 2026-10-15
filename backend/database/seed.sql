-- Sporty: Plataforma de Reservas Deportivas
-- Seed Data para desarrollo y testing
-- Ejecutar despues de migrations/001_initial_schema.sql

-- =====================================================
-- DATA SEED: Sedes iniciales
-- =====================================================
INSERT INTO sede (nombre, direccion, telefono) VALUES
    ('Ñuñoa', 'Av. Irarrazabal 2400, Ñuñoa, Santiago', '+56223456789'),
    ('La Florida', 'Av. La Florida 12345, La Florida, Santiago', '+56223456790');

-- =====================================================
-- DATA SEED: Canchas (6 padel, 4 futbol7)
-- =====================================================
-- Ñuñoa: 3 pádel (2 techadas, 1 abierta), 2 fútbol 7 (1 techada)
INSERT INTO cancha (sede_id, deporte, techada, estado) VALUES
    (1, 'padel', TRUE, 'disponible'),
    (1, 'padel', TRUE, 'disponible'),
    (1, 'padel', FALSE, 'disponible'),
    (1, 'futbol7', TRUE, 'disponible'),
    (1, 'futbol7', FALSE, 'disponible');

-- La Florida: 3 pádel (2 techadas, 1 abierta), 2 fútbol 7 (1 techada)
INSERT INTO cancha (sede_id, deporte, techada, estado) VALUES
    (2, 'padel', TRUE, 'disponible'),
    (2, 'padel', TRUE, 'disponible'),
    (2, 'padel', FALSE, 'disponible'),
    (2, 'futbol7', TRUE, 'disponible'),
    (2, 'futbol7', FALSE, 'disponible');

-- =====================================================
-- DATA SEED: Tarifas
-- =====================================================
-- Pádel
INSERT INTO tarifa (deporte, duracion_minutos, franja, monto) VALUES
    ('padel', 60, 'manana', 8000),
    ('padel', 60, 'tarde', 10000),
    ('padel', 60, 'noche', 12000),
    ('padel', 90, 'manana', 11000),
    ('padel', 90, 'tarde', 14000),
    ('padel', 90, 'noche', 16000),
    ('padel', 120, 'manana', 14000),
    ('padel', 120, 'tarde', 18000),
    ('padel', 120, 'noche', 20000);

-- Fútbol 7
INSERT INTO tarifa (deporte, duracion_minutos, franja, monto) VALUES
    ('futbol7', 60, 'manana', 15000),
    ('futbol7', 60, 'tarde', 20000),
    ('futbol7', 60, 'noche', 25000),
    ('futbol7', 90, 'manana', 22000),
    ('futbol7', 90, 'tarde', 28000),
    ('futbol7', 90, 'noche', 35000);

-- =====================================================
-- DATA SEED: Usuarios personal (contraseña: Test1234)
-- =====================================================
-- Hash bcrypt para 'Test1234'
INSERT INTO usuario_personal (sede_id, nombre, email, password_hash, rol, activo) VALUES
    (1, 'Carlos Encargado', 'carlos@nunoa.sporty.cl', '$2b$10$rQZ7qK8vJv5R.q5R.Z5K5eHn5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'encargado', TRUE),
    (1, 'María Profesora', 'maria@nunoa.sporty.cl', '$2b$10$rQZ7qK8vJv5R.q5R.Z5K5eHn5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'profesor', TRUE),
    (1, 'Admin Principal', 'admin@sporty.cl', '$2b$10$rQZ7qK8vJv5R.q5R.Z5K5eHn5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'administrador', TRUE),
    (2, 'Pedro Encargado', 'pedro@florida.sporty.cl', '$2b$10$rQZ7qK8vJv5R.q5R.Z5K5eHn5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'encargado', TRUE),
    (2, 'Ana Profesora', 'ana@florida.sporty.cl', '$2b$10$rQZ7qK8vJv5R.q5R.Z5K5eHn5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'profesor', TRUE);

-- =====================================================
-- DATA SEED: Jugadores de prueba
-- =====================================================
INSERT INTO jugador (nombre, email, telefono, bloqueado, inasistencias_60dias, google_id) VALUES
    ('Juan Jugador', 'juan@test.cl', '+56911111111', FALSE, 0, 'google_111111111'),
    ('Ana Jugadora', 'ana@test.cl', '+56922222222', FALSE, 0, 'google_222222222'),
    ('Pedro Jugador', 'pedro@test.cl', '+56933333333', FALSE, 1, 'google_333333333'),
    ('María Jugadora', 'maria@test.cl', '+56944444444', FALSE, 0, 'google_444444444'),
    ('Carlos Bloqueado', 'carlos@test.cl', '+56955555555', TRUE, 3, 'google_555555555');

-- =====================================================
-- DATA SEED: Consentimientos de datos (Ley 19.628)
-- =====================================================
INSERT INTO consentimiento_datos (jugador_id, version, fecha_consentimiento, aceptado) VALUES
    (1, '1.0', CURRENT_TIMESTAMP, TRUE),
    (2, '1.0', CURRENT_TIMESTAMP, TRUE),
    (3, '1.0', CURRENT_TIMESTAMP, TRUE),
    (4, '1.0', CURRENT_TIMESTAMP, TRUE),
    (5, '1.0', CURRENT_TIMESTAMP, TRUE);

-- =====================================================
-- DATA SEED: Reservas de ejemplo
-- =====================================================
-- Reserva pagada futuro
INSERT INTO reserva (jugador_id, cancha_id, tarifa_id, inicio, fin, estado, creada_en, confirmada_en) VALUES
    (1, 1, 2, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'pagada', NOW(), NOW());

-- Reserva retenida (en proceso de pago)
INSERT INTO reserva (jugador_id, cancha_id, tarifa_id, inicio, fin, estado, creada_en) VALUES
    (2, 3, 5, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 'retenida', NOW());

-- Reserva cancelada
INSERT INTO reserva (jugador_id, cancha_id, tarifa_id, inicio, fin, estado, creada_en) VALUES
    (3, 6, 10, NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '1 hour', 'cancelada', NOW());

-- =====================================================
-- DATA SEED: Pagos de ejemplo
-- =====================================================
INSERT INTO pago (reserva_id, monto_total, estado, token_transbank, referencia_transbank, pagado_en, es_parcial) VALUES
    (1, 10000, 'completado', 'token_webpay_001', 'ref_webpay_001', NOW(), FALSE);

-- =====================================================
-- DATA SEED: Clases de ejemplo
-- =====================================================
INSERT INTO clase (cancha_id, profesor_id, inicio, fin, nombre, cupos, precio) VALUES
    (1, 2, NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '11 hours', 'Clase Padel Iniciantes', 6, 5000),
    (2, 2, NOW() + INTERVAL '1 day' + INTERVAL '14 hours', NOW() + INTERVAL '1 day' + INTERVAL '15 hours', 'Clase Padel Intermedio', 4, 7000),
    (6, 5, NOW() + INTERVAL '2 days' + INTERVAL '9 hours', NOW() + INTERVAL '2 days' + INTERVAL '10 hours', 'Clase Futbol7 Niños', 10, 4000);

-- =====================================================
-- DATA SEED: Inscripciones a clases
-- =====================================================
INSERT INTO inscripcion_clase (clase_id, jugador_id, inscrita_en, estado) VALUES
    (1, 1, NOW(), 'activa'),
    (1, 2, NOW(), 'activa'),
    (2, 3, NOW(), 'activa');

-- =====================================================
-- DATA SEED: Bloqueos de cancha (mantenimiento)
-- =====================================================
INSERT INTO bloqueo_cancha (cancha_id, reserva_id, inicio, fin, estado, motivo) VALUES
    (1, NULL, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '4 hours', 'activo', 'Mantenimiento preventivo');

-- =====================================================
-- DATA SEED: Bloqueos de jugador
-- =====================================================
INSERT INTO bloqueo_jugador (jugador_id, creado_por, motivo, inicio, fin) VALUES
    (5, 3, 'Bloqueo automático por 3 inasistencias en 60 días', NOW(), NOW() + INTERVAL '30 days');
