import { test, expect } from "@playwright/test";
import { mockDashboard, mockSales, mockRankings } from "./helpers/mock-api";

test.describe("Сценарій 1 — Навігація через бічну панель", () => {
	test("1.1 — бренд Sales Analytics відображається на стартовій сторінці", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/dashboard");
		await expect(
			page.getByRole("heading", { name: "Sales Analytics" }),
		).toBeVisible();
	});

	test("1.2 — усі 7 пунктів навігаційного меню відображаються", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/dashboard");

		const nav = page.locator("aside nav");
		await expect(nav.getByText("Dashboard")).toBeVisible();
		await expect(nav.getByText("Sales")).toBeVisible();
		await expect(nav.getByText("Reports")).toBeVisible();
		await expect(nav.getByText("Rankings")).toBeVisible();
		await expect(nav.getByText("Author")).toBeVisible();
		await expect(nav.getByText("Upload")).toBeVisible();
		await expect(nav.getByText("Operational Data")).toBeVisible();
	});

	test("1.3 — клік на Sales переводить на /sales", async ({ page }) => {
		await mockDashboard(page);
		await mockSales(page);
		await page.goto("/dashboard");

		await page.locator("aside nav").getByText("Sales").click();
		await expect(page).toHaveURL(/\/sales/);
		await expect(
			page.getByRole("heading", { name: "Sales Management" }),
		).toBeVisible();
	});

	test("1.4 — клік на Rankings переводить на /rankings", async ({ page }) => {
		await mockDashboard(page);
		await mockRankings(page);
		await page.goto("/dashboard");

		await page.locator("aside nav").getByText("Rankings").click();
		await expect(page).toHaveURL(/\/rankings/);
		await expect(page.getByRole("heading", { name: "Rankings" })).toBeVisible();
	});

	test("1.5 — активний пункт меню підсвічений (border-right синій)", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/dashboard");

		const dashboardLink = page.locator("aside nav a[href='/dashboard']");
		await expect(dashboardLink).toHaveClass(/border-blue-500/);
	});

	test("1.6 — після переходу на /upload активний пункт змінюється", async ({
		page,
	}) => {
		await mockDashboard(page);
		await page.goto("/upload");

		const uploadLink = page.locator("aside nav a[href='/upload']");
		const dashLink = page.locator("aside nav a[href='/dashboard']");

		await expect(uploadLink).toHaveClass(/border-blue-500/);
		await expect(dashLink).not.toHaveClass(/border-blue-500/);
	});
});
