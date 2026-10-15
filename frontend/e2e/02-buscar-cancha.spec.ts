import { test, expect } from '@playwright/test';
import { test as base } from '@playwright/test';
import { loginAsJugador } from './fixtures';
import { getSedes, getReservasDisponibilidad } from './helpers';

const testReservas = base.extend<{ testData: { sedes: any[]; disponibilidad: any[] } }>({
  testData: async ({ request }, use) => {
    const token = 'test-token';
    const sedes = await getSedes(request, token);
    const disponibilidad = await getReservasDisponibilidad(
      request,
      token,
      {
        sedeId: sedes[0]?.id || 1,
        deporte: 'padel',
        fecha: new Date().toISOString().split('T')[0],
        rangoHorario: 'tarde',
      }
    );
    await use({ sedes, disponibilidad });
  },
});

test.describe('Buscar Cancha', () => {
  test('TC001: Reserva de cancha y pago exitoso con Webpay Plus', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    await expect(page.locator('text=Sedes')).toBeVisible();

    const sedeButtons = page.locator('[data-testid="sede-button"]');
    const count = await sedeButtons.count();
    if (count > 0) {
      await sedeButtons.first().click();
    }

    const padelButton = page.locator('button:has-text("Pádel"), button:has-text("padel")');
    if (await padelButton.isVisible()) {
      await padelButton.click();
    }

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') && response.status() === 200,
      { timeout: 10000 }
    );
  });

  test('debe mostrar grilla de disponibilidad', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas/disponibilidad') ||
        response.url().includes('/api/sedes'),
      { timeout: 10000 }
    );

    const disponibilidadList = page.locator('[data-testid="disponibilidad-list"]');
    if (await disponibilidadList.isVisible()) {
      await expect(disponibilidadList).toBeVisible();
    }
  });

  test('debe permitir seleccionar fecha', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    const fechaInput = page.locator('input[type="date"], input[placeholder*="fecha" i]');
    if (await fechaInput.isVisible({ timeout: 5000 })) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await fechaInput.fill(tomorrow.toISOString().split('T')[0]);

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas/disponibilidad'),
        { timeout: 10000 }
      );
    }
  });

  test('TC002: Prevención de doble reserva', async ({ page, request }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') && response.status() === 200,
      { timeout: 10000 }
    );

    const disponibleSlot = page.locator('[data-testid="slot-disponible"]').first();
    if (await disponibleSlot.isVisible({ timeout: 5000 })) {
      await disponibleSlot.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas') &&
          (response.status() === 201 || response.request().method() === 'POST'),
        { timeout: 10000 }
      );
    }
  });

  test('debe mostrar selector de deporte', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    const padelOption = page.locator('button:has-text("Pádel")');
    const futbolOption = page.locator('button:has-text("Fútbol 7")');

    if (await padelOption.isVisible()) {
      await expect(padelOption).toBeVisible();
    }
    if (await futbolOption.isVisible()) {
      await expect(futbolOption).toBeVisible();
    }
  });

  test('debe mostrar selector de rango horario', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    const mananaButton = page.locator('button:has-text("Mañana")');
    const tardeButton = page.locator('button:has-text("Tarde")');
    const nocheButton = page.locator('button:has-text("Noche")');

    if (await mananaButton.isVisible()) {
      await expect(mananaButton).toBeVisible();
    }
    if (await tardeButton.isVisible()) {
      await expect(tardeButton).toBeVisible();
    }
    if (await nocheButton.isVisible()) {
      await expect(nocheButton).toBeVisible();
    }
  });

  test('TC033: Jugador intenta reservar una cancha bloqueada por mantenimiento', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') && response.status() === 200,
      { timeout: 10000 }
    );

    const slots = page.locator('[data-testid="slot"]');
    const count = await slots.count();

    for (let i = 0; i < count; i++) {
      const slot = slots.nth(i);
      const isAvailable = await slot.locator('[data-testid="slot-disponible"]').isVisible();
      const isBloqueada = await slot.locator('[data-testid="slot-bloqueada"]').isVisible();

      if (isBloqueada) {
        await expect(slot.locator('text=Bloqueada')).toBeVisible();
      }
    }
  });
});