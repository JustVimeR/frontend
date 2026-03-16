import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
		post: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
	},
}));

jest.mock("lucide-react", () => ({
	Plus: () => <svg />,
	Edit: () => <svg />,
	Trash2: ({ className }: any) => (
		<svg data-testid="trash-icon" className={className} />
	),
	X: () => <svg />,
	Search: () => <svg data-testid="search-icon" />,
}));

import api from "@/lib/api";
import SalesPage from "@/app/sales/page";

const mockApi = api as jest.Mocked<typeof api>;

const mockSales = [
	{
		id: 1,
		sale_id: 1001,
		date: "2024-01-15",
		product_id: 10,
		manager_id: 5,
		region_id: 3,
		quantity: 2,
		unit_price: 299.99,
		discount: 0,
		revenue: 599.98,
		payment_type: "card",
		sales_channel: "store",
		supplier_id: 7,
	},
	{
		id: 2,
		sale_id: 1002,
		date: "2024-01-16",
		product_id: 11,
		manager_id: 6,
		region_id: 4,
		quantity: 1,
		unit_price: 149.99,
		discount: 10,
		revenue: 134.99,
		payment_type: "online",
		sales_channel: "online_store",
		supplier_id: 8,
	},
];

const mockDims = {
	products: [
		{ id: 10, name: "Widget Pro" },
		{ id: 11, name: "Gadget X" },
	],
	managers: [
		{ id: 5, name: "Alice Johnson" },
		{ id: 6, name: "Bob Smith" },
	],
	regions: [
		{ id: 3, name: "North Region" },
		{ id: 4, name: "South Region" },
	],
	suppliers: [
		{ id: 7, name: "Supplier A" },
		{ id: 8, name: "Supplier B" },
	],
};

const setupSuccessMocks = () => {
	mockApi.get.mockImplementation((url: string, config?: any) => {
		if (url === "/sales") return Promise.resolve({ data: mockSales });
		if (url === "/sales/count") return Promise.resolve({ data: { count: 2 } });
		if (url === "/dims/product")
			return Promise.resolve({ data: mockDims.products });
		if (url === "/dims/manager")
			return Promise.resolve({ data: mockDims.managers });
		if (url === "/dims/region")
			return Promise.resolve({ data: mockDims.regions });
		if (url === "/dims/supplier")
			return Promise.resolve({ data: mockDims.suppliers });
		return Promise.resolve({ data: [] });
	});
};

describe("SalesPage — завантаження та відображення даних", () => {
	beforeEach(() => {
		setupSuccessMocks();
	});

	afterEach(() => jest.clearAllMocks());

	it("показує Loading... під час завантаження", () => {
		render(<SalesPage />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("відображає заголовок Sales Management після завантаження", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText("Sales Management")).toBeInTheDocument();
		});
	});

	it("відображає рядки таблиці з датами продажів", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText("2024-01-15")).toBeInTheDocument();
			expect(screen.getByText("2024-01-16")).toBeInTheDocument();
		});
	});

	it("відображає назви продуктів з dims", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText("Widget Pro")).toBeInTheDocument();
			expect(screen.getByText("Gadget X")).toBeInTheDocument();
		});
	});

	it("відображає ім'я менеджера з dims", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
		});
	});

	it("відображає revenue із знаком $", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText("$599.98")).toBeInTheDocument();
		});
	});

	it("відображає пагінацію: кнопки Previous та Next", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText("Previous")).toBeInTheDocument();
			expect(screen.getByText("Next")).toBeInTheDocument();
		});
	});

	it("показує поточну сторінку", async () => {
		render(<SalesPage />);
		await waitFor(() => {
			expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
		});
	});
});

describe("SalesPage — видалення продажу", () => {
	beforeEach(() => {
		setupSuccessMocks();
		mockApi.delete.mockResolvedValue({ data: {} });
	});

	afterEach(() => jest.clearAllMocks());

	it("не видаляє запис, якщо скасовано confirm", async () => {
		window.confirm = jest.fn(() => false);

		render(<SalesPage />);
		await waitFor(() => screen.getByText("2024-01-15"));

		const trashButtons = screen.getAllByTestId("trash-icon");
		fireEvent.click(trashButtons[0].closest("button")!);

		expect(mockApi.delete).not.toHaveBeenCalled();
	});

	it("викликає api.delete після підтвердження", async () => {
		window.confirm = jest.fn(() => true);

		render(<SalesPage />);
		await waitFor(() => screen.getByText("2024-01-15"));

		const trashButtons = screen.getAllByTestId("trash-icon");
		fireEvent.click(trashButtons[0].closest("button")!);

		await waitFor(() => {
			expect(mockApi.delete).toHaveBeenCalledWith("/sales/1");
		});
	});

	it("оновлює список продажів після видалення (викликає fetchSales знову)", async () => {
		window.confirm = jest.fn(() => true);

		render(<SalesPage />);
		await waitFor(() => screen.getByText("2024-01-15"));

		const callsBefore = mockApi.get.mock.calls.length;
		const trashButtons = screen.getAllByTestId("trash-icon");
		fireEvent.click(trashButtons[0].closest("button")!);

		await waitFor(() => {
			expect(mockApi.get.mock.calls.length).toBeGreaterThan(callsBefore);
		});
	});
});

describe("SalesPage — помилка при видаленні", () => {
	beforeEach(() => {
		setupSuccessMocks();
		mockApi.delete.mockRejectedValue(new Error("Delete failed"));
		window.confirm = jest.fn(() => true);
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		(console.error as jest.Mock).mockRestore();
	});

	it("не крашається при помилці видалення", async () => {
		render(<SalesPage />);
		await waitFor(() => screen.getByText("2024-01-15"));

		const trashButtons = screen.getAllByTestId("trash-icon");
		expect(() =>
			fireEvent.click(trashButtons[0].closest("button")!),
		).not.toThrow();

		await waitFor(() => {
			expect(mockApi.delete).toHaveBeenCalled();
		});
	});
});

describe("SalesPage — пошук", () => {
	beforeEach(() => {
		setupSuccessMocks();
	});

	afterEach(() => jest.clearAllMocks());

	it("відображає поле пошуку", async () => {
		render(<SalesPage />);
		await waitFor(() => screen.getByText("Sales Management"));
		expect(
			screen.getByPlaceholderText(
				"Search by product, manager, region, or city...",
			),
		).toBeInTheDocument();
	});

	it("надсилає запит із searchTerm при кліку на Search", async () => {
		render(<SalesPage />);
		await waitFor(() => screen.getByText("Sales Management"));

		const searchInput = screen.getByPlaceholderText(
			"Search by product, manager, region, or city...",
		);
		fireEvent.change(searchInput, { target: { value: "Widget" } });
		fireEvent.click(screen.getByRole("button", { name: "Search" }));

		await waitFor(() => {
			const getCalls = mockApi.get.mock.calls;
			const salesCall = getCalls.find(
				([url, config]) =>
					url === "/sales" && config?.params?.search === "Widget",
			);
			expect(salesCall).toBeDefined();
		});
	});

	it("натискання Enter у полі пошуку запускає пошук", async () => {
		render(<SalesPage />);
		await waitFor(() => screen.getByText("Sales Management"));

		const searchInput = screen.getByPlaceholderText(
			"Search by product, manager, region, or city...",
		);
		fireEvent.change(searchInput, { target: { value: "Alice" } });
		fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

		await waitFor(() => {
			const getCalls = mockApi.get.mock.calls;
			const salesCall = getCalls.find(
				([url, config]) =>
					url === "/sales" && config?.params?.search === "Alice",
			);
			expect(salesCall).toBeDefined();
		});
	});
});
