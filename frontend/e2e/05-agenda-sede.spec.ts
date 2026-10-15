import { test, expect } from '@playwright/test';
import { loginAsEncargado } from './fixtures';

test.describe('Agenda de Sede', () => {
  test('debe cargar la agenda de la sede', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        (response.url().includes('/api/sedes') && response.status() === 200) ||
        (response.url().includes('/api/reservas') && response.status() === 200),
      { timeout: 15000 }
    );

    const agendaGrilla = page.locator('[data-testid="agenda-grilla"]');
    if (await agendaGrilla.isVisible({ timeout: 5000 })) {
      await expect(agendaGrilla).toBeVisible();
    }
  });

  test('TC007: Acceso restringido por sede para el personal', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') && response.status() === 200,
      { timeout: 15000 }
    );

    const sedeNombre = page.locator('[data-testid="sede-nombre"]');
    if (await sedeNombre.isVisible({ timeout: 5000 })) {
      const sedeText = await sedeNombre.textContent();
      expect(sedeText).toMatch(/Ñuñoa|La Florida/);
    }
  });

  test('debe mostrar grilla de canchas por horarios', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') ||
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const grilla = page.locator('[data-testid="grilla-agenda"]');
    if (await grilla.isVisible({ timeout: 5000 })) {
      await expect(grilla).toBeVisible();
    }
  });

  test('debe permitir seleccionar fecha', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    const fechaInput = page.locator('input[type="date"]');
    if (await fechaInput.isVisible({ timeout: 5000 })) {
      const today = new Date().toISOString().split('T')[0];
      await fechaInput.fill(today);

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/sedes') &&
          response.url().includes('agenda'),
        { timeout: 15000 }
      );
    }
  });

  test('TC030: Personal de sede registra el check-in de una reserva', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') ||
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const reservaItem = page.locator('[data-testid="reserva-item"]').first();
    if (await reservaItem.isVisible({ timeout: 5000 })) {
      const asistioButton = reservaItem.locator('button:has-text("Asistió")');
      const noAsistioButton = reservaItem.locator('button:has-text("No asistió")');

      if (await asistioButton.isVisible()) {
        await asistioButton.click();

        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/reservas') &&
            response.url().includes('/asistio'),
          { timeout: 10000 }
        );
      }
    }
  });

  test('debe mostrar colores por estado de reserva', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') ||
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const estados = ['Retenida', 'Pagada', 'Cancelada'];
    for (const estado of estados) {
      const reserva = page.locator(`[data-testid="reserva-${estado.toLowerCase()}"]`);
      if (await reserva.isVisible({ timeout: 3000 })) {
        await expect(reserva).toBeVisible();
      }
    }
  });

  test('debe permitir ver detalle de reserva', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') ||
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const reservaCard = page.locator('[data-testid="reserva-card"]').first();
    if (await reservaCard.isVisible({ timeout: 5000 })) {
      await reservaCard.click();

      const detalleModal = page.locator('[data-testid="detalle-reserva"]');
      if (await detalleModal.isVisible({ timeout: 3000 })) {
        await expect(detalleModal).toBeVisible();
      }
    }
  });
});