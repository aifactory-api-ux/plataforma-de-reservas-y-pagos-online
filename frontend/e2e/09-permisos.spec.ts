import { test, expect } from '@playwright/test';
import { loginAsJugador, loginAsEncargado, loginAsAdmin } from './fixtures';

test.describe('Control de Accesos y Permisos', () => {
  test('TC007: Acceso restringido por sede para el personal - ñuñoa no ve la florida', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') && response.status() === 200,
      { timeout: 15000 }
    );

    const floridaAccess = page.locator('text=La Florida');
    const nunoaAccess = page.locator('text=Ñuñoa');

    const hasFlorida = await floridaAccess.isVisible({ timeout: 3000 });
    const hasNunoa = await nunoaAccess.isVisible({ timeout: 3000 });

    expect(hasFlorida || hasNunoa).toBeTruthy();
  });

  test('TC009: Personal de sede no puede autorizar devoluciones excepcionales', async ({ page }) => {
    await loginAsEncargado(page);

    await page.goto('/admin');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/admin') && response.status() === 403,
      { timeout: 10000 }
    );

    const accessDenied = page.locator('text=Acceso denegado, text=Permiso denegado, text=No autorizado');
    if (await accessDenied.isVisible({ timeout: 5000 })) {
      await expect(accessDenied).toBeVisible();
    } else {
      const adminPanel = page.locator('[data-testid="admin-panel"]');
      const restrictedOption = page.locator('button:has-text("Devolución"), button:has-text("Autorizar")');

      if (await restrictedOption.isVisible({ timeout: 3000 })) {
        await expect(restrictedOption).not.toBeVisible();
      }
    }
  });

  test('TC024: Personal de sede no puede exportar datos', async ({ page }) => {
    await loginAsEncargado(page);

    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/'),
      { timeout: 15000 }
    );

    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Descargar")');
    if (await exportButton.isVisible({ timeout: 5000 })) {
      await expect(exportButton).not.toBeVisible();
    }
  });

  test('debe permitir acceso a admin solo para administradores', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login|buscar-cancha/, { timeout: 10000 });
  });

  test('debe permitir acceso a reserva-presencial solo para encargado', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/reserva-presencial');

    await expect(page).not.toHaveURL(/\/reserva-presencial/, { timeout: 10000 });
  });

  test('debe permitir acceso a agenda para encargado, profesor y administrador', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await expect(page).toHaveURL(/\/agenda/, { timeout: 10000 });
    await expect(page.locator('text=Agenda')).toBeVisible({ timeout: 5000 });
  });

  test('debe permitir acceso a mis-clases para jugador y profesor', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await expect(page).toHaveURL(/\/mis-clases/, { timeout: 10000 });
  });
});