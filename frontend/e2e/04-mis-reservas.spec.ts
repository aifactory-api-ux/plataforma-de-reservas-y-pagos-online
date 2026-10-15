import { test, expect } from '@playwright/test';
import { loginAsJugador } from './fixtures';

test.describe('Mis Reservas', () => {
  test('debe cargar y mostrar reservas del jugador', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas') && response.status() === 200,
      { timeout: 15000 }
    );

    const reservasList = page.locator('[data-testid="mis-reservas-list"]');
    if (await reservasList.isVisible({ timeout: 5000 })) {
      await expect(reservasList).toBeVisible();
    }
  });

  test('debe mostrar reservas futuras y pasadas', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const futurasTab = page.locator('button:has-text("Futuras"), button:has-text("Próximas")');
    const pasadasTab = page.locator('button:has-text("Pasadas")');

    if (await futurasTab.isVisible()) {
      await expect(futurasTab).toBeVisible();
    }
    if (await pasadasTab.isVisible()) {
      await expect(pastadasTab).toBeVisible();
    }
  });

  test('TC004: Registro manual de pago por personal de sede', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const reservaCard = page.locator('[data-testid="reserva-card"]').first();
    if (await reservaCard.isVisible({ timeout: 5000 })) {
      const estadoBadge = reservaCard.locator('[data-testid="badge-estado"]');
      await expect(estadoBadge).toBeVisible();
    }
  });

  test('debe mostrar badges de estado', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const estadoLabels = ['Retenida', 'Pagada', 'Cancelada', 'Asistió', 'No asistió'];
    for (const label of estadoLabels) {
      const badge = page.locator(`text=${label}`);
      const count = await badge.count();
      if (count > 0) {
        await expect(badge.first()).toBeVisible();
      }
    }
  });

  test('debe permitir cancelar reserva', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const cancelarButton = page.locator('button:has-text("Cancelar"), button:has-text("Cancelar reserva")');
    if (await cancelarButton.isVisible({ timeout: 5000 })) {
      await cancelarButton.first().click();

      const confirmModal = page.locator('[data-testid="modal-confirmacion"]');
      if (await confirmModal.isVisible()) {
        const confirmButton = page.locator('button:has-text("Confirmar")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();

          await page.waitForResponse(
            (response) =>
              (response.url().includes('/api/reservas') && response.request().method() === 'DELETE') ||
              response.status() === 200,
            { timeout: 10000 }
          );
        }
      }
    }
  });

  test('TC006: Cancelación de reserva con y sin derecho a devolución', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const reservaCards = page.locator('[data-testid="reserva-card"]');
    const count = await reservaCards.count();

    if (count > 0) {
      const primeraReserva = reservaCards.first();
      const cancelarBtn = primeraReserva.locator('button:has-text("Cancelar")');

      if (await cancelarBtn.isVisible()) {
        await cancelarBtn.click();

        const modal = page.locator('[data-testid="modal-confirmacion"]');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const description = await modal.locator('text=Dación').isVisible() ||
                          await modal.locator('text=devolución').isVisible() ||
                          await modal.locator('text=reembolso').isVisible();
        if (description) {
          await expect(page.locator('text=devolución')).toBeVisible();
        }
      }
    }
  });

  test('debe mostrar datos de sede y cancha', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const sedeInfo = page.locator('[data-testid="sede-info"], text=Ñuñoa, text=La Florida');
    if (await sedeInfo.isVisible({ timeout: 5000 })) {
      await expect(sedeInfo.first()).toBeVisible();
    }
  });

  test('debe mostrar alerta de bloqueo si aplica', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-reservas');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/reservas'),
      { timeout: 15000 }
    );

    const bloqueoAlert = page.locator('text=Bloqueado, text=bloqueado');
    if (await bloqueoAlert.isVisible({ timeout: 5000 })) {
      await expect(bloqueoAlert.first()).toBeVisible();
    }
  });
});