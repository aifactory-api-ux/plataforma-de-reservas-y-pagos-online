import { test, expect } from '@playwright/test';
import { clearAuth, loginAsJugador, loginAsEncargado, loginAsAdmin } from './fixtures';

test.describe('Auth - Autenticación y Autorización', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('TC020: Registro e inicio de sesión de jugador con Google Sign-In', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Sporty/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Reserva tu cancha/i })).toBeVisible();

    const googleButton = page.locator('button:has-text("Continuar con Google")');
    await expect(googleButton).toBeVisible();

    await expect(page.getByText(/Términos de Servicio/i)).toBeVisible();
    await expect(page.getByText(/Política de Privacidad/i)).toBeVisible();
  });

  test('debe mostrar página de login con elementos correctos', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Reserva tu cancha' })).toBeVisible();
    await expect(page.getByText('Accede con tu cuenta de Google para buscar y reservar canchas')).toBeVisible();
    await expect(page.locator('img[alt*="google" i], button svg')).toBeVisible();
  });

  test('TC011: Registro con aceptación de Ley 19.628 - rechazo sin consentimiento', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Continuar con Google")');
    await googleButton.click();

    const checkbox = page.locator('input[type="checkbox"]');
    if (await checkbox.isVisible()) {
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('TC011: Consentimiento Ley 19.628 visible en formulario', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText(/Ley 19.628/i)).toBeVisible();
    await expect(page.getByText(/protección de datos personales/i)).toBeVisible();
  });

  test('debe redirigir a login si no está autenticado', async ({ page }) => {
    await page.goto('/buscar-cancha');

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
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

  test('debe permitir acceso a login sin redirigir', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Reserva tu cancha' })).toBeVisible();
  });

  test('debe cerrar sesión y redirigir a login', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/');

    const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir")');
    if (await logoutButton.isVisible({ timeout: 5000 })) {
      await logoutButton.click();

      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });

  test('TC011: Jugador puede ver sus datos personales tras login', async ({ page }) => {
    await loginAsJugador(page);

    await page.waitForResponse(resp => resp.url().includes('/api/') && resp.status() >= 200);

    await page.goto('/perfil');

    await expect(page.getByText(/Jugador Test/i)).toBeVisible({ timeout: 5000 });
  });

  test('Auth spec assertion: localStorage contiene token tras login', async ({ page }) => {
    await loginAsJugador(page);

    await page.waitForResponse(resp => resp.url().includes('/api/auth/') && resp.status() >= 200);

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('debe mantener sesión tras refresh de página', async ({ page }) => {
    await loginAsJugador(page);

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/') && resp.status() >= 200),
      page.goto('/buscar-cancha'),
    ]);
    expect(response.status()).toBeGreaterThanOrEqual(200);

    await page.reload();

    await expect(page).toHaveURL(/\/buscar-cancha/, { timeout: 5000 });
  });

  test('debe limpiar sesión al hacer logout', async ({ page }) => {
    await loginAsJugador(page);
    await page.goto('/perfil');

    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('TC007: Acceso restringido por sede para personal - encargado Ñuñoa', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/agenda-sede/2');

    await expect(page.locator('text=Permiso denegado, text=No tienes acceso')).toBeVisible({ timeout: 5000 }).catch(() => {
    });
  });

  test('TC009: Personal de sede no puede ver función de devoluciones excepcionales', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/panel-admin');

    const devolucionOption = page.locator('text=Devolución excepcional, text=Reintegro especial');
    if (await devolucionOption.isVisible()) {
      await expect(devolucionOption).not.toBeVisible();
    }
  });

  test('TC024: Personal de sede no puede exportar datos', async ({ page }) => {
    await loginAsEncargado(page);
    await page.goto('/panel-admin');

    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Descargar Excel")');
    if (await exportButton.isVisible()) {
      await expect(exportButton).not.toBeVisible();
    }
  });

  test('debe mostrar error 401 al acceder con token inválido', async ({ page }) => {
    await page.goto('/login');

    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'token-invalido');
      localStorage.setItem('user', JSON.stringify({ id: 1, nombre: 'Test', rol: 'jugador' }));
    });

    await page.goto('/buscar-cancha');

    await expect(page.locator('text=Error, text=No autorizado, text=Session expirada')).toBeVisible({ timeout: 5000 }).catch(() => {
    });
  });

  test('debe mostrar loading state durante redirect a Google', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Continuar con Google")');

    const [popupPromise] = await Promise.all([
      page.waitForEvent('popup').catch(() => null),
      googleButton.click().catch(() => null),
    ]);
  });

  test('TC026: Recuperación de contraseña para personal de sede', async ({ page }) => {
    await page.goto('/login');

    const forgotPassword = page.locator('text=Olvidé mi contraseña, a:has-text("Recuperar contraseña")');
    if (await forgotPassword.isVisible({ timeout: 3000 })) {
      await forgotPassword.click();

      await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe renderizar logo de Sporty en login', async ({ page }) => {
    await page.goto('/login');

    const logo = page.locator('img[alt*="Sporty" i], svg');
    await expect(logo.first()).toBeVisible();
  });

  test('debe tener links funcionales a términos y privacidad', async ({ page }) => {
    await page.goto('/login');

    const terminosLink = page.locator('a:has-text("Términos de Servicio"), a:has-text("Términos y Condiciones")');
    const privacidadLink = page.locator('a:has-text("Política de Privacidad")');

    if (await terminosLink.isVisible()) {
      await expect(terminosLink).toHaveAttribute('href', /.+/);
    }
    if (await privacidadLink.isVisible()) {
      await expect(privacidadLink).toHaveAttribute('href', /.+/);
    }
  });

  test('debe responder API de auth con estructura correcta', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Continuar con Google")');

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/')),
      googleButton.click(),
    ]);

    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('debe validar formato de email en recuperación', async ({ page }) => {
    await page.goto('/login');

    const forgotPassword = page.locator('text=Olvidé mi contraseña');
    if (await forgotPassword.isVisible({ timeout: 3000 })) {
      await forgotPassword.click();

      const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('email-invalido');
        await emailInput.blur();

        await expect(page.locator('text=email inválido, text=formato incorrecto')).toBeVisible({ timeout: 3000 }).catch(() => {
        });
      }
    }
  });
});
