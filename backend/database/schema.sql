-- Sporty: Plataforma de Reservas Deportivas
-- Database Schema for PostgreSQL 15
-- Generated from SPEC.md Architecture

-- Enable UUID extension for future use
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SEDE
-- =====================================================
CREATE TABLE sede (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_sede_nombre ON sede(nombre);

-- =====================================================
-- CANCHA
-- =====================================================
CREATE TABLE cancha (
    id SERIAL PRIMARY KEY,
    sede_id INTEGER NOT NULL REFERENCES sede(id) ON DELETE CASCADE,
    deporte VARCHAR(20) NOT NULL CHECK (deporte IN ('padel', 'futbol7')),
    techada BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'mantenimiento', 'bloqueada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cancha_sede_id ON cancha(sede_id);
CREATE INDEX idx_cancha_deporte ON cancha(deporte);
CREATE INDEX idx_cancha_estado ON cancha(estado);
CREATE UNIQUE INDEX idx_cancha_sede_nombre ON cancha(sede_id, deporte, techada);

-- =====================================================
-- TARIFA
-- =====================================================
CREATE TABLE tarifa (
    id SERIAL PRIMARY KEY,
    deporte VARCHAR(20) NOT NULL CHECK (deporte IN ('padel', 'futbol7')),
    duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos IN (30, 60, 90, 120, 180)),
    franja VARCHAR(10) NOT NULL CHECK (franja IN ('manana', 'tarde', 'noche')),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tarifa_deporte ON tarifa(deporte);
CREATE INDEX idx_tarifa_franja ON tarifa(franja);
CREATE UNIQUE INDEX idx_tarifa_deporte_duracion_franja ON tarifa(deporte, duracion_minutos, franja);

-- =====================================================
-- JUGADOR
-- =====================================================
CREATE TABLE jugador (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    inasistencias_60dias INTEGER NOT NULL DEFAULT 0,
    google_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_jugador_email ON jugador(email);
CREATE UNIQUE INDEX idx_jugador_google_id ON jugador(google_id);
CREATE INDEX idx_jugador_bloqueado ON jugador(bloqueado);

-- =====================================================
-- CONSENTIMIENTO_DATOS
-- =====================================================
CREATE TABLE consentimiento_datos (
    id SERIAL PRIMARY KEY,
    jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    fecha_consentimiento TIMESTAMP WITH TIME ZONE NOT NULL,
    aceptado BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consentimiento_jugador_id ON consentimiento_datos(jugador_id);
CREATE INDEX idx_consentimiento_version ON consentimiento_datos(version);

-- =====================================================
-- USUARIO_PERSONAL
-- =====================================================
CREATE TABLE usuario_personal (
    id SERIAL PRIMARY KEY,
    sede_id INTEGER NOT NULL REFERENCES sede(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('encargado', 'profesor', 'administrador')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_usuario_personal_email ON usuario_personal(email);
CREATE INDEX idx_usuario_personal_sede_id ON usuario_personal(sede_id);
CREATE INDEX idx_usuario_personal_rol ON usuario_personal(rol);
CREATE INDEX idx_usuario_personal_activo ON usuario_personal(activo);

-- =====================================================
-- RESERVA
-- =====================================================
CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE RESTRICT,
    cancha_id INTEGER NOT NULL REFERENCES cancha(id) ON DELETE RESTRICT,
    tarifa_id INTEGER NOT NULL REFERENCES tarifa(id) ON DELETE RESTRICT,
    inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'retenida' CHECK (estado IN ('retenida', 'pagada', 'cancelada', 'asistio', 'no_asistio')),
    creada_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmada_en TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reserva_jugador_id ON reserva(jugador_id);
CREATE INDEX idx_reserva_cancha_id ON reserva(cancha_id);
CREATE INDEX idx_reserva_tarifa_id ON reserva(tarifa_id);
CREATE INDEX idx_reserva_estado ON reserva(estado);
CREATE INDEX idx_reserva_inicio ON reserva(inicio);
CREATE INDEX idx_reserva_fin ON reserva(fin);
CREATE INDEX idx_reserva_cancha_estado_inicio ON reserva(cancha_id, estado, inicio, fin);

-- Constraint to prevent double booking
CREATE UNIQUE INDEX idx_reserva_cancha_tiempo_disponible
    ON reserva(cancha_id, inicio)
    WHERE estado IN ('retenida', 'pagada');

-- =====================================================
-- PAGO
-- =====================================================
CREATE TABLE pago (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reserva(id) ON DELETE RESTRICT,
    monto_total DECIMAL(10, 2) NOT NULL CHECK (monto_total > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
    token_transbank VARCHAR(255),
    referencia_transbank VARCHAR(255),
    pagado_en TIMESTAMP WITH TIME ZONE,
    es_parcial BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pago_reserva_id ON pago(reserva_id);
CREATE INDEX idx_pago_estado ON pago(estado);
CREATE INDEX idx_pago_token_transbank ON pago(token_transbank);

-- =====================================================
-- DEVOLUCION
-- =====================================================
CREATE TABLE devolucion (
    id SERIAL PRIMARY KEY,
    pago_id INTEGER NOT NULL REFERENCES pago(id) ON DELETE RESTRICT,
    autorizado_por INTEGER NOT NULL REFERENCES usuario_personal(id) ON DELETE RESTRICT,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    motivo TEXT NOT NULL,
    creada_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devolucion_pago_id ON devolucion(pago_id);
CREATE INDEX idx_devolucion_autorizado_por ON devolucion(autorizado_por);

-- =====================================================
-- BLOQUEO_CANCHA
-- =====================================================
CREATE TABLE bloqueo_cancha (
    id SERIAL PRIMARY KEY,
    cancha_id INTEGER NOT NULL REFERENCES cancha(id) ON DELETE CASCADE,
    reserva_id INTEGER REFERENCES reserva(id) ON DELETE SET NULL,
    inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'liberado')),
    motivo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bloqueo_cancha_cancha_id ON bloqueo_cancha(cancha_id);
CREATE INDEX idx_bloqueo_cancha_reserva_id ON bloqueo_cancha(reserva_id);
CREATE INDEX idx_bloqueo_cancha_estado ON bloqueo_cancha(estado);
CREATE INDEX idx_bloqueo_cancha_tiempo ON bloqueo_cancha(cancha_id, inicio, fin);

-- =====================================================
-- BLOQUEO_JUGADOR
-- =====================================================
CREATE TABLE bloqueo_jugador (
    id SERIAL PRIMARY KEY,
    jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
    creado_por INTEGER NOT NULL REFERENCES usuario_personal(id) ON DELETE RESTRICT,
    motivo TEXT NOT NULL,
    inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fin TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bloqueo_jugador_jugador_id ON bloqueo_jugador(jugador_id);
CREATE INDEX idx_bloqueo_jugador_creado_por ON bloqueo_jugador(creado_por);
CREATE INDEX idx_bloqueo_jugador_tiempo ON bloqueo_jugador(jugador_id, inicio, fin);

-- =====================================================
-- CLASE
-- =====================================================
CREATE TABLE clase (
    id SERIAL PRIMARY KEY,
    cancha_id INTEGER NOT NULL REFERENCES cancha(id) ON DELETE RESTRICT,
    profesor_id INTEGER NOT NULL REFERENCES usuario_personal(id) ON DELETE RESTRICT,
    inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fin TIMESTAMP WITH TIME ZONE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    cupos INTEGER NOT NULL CHECK (cupos >= 1 AND cupos <= 50),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clase_cancha_id ON clase(cancha_id);
CREATE INDEX idx_clase_profesor_id ON clase(profesor_id);
CREATE INDEX idx_clase_inicio ON clase(inicio);
CREATE INDEX idx_clase_fin ON clase(fin);

-- =====================================================
-- INSCRIPCION_CLASE
-- =====================================================
CREATE TABLE inscripcion_clase (
    id SERIAL PRIMARY KEY,
    clase_id INTEGER NOT NULL REFERENCES clase(id) ON DELETE CASCADE,
    jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
    inscrita_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inscripcion_clase_clase_id ON inscripcion_clase(clase_id);
CREATE INDEX idx_inscripcion_clase_jugador_id ON inscripcion_clase(jugador_id);
CREATE INDEX idx_inscripcion_clase_estado ON inscripcion_clase(estado);
CREATE UNIQUE INDEX idx_inscripcion_clase_unica ON inscripcion_clase(clase_id, jugador_id) WHERE estado = 'activa';

-- =====================================================
-- AUDIT LOG (for Ley 19.628 compliance)
-- =====================================================
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    registro_id INTEGER NOT NULL,
    usuario_id INTEGER,
    usuario_tipo VARCHAR(20),
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE')),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_tabla ON audit_log(tabla);
CREATE INDEX idx_audit_log_registro_id ON audit_log(registro_id);
CREATE INDEX idx_audit_log_usuario_id ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sede_updated_at
    BEFORE UPDATE ON sede
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cancha_updated_at
    BEFORE UPDATE ON cancha
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarifa_updated_at
    BEFORE UPDATE ON tarifa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jugador_updated_at
    BEFORE UPDATE ON jugador
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuario_personal_updated_at
    BEFORE UPDATE ON usuario_personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reserva_updated_at
    BEFORE UPDATE ON reserva
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pago_updated_at
    BEFORE UPDATE ON pago
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bloqueo_cancha_updated_at
    BEFORE UPDATE ON bloqueo_cancha
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bloqueo_jugador_updated_at
    BEFORE UPDATE ON bloqueo_jugador
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clase_updated_at
    BEFORE UPDATE ON clase
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscripcion_clase_updated_at
    BEFORE UPDATE ON inscripcion_clase
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA SEED: Initial Sedes
-- =====================================================
INSERT INTO sede (nombre, direccion, telefono) VALUES
    ('Ñuñoa', 'Av. Irarrazabal 2400, Ñuñoa, Santiago', '+56223456789'),
    ('La Florida', 'Av. La Florida 12345, La Florida, Santiago', '+56223456790');

-- =====================================================
-- DATA SEED: Initial Canchas (6 padel, 4 futbol7)
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
-- DATA SEED: Initial Tarifas
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
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE sede IS 'Sedes deportivas del complejo';
COMMENT ON TABLE cancha IS 'Canchas de pádel y fútbol 7 por sede';
COMMENT ON TABLE tarifa IS 'Tarifas por deporte, duración y franja horaria';
COMMENT ON TABLE jugador IS 'Jugadores registrados en la plataforma';
COMMENT ON TABLE consentimiento_datos IS 'Registro de consentimiento Ley 19.628';
COMMENT ON TABLE usuario_personal IS 'Personal de las sedes (encargados, profesores, administradores)';
COMMENT ON TABLE reserva IS 'Reservas de cancha con estado de retención/pago';
COMMENT ON TABLE pago IS 'Pagos asociados a reservas (Webpay)';
COMMENT ON TABLE devolucion IS 'Devoluciones autorizadas por administradores';
COMMENT ON TABLE bloqueo_cancha IS 'Bloqueos temporales de cancha (mantenimiento, retención por pago)';
COMMENT ON TABLE bloqueo_jugador IS 'Bloqueos de jugadores por inasistencias u otras razones';
COMMENT ON TABLE clase IS 'Clases programadas por profesores';
COMMENT ON TABLE inscripcion_clase IS 'Inscripciones de jugadores a clases';
COMMENT ON TABLE audit_log IS 'Log de auditoría para cumplimiento Ley 19.628';
