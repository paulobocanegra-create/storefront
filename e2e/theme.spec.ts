import { expect, test } from "@playwright/test";

const shop = "/en/default-channel";

test("theme selection survives reloads, navigation and checkout", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto(shop);
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	const lightBackground = await page
		.locator("body")
		.evaluate((body) => getComputedStyle(body).backgroundColor);
	await page.getByRole("button", { name: "Switch to dark mode", exact: true }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	expect(await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor)).not.toBe(
		lightBackground,
	);
	await page.reload();
	await expect(page.getByRole("button", { name: "Switch to light mode", exact: true })).toBeEnabled();
	await page.goto(`${shop}/products`);
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await page.goto("/checkout");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await page.goto(shop);
	await page.getByRole("button", { name: "Switch to light mode", exact: true }).click();
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("follows system preference until the shopper chooses a theme", async ({ page, context }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto(shop);
	await expect(page.getByRole("button", { name: "Switch to light mode", exact: true })).toBeEnabled();
	await page.emulateMedia({ colorScheme: "light" });
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await page.getByRole("button", { name: "Switch to dark mode", exact: true }).click();
	await page.emulateMedia({ colorScheme: "dark" });
	await page.emulateMedia({ colorScheme: "light" });
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

	const secondTab = await context.newPage();
	await secondTab.goto(shop);
	await expect(secondTab.getByRole("button", { name: "Switch to light mode", exact: true })).toBeEnabled();
	await secondTab.getByRole("button", { name: "Switch to light mode", exact: true }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("theme control is reachable on mobile and works with the keyboard", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto(shop);
	const toggle = page.getByRole("button", { name: "Switch to dark mode", exact: true });
	await expect(toggle).toBeVisible();
	const bounds = await toggle.boundingBox();
	expect(bounds?.width).toBeGreaterThanOrEqual(44);
	expect(bounds?.height).toBeGreaterThanOrEqual(44);
	await toggle.focus();
	await page.keyboard.press("Enter");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
