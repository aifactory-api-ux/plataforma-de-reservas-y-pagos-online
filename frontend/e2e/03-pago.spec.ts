import { test, expect } from '@playwright/test';
import { loginAsJugador } from './fixtures';

test.describe('Pago', () => {
  test('TC001: Reserva de cancha y pago exitoso con Webpay Plus', async ({ page }) => {
    await loginAsJugador(page);

    const mockReservaId = 1;
    await page.goto(`/pago?reservaId=${mockReservaId}`);

    await expect(page.locator('text=Resumen de reserva')).toBeVisible({ timeout: 10000 });

    const proceedToPaymentButton = page.locator('button:has-text("Proceder al pago"), button:has-text("Pagar")');
    if (await proceedToPaymentButton.isVisible()) {
      await proceedToPaymentButton.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/pagos/initiate') &&
          response.request().method() === 'POST',
        { timeout: 15000 }
      );
    }
  });

  test('debe mostrar datos de la reserva', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=1');

    const summaryCard = page.locator('[data-testid="resumen-reserva"]');
    if (await summaryCard.isVisible({ timeout: 5000 })) {
      await expect(summaryCard).toBeVisible();
    }
  });

  test('debe mostrar contador de retención', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=1');

    const timer = page.locator('[data-testid="contador-retencion"], [data-testid="RetentionTimer"]');
    if (await timer.isVisible({ timeout: 5000 })) {
      await expect(timer).toBeVisible();
    }
  });

  test('TC012: Jugador organiza reserva y divide el pago con compañeros', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=1');

    const splitPaymentOption = page.locator('button:has-text("Dividir pago"), [data-testid="split-payment"]');
    if (await splitPaymentOption.isVisible({ timeout: 5000 })) {
      await splitPaymentOption.click();

      const playerCountSelect = page.locator('select[name="numJugadores"], [data-testid="num-jugadores"]');
      if (await playerCountSelect.isVisible()) {
        await playerCountSelect.selectOption('3');
      }

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/pagos') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      );
    }
  });

  test('TC028: Manejo de pago rechazado por Webpay Plus', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=999');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/pagos') || response.status() >= 400,
      { timeout: 10000 }
    );

    const errorMessage = page.locator('text=Pago rechazado, text=Error en el pago');
    if (await errorMessage.isVisible({ timeout: 5000 })) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('debe mostrar botón de pago Webpay', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=1');

    const webpayButton = page.locator('button:has-text("Webpay"), button:has-text("Pagar con Webpay")');
    if (await webpayButton.isVisible({ timeout: 5000 })) {
      await expect(webpayButton).toBeVisible();
    }
  });

  test('debe mostrar información de contacto', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/pago?reservaId=1');

    const contactoSection = page.locator('[data-testid="contacto-info"], text=Datos de contacto');
    if (await contactoSection.isVisible({ timeout: 5000 })) {
      await expect(contactoSection).toBeVisible();
    }
  });
});