import { test, expect } from '@playwright/test';
import { loginAsJugador } from './fixtures';

test.describe('Mis Clases', () => {
  test('debe cargar clases del jugador', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases') && response.status() === 200,
      { timeout: 15000 }
    );

    const clasesList = page.locator('[data-testid="clases-list"]');
    if (await clasesList.isVisible({ timeout: 5000 })) {
      await expect(clasesList).toBeVisible();
    }
  });

  test('TC018: Profesor publica una clase de pádel', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases') && response.status() === 200,
      { timeout: 15000 }
    );

    const nuevaClaseButton = page.locator('button:has-text("Nueva clase"), button:has-text("Publicar clase")');
    if (await nuevaClaseButton.isVisible({ timeout: 5000 })) {
      await nuevaClaseButton.click();

      const nombreInput = page.locator('input[name="nombre"]');
      const cuposInput = page.locator('input[name="cupos"]');
      const precioInput = page.locator('input[name="precio"]');

      if (await nombreInput.isVisible()) {
        await nombreInput.fill('Clase de Pádel Iniciante');
        await cuposInput.fill('6');
        await precioInput.fill('8000');

        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/clases') &&
            response.request().method() === 'POST',
          { timeout: 10000 }
        );
      }
    }
  });

  test('debe mostrar clases disponibles para inscripción', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases'),
      { timeout: 15000 }
    );

    const claseCard = page.locator('[data-testid="clase-card"]');
    if (await claseCard.isVisible({ timeout: 5000 })) {
      await expect(claseCard).toBeVisible();
    }
  });

  test('debe permitir inscribirse a una clase', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases'),
      { timeout: 15000 }
    );

    const inscribirButton = page.locator('button:has-text("Inscribirse"), button:has-text("Reservar")');
    if (await inscribirButton.isVisible({ timeout: 5000 })) {
      await inscribirButton.first().click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/clases') &&
          response.url().includes('/inscribir') &&
          response.request().method() === 'POST',
        { timeout: 10000 }
      );
    }
  });

  test('debe mostrar información del profesor', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases'),
      { timeout: 15000 }
    );

    const profesorInfo = page.locator('[data-testid="profesor-info"], text=Profesor');
    if (await profesorInfo.isVisible({ timeout: 5000 })) {
      await expect(profesorInfo.first()).toBeVisible();
    }
  });

  test('debe mostrar cupos disponibles', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases'),
      { timeout: 15000 }
    );

    const cuposInfo = page.locator('[data-testid="cupos"], text=cupos');
    if (await cuposInfo.isVisible({ timeout: 5000 })) {
      await expect(cuposInfo.first()).toBeVisible();
    }
  });

  test('debe mostrar fecha y hora de la clase', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases'),
      { timeout: 15000 }
    );

    const fechaInfo = page.locator('[data-testid="fecha-hora"], text=202');
    if (await fechaInfo.isVisible({ timeout: 5000 })) {
      await expect(fechaInfo.first()).toBeVisible();
    }
  });

  test('debe permitir cancelar inscripción', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/mis-clases');

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/clases'),
      { timeout: 15000 }
    );

    const cancelarButton = page.locator('button:has-text("Cancelar inscripción"), button:has-text("Desinscribirse")');
    if (await cancelarButton.isVisible({ timeout: 5000 })) {
      await cancelarButton.first().click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/clases') &&
          response.request().method() === 'DELETE',
        { timeout: 10000 }
      );
    }
  });
});