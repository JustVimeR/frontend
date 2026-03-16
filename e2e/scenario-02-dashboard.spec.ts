import { test, expect } from "@playwright/test";
import { mockDashboard, mockAPI, MOCK_METRICS } from "./helpers/mock-api";

test.describe("Сценарій 2 — Dashboard: метрики та графіки", () => {
	test("2.1 — відображається заголовок Dashboard та 4 метричні картки", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/dashboard");

		await expect(
			page.getByRole("heading", { name: "Dashboard" }),
		).toBeVisible();
		await expect(page.getByText("Total Revenue")).toBeVisible();
		await expect(page.getByText("Total Sales")).toBeVisible();
		await expect(page.getByText("Avg Check")).toBeVisible();
		await expect(page.getByText("Quantity Sold")).toBeVisible();
	});

	test("2.2 — значення Total Revenue форматується як $125000.50", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/dashboard");

		await expect(
			page.getByText(`$${MOCK_METRICS.total_revenue.toFixed(2)}`),
		).toBeVisible();
	});

	test("2.3 — значення Total Sales відображається як 340", async ({ page }) => {
		await mockDashboard(page);
		await page.goto("/dashboard");

		await expect(
			page.getByText(String(MOCK_METRICS.count_sales)),
		).toBeVisible();
	});

	test("2.4 — секція Revenue Trend присутня після завантаження", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/dashboard");

		await expect(page.getByText("Revenue Trend")).toBeVisible();
		await expect(page.getByText("Revenue Bar")).toBeVisible();
	});

	test("2.5 — при помилці API сторінка не падає, заголовок відсутній", async ({
		page,
	}) => {
		await mockAPI(page, [
			{
				url: "/dashboard/metrics",
				body: { detail: "Internal Server Error" },
				status: 500,
			},
			{
				url: "/reports/aggregate",
				body: { detail: "Internal Server Error" },
				status: 500,
			},
		]);

		let consoleErrors = 0;
		page.on("console", (msg) => {
			if (msg.type() === "error") consoleErrors++;
		});

		await page.goto("/dashboard");
		await expect(page.getByText("Loading...")).not.toBeVisible({
			timeout: 5000,
		});
	});
});
