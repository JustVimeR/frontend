"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
	LineChartComponent,
	BarChartComponent,
	PieChartComponent,
} from "@/components/Charts";
import { Filter, RotateCcw } from "lucide-react";

interface DimItem {
	id: number;
	name: string;
}

const REPORTS_CONFIG: any = {
	"region-period-category": {
		title: "Region × Period × Category",
		dim1: "region",
		dim2: "month",
		chartType: "line",
		desc: "Sales performance by region over time.",
	},
	"manager-month-region": {
		title: "Manager × Month × Region",
		dim1: "manager",
		dim2: "month",
		chartType: "bar",
		desc: "Manager performance analysis.",
	},
	"category-quarter-supplier": {
		title: "Category × Quarter × Supplier",
		dim1: "category",
		dim2: "quarter",
		chartType: "bar",
		desc: "Category trends by quarter.",
	},
	"product-region-month": {
		title: "Product × Region × Month",
		dim1: "product",
		dim2: "region",
		chartType: "line",
		desc: "Product distribution across regions.",
	},
	"supplier-category-year": {
		title: "Supplier × Category × Year",
		dim1: "supplier",
		dim2: "category",
		chartType: "pie",
		desc: "Supplier category breakdown.",
	},
};

export default function ReportPage() {
	const params = useParams();
	const slug = params.slug as string;
	const config = REPORTS_CONFIG[slug];

	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filtersOpen, setFiltersOpen] = useState(false);

	// Dims for dropdowns
	const [dims, setDims] = useState<{
		regions: DimItem[];
		managers: DimItem[];
		suppliers: DimItem[];
		products: DimItem[];
		categories: string[];
	}>({
		regions: [],
		managers: [],
		suppliers: [],
		products: [],
		categories: [
			"Accessories",
			"Cameras",
			"Gaming",
			"Headphones",
			"Home Appliances",
			"Kitchen",
			"Laptops",
			"Monitors",
			"Networking",
			"Printers",
			"Smartphones",
			"Smartwatches",
			"Storage",
			"TV",
			"Wearables",
		],
	});

	// Filter state
	const [filters, setFilters] = useState({
		region: "",
		manager: "",
		category: "",
		supplier: "",
		product: "",
		date_from: "",
		date_to: "",
	});

	useEffect(() => {
		const fetchDims = async () => {
			try {
				const [r, m, s, p] = await Promise.all([
					api.get("/dims/region"),
					api.get("/dims/manager"),
					api.get("/dims/supplier"),
					api.get("/dims/product"),
				]);
				setDims((prev) => ({
					...prev,
					regions: r.data,
					managers: m.data,
					suppliers: s.data,
					products: p.data,
				}));
			} catch (e) {
				console.error(e);
			}
		};
		fetchDims();
	}, []);

	const fetchData = useCallback(async () => {
		if (!config) return;
		setLoading(true);
		try {
			const queryParams: any = {
				dimension1: config.dim1,
				dimension2: config.dim2,
			};

			// Append active filters
			if (filters.region) queryParams.region = filters.region;
			if (filters.manager) queryParams.manager = filters.manager;
			if (filters.category) queryParams.category = filters.category;
			if (filters.supplier) queryParams.supplier = filters.supplier;
			if (filters.product) queryParams.product = filters.product;
			if (filters.date_from) queryParams.date_from = filters.date_from;
			if (filters.date_to) queryParams.date_to = filters.date_to;

			const res = await api.get("/reports/aggregate", {
				params: queryParams,
			});

			const chartData = res.data.map((item: any) => ({
				name: `${item.d1} - ${item.d2}`,
				value: item.value,
				d1: item.d1,
				d2: item.d2,
			}));

			setData(chartData);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [slug, filters]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const resetFilters = () => {
		setFilters({
			region: "",
			manager: "",
			category: "",
			supplier: "",
			product: "",
			date_from: "",
			date_to: "",
		});
	};

	const activeFilterCount = Object.values(filters).filter(Boolean).length;

	if (!config) return <div>Report not found</div>;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
					<p className="text-gray-600">{config.desc}</p>
				</div>
				<div className="flex gap-2">
					{activeFilterCount > 0 && (
						<button
							onClick={resetFilters}
							className="flex items-center px-3 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50"
						>
							<RotateCcw className="w-4 h-4 mr-1" />
							Reset
						</button>
					)}
					<button
						onClick={() => setFiltersOpen(!filtersOpen)}
						className={`flex items-center px-4 py-2 text-sm rounded-lg border ${
							filtersOpen || activeFilterCount > 0
								? "bg-indigo-50 border-indigo-300 text-indigo-700"
								: "bg-white text-gray-600 hover:bg-gray-50"
						}`}
					>
						<Filter className="w-4 h-4 mr-2" />
						Filters
						{activeFilterCount > 0 && (
							<span className="ml-2 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
								{activeFilterCount}
							</span>
						)}
					</button>
				</div>
			</div>

			{/* Filters panel */}
			{filtersOpen && (
				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
						{/* Region */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Region
							</label>
							<select
								value={filters.region}
								onChange={(e) =>
									setFilters((f) => ({ ...f, region: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							>
								<option value="">All</option>
								{dims.regions.map((r) => (
									<option key={r.id} value={r.name.split(" - ")[0]}>
										{r.name}
									</option>
								))}
							</select>
						</div>

						{/* Manager */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Manager
							</label>
							<select
								value={filters.manager}
								onChange={(e) =>
									setFilters((f) => ({ ...f, manager: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							>
								<option value="">All</option>
								{dims.managers.map((m) => (
									<option key={m.id} value={m.name}>
										{m.name}
									</option>
								))}
							</select>
						</div>

						{/* Category */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Category
							</label>
							<select
								value={filters.category}
								onChange={(e) =>
									setFilters((f) => ({ ...f, category: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							>
								<option value="">All</option>
								{dims.categories.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>

						{/* Supplier */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Supplier
							</label>
							<select
								value={filters.supplier}
								onChange={(e) =>
									setFilters((f) => ({ ...f, supplier: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							>
								<option value="">All</option>
								{dims.suppliers.map((s) => (
									<option key={s.id} value={s.name}>
										{s.name}
									</option>
								))}
							</select>
						</div>

						{/* Product */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Product
							</label>
							<select
								value={filters.product}
								onChange={(e) =>
									setFilters((f) => ({ ...f, product: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							>
								<option value="">All</option>
								{dims.products.map((p) => (
									<option key={p.id} value={p.name}>
										{p.name}
									</option>
								))}
							</select>
						</div>

						{/* Date From */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Date From
							</label>
							<input
								type="date"
								value={filters.date_from}
								onChange={(e) =>
									setFilters((f) => ({ ...f, date_from: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							/>
						</div>

						{/* Date To */}
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">
								Date To
							</label>
							<input
								type="date"
								value={filters.date_to}
								onChange={(e) =>
									setFilters((f) => ({ ...f, date_to: e.target.value }))
								}
								className="w-full border rounded p-1.5 text-sm"
							/>
						</div>
					</div>
				</div>
			)}

			{loading ? (
				<div className="text-center py-12 text-gray-400">
					Loading report data...
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="font-semibold mb-4">Trend (Line)</h3>
						<LineChartComponent data={data} xKey="name" yKey="value" />
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="font-semibold mb-4">Comparison (Bar)</h3>
						<BarChartComponent data={data} xKey="name" yKey="value" />
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="font-semibold mb-4">Structure (Pie)</h3>
						<PieChartComponent data={data} nameKey="name" valueKey="value" />
					</div>
					<div className="bg-white p-6 rounded-lg shadow max-h-96 overflow-y-auto">
						<h3 className="font-semibold mb-4">Data Table</h3>
						<table className="min-w-full divide-y divide-gray-200">
							<thead>
								<tr>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
										{config.dim1}
									</th>
									<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
										{config.dim2}
									</th>
									<th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
										Value
									</th>
								</tr>
							</thead>
							<tbody>
								{data.map((row: any, idx: number) => (
									<tr key={idx}>
										<td className="px-4 py-2 text-sm text-gray-900">
											{row.d1}
										</td>
										<td className="px-4 py-2 text-sm text-gray-500">
											{row.d2}
										</td>
										<td className="px-4 py-2 text-sm text-gray-900 text-right">
											${row.value.toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
