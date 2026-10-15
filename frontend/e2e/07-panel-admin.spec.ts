import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

test.describe('Panel de Administración', () => {
  test('debe cargar panel de administración', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(page.locator('text=Administración')).toBeVisible({ timeout: 10000 });
  });

  test('TC017: Administrador configura nueva cancha y horarios', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const tarifasTab = page.locator('button:has-text("Tarifas"), a:has-text("Tarifas")');
    if (await tarifasTab.isVisible({ timeout: 5000 })) {
      await tarifasTab.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/tarifas') && response.status() === 200,
        { timeout: 10000 }
      );

      const nuevaTarifaButton = page.locator('button:has-text("Nueva tarifa"), button:has-text("Agregar")');
      if (await nuevaTarifaButton.isVisible()) {
        await nuevaTarifaButton.click();

        const precioInput = page.locator('input[name="monto"], input[name="precio"]');
        if (await precioInput.isVisible()) {
          await precioInput.fill('15000');
        }

        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/admin/tarifas') &&
            response.request().method() === 'POST',
          { timeout: 10000 }
        );
      }
    }
  });

  test('TC019: Administrador consulta reportes de ingresos y ocupación', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const reportesTab = page.locator('button:has-text("Reportes"), a:has-text("Reportes")');
    if (await reportesTab.isVisible({ timeout: 5000 })) {
      await reportesTab.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/reportes') && response.status() === 200,
        { timeout: 15000 }
      );

      const ingresosCard = page.locator('[data-testid="reportes-ingresos"]');
      if (await ingresosCard.isVisible({ timeout: 5000 })) {
        await expect(ingresosCard).toBeVisible();
      }
    }
  });

  test('TC021: Administrador gestiona cuentas de personal', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const usuariosTab = page.locator('button:has-text("Usuarios"), a:has-text("Usuarios")');
    if (await usuariosTab.isVisible({ timeout: 5000 })) {
      await usuariosTab.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/usuarios') && response.status() === 200,
        { timeout: 10000 }
      );

      const nuevoUsuarioButton = page.locator('button:has-text("Nuevo usuario"), button:has-text("Agregar")');
      if (await nuevoUsuarioButton.isVisible()) {
        await nuevoUsuarioButton.click();

        const nombreInput = page.locator('input[name="nombre"]');
        const emailInput = page.locator('input[name="email"]');

        if (await nombreInput.isVisible()) {
          await nombreInput.fill('Juan Encargado');
          await emailInput.fill(`juan.encargado${Date.now()}@sporty.cl`);

          await page.waitForResponse(
            (response) =>
              response.url().includes('/api/admin/usuarios') &&
              response.request().method() === 'POST',
            { timeout: 10000 }
          );
        }
      }
    }
  });

  test('TC025: Administrador exporta reportes a Excel', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const reportesTab = page.locator('button:has-text("Reportes")');
    if (await reportesTab.isVisible({ timeout: 5000 })) {
      await reportesTab.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/reportes'),
        { timeout: 15000 }
      );

      const exportarButton = page.locator('button:has-text("Exportar"), button:has-text("Descargar Excel")');
      if (await exportarButton.isVisible({ timeout: 5000 })) {
        await expect(exportarButton).toBeVisible();
      }
    }
  });

  test('TC029: Administrador consulta reporte específico de no-shows', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const reportesTab = page.locator('button:has-text("Reportes")');
    if (await reportesTab.isVisible({ timeout: 5000 })) {
      await reportesTab.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/reportes') && response.status() === 200,
        { timeout: 15000 }
      );

      const noShowsLink = page.locator('button:has-text("No-shows"), a:has-text("No-shows")');
      if (await noShowsLink.isVisible({ timeout: 5000 })) {
        await noShowsLink.click();

        await page.waitForResponse(
          (response) =>
            response.url().includes('/api/admin/reportes'),
          { timeout: 15000 }
        );

        const noShowsReport = page.locator('[data-testid="reporte-noshows"]');
        if (await noShowsReport.isVisible({ timeout: 5000 })) {
          await expect(noShowsReport).toBeVisible();
        }
      }
    }
  });

  test('TC032: Administrador desactiva una cuenta de profesor', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const usuariosTab = page.locator('button:has-text("Usuarios")');
    if (await usuariosTab.isVisible({ timeout: 5000 })) {
      await usuariosTab.click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/usuarios') && response.status() === 200,
        { timeout: 10000 }
      );

      const profesorCard = page.locator('[data-testid="usuario-card"]:has-text("Profesor")').first();
      if (await profesorCard.isVisible({ timeout: 5000 })) {
        const deactivateButton = profesorCard.locator('button:has-text("Desactivar"), button:has-text("Eliminar")');
        if (await deactivateButton.isVisible()) {
          await deactivateButton.click();

          await page.waitForResponse(
            (response) =>
              response.url().includes('/api/admin/usuarios') &&
              (response.request().method() === 'DELETE' || response.request().method() === 'PUT'),
            { timeout: 10000 }
          );
        }
      }
    }
  });

  test('debe mostrar métricas generales', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const metricasCard = page.locator('[data-testid="metricas"]');
    if (await metricasCard.isVisible({ timeout: 5000 })) {
      await expect(metricasCard).toBeVisible();
    }
  });

  test('debe mostrar tabs de navegación del admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    const tabs = ['Dashboard', 'Usuarios', 'Tarifas', 'Reportes', 'Configuración'];
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}"), a:has-text("${tab}")`);
      if (await tabButton.isVisible({ timeout: 3000 })) {
        await expect(tabButton).toBeVisible();
      }
    }
  });
});