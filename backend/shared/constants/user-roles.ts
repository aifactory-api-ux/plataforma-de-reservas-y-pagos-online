export const USER_ROLES = {
  ENCARGADO: 'encargado',
  PROFESOR: 'profesor',
  ADMINISTRADOR: 'administrador',
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_ROLES_LABELS: Record<UserRoleType, string> = {
  [USER_ROLES.ENCARGADO]: 'Encargado de Sede',
  [USER_ROLES.PROFESOR]: 'Profesor',
  [USER_ROLES.ADMINISTRADOR]: 'Administrador',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ENCARGADO]: [
    'reservas.read',
    'reservas.create',
    'reservas.update',
    'agenda.read',
    'jugadores.read',
    'jugadores.update',
    'pagos.read',
    'pagos.create',
    'clases.read',
  ],
  [USER_ROLES.PROFESOR]: [
    'reservas.read',
    'agenda.read',
    'clases.read',
    'clases.create',
    'clases.update',
    'jugadores.read',
  ],
  [USER_ROLES.ADMINISTRADOR]: [
    'reservas.read',
    'reservas.create',
    'reservas.update',
    'reservas.delete',
    'agenda.read',
    'jugadores.read',
    'jugadores.update',
    'jugadores.delete',
    'pagos.read',
    'pagos.update',
    'devoluciones.create',
    'clases.read',
    'clases.create',
    'clases.update',
    'clases.delete',
    'usuarios.read',
    'usuarios.create',
    'usuarios.update',
    'usuarios.delete',
    'sedes.read',
    'sedes.create',
    'sedes.update',
    'canchas.read',
    'canchas.create',
    'canchas.update',
    'tarifas.read',
    'tarifas.create',
    'tarifas.update',
    'reportes.read',
    'reportes.export',
  ],
} as const;

export type Permission =
  | 'reservas.read'
  | 'reservas.create'
  | 'reservas.update'
  | 'reservas.delete'
  | 'agenda.read'
  | 'jugadores.read'
  | 'jugadores.update'
  | 'jugadores.delete'
  | 'pagos.read'
  | 'pagos.create'
  | 'pagos.update'
  | 'devoluciones.create'
  | 'clases.read'
  | 'clases.create'
  | 'clases.update'
  | 'clases.delete'
  | 'usuarios.read'
  | 'usuarios.create'
  | 'usuarios.update'
  | 'usuarios.delete'
  | 'sedes.read'
  | 'sedes.create'
  | 'sedes.update'
  | 'canchas.read'
  | 'canchas.create'
  | 'canchas.update'
  | 'tarifas.read'
  | 'tarifas.create'
  | 'tarifas.update'
  | 'reportes.read'
  | 'reportes.export';
