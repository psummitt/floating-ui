import {test, expect} from '@playwright/test';
import {click} from './utils/click';

['.0', '.25', '.5', '.75'].forEach((decimalSize) => {
  test(`arrow should be centered to the reference ${decimalSize}`, async ({
    page,
  }) => {
    await page.goto('http://localhost:1234/decimal-size');
    await click(page, `[data-testid="decimal-size-${decimalSize}"]`);

    expect(await page.locator('.container').screenshot()).toMatchSnapshot(
      `decimal-size-${decimalSize}.png`
    );
  });
});
