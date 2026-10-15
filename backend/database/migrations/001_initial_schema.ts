import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000001 implements MigrationInterface {
  name = 'InitialSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE sede (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_sede_nombre ON sede(nombre)`);

    await queryRunner.query(`
      CREATE TABLE cancha (
        id SERIAL PRIMARY KEY,
        sede_id INTEGER NOT NULL REFERENCES sede(id) ON DELETE CASCADE,
        deporte VARCHAR(20) NOT NULL CHECK (deporte IN ('padel', 'futbol7')),
        techada BOOLEAN NOT NULL DEFAULT FALSE,
        estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'mantenimiento', 'bloqueada')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_cancha_sede_id ON cancha(sede_id)`);
    await queryRunner.query(`CREATE INDEX idx_cancha_deporte ON cancha(deporte)`);
    await queryRunner.query(`CREATE INDEX idx_cancha_estado ON cancha(estado)`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_cancha_sede_nombre ON cancha(sede_id, deporte, techada)`);

    await queryRunner.query(`
      CREATE TABLE tarifa (
        id SERIAL PRIMARY KEY,
        deporte VARCHAR(20) NOT NULL CHECK (deporte IN ('padel', 'futbol7')),
        duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos IN (30, 60, 90, 120, 180)),
        franja VARCHAR(10) NOT NULL CHECK (franja IN ('manana', 'tarde', 'noche')),
        monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_tarifa_deporte ON tarifa(deporte)`);
    await queryRunner.query(`CREATE INDEX idx_tarifa_franja ON tarifa(franja)`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_tarifa_deporte_duracion_franja ON tarifa(deporte, duracion_minutos, franja)`);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_jugador_email ON jugador(email)`);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_jugador_google_id ON jugador(google_id)`);
    await queryRunner.query(`CREATE INDEX idx_jugador_bloqueado ON jugador(bloqueado)`);

    await queryRunner.query(`
      CREATE TABLE consentimiento_datos (
        id SERIAL PRIMARY KEY,
        jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
        version VARCHAR(20) NOT NULL,
        fecha_consentimiento TIMESTAMP WITH TIME ZONE NOT NULL,
        aceptado BOOLEAN NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_consentimiento_jugador_id ON consentimiento_datos(jugador_id)`);
    await queryRunner.query(`CREATE INDEX idx_consentimiento_version ON consentimiento_datos(version)`);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX idx_usuario_personal_email ON usuario_personal(email)`);
    await queryRunner.query(`CREATE INDEX idx_usuario_personal_sede_id ON usuario_personal(sede_id)`);
    await queryRunner.query(`CREATE INDEX idx_usuario_personal_rol ON usuario_personal(rol)`);
    await queryRunner.query(`CREATE INDEX idx_usuario_personal_activo ON usuario_personal(activo)`);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_reserva_jugador_id ON reserva(jugador_id)`);
    await queryRunner.query(`CREATE INDEX idx_reserva_cancha_id ON reserva(cancha_id)`);
    await queryRunner.query(`CREATE INDEX idx_reserva_tarifa_id ON reserva(tarifa_id)`);
    await queryRunner.query(`CREATE INDEX idx_reserva_estado ON reserva(estado)`);
    await queryRunner.query(`CREATE INDEX idx_reserva_inicio ON reserva(inicio)`);
    await queryRunner.query(`CREATE INDEX idx_reserva_fin ON reserva(fin)`);
    await queryRunner.query(`CREATE INDEX idx_reserva_cancha_estado_inicio ON reserva(cancha_id, estado, inicio, fin)`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_reserva_cancha_tiempo_disponible
      ON reserva(cancha_id, inicio)
      WHERE estado IN ('retenida', 'pagada')
    `);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_pago_reserva_id ON pago(reserva_id)`);
    await queryRunner.query(`CREATE INDEX idx_pago_estado ON pago(estado)`);
    await queryRunner.query(`CREATE INDEX idx_pago_token_transbank ON pago(token_transbank)`);

    await queryRunner.query(`
      CREATE TABLE devolucion (
        id SERIAL PRIMARY KEY,
        pago_id INTEGER NOT NULL REFERENCES pago(id) ON DELETE RESTRICT,
        autorizado_por INTEGER NOT NULL REFERENCES usuario_personal(id) ON DELETE RESTRICT,
        monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
        motivo TEXT NOT NULL,
        creada_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_devolucion_pago_id ON devolucion(pago_id)`);
    await queryRunner.query(`CREATE INDEX idx_devolucion_autorizado_por ON devolucion(autorizado_por)`);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_cancha_cancha_id ON bloqueo_cancha(cancha_id)`);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_cancha_reserva_id ON bloqueo_cancha(reserva_id)`);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_cancha_estado ON bloqueo_cancha(estado)`);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_cancha_tiempo ON bloqueo_cancha(cancha_id, inicio, fin)`);

    await queryRunner.query(`
      CREATE TABLE bloqueo_jugador (
        id SERIAL PRIMARY KEY,
        jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
        creado_por INTEGER NOT NULL REFERENCES usuario_personal(id) ON DELETE RESTRICT,
        motivo TEXT NOT NULL,
        inicio TIMESTAMP WITH TIME ZONE NOT NULL,
        fin TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_jugador_jugador_id ON bloqueo_jugador(jugador_id)`);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_jugador_creado_por ON bloqueo_jugador(creado_por)`);
    await queryRunner.query(`CREATE INDEX idx_bloqueo_jugador_tiempo ON bloqueo_jugador(jugador_id, inicio, fin)`);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_clase_cancha_id ON clase(cancha_id)`);
    await queryRunner.query(`CREATE INDEX idx_clase_profesor_id ON clase(profesor_id)`);
    await queryRunner.query(`CREATE INDEX idx_clase_inicio ON clase(inicio)`);
    await queryRunner.query(`CREATE INDEX idx_clase_fin ON clase(fin)`);

    await queryRunner.query(`
      CREATE TABLE inscripcion_clase (
        id SERIAL PRIMARY KEY,
        clase_id INTEGER NOT NULL REFERENCES clase(id) ON DELETE CASCADE,
        jugador_id INTEGER NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
        inscrita_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_clase_clase_id ON inscripcion_clase(clase_id)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_clase_jugador_id ON inscripcion_clase(jugador_id)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_clase_estado ON inscripcion_clase(estado)`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_inscripcion_clase_unica
      ON inscripcion_clase(clase_id, jugador_id)
      WHERE estado = 'activa'
    `);

    await queryRunner.query(`
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
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_audit_log_tabla ON audit_log(tabla)`);
    await queryRunner.query(`CREATE INDEX idx_audit_log_registro_id ON audit_log(registro_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_log_usuario_id ON audit_log(usuario_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_log_created_at ON audit_log(created_at)`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    const tables = [
      'sede', 'cancha', 'tarifa', 'jugador', 'usuario_personal',
      'reserva', 'pago', 'devolucion', 'bloqueo_cancha', 'bloqueo_jugador',
      'clase', 'inscripcion_clase'
    ];

    for (const table of tables) {
      await queryRunner.query(`
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'inscripcion_clase', 'clase', 'bloqueo_jugador', 'bloqueo_cancha',
      'devolucion', 'pago', 'reserva', 'usuario_personal', 'consentimiento_datos',
      'jugador', 'tarifa', 'cancha', 'sede', 'audit_log'
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}`);
    }

    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_log`);
    await queryRunner.query(`DROP TABLE IF EXISTS inscripcion_clase`);
    await queryRunner.query(`DROP TABLE IF EXISTS clase`);
    await queryRunner.query(`DROP TABLE IF EXISTS bloqueo_jugador`);
    await queryRunner.query(`DROP TABLE IF EXISTS bloqueo_cancha`);
    await queryRunner.query(`DROP TABLE IF EXISTS devolucion`);
    await queryRunner.query(`DROP TABLE IF EXISTS pago`);
    await queryRunner.query(`DROP TABLE IF EXISTS reserva`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuario_personal`);
    await queryRunner.query(`DROP TABLE IF EXISTS consentimiento_datos`);
    await queryRunner.query(`DROP TABLE IF EXISTS jugador`);
    await queryRunner.query(`DROP TABLE IF EXISTS tarifa`);
    await queryRunner.query(`DROP TABLE IF EXISTS cancha`);
    await queryRunner.query(`DROP TABLE IF EXISTS sede`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
