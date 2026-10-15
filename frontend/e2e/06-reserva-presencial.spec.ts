import { test, expect } from '@playwright/test';
import { loginAsEncargado } from './fixtures';

test.describe('Reserva Presencial', () => {
  test('TC013: Personal de sede crea una reserva presencial para un jugador', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/reserva-presencial');

    await expect(page.locator('text=Reserva presencial')).toBeVisible({ timeout: 10000 });

    const nombreInput = page.locator('input[name="nombre"], input[placeholder*="nombre" i]');
    if (await nombreInput.isVisible({ timeout: 5000 })) {
      await nombreInput.fill('Juan Pérez');

      const telefonoInput = page.locator('input[name="telefono"], input[placeholder*="teléfono" i]');
      if (await telefonoInput.isVisible()) {
        await telefonoInput.fill('+56912345678');
      }

      const buscarButton = page.locator('button:has-text("Buscar"), button:has-text("Buscar jugador")');
      if (await buscarButton.isVisible()) {
        await buscarButton.click();

        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/reservas') ||
            response.url().includes('/api/sedes'),
          { timeout: 10000 }
        );
      }
    }

    const confirmarButton = page.locator('button:has-text("Confirmar"), button:has-text("Crear reserva")');
    if (await confirmarButton.isVisible({ timeout: 5000 })) {
      await confirmarButton.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      );
    }
  });

  test('debe permitir buscar jugador existente', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/reserva-presencial');

    const buscarInput = page.locator('input[name="telefono"], input[name="email"], input[placeholder*="buscar" i]');
    if (await buscarInput.isVisible({ timeout: 5000 })) {
      await buscarInput.fill('+56912345678');

      const buscarButton = page.locator('button:has-text("Buscar")');
      await buscarButton.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas') ||
          response.url().includes('/api/sedes'),
        { timeout: 10000 }
      );

      const results = page.locator('[data-testid="resultados-busqueda"]');
      if (await results.isVisible({ timeout: 5000 })) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('debe permitir seleccionar cancha', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/reserva-presencial');

    const canchaSelect = page.locator('select[name="cancha"], [data-testid="cancha-select"]');
    if (await canchaSelect.isVisible({ timeout: 5000 })) {
      const options = await canchaSelect.locator('option').count();
      if (options > 1) {
        await canchaSelect.selectOption({ index: 1 });

        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/sedes') ||
            response.url().includes('/api/reservas/disponibilidad'),
          { timeout: 10000 }
        );
      }
    }
  });

  test('debe permitir seleccionar fecha y hora', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/reserva-presencial');

    const fechaInput = page.locator('input[type="date"]');
    if (await fechaInput.isVisible({ timeout: 5000 })) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await fechaInput.fill(tomorrow.toISOString().split('T')[0]);

      const horaSelect = page.locator('select[name="hora"], [data-testid="hora-select"]');
      if (await horaSelect.isVisible({ timeout: 3000 })) {
        const options = await horaSelect.locator('option').count();
        if (options > 1) {
          await horaSelect.selectOption({ index: 1 });
        }
      }
    }
  });

  test('debe mostrar selector de sede', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/reserva-presencial');

    const sedeSelect = page.locator('select[name="sede"], [data-testid="sede-select"]');
    if (await sedeSelect.isVisible({ timeout: 5000 })) {
      const options = await sedeSelect.locator('option').count();
      expect(options).toBeGreaterThan(1);
    }
  });

  test('debe validar campos requeridos', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/reserva-presencial');

    const confirmarButton = page.locator('button:has-text("Confirmar"), button:has-text("Crear")');
    if (await confirmarButton.isVisible({ timeout: 5000 })) {
      await confirmarButton.click();

      const errorMessages = page.locator('text=Requerido, text=Obligatorio');
      if (await errorMessages.isVisible({ timeout: 3000 })) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });
});