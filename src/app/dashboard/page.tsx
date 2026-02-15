"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
	LineChartComponent,
	BarChartComponent,
	PieChartComponent,
} from "@/components/Charts";
import { ArrowUpRight, DollarSign, ShoppingBag, Users } from "lucide-react";

export default function Dashboard() {
	const [metrics, setMetrics] = useState<any>(null);
	const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [mRes, rRes] = await Promise.all([
					api.get("/dashboard/metrics"),
					api.get("/reports/aggregate?dimension1=month&dimension2=year"),
				]);
				setMetrics(mRes.data);

				const chartData = rRes.data.map((item: any) => ({
					name: `${item.d1} ${item.d2}`,
					value: item.value,
				}));
				setRevenueByMonth(chartData);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

			{/* Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<MetricCard
					title="Total Revenue"
					value={`$${metrics?.total_revenue?.toFixed(2)}`}
					icon={DollarSign}
				/>
				<MetricCard
					title="Total Sales"
					value={metrics?.count_sales}
					icon={ShoppingBag}
				/>
				<MetricCard
					title="Avg Check"
					value={`$${metrics?.avg_check?.toFixed(2)}`}
					icon={ArrowUpRight}
				/>
				<MetricCard
					title="Quantity Sold"
					value={metrics?.total_quantity}
					icon={Users}
				/>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
					<LineChartComponent data={revenueByMonth} xKey="name" yKey="value" />
				</div>
				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Revenue Bar</h2>
					<BarChartComponent data={revenueByMonth} xKey="name" yKey="value" />
				</div>
			</div>
		</div>
	);
}

const MetricCard = ({ title, value, icon: Icon }: any) => (
	<div className="bg-white p-6 rounded-lg shadow flex items-center">
		<div className="p-3 bg-blue-100 rounded-full mr-4">
			<Icon className="w-6 h-6 text-blue-600" />
		</div>
		<div>
			<p className="text-sm text-gray-500">{title}</p>
			<p className="text-2xl font-bold text-gray-800">{value}</p>
		</div>
	</div>
);
