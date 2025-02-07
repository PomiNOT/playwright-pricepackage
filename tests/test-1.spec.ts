import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8080/QuizPractice/admin/subjectdetail/pricepackage?subjectId=1');
  await page.getByRole('row', { name: '2 9 Month Premium 9 30000 VND' }).getByRole('link').click();
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
});