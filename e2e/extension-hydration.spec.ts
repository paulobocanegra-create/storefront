import { expect, test } from "@playwright/test";

test("body attributes injected by an extension do not cause hydration warnings", async ({ page }) => {
	const errors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error" && /hydrat|didn't match/i.test(message.text())) {
			errors.push(message.text());
		}
	});
	page.on("pageerror", (error) => errors.push(error.message));
	// Observe the parser creating body, before React hydrates the document.
	await page.addInitScript(() => {
		const inject = () => {
			if (!document.body) return;
			document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1338.0");
			document.body.setAttribute("data-gr-ext-installed", "");
			observer.disconnect();
		};
		const observer = new MutationObserver(inject);
		observer.observe(document, { childList: true, subtree: true });
		inject();
	});
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/en/default-channel");
	await expect(page.getByRole("button", { name: "Switch to dark mode", exact: true })).toBeEnabled();
	await expect(page.locator("body")).toHaveAttribute("data-gr-ext-installed", "");
	await page.getByRole("button", { name: "Switch to dark mode", exact: true }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await page.goto("/checkout");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page.locator("body")).toHaveAttribute("data-gr-ext-installed", "");
	expect(errors).toEqual([]);
});
