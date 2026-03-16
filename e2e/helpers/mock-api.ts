import { Page, Route } from "@playwright/test";

export const MOCK_METRICS = {
	total_revenue: 125000.5,
	count_sales: 340,
	avg_check: 367.65,
	total_quantity: 980,
};

export const MOCK_AGGREGATE = [
	{ d1: "Jan", d2: "2024", value: 45000 },
	{ d1: "Feb", d2: "2024", value: 52000 },
	{ d1: "Mar", d2: "2024", value: 28000 },
];

export const MOCK_SALES = [
	{
		id: 1,
		sale_id: 1001,
		date: "2024-01-15",
		product_id: 1,
		manager_id: 1,
		region_id: 1,
		quantity: 3,
		unit_price: 199.99,
		discount: 0,
		revenue: 599.97,
		payment_type: "Credit Card",
		sales_channel: "Online",
		supplier_id: 1,
	},
	{
		id: 2,
		sale_id: 1002,
		date: "2024-01-16",
		product_id: 2,
		manager_id: 2,
		region_id: 1,
		quantity: 1,
		unit_price: 299.99,
		discount: 0.1,
		revenue: 269.99,
		payment_type: "Cash",
		sales_channel: "Store",
		supplier_id: 2,
	},
];

export const MOCK_SALES_COUNT = { count: 2 };

export const MOCK_DIMS_PRODUCT = [
	{ id: 1, name: "Widget Pro" },
	{ id: 2, name: "Gadget X" },
];
export const MOCK_DIMS_MANAGER = [
	{ id: 1, name: "Alice Johnson" },
	{ id: 2, name: "Bob Smith" },
];
export const MOCK_DIMS_REGION = [{ id: 1, name: "North Region" }];
export const MOCK_DIMS_SUPPLIER = [{ id: 1, name: "SupplierA" }];

export const MOCK_RANKINGS_MANAGER = [
	{ rank: 1, name: "Alice Johnson", revenue: 125000 },
	{ rank: 2, name: "Bob Smith", revenue: 98000 },
	{ rank: 3, name: "Carol Davis", revenue: 87000 },
];
export const MOCK_RANKINGS_PRODUCT = [
	{ rank: 1, name: "Widget Pro", revenue: 75000 },
	{ rank: 2, name: "Gadget X", revenue: 62000 },
];
export const MOCK_RANKINGS_REGION = [
	{ rank: 1, name: "North Region", revenue: 95000 },
	{ rank: 2, name: "South Region", revenue: 80000 },
];

type MockDef = { url: string | RegExp; body: unknown; status?: number };

export async function mockAPI(page: Page, defs: MockDef[]) {
	for (const def of defs) {
		await page.route(
			(url) => {
				const href = url.href;
				if (
					!href.includes("localhost:8000") &&
					!href.includes("127.0.0.1:8000")
				) {
					return false;
				}
				const pathname = href.split("?")[0];
				return typeof def.url === "string"
					? pathname.endsWith(def.url)
					: def.url.test(href);
			},
			(route: Route) =>
				route.fulfill({
					status: def.status ?? 200,
					contentType: "application/json",
					body: JSON.stringify(def.body),
				}),
		);
	}
}

export async function mockDashboard(page: Page) {
	await mockAPI(page, [
		{ url: "/dashboard/metrics", body: MOCK_METRICS },
		{ url: "/reports/aggregate", body: MOCK_AGGREGATE },
	]);
}

export async function mockSales(page: Page) {
	await mockAPI(page, [
		{ url: "/sales/count", body: MOCK_SALES_COUNT },
		{ url: "/dims/product", body: MOCK_DIMS_PRODUCT },
		{ url: "/dims/manager", body: MOCK_DIMS_MANAGER },
		{ url: "/dims/region", body: MOCK_DIMS_REGION },
		{ url: "/dims/supplier", body: MOCK_DIMS_SUPPLIER },
		{ url: "/sales", body: MOCK_SALES },
	]);
	await page.route(
		(url) =>
			(url.href.includes("localhost:8000") ||
				url.href.includes("127.0.0.1:8000")) &&
			url.href.includes("/sales/") &&
			!url.href.includes("count"),
		(route: Route) => {
			if (route.request().method() === "DELETE") {
				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ ok: true }),
				});
			} else {
				route.continue();
			}
		},
	);
}

export async function mockRankings(page: Page) {
	await mockAPI(page, [
		{ url: "/rankings/manager", body: MOCK_RANKINGS_MANAGER },
		{ url: "/rankings/product", body: MOCK_RANKINGS_PRODUCT },
		{ url: "/rankings/region", body: MOCK_RANKINGS_REGION },
	]);
}
