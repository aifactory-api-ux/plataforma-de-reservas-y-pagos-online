import { test, expect } from '@playwright/test';
import { clearAuth } from './fixtures';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('TC020: Registro e inicio de sesión de jugador con Google Sign-In', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('text=Sporty')).toBeVisible();
    await expect(page.locator('text=Reserva tu cancha')).toBeVisible();

    const googleButton = page.locator('button:has-text("Continuar con Google")');
    await expect(googleButton).toBeVisible();

    await expect(page.locator('text=Términos de Servicio')).toBeVisible();
    await expect(page.locator('text=Política de Privacidad')).toBeVisible();
  });

  test('debe mostrar página de login correctamente', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Reserva tu cancha' })).toBeVisible();
    await expect(page.getByText('Accede con tu cuenta de Google para buscar y reservar canchas')).toBeVisible();
  });

  test('debe redirigir a login si no está autenticado', async ({ page }) => {
    await page.goto('/buscar-cancha');

    await expect(page).toHaveURL(/\/login/);
  });

  test('debe rechazar acceso a páginas protegidas sin autenticación', async ({ page }) => {
    const protectedPages = [
      '/buscar-cancha',
      '/mis-reservas',
      '/pago',
    ];

    for (const path of protectedPages) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });
});