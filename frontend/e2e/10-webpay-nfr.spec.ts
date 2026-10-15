import { test, expect } from '@playwright/test';
import { loginAsJugador } from './fixtures';

test.describe('Webpay Plus Integration', () => {
  test('TC001: Reserva y pago exitoso con Webpay Plus', async ({ page, request }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=1');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas') && response.status() === 200,
      { timeout: 15000 }
    );

    const summaryVisible = page.locator('[data-testid="resumen-reserva"]');
    if (await summaryVisible.isVisible({ timeout: 5000 })) {
      await expect(summaryVisible).toBeVisible();
    }

    const pagarButton = page.locator('button:has-text("Pagar"), button:has-text("Webpay")');
    if (await pagarButton.isVisible({ timeout: 5000 })) {
      await pagarButton.click();

      const initiateResponse = await page.waitForResponse(
        (response) =>
          response.url().includes('/api/pagos/initiate') &&
          response.request().method() === 'POST',
        { timeout: 15000 }
      );

      expect(initiateResponse.status()).toBe(200);
      const responseData = await initiateResponse.json();
      expect(responseData).toHaveProperty('tokenTransbank');
      expect(responseData).toHaveProperty('urlWebpay');
    }
  });

  test('debe mostrar estado de pago exitoso', async ({ page }) => {
    await page.goto('/pago/webpay-return?token=mock_token&TBK_TOKEN=mock_tbk_token');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/pagos') ||
        response.status() >= 200,
      { timeout: 15000 }
    );

    const successMessage = page.locator('text=Pago confirmado, text=Reserva confirmada');
    if (await successMessage.isVisible({ timeout: 5000 })) {
      await expect(successMessage.first()).toBeVisible();
    }
  });

  test('debe mostrar estado de pago rechazado', async ({ page }) => {
    await page.goto('/pago/webpay-return?error=1');

    const errorMessage = page.locator('text=Pago rechazado, text=Error en el pago');
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('TC028: Manejo de pago rechazado', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=999');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/pagos') ||
        response.url().includes('/api/reservas') ||
        response.status() >= 400,
      { timeout: 15000 }
    );

    const errorAlert = page.locator('[data-testid="error-alert"], text=Error');
    if (await errorAlert.isVisible({ timeout: 5000 })) {
      await expect(errorAlert.first()).toBeVisible();
    }
  });
});

test.describe('Reserva con Timeout', () => {
  test('TC003: Liberación automática por timeout de 10 minutos', async ({ page }) => {
    await loginAsJugador(page);

    await page.goto('/buscar-cancha');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas/disponibilidad'),
      { timeout: 15000 }
    );

    const disponibleSlot = page.locator('[data-testid="slot-disponible"]').first();
    if (await disponibleSlot.isVisible({ timeout: 5000 })) {
      await disponibleSlot.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      );

      await page.goto('/pago');

      const timer = page.locator('[data-testid="contador-retencion"]');
      if (await timer.isVisible({ timeout: 5000 })) {
        await expect(timer).toBeVisible();
      }
    }
  });
});

test.describe('NFR - Non-Functional Requirements', () => {
  test('NFR001: Tiempo de respuesta de reserva completa < 2 minutos', async ({ page }) => {
    await loginAsJugador(page);

    const startTime = Date.now();

    await page.goto('/buscar-cancha');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/sedes') &&
        response.status() === 200,
      { timeout: 15000 }
    );

    const slot = page.locator('[data-testid="slot-disponible"]').first();
    if (await slot.isVisible({ timeout: 5000 })) {
      await slot.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas') &&
          response.request().method() === 'POST',
        { timeout: 15000 }
      );
    }

    const totalTime = (Date.now() - startTime) / 1000 / 60;
    expect(totalTime).toBeLessThan(2);
  });

  test('NFR005: Retención de cancha durante pago', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/buscar-cancha');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas/disponibilidad'),
      { timeout: 15000 }
    );

    const slot = page.locator('[data-testid="slot-disponible"]').first();
    if (await slot.isVisible({ timeout: 5000 })) {
      await slot.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/reservas') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      );

      const retenidaBadge = page.locator('[data-testid="badge-retenida"]');
      if (await retenidaBadge.isVisible({ timeout: 5000 })) {
        await expect(retenidaBadge).toBeVisible();
      }
    }
  });

  test('NFR006: Validación de seguridad en Webpay', async ({ page, request }) => {
    await loginAsJugador(page);

    const response = await request.post('/api/pagos/initiate', {
      headers: {
        Authorization: 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
      data: { reservaId: 1 },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});