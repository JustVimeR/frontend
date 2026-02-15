"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
	LineChartComponent,
	BarChartComponent,
	PieChartComponent,
} from "@/components/Charts";

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

	useEffect(() => {
		if (!config) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await api.get("/reports/aggregate", {
					params: { dimension1: config.dim1, dimension2: config.dim2 },
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
		};

		fetchData();
	}, [slug]);

	if (!config) return <div>Report not found</div>;
	if (loading) return <div>Loading report data...</div>;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
			<p className="text-gray-600">{config.desc}</p>

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
							{data.map((row: any, idx) => (
								<tr key={idx}>
									<td className="px-4 py-2 text-sm text-gray-900">{row.d1}</td>
									<td className="px-4 py-2 text-sm text-gray-500">{row.d2}</td>
									<td className="px-4 py-2 text-sm text-gray-900 text-right">
										${row.value.toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
