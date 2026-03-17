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
	Trophy: ({ className }: any) => (
		<svg data-testid="trophy-icon" className={className} />
	),
}));

import api from "@/lib/api";
import RankingsPage from "@/app/rankings/page";

const mockApi = api as jest.Mocked<typeof api>;

const mockManagers = [
	{ rank: 1, name: "Alice Johnson", revenue: 125000 },
	{ rank: 2, name: "Bob Smith", revenue: 98000 },
	{ rank: 3, name: "Carol Davis", revenue: 87500 },
];

const mockProducts = [
	{ rank: 1, name: "Widget Pro", revenue: 45000 },
	{ rank: 2, name: "Gadget X", revenue: 38000 },
];

const mockRegions = [
	{ rank: 1, name: "North Region", revenue: 210000 },
	{ rank: 2, name: "South Region", revenue: 175000 },
];

describe("RankingsPage — успішне завантаження даних", () => {
	beforeEach(() => {
		mockApi.get.mockImplementation((url: string) => {
			if (url === "/rankings/manager")
				return Promise.resolve({ data: mockManagers });
			if (url === "/rankings/product")
				return Promise.resolve({ data: mockProducts });
			if (url === "/rankings/region")
				return Promise.resolve({ data: mockRegions });
			return Promise.resolve({ data: [] });
		});
	});

	afterEach(() => jest.clearAllMocks());

	it("показує Loading... під час завантаження", async () => {
		render(<RankingsPage />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
		await act(async () => {});
	});

	it("відображає заголовок Rankings після завантаження", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Rankings")).toBeInTheDocument();
		});
	});

	it("відображає секцію Top Managers", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Top Managers")).toBeInTheDocument();
		});
	});

	it("відображає секцію Top Products", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Top Products")).toBeInTheDocument();
		});
	});

	it("відображає секцію Top Regions", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Top Regions")).toBeInTheDocument();
		});
	});

	it("відображає імена менеджерів", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
			expect(screen.getByText("Bob Smith")).toBeInTheDocument();
			expect(screen.getByText("Carol Davis")).toBeInTheDocument();
		});
	});

	it("відображає назви продуктів", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Widget Pro")).toBeInTheDocument();
			expect(screen.getByText("Gadget X")).toBeInTheDocument();
		});
	});

	it("відображає назви регіонів", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("North Region")).toBeInTheDocument();
			expect(screen.getByText("South Region")).toBeInTheDocument();
		});
	});

	it("відображає revenue менеджерів у форматі з $", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			const revenueEl = screen.getByText(/\$125/);
			expect(revenueEl).toBeInTheDocument();
		});
	});

	it("відображає ранги у списку (1, 2, 3...)", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			const rankBadges = screen.getAllByText("1");
			expect(rankBadges.length).toBeGreaterThanOrEqual(3);
		});
	});

	it("рендерить 3 Trophy іконки (по одній на секцію)", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			const trophies = screen.getAllByTestId("trophy-icon");
			expect(trophies).toHaveLength(3);
		});
	});

	it("викликає всі три rankings ендпоінти", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(mockApi.get).toHaveBeenCalledWith("/rankings/manager");
			expect(mockApi.get).toHaveBeenCalledWith("/rankings/product");
			expect(mockApi.get).toHaveBeenCalledWith("/rankings/region");
		});
	});
});

describe("RankingsPage — помилка завантаження", () => {
	beforeEach(() => {
		mockApi.get.mockRejectedValue(new Error("API unavailable"));
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		(console.error as jest.Mock).mockRestore();
	});

	it("не показує Loading... після помилки", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
		});
	});

	it("рендериться без краша при помилці API", async () => {
		expect(() => render(<RankingsPage />)).not.toThrow();
		await waitFor(() => {
			expect(mockApi.get).toHaveBeenCalled();
		});
	});

	it("відображає заголовок Rankings навіть при помилці (порожні дані)", async () => {
		render(<RankingsPage />);
		await waitFor(() => {
			expect(screen.getByText("Rankings")).toBeInTheDocument();
		});
	});
});
