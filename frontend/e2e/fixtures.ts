import { test as base, Page } from '@playwright/test';
import { apiFetch } from '../src/lib/api';

export interface Jugador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  inasistencias60Dias: number;
}

export interface UsuarioPersonal {
  id: number;
  sedeId: number;
  nombre: string;
  email: string;
  rol: 'encargado' | 'profesor' | 'administrador';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  usuario: Jugador | UsuarioPersonal;
}

export const test = base.extend<{
  authenticatedJugador: { token: string; jugador: Jugador };
  authenticatedEncargado: { token: string; usuario: UsuarioPersonal };
  authenticatedAdmin: { token: string; usuario: UsuarioPersonal };
}>({
  authenticatedJugador: async ({ page }, use) => {
    const token = await getTestToken('jugador');
    const jugador = await createTestJugador();
    await page.evaluate(
      ({ accessToken, user }) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      },
      { accessToken: token, user: jugador }
    );
    await use({ token, jugador });
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    });
  },

  authenticatedEncargado: async ({ page }, use) => {
    const token = await getTestToken('encargado');
    const usuario = await createTestUsuarioPersonal('encargado');
    await page.evaluate(
      ({ accessToken, user }) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      },
      { accessToken: token, user: usuario }
    );
    await use({ token, usuario });
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    });
  },

  authenticatedAdmin: async ({ page }, use) => {
    const token = await getTestToken('administrador');
    const usuario = await createTestUsuarioPersonal('administrador');
    await page.evaluate(
      ({ accessToken, user }) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      },
      { accessToken: token, user: usuario }
    );
    await use({ token, usuario });
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    });
  },
});

async function getTestToken(role: string): Promise<string> {
  return `test-token-${role}-${Date.now()}`;
}

async function createTestJugador(): Promise<Jugador> {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    nombre: 'Jugador Test',
    email: `jugador.test.${Date.now()}@test.cl`,
    telefono: '+56912345678',
    bloqueado: false,
    inasistencias60Dias: 0,
  };
}

async function createTestUsuarioPersonal(
  rol: 'encargado' | 'profesor' | 'administrador'
): Promise<UsuarioPersonal> {
  return {
    id: Math.floor(Math.random() * 10000) + 1,
    sedeId: 1,
    nombre: `${rol.charAt(0).toUpperCase() + rol.slice(1)} Test`,
    email: `${rol}.test.${Date.now()}@test.cl`,
    rol,
  };
}

export async function loginAsJugador(page: Page): Promise<void> {
  const testUser = createTestJugador();
  const token = await getTestToken('jugador');
  await page.evaluate(
    ({ accessToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { accessToken: token, user: testUser }
  );
}

export async function loginAsEncargado(page: Page): Promise<void> {
  const testUser = await createTestUsuarioPersonal('encargado');
  const token = await getTestToken('encargado');
  await page.evaluate(
    ({ accessToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { accessToken: token, user: testUser }
  );
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const testUser = await createTestUsuarioPersonal('administrador');
  const token = await getTestToken('administrador');
  await page.evaluate(
    ({ accessToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { accessToken: token, user: testUser }
  );
}

export async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  });
}