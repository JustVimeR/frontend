import { test, expect } from "@playwright/test";
import { mockAPI } from "./helpers/mock-api";
import path from "path";
import fs from "fs";
import os from "os";

function createTempFile(name: string, sizeBytes = 2048): string {
	const tmpPath = path.join(os.tmpdir(), name);
	fs.writeFileSync(tmpPath, Buffer.alloc(sizeBytes, "x"));
	return tmpPath;
}

test.describe("Сценарій 3 — Upload: форма завантаження файлу", () => {
	test("3.1 — початковий стан: заголовок є, кнопка Upload прихована", async ({
		page,
	}) => {
		await page.goto("/upload");

		await expect(
			page.getByRole("heading", { name: "Upload Sales Data" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Upload" }),
		).not.toBeVisible();
	});

	test("3.2 — після вибору файлу відображається ім'я та розмір", async ({
		page,
	}) => {
		const filePath = createTempFile("sales_test.xlsx", 3072);
		await page.goto("/upload");

		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(filePath);

		await expect(page.getByText("sales_test.xlsx")).toBeVisible();
		await expect(page.getByText(/KB/)).toBeVisible();
	});

	test("3.3 — кнопка Upload з'являється після вибору файлу", async ({
		page,
	}) => {
		const filePath = createTempFile("data.xlsx");
		await page.goto("/upload");

		await page.locator('input[type="file"]').setInputFiles(filePath);
		await expect(page.getByRole("button", { name: /Upload/ })).toBeVisible();
	});

	test("3.4 — успішне завантаження: відображається Success-повідомлення", async ({
		page,
	}) => {
		await mockAPI(page, [
			{
				url: "/upload/sales",
				body: { rows_inserted: 45, rows_processed: 50 },
			},
		]);

		const filePath = createTempFile("sales_ok.xlsx");
		await page.goto("/upload");

		await page.locator('input[type="file"]').setInputFiles(filePath);
		await page.getByRole("button", { name: /Upload/ }).click();

		await expect(
			page.getByText(/Successfully processed 45 new records/),
		).toBeVisible();
		await expect(page.getByText(/from 50 total/)).toBeVisible();
	});

	test("3.5 — після успішного завантаження файл очищується (кнопка Upload зникає)", async ({
		page,
	}) => {
		await mockAPI(page, [
			{ url: "/upload/sales", body: { rows_inserted: 10, rows_processed: 10 } },
		]);

		const filePath = createTempFile("clear_test.xlsx");
		await page.goto("/upload");

		await page.locator('input[type="file"]').setInputFiles(filePath);
		await page.getByRole("button", { name: /Upload/ }).click();

		await expect(page.getByText(/Successfully processed/)).toBeVisible();
		await expect(
			page.getByRole("button", { name: /^Upload$/ }),
		).not.toBeVisible();
	});

	test("3.6 — при помилці сервера з detail відображається серверне повідомлення", async ({
		page,
	}) => {
		await mockAPI(page, [
			{
				url: "/upload/sales",
				body: { detail: "Invalid column: sale_date" },
				status: 422,
			},
		]);

		const filePath = createTempFile("bad_file.xlsx");
		await page.goto("/upload");

		await page.locator('input[type="file"]').setInputFiles(filePath);
		await page.getByRole("button", { name: /Upload/ }).click();

		await expect(page.getByText("Invalid column: sale_date")).toBeVisible();
	});

	test("3.7 — список Expected Columns містить sale_id та quantity", async ({
		page,
	}) => {
		await page.goto("/upload");

		await expect(page.getByText("Expected Columns")).toBeVisible();
		await expect(page.locator("code", { hasText: "sale_id" })).toBeVisible();
		await expect(page.locator("code", { hasText: "quantity" })).toBeVisible();
	});
});
