# E2E Tests - Sporty Frontend

Este directorio contiene los tests E2E de Playwright para la plataforma Sporty.

## Requisitos Previos

- Node.js 20+
- Docker y docker-compose (para ejecutar el backend completo)
- Playwright (se instala con `npm install`)

## Instalación

```bash
cd frontend
npm install
npx playwright install chromium
```

## Ejecutar Tests

### Modo headless (default)
```bash
npm run test:e2e
```

### Modo UI (interactivo)
```bash
npm run test:e2e:ui
```

### Modo headed (con navegador visible)
```bash
npm run test:e2e:headed
```

## Estructura de Tests

- `01-autenticacion.spec.ts` - Tests de login y autenticación (TC020)
- `02-buscar-cancha.spec.ts` - Tests de búsqueda de canchas (TC001, TC002, TC033)
- `03-pago.spec.ts` - Tests del flujo de pago (TC001, TC012, TC028)
- `04-mis-reservas.spec.ts` - Tests de gestión de reservas (TC004, TC006)
- `05-agenda-sede.spec.ts` - Tests de agenda para staff (TC007, TC030)
- `06-reserva-presencial.spec.ts` - Tests de reserva presencial (TC013)
- `07-panel-admin.spec.ts` - Tests del panel de administración (TC017, TC019, TC021, TC025, TC029, TC032)
- `08-mis-clases.spec.ts` - Tests de clases (TC018)
- `09-permisos.spec.ts` - Tests de control de accesos (TC007, TC009, TC024)
- `10-webpay-nfr.spec.ts` - Tests de integración Webpay y NFR (TC001, TC003, TC028, NFR001, NFR005, NFR006)

## Configuración

El archivo `playwright.config.ts` contiene la configuración principal:

- Base URL: `http://localhost:23007`
- Timeout: 120 segundos
- Headless: true (false con `--headed`)
- Captura de video y screenshots en fallos

## Patrones de Test

### Interceptar llamadas API
```typescript
await page.waitForResponse(
  (response) =>
    response.url().includes('/api/reservas') &&
    response.status() === 200
);
```

### Verificar datos en DOM
```typescript
await expect(page.locator('[data-testid="reserva-card"]')).toBeVisible();
```

### Autenticación en tests
```typescript
await loginAsJugador(page);  // Login como jugador
await loginAsEncargado(page); // Login como encargado
await loginAsAdmin(page);     // Login como administrador
```

## Notas

- Los tests utilizan el backend real via docker-compose
- No se usan mocks - todas las llamadas van al backend real
- Los data-testid son convenciones usadas en los tests
- Algunos tests pueden requerir datos específicos en la base de datos