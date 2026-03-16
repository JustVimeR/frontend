import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
	LineChartComponent,
	BarChartComponent,
	PieChartComponent,
} from "@/components/Charts";

jest.mock("recharts", () => ({
	LineChart: ({ children, data }: any) => (
		<div data-testid="line-chart" data-length={data?.length}>
			{children}
		</div>
	),
	BarChart: ({ children, data }: any) => (
		<div data-testid="bar-chart" data-length={data?.length}>
			{children}
		</div>
	),
	PieChart: ({ children }: any) => (
		<div data-testid="pie-chart">{children}</div>
	),
	Pie: ({ data, dataKey, nameKey }: any) => (
		<div
			data-testid="pie"
			data-datakey={dataKey}
			data-namekey={nameKey}
			data-length={data?.length}
		/>
	),
	Cell: ({ fill }: any) => <span data-fill={fill} />,
	Line: ({ dataKey }: any) => <div data-testid="line" data-datakey={dataKey} />,
	Bar: ({ dataKey }: any) => <div data-testid="bar" data-datakey={dataKey} />,
	XAxis: ({ dataKey }: any) => (
		<div data-testid="x-axis" data-datakey={dataKey} />
	),
	YAxis: () => <div data-testid="y-axis" />,
	CartesianGrid: () => <div data-testid="cartesian-grid" />,
	Tooltip: () => <div data-testid="tooltip" />,
	Legend: () => <div data-testid="legend" />,
	ResponsiveContainer: ({ children }: any) => (
		<div data-testid="responsive-container">{children}</div>
	),
}));

const sampleData = [
	{ month: "Jan", revenue: 1200 },
	{ month: "Feb", revenue: 1500 },
	{ month: "Mar", revenue: 900 },
];

const pieData = [
	{ category: "Electronics", value: 4000 },
	{ category: "Clothing", value: 2500 },
];

// ===== LineChartComponent =====
describe("LineChartComponent", () => {
	it("рендериться без помилок", () => {
		render(
			<LineChartComponent data={sampleData} xKey="month" yKey="revenue" />,
		);
		expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
	});

	it("передає правильний xKey та yKey", () => {
		render(
			<LineChartComponent data={sampleData} xKey="month" yKey="revenue" />,
		);
		expect(screen.getByTestId("x-axis")).toHaveAttribute(
			"data-datakey",
			"month",
		);
		expect(screen.getByTestId("line")).toHaveAttribute(
			"data-datakey",
			"revenue",
		);
	});

	it("відображає LineChart з переданими даними", () => {
		render(
			<LineChartComponent data={sampleData} xKey="month" yKey="revenue" />,
		);
		expect(screen.getByTestId("line-chart")).toHaveAttribute(
			"data-length",
			String(sampleData.length),
		);
	});

	it("рендериться з порожнім масивом даних без краша", () => {
		render(<LineChartComponent data={[]} xKey="month" yKey="revenue" />);
		expect(screen.getByTestId("line-chart")).toBeInTheDocument();
	});
});

// ===== BarChartComponent =====
describe("BarChartComponent", () => {
	it("рендериться без помилок", () => {
		render(<BarChartComponent data={sampleData} xKey="month" yKey="revenue" />);
		expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
	});

	it("передає правильний dataKey для Bar", () => {
		render(<BarChartComponent data={sampleData} xKey="month" yKey="revenue" />);
		expect(screen.getByTestId("bar")).toHaveAttribute(
			"data-datakey",
			"revenue",
		);
	});

	it("відображає BarChart з правильною кількістю точок даних", () => {
		render(<BarChartComponent data={sampleData} xKey="month" yKey="revenue" />);
		expect(screen.getByTestId("bar-chart")).toHaveAttribute(
			"data-length",
			String(sampleData.length),
		);
	});
});

// ===== PieChartComponent =====
describe("PieChartComponent", () => {
	it("рендериться без помилок", () => {
		render(
			<PieChartComponent data={pieData} nameKey="category" valueKey="value" />,
		);
		expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
	});

	it("передає правильний dataKey для Pie", () => {
		render(
			<PieChartComponent data={pieData} nameKey="category" valueKey="value" />,
		);
		expect(screen.getByTestId("pie")).toHaveAttribute("data-datakey", "value");
	});

	it("рендерить Cells для кожного елемента даних", () => {
		render(
			<PieChartComponent data={pieData} nameKey="category" valueKey="value" />,
		);
		expect(screen.getByTestId("pie")).toHaveAttribute(
			"data-length",
			String(pieData.length),
		);
	});
});
