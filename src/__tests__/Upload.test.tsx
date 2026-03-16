import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
		post: jest.fn(),
	},
}));

jest.mock("lucide-react", () => ({
	Upload: () => <svg data-testid="icon-upload" />,
	FileSpreadsheet: () => <svg data-testid="icon-spreadsheet" />,
	CheckCircle: () => <svg data-testid="icon-check" />,
	AlertCircle: () => <svg data-testid="icon-alert" />,
}));

import api from "@/lib/api";
import UploadPage from "@/app/upload/page";

const mockApi = api as jest.Mocked<typeof api>;

const selectFile = (filename = "sales.xlsx", size = 1024) => {
	const file = new File(["col1,col2\nval1,val2"], filename, {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	Object.defineProperty(file, "size", { value: size });
	const input =
		(screen.getByRole("textbox", { hidden: true }) as HTMLInputElement) ||
		(document.querySelector('input[type="file"]') as HTMLInputElement);
	fireEvent.change(input, { target: { files: [file] } });
	return file;
};

describe("UploadPage — рендеринг початкового стану", () => {
	it("відображає заголовок Upload Sales Data", () => {
		render(<UploadPage />);
		expect(screen.getByText("Upload Sales Data")).toBeInTheDocument();
	});

	it("не показує кнопку Upload до вибору файлу", () => {
		render(<UploadPage />);
		expect(screen.queryByText("Upload")).not.toBeInTheDocument();
	});

	it("відображає список очікуваних стовпців", () => {
		render(<UploadPage />);
		expect(screen.getByText("Expected Columns")).toBeInTheDocument();
		expect(screen.getByText("sale_id")).toBeInTheDocument();
		expect(screen.getByText("quantity")).toBeInTheDocument();
	});

	it("відображає поле для вибору файлу (.xlsx)", () => {
		render(<UploadPage />);
		const input = document.querySelector('input[type="file"]');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute("accept", ".xlsx, .xls");
	});
});

describe("UploadPage — вибір файлу", () => {
	it("відображає ім'я файлу після вибору", () => {
		render(<UploadPage />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["data"], "sales_2024.xlsx", {
			type: "application/vnd.ms-excel",
		});
		fireEvent.change(input, { target: { files: [file] } });
		expect(screen.getByText("sales_2024.xlsx")).toBeInTheDocument();
	});

	it("відображає розмір файлу після вибору", () => {
		render(<UploadPage />);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["x".repeat(2048)], "data.xlsx", {
			type: "application/vnd.ms-excel",
		});
		fireEvent.change(input, { target: { files: [file] } });
		expect(screen.getByText(/KB/)).toBeInTheDocument();
	});
});

describe("UploadPage — успішне завантаження файлу", () => {
	beforeEach(() => {
		mockApi.post.mockResolvedValue({
			data: { rows_inserted: 45, rows_processed: 50 },
		});
	});

	afterEach(() => jest.clearAllMocks());

	it("показує Success-повідомлення після завантаження", async () => {
		render(<UploadPage />);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["data"], "sales.xlsx", {
			type: "application/vnd.ms-excel",
		});
		fireEvent.change(input, { target: { files: [file] } });

		const uploadBtn = screen.getByText("Upload").closest("button")!;
		fireEvent.click(uploadBtn);

		await waitFor(() => {
			expect(screen.getByText("Success")).toBeInTheDocument();
		});
		expect(
			screen.getByText(
				/Successfully processed 45 new records \(from 50 total\)/,
			),
		).toBeInTheDocument();
	});

	it("надсилає POST на /upload/sales з FormData", async () => {
		render(<UploadPage />);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["data"], "sales.xlsx", {
			type: "application/vnd.ms-excel",
		});
		fireEvent.change(input, { target: { files: [file] } });

		fireEvent.click(screen.getByText("Upload").closest("button")!);

		await waitFor(() => {
			expect(mockApi.post).toHaveBeenCalledWith(
				"/upload/sales",
				expect.any(FormData),
				expect.objectContaining({
					headers: { "Content-Type": "multipart/form-data" },
				}),
			);
		});
	});

	it("очищує вибраний файл після успішного завантаження", async () => {
		render(<UploadPage />);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["data"], "test.xlsx", {
			type: "application/vnd.ms-excel",
		});
		fireEvent.change(input, { target: { files: [file] } });

		fireEvent.click(screen.getByText("Upload").closest("button")!);

		await waitFor(() => {
			expect(screen.getByText("Success")).toBeInTheDocument();
		});
		expect(screen.queryByText("test.xlsx")).not.toBeInTheDocument();
	});
});

describe("UploadPage — помилка з detail від сервера", () => {
	beforeEach(() => {
		mockApi.post.mockRejectedValue({
			response: { data: { detail: "Invalid column: sale_date" } },
		});
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		(console.error as jest.Mock).mockRestore();
	});

	it("показує Error-повідомлення з detail при помилці сервера", async () => {
		render(<UploadPage />);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: { files: [new File(["data"], "bad.xlsx")] },
		});
		fireEvent.click(screen.getByText("Upload").closest("button")!);

		await waitFor(() => {
			expect(screen.getByText("Error")).toBeInTheDocument();
			expect(screen.getByText("Invalid column: sale_date")).toBeInTheDocument();
		});
	});
});

describe("UploadPage — загальна помилка мережі", () => {
	beforeEach(() => {
		mockApi.post.mockRejectedValue(new Error("Network Error"));
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		(console.error as jest.Mock).mockRestore();
	});

	it("показує fallback-повідомлення про помилку", async () => {
		render(<UploadPage />);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: { files: [new File(["data"], "sales.xlsx")] },
		});
		fireEvent.click(screen.getByText("Upload").closest("button")!);

		await waitFor(() => {
			expect(screen.getByText("Error")).toBeInTheDocument();
			expect(
				screen.getByText("Failed to upload file. Please check format."),
			).toBeInTheDocument();
		});
	});
});
