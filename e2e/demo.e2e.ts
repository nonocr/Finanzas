// Recorrido de humo en modo demo: lo esencial carga y no vuelven los errores de la auditoría de pruebas (2026-11-04).
import { expect, test, type Page } from '@playwright/test';

/** Pega texto en el campo como lo haría el iPhone (evento paste con el texto en el portapapeles). */
async function paste(page: Page, label: string, text: string) {
  await page.getByLabel(label, { exact: true }).evaluate((el, t) => {
    const data = new DataTransfer();
    data.setData('text/plain', t);
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  }, text);
}

// Ninguna prueba deja errores en la consola.
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => m.type() === 'error' && list.push(m.text()));
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test('las pantallas principales cargan sin desbordar', async ({ page }) => {
  for (const [path, heading] of [
    ['/', 'Resumen'],
    ['/movimientos', 'Movimientos'],
    ['/estadisticas', 'Estadísticas'],
    ['/presupuesto', 'Presupuesto'],
    ['/mas', 'Ajustes'],
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});

test('un pago de Wallet sin monto dice «Sin monto» en el Resumen, no ₡0', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('region', { name: 'Pagos por revisar' });
  await expect(card).toBeVisible();
  await expect(card.getByText('Sin monto').first()).toBeVisible();
  await expect(card.getByText('₡0', { exact: true })).toHaveCount(0);
});

test('pegar un monto con decimales no lo multiplica por 100', async ({ page }) => {
  await page.goto('/?agregar');
  await paste(page, 'Monto', '₡12.500,00');
  await expect(page.getByLabel('Monto', { exact: true })).toHaveValue('12.500');
});

test('pasar de Gasto a Ingreso quita la categoría de gasto', async ({ page }) => {
  await page.goto('/?agregar');
  await page.getByRole('button', { name: 'Comida' }).click();
  await expect(page.getByRole('button', { name: 'Comida' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('tab', { name: 'Ingreso' }).click();
  await page.getByRole('tab', { name: 'Gasto' }).click();
  await expect(page.getByRole('button', { name: 'Comida' })).toHaveAttribute('aria-pressed', 'false');
});

test('editar solo el nombre de una cuenta en negativo no le cambia el signo', async ({ page }) => {
  await page.goto('/mas/cuentas');
  await page.getByRole('button', { name: 'Agregar tarjeta o cuenta' }).click();
  await page.getByRole('button', { name: 'Efectivo', exact: true }).click();
  await page.getByPlaceholder('Efectivo').fill('Caja QA');
  await page.getByText('Saldo actual').click();
  await paste(page, 'Saldo actual', '4.000');
  await page.getByRole('switch').click();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('button', { name: /Caja QA/ })).toContainText('−₡4.000');

  await page.getByRole('button', { name: /Caja QA/ }).click();
  await page.getByPlaceholder('Efectivo').fill('Caja QA 2');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('button', { name: /Caja QA 2/ })).toContainText('−₡4.000');
});
