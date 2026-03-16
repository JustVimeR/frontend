import { test, expect } from "@playwright/test";
import {
	mockRankings,
	mockAPI,
	MOCK_RANKINGS_MANAGER,
} from "./helpers/mock-api";

test.describe("Сценарій 5 — Rankings: три блоки рейтингів", () => {
	test.beforeEach(async ({ page }) => {
		await mockRankings(page);
		await page.goto("/rankings");
		await expect(page.getByRole("heading", { name: "Rankings" })).toBeVisible();
	});

	test("5.1 — заголовок Rankings відображається", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Rankings" })).toBeVisible();
	});

	test("5.2 — картки Top Managers, Top Products, Top Regions присутні", async ({
		page,
	}) => {
		await expect(page.getByText("Top Managers")).toBeVisible();
		await expect(page.getByText("Top Products")).toBeVisible();
		await expect(page.getByText("Top Regions")).toBeVisible();
	});

	test("5.3 — імена менеджерів відображаються у списку", async ({ page }) => {
		for (const { name } of MOCK_RANKINGS_MANAGER) {
			await expect(page.getByText(name)).toBeVisible();
		}
	});

	test("5.4 — назви продуктів відображаються", async ({ page }) => {
		await expect(page.getByText("Widget Pro")).toBeVisible();
		await expect(page.getByText("Gadget X")).toBeVisible();
	});

	test("5.5 — назви регіонів відображаються", async ({ page }) => {
		await expect(page.getByText("North Region")).toBeVisible();
		await expect(page.getByText("South Region")).toBeVisible();
	});

	test("5.6 — revenue відображається у форматі з $", async ({ page }) => {
		const revenueLocators = page.locator("text=/\\$\\d/");
		await expect(revenueLocators.first()).toBeVisible();
	});

	test("5.7 — ранги 1, 2, 3 відображаються у кожному блоці", async ({
		page,
	}) => {
		const rankOnes = page.locator("span", { hasText: /^1$/ });
		await expect(rankOnes).toHaveCount(3);
	});
});

test.describe("Сценарій 5b — Rankings: обробка помилки API", () => {
	test("5.8 — при помилці API сторінка не крашається", async ({ page }) => {
		await mockAPI(page, [
			{ url: "/rankings/manager", body: { detail: "error" }, status: 500 },
			{ url: "/rankings/product", body: { detail: "error" }, status: 500 },
			{ url: "/rankings/region", body: { detail: "error" }, status: 500 },
		]);

		await page.goto("/rankings");
		await expect(page.getByText("Loading...")).not.toBeVisible({
			timeout: 5000,
		});
	});
});
