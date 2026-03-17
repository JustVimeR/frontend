import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";

const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
	usePathname: () => mockUsePathname(),
	redirect: jest.fn(),
}));

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({ children, href, className }: any) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

jest.mock("lucide-react", () => ({
	LayoutDashboard: () => <svg data-testid="icon-dashboard" />,
	ShoppingCart: () => <svg data-testid="icon-sales" />,
	BarChart3: () => <svg data-testid="icon-reports" />,
	Medal: () => <svg data-testid="icon-rankings" />,
	User: () => <svg data-testid="icon-user" />,
	FileSpreadsheet: () => <svg data-testid="icon-upload" />,
	Database: () => <svg data-testid="icon-db" />,
	FileBarChart: () => <svg data-testid="icon-filechart" />,
	Trophy: () => <svg />,
}));

import Layout from "@/components/Layout";
import ReportsIndex from "@/app/reports/overview/page";
import AuthorPage from "@/app/author/page";

// ===== Layout =====
describe("Layout — рендеринг навігації", () => {
	it("відображає бренд Sales Analytics", () => {
		mockUsePathname.mockReturnValue("/dashboard");
		render(
			<Layout>
				<div>content</div>
			</Layout>,
		);
		expect(screen.getByText("Sales Analytics")).toBeInTheDocument();
	});

	it("відображає всі пункти навігації", () => {
		mockUsePathname.mockReturnValue("/dashboard");
		render(
			<Layout>
				<div>content</div>
			</Layout>,
		);
		expect(screen.getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getByText("Sales")).toBeInTheDocument();
		expect(screen.getByText("Reports")).toBeInTheDocument();
		expect(screen.getByText("Rankings")).toBeInTheDocument();
		expect(screen.getByText("Author")).toBeInTheDocument();
		expect(screen.getByText("Upload")).toBeInTheDocument();
		expect(screen.getByText("Operational Data")).toBeInTheDocument();
	});

	it("рендерить children у main секції", () => {
		mockUsePathname.mockReturnValue("/dashboard");
		render(
			<Layout>
				<div data-testid="child-content">My Page</div>
			</Layout>,
		);
		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});

	it("додає активний клас до поточного маршруту /dashboard", () => {
		// MOCK SCENARIO 21: активний маршрут — dashboard
		mockUsePathname.mockReturnValue("/dashboard");
		render(
			<Layout>
				<div />
			</Layout>,
		);
		const dashboardLink = screen.getByText("Dashboard").closest("a");
		expect(dashboardLink).toHaveClass("bg-gray-200");
	});

	it("не додає активний клас до неактивного маршруту", () => {
		// MOCK SCENARIO 22: активний маршрут — sales
		mockUsePathname.mockReturnValue("/sales");
		render(
			<Layout>
				<div />
			</Layout>,
		);
		const dashboardLink = screen.getByText("Dashboard").closest("a");
		expect(dashboardLink).not.toHaveClass("bg-gray-200");
	});

	it("dashboard nav-link має правильний href", () => {
		mockUsePathname.mockReturnValue("/dashboard");
		render(
			<Layout>
				<div />
			</Layout>,
		);
		expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});
});

// ===== ReportsIndex =====
describe("ReportsIndex — відображення звітів", () => {
	it("відображає заголовок Reports Overview", () => {
		render(<ReportsIndex />);
		expect(screen.getByText("Reports Overview")).toBeInTheDocument();
	});

	it("відображає 5 карток звітів", () => {
		render(<ReportsIndex />);
		expect(screen.getByText("Region × Period × Category")).toBeInTheDocument();
		expect(screen.getByText("Manager × Month × Region")).toBeInTheDocument();
		expect(
			screen.getByText("Category × Quarter × Supplier"),
		).toBeInTheDocument();
		expect(screen.getByText("Product × Region × Month")).toBeInTheDocument();
		expect(screen.getByText("Supplier × Category × Year")).toBeInTheDocument();
	});

	it("кожен звіт є посиланням з правильним href", () => {
		render(<ReportsIndex />);
		const link = screen.getByText("Region × Period × Category").closest("a");
		expect(link).toHaveAttribute("href", "/reports/region-period-category");
	});
});

// ===== AuthorPage =====
describe("AuthorPage — статична сторінка автора", () => {
	it("відображає ім'я автора", () => {
		render(<AuthorPage />);
		expect(
			screen.getByText("Developed by Taran Vladyslav"),
		).toBeInTheDocument();
	});

	it("відображає посаду автора", () => {
		render(<AuthorPage />);
		expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
	});

	it("відображає назву проекту", () => {
		render(<AuthorPage />);
		expect(screen.getByText(/Sales Analytics System/)).toBeInTheDocument();
	});

	it("відображає технологічні теги", () => {
		render(<AuthorPage />);
		expect(screen.getByText("FastAPI")).toBeInTheDocument();
		expect(screen.getByText("Next.js 14")).toBeInTheDocument();
		expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
		expect(screen.getByText("TailwindCSS")).toBeInTheDocument();
	});
});
