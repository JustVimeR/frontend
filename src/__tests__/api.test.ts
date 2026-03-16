import "@testing-library/jest-dom";

jest.mock("axios", () => {
	const mockAxiosInstance = {
		get: jest.fn(),
		post: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};
	return {
		create: jest.fn(() => mockAxiosInstance),
		default: { create: jest.fn(() => mockAxiosInstance) },
	};
});

describe("api.ts — axios instance configuration", () => {
	it("повинен створювати axios-екземпляр з правильним baseURL та headers", () => {
		jest.resetModules();

		const mockCreate = jest.fn(() => ({
			get: jest.fn(),
			post: jest.fn(),
			interceptors: {
				request: { use: jest.fn() },
				response: { use: jest.fn() },
			},
		}));

		jest.doMock("axios", () => ({
			create: mockCreate,
			default: { create: mockCreate },
		}));

		require("@/lib/api");

		expect(mockCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				baseURL: "http://localhost:8000",
				headers: expect.objectContaining({
					"Content-Type": "application/json",
				}),
			}),
		);
	});
});

describe("api.ts — успішний GET-запит", () => {
	let apiInstance: any;

	beforeEach(() => {
		jest.resetModules();

		const mockGet = jest.fn().mockResolvedValue({
			data: { total_revenue: 5000, count_sales: 120 },
			status: 200,
		});

		const mockAxiosInstance = {
			get: mockGet,
			post: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			interceptors: {
				request: { use: jest.fn() },
				response: { use: jest.fn() },
			},
		};

		jest.doMock("axios", () => ({ create: jest.fn(() => mockAxiosInstance) }));
		apiInstance = require("@/lib/api").default;
	});

	it("повертає дані дешборду при успішному GET /dashboard/metrics", async () => {
		const response = await apiInstance.get("/dashboard/metrics");
		expect(response.data).toEqual({ total_revenue: 5000, count_sales: 120 });
		expect(response.status).toBe(200);
		expect(apiInstance.get).toHaveBeenCalledWith("/dashboard/metrics");
	});
});

describe("api.ts — мережева помилка GET-запиту", () => {
	let apiInstance: any;

	beforeEach(() => {
		jest.resetModules();

		const networkError = new Error("Network Error");
		const mockGet = jest.fn().mockRejectedValue(networkError);

		const mockAxiosInstance = {
			get: mockGet,
			post: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			interceptors: {
				request: { use: jest.fn() },
				response: { use: jest.fn() },
			},
		};

		jest.doMock("axios", () => ({ create: jest.fn(() => mockAxiosInstance) }));
		apiInstance = require("@/lib/api").default;
	});

	it("відкидає проміс з помилкою при збої мережі", async () => {
		await expect(apiInstance.get("/dashboard/metrics")).rejects.toThrow(
			"Network Error",
		);
	});
});

describe("api.ts — POST-запит для завантаження файлу", () => {
	let apiInstance: any;

	beforeEach(() => {
		jest.resetModules();

		const mockPost = jest.fn().mockResolvedValue({
			data: { rows_inserted: 45, rows_processed: 50 },
			status: 200,
		});

		const mockAxiosInstance = {
			get: jest.fn(),
			post: mockPost,
			put: jest.fn(),
			delete: jest.fn(),
			interceptors: {
				request: { use: jest.fn() },
				response: { use: jest.fn() },
			},
		};

		jest.doMock("axios", () => ({ create: jest.fn(() => mockAxiosInstance) }));
		apiInstance = require("@/lib/api").default;
	});

	it("надсилає FormData через POST /upload/sales та повертає результат", async () => {
		const formData = new FormData();
		formData.append(
			"file",
			new Blob(["data"], { type: "application/vnd.ms-excel" }),
			"sales.xlsx",
		);

		const response = await apiInstance.post("/upload/sales", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		expect(response.data.rows_inserted).toBe(45);
		expect(response.data.rows_processed).toBe(50);
		expect(apiInstance.post).toHaveBeenCalledWith(
			"/upload/sales",
			formData,
			expect.objectContaining({
				headers: { "Content-Type": "multipart/form-data" },
			}),
		);
	});
});
