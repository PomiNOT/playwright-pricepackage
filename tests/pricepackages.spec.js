// @ts-check
import { test, expect } from '@playwright/test';
import { setupPricePackages } from '../db/setupdb';

// because we are resetting the database before every test case, all test cases need to be run sequentially
test.describe.configure({ mode: 'serial' });

// resseting the database to meet preconditions
test.beforeEach(async () => {
  await setupPricePackages();
});

/** @returns {string} */
function tc(id) {
  return `Price Package-${id}`;
}

const INDEX_PAGE = 'http://localhost:8080/QuizPractice';
const PRICE_PKG_PAGE = 'http://localhost:8080/QuizPractice/admin/subjectdetail/pricepackage?subjectId=1';

/** 
 * @param {import('@playwright/test').Locator} table
 * @param {string[]} headers
 * @return {Promise<(string | null)[][]>}
 */
async function takeDataFromTable(table, headers) {
  const tableHeaders = await table.locator('thead tr th').all();
  const indices = [];

  for (let i = 0; i < tableHeaders.length; i++) {
    const text = await tableHeaders[i].textContent();
    if (!text) continue;

    if (headers.includes(text)) {
      indices.push(i);
    }
  }

  const results = [];
  const tableRows = await table.locator('tbody tr').all();

  for (const tableRow of tableRows) {
    const rowContent = await Promise.all(indices.map(i => tableRow.locator('td').nth(i).textContent()));
    results.push(rowContent);
  }

  return results;
}

test.describe('List Price Packages', () => {

  /** 
   * @param {import('@playwright/test').Page} page 
   * @param {string} username 
   * @param {string} password 
  */
  const loginToAdmin = function (page, username, password) {
    return test.step('Login', async () => {
      await page.goto(INDEX_PAGE);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(username);
      await page.locator('#loginModal input[name="password"]').click();
      await page.locator('#loginModal input[name="password"]').fill(password);
      await page.locator('input[name="submit"]').click();
    });
  }

  const goToPricePackage = function (page, name) {
    return test.step('Go to price package for VAT', async () => {
      await page.getByRole('button', { name: 'Close' }).click();
      await page.getByRole('link', { name: ' Subject List' }).click();
      await page.getByPlaceholder('Subject Title').fill(name);
      await page.getByRole('button', { name: 'Search' }).click();
      await page.locator('.text-end > .btn').first().click();
    });
  }

  const expectedDataTC0 = [
    ['1', '6 Month Premium', '6', '20000 VND', '16000 VND', 'Inactive'],
    ['2', '9 Month Premium', '9', '30000 VND', '24000 VND', 'Active'],
    ['3', '3 Month Premium', '3', '10000 VND', '9000 VND', 'Active']
  ];

  const expectedDataTC2 = [
    ['1', '6 Month Premium', '6', '20000 VND', '16000 VND', 'Active'],
    ['2', '9 Month Premium', '9', '30000 VND', '24000 VND', 'Active'],
    ['3', '3 Month Premium', '3', '10000 VND', '9000 VND', 'Active']
  ];

  const expectedDataTC3 = [
    ['1', '6 Month Premium', '6', '20000 VND', '16000 VND', 'Inactive'],
    ['2', '9 Month Premium', '9', '30000 VND', '24000 VND', 'Inactive'],
    ['3', '3 Month Premium', '3', '10000 VND', '9000 VND', 'Active']
  ];
  
  const headers = ['ID', 'Package', 'Duration', 'List Price', 'Sale Price', 'Status'];

  test(tc(0), async ({ page }) => {
    await loginToAdmin(page, 'day@gmail.com', '123');
    await goToPricePackage(page, 'College Algebra with the Math Sorcerer');
    const table = page.locator('table');
    const data = await takeDataFromTable(table, headers);
    await expect(data).toEqual(expectedDataTC0);
  });

  test(tc(1), async ({ page }) => {
    await loginToAdmin(page, 'day@gmail.com', '123');
    await goToPricePackage(page, 'VAT');
    const tableBody = page.locator('table tbody');
    await expect(tableBody).toHaveText('No results');
  });

  test(tc(2), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.getByRole('button', { name: 'Activate', exact: true }).click();
    await page.locator('#activateModal').getByRole('button', { name: 'Activate' }).click();
    const table = page.locator('table');
    const data = await takeDataFromTable(table, headers);
    await expect(data).toEqual(expectedDataTC2);
  });
  
  test(tc(3), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.locator('table tbody tr').nth(1).getByRole('button').click();
    await page.locator('#deactivateModal').getByRole('button', { name: 'Deactivate' }).click();
    const table = page.locator('table');
    const data = await takeDataFromTable(table, headers);
    await expect(data).toEqual(expectedDataTC3);
  });
})

test.describe('Edit Price Package', () => {
  const expectedDataTC5 = [
    ['1', 'haha', '48', '10000 VND', '9000 VND', 'Inactive'],
    ['2', '9 Month Premium', '9', '30000 VND', '24000 VND', 'Active'],
    ['3', '3 Month Premium', '3', '10000 VND', '9000 VND', 'Active']
  ];

  const headers = ['ID', 'Package', 'Duration', 'List Price', 'Sale Price', 'Status'];

  test(tc(4), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.locator('table tbody tr').nth(1).getByRole('link').click();

    await expect(page.getByPlaceholder('Enter package name')).toHaveValue('9 Month Premium');
    await expect(page.getByPlaceholder('Enter access duration in')).toHaveValue('9');
    await expect(page.getByPlaceholder('Status')).toHaveValue('Active');
    await expect(page.getByPlaceholder('Enter list price')).toHaveValue('30000');
    await expect(page.getByPlaceholder('Enter sale percentage')).toHaveValue('20');
    await expect(page.getByPlaceholder('Sale Price')).toHaveValue('24000');
    await expect(page.getByPlaceholder('Enter description')).toHaveValue('Hello world');
  });

  test(tc(5), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.locator('table tbody tr').nth(0).getByRole('link').click();
    await page.getByPlaceholder('Enter package name').click();
    await page.getByPlaceholder('Enter package name').fill('haha');
    await page.getByPlaceholder('Enter access duration in').click();
    await page.getByPlaceholder('Enter access duration in').fill('48');
    await page.getByPlaceholder('Enter list price').click();
    await page.getByPlaceholder('Enter list price').fill('10000');
    await page.getByPlaceholder('Enter sale percentage').click();
    await page.getByPlaceholder('Enter sale percentage').fill('10');
    await page.getByPlaceholder('Enter description').click();
    await page.getByPlaceholder('Enter description').fill('Hello world');
    await page.getByRole('button', { name: 'Update' }).click();

    const table = page.locator('table');
    const data = await takeDataFromTable(table, headers);
    await expect(data).toEqual(expectedDataTC5);
  });

  test(tc(6), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.locator('table tbody tr').nth(1).getByRole('link').click();

    await page.getByPlaceholder('Enter package name').click();
    await page.getByPlaceholder('Enter package name').fill('');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter package name').fill('         ');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter package name').fill('9 Month Premium');
    await page.getByPlaceholder('Enter access duration in').click();
    await page.getByPlaceholder('Enter access duration in').fill('-1');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter access duration in').fill('150');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter access duration in').fill('9');
    await page.getByPlaceholder('Enter list price').click();
    await page.getByPlaceholder('Enter list price').fill('-9');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter list price').fill('');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter list price').fill('30000');
    await page.getByPlaceholder('Enter sale percentage').click();
    await page.getByPlaceholder('Enter sale percentage').fill('-1');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter sale percentage').fill('105');
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByPlaceholder('Enter sale percentage').fill('20');

    //stays on the page
    await expect(page).toHaveTitle('Edit Price Package');
  });
});

test.describe('Add Price Package', () => {
  const expectedDataTC8 = [
    ['6 Month Premium', '6', '20000 VND', '16000 VND', 'Inactive'],
    ['9 Month Premium', '9', '30000 VND', '24000 VND', 'Active'],
    ['3 Month Premium', '3', '10000 VND', '9000 VND', 'Active'],
    ['haha', '48', '10000 VND', '9000 VND', 'Inactive']
  ];

  const headers = ['Package', 'Duration', 'List Price', 'Sale Price', 'Status'];

  test(tc(7), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.getByRole('link', { name: ' Add New Package' }).click();

    await expect(page.getByPlaceholder('Enter package name')).toHaveValue('');
    await expect(page.getByPlaceholder('Enter access duration in')).toHaveValue('1');
    await expect(page.getByPlaceholder('Enter list price')).toHaveValue('1000');
    await expect(page.getByPlaceholder('Enter sale percentage')).toHaveValue('0');
    await expect(page.getByPlaceholder('Sale Price')).toHaveValue('1000');
  });

  test(tc(8), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.getByRole('link', { name: ' Add New Package' }).click();

    await page.getByPlaceholder('Enter package name').click();
    await page.getByPlaceholder('Enter package name').fill('haha');
    await page.getByPlaceholder('Enter access duration in').click();
    await page.getByPlaceholder('Enter access duration in').fill('48');
    await page.getByPlaceholder('Enter list price').click();
    await page.getByPlaceholder('Enter list price').fill('10000');
    await page.getByPlaceholder('Enter sale percentage').click();
    await page.getByPlaceholder('Enter sale percentage').fill('10');
    await page.getByPlaceholder('Enter description').click();
    await page.getByPlaceholder('Enter description').fill('Hello world');
    await page.getByRole('button', { name: 'Add' }).click();

    const table = page.locator('table');
    const data = await takeDataFromTable(table, headers);
    await expect(data).toEqual(expectedDataTC8);
  });

  test(tc(9), async ({ page }) => {
    await page.goto(PRICE_PKG_PAGE);
    await page.getByRole('link', { name: ' Add New Package' }).click();

    await page.getByPlaceholder('Enter package name').click();
    await page.getByPlaceholder('Enter package name').fill('');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter package name').fill('         ');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter package name').fill('9 Month Premium');
    await page.getByPlaceholder('Enter access duration in').click();
    await page.getByPlaceholder('Enter access duration in').fill('-1');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter access duration in').fill('150');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter access duration in').fill('9');
    await page.getByPlaceholder('Enter list price').click();
    await page.getByPlaceholder('Enter list price').fill('-9');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter list price').fill('');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter list price').fill('30000');
    await page.getByPlaceholder('Enter sale percentage').click();
    await page.getByPlaceholder('Enter sale percentage').fill('-1');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter sale percentage').fill('105');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByPlaceholder('Enter sale percentage').fill('20');

    //stays on the page
    await expect(page).toHaveTitle('Add Price Package');
  });
});