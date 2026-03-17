import { test, expect } from "@playwright/test";

const REPORT_CARDS = [
	{
		title: "Region \u00d7 Period \u00d7 Category",
		href: "/reports/region-period-category",
	},
	{
		title: "Manager \u00d7 Month \u00d7 Region",
		href: "/reports/manager-month-region",
	},
	{
		title: "Category \u00d7 Quarter \u00d7 Supplier",
		href: "/reports/category-quarter-supplier",
	},
	{
		title: "Product \u00d7 Region \u00d7 Month",
		href: "/reports/product-region-month",
	},
	{
		title: "Supplier \u00d7 Category \u00d7 Year",
		href: "/reports/supplier-category-year",
	},
];

test.describe("Сценарій 6a — Reports Overview", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/reports/overview");
	});

	test("6.1 — заголовок Reports Overview відображається", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /Reports/ })).toBeVisible();
	});

	test("6.2 — всі 5 карток звітів відображаються", async ({ page }) => {
		for (const card of REPORT_CARDS) {
			await expect(page.getByText(card.title)).toBeVisible();
		}
	});

	test("6.3 — картка Region × Period × Category є посиланням з правильним href", async ({
		page,
	}) => {
		const link = page.locator(`a[href="/reports/region-period-category"]`);
		await expect(link).toBeVisible();
	});

	test("6.4 — клік на картку переводить на відповідний маршрут", async ({
		page,
	}) => {
		await page.locator(`a[href="/reports/region-period-category"]`).click();
		await expect(page).toHaveURL(/region-period-category/);
	});
});

test.describe("Сценарій 6b — Author page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/author");
	});

	test("6.5 — ім'я автора відображається", async ({ page }) => {
		await expect(page.getByText(/Taran Vladyslav/i)).toBeVisible();
	});

	test("6.6 — посада Full-Stack Developer відображається", async ({ page }) => {
		await expect(page.getByText(/Full-Stack Developer/i)).toBeVisible();
	});

	test("6.7 — назва проекту Sales Analytics System відображається", async ({
		page,
	}) => {
		await expect(page.getByText(/Sales Analytics System/i)).toBeVisible();
	});

	test("6.8 — технологічні теги FastAPI та Next.js відображаються", async ({
		page,
	}) => {
		await expect(page.locator("span", { hasText: /^FastAPI$/ })).toBeVisible();
		await expect(
			page.locator("span", { hasText: /^Next\.js 14$/ }),
		).toBeVisible();
		await expect(
			page.locator("span", { hasText: /^PostgreSQL$/ }),
		).toBeVisible();
		await expect(
			page.locator("span", { hasText: /^TailwindCSS$/ }),
		).toBeVisible();
	});
});
