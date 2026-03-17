import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";

jest.mock("@/lib/api", () => ({
	__esModule: true,
	default: {
		get: jest.fn(),
	},
}));

jest.mock("lucide-react", () => ({
	ArrowUpRight: () => <svg data-testid="icon-arrow" />,
	DollarSign: () => <svg data-testid="icon-dollar" />,
	ShoppingBag: () => <svg data-testid="icon-bag" />,
	Users: () => <svg data-testid="icon-users" />,
}));

jest.mock("recharts", () => ({
	LineChart: ({ children }: any) => (
		<div data-testid="line-chart">{children}</div>
	),
	BarChart: ({ children }: any) => (
		<div data-testid="bar-chart">{children}</div>
	),
	PieChart: ({ children }: any) => (
		<div data-testid="pie-chart">{children}</div>
	),
	Pie: () => <div />,
	Cell: () => <span />,
	Line: () => <div />,
	Bar: () => <div />,
	XAxis: () => <div />,
	YAxis: () => <div />,
	CartesianGrid: () => <div />,
	Tooltip: () => <div />,
	Legend: () => <div />,
	ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

import api from "@/lib/api";
import Dashboard from "@/app/dashboard/page";

const mockApi = api as jest.Mocked<typeof api>;

const mockMetrics = {
	total_revenue: 125000.5,
	count_sales: 340,
	avg_check: 367.65,
	total_quantity: 1200,
};

const mockRevenueData = [
	{ d1: "January", d2: "2024", value: 15000 },
	{ d1: "February", d2: "2024", value: 18000 },
];

describe("Dashboard — успішне завантаження даних", () => {
	beforeEach(() => {
		mockApi.get.mockImplementation((url: string) => {
			if (url === "/dashboard/metrics") {
				return Promise.resolve({ data: mockMetrics });
			}
			if (url.includes("/reports/aggregate")) {
				return Promise.resolve({ data: mockRevenueData });
			}
			return Promise.resolve({ data: {} });
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("спочатку показує індикатор завантаження", async () => {
		render(<Dashboard />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
		await act(async () => {});
	});

	it("відображає заголовок Dashboard після завантаження", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByText("Dashboard")).toBeInTheDocument();
		});
	});

	it("відображає картку Total Revenue з правильним значенням", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByText("Total Revenue")).toBeInTheDocument();
			expect(screen.getByText("$125000.50")).toBeInTheDocument();
		});
	});

	it("відображає картку Total Sales з правильним значенням", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByText("Total Sales")).toBeInTheDocument();
			expect(screen.getByText("340")).toBeInTheDocument();
		});
	});

	it("відображає картки Avg Check та Quantity Sold", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByText("Avg Check")).toBeInTheDocument();
			expect(screen.getByText("Quantity Sold")).toBeInTheDocument();
		});
	});

	it("викликає обидва API-ендпоінти", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(mockApi.get).toHaveBeenCalledWith("/dashboard/metrics");
			expect(mockApi.get).toHaveBeenCalledWith(
				expect.stringContaining("/reports/aggregate"),
			);
		});
	});

	it("відображає секцію Revenue Trend після завантаження", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
		});
	});
});

describe("Dashboard — помилка завантаження даних", () => {
	beforeEach(() => {
		jest.spyOn(console, "error").mockImplementation(() => {});
		mockApi.get.mockRejectedValue(new Error("Server error"));
	});

	afterEach(() => {
		jest.clearAllMocks();
		(console.error as jest.Mock).mockRestore();
	});

	it("не показує Loading... після помилки", async () => {
		render(<Dashboard />);
		await waitFor(() => {
			expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
		});
	});

	it("не крашається при помилці API", async () => {
		expect(() => render(<Dashboard />)).not.toThrow();
		await waitFor(() => {
			expect(mockApi.get).toHaveBeenCalled();
		});
	});
});
