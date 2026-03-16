import { test, expect } from "@playwright/test";
import { mockSales, MOCK_SALES } from "./helpers/mock-api";

test.describe("Сценарій 4 — Sales: таблиця, пошук, видалення", () => {
	test.beforeEach(async ({ page }) => {
		await mockSales(page);
		await page.goto("/sales");
		await expect(
			page.getByRole("heading", { name: "Sales Management" }),
		).toBeVisible();
	});

	test("4.1 — заголовок Sales Management відображається", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Sales Management" }),
		).toBeVisible();
	});

	test("4.2 — рядки таблиці з датами продажів відображаються", async ({
		page,
	}) => {
		await expect(page.getByText(MOCK_SALES[0].date)).toBeVisible();
		await expect(page.getByText(MOCK_SALES[1].date)).toBeVisible();
	});

	test("4.3 — назви продуктів резолвуються з dimensions", async ({ page }) => {
		await expect(page.getByText("Widget Pro")).toBeVisible();
		await expect(page.getByText("Gadget X")).toBeVisible();
	});

	test("4.4 — revenue відображається з символом $", async ({ page }) => {
		await expect(page.getByText("$599.97")).toBeVisible();
	});

	test("4.5 — кнопки пагінації Previous та Next присутні", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Previous" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
	});

	test("4.6 — рядок пагінації показує Page 1 of 1", async ({ page }) => {
		await expect(page.getByText(/Page 1 of/)).toBeVisible();
	});

	test("4.7 — поле пошуку присутнє з правильним placeholder", async ({
		page,
	}) => {
		const input = page.locator('input[placeholder*="Search by product"]');
		await expect(input).toBeVisible();
	});

	test("4.8 — клік на Search запускає пошук із введеним терміном", async ({
		page,
	}) => {
		const input = page.locator('input[placeholder*="Search by product"]');
		await input.fill("Widget");

		const [request] = await Promise.all([
			page.waitForRequest(
				(req) =>
					req.url().includes("/sales") && req.url().includes("search=Widget"),
			),
			page.getByRole("button", { name: "Search" }).click(),
		]);
		expect(request.url()).toContain("search=Widget");
	});

	test("4.9 — Enter у полі пошуку запускає пошук", async ({ page }) => {
		const input = page.locator('input[placeholder*="Search by product"]');
		await input.fill("Alice");

		const [request] = await Promise.all([
			page.waitForRequest((req) => req.url().includes("search=Alice")),
			input.press("Enter"),
		]);
		expect(request.url()).toContain("search=Alice");
	});

	test("4.10 — клік на Delete з підтвердженням запускає api.delete", async ({
		page,
	}) => {
		page.on("dialog", (dialog) => dialog.accept());

		const [deleteReq] = await Promise.all([
			page.waitForRequest(
				(req) => req.method() === "DELETE" && req.url().includes("/sales/"),
			),
			page
				.locator("table tbody tr")
				.first()
				.locator("td:last-child button")
				.click(),
		]);
		expect(deleteReq.method()).toBe("DELETE");
	});

	test("4.11 — клік на Delete зі скасуванням НЕ запускає api.delete", async ({
		page,
	}) => {
		let deleteRequest: string | null = null;
		page.on("request", (req) => {
			if (req.method() === "DELETE") deleteRequest = req.url();
		});

		page.on("dialog", (dialog) => dialog.dismiss());
		await page
			.locator("table tbody tr")
			.first()
			.locator("td:last-child button")
			.click();

		await page.waitForTimeout(500);
		expect(deleteRequest).toBeNull();
	});
});
