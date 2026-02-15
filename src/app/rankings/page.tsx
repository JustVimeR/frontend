"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Trophy } from "lucide-react";

export default function RankingsPage() {
	const [managers, setManagers] = useState([]);
	const [products, setProducts] = useState([]);
	const [regions, setRegions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [m, p, r] = await Promise.all([
					api.get("/rankings/manager"),
					api.get("/rankings/product"),
					api.get("/rankings/region"),
				]);
				setManagers(m.data);
				setProducts(p.data);
				setRegions(r.data);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold text-gray-800">Rankings</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<RankingCard
					title="Top Managers"
					data={managers}
					icon={Trophy}
					color="text-yellow-500"
				/>
				<RankingCard
					title="Top Products"
					data={products}
					icon={Trophy}
					color="text-blue-500"
				/>
				<RankingCard
					title="Top Regions"
					data={regions}
					icon={Trophy}
					color="text-purple-500"
				/>
			</div>
		</div>
	);
}

const RankingCard = ({ title, data, icon: Icon, color }: any) => (
	<div className="bg-white rounded-lg shadow overflow-hidden">
		<div className="p-4 border-b flex items-center">
			<Icon className={`w-5 h-5 mr-2 ${color}`} />
			<h2 className="text-lg font-semibold">{title}</h2>
		</div>
		<div className="p-4">
			<ul className="space-y-3">
				{data.map((item: any) => (
					<li key={item.name} className="flex justify-between items-center">
						<div className="flex items-center">
							<span
								className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold mr-3 ${item.rank === 1 ? "bg-yellow-100 text-yellow-700" : ""}`}
							>
								{item.rank}
							</span>
							<span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
								{item.name}
							</span>
						</div>
						<span className="text-sm font-bold text-gray-900">
							${item.revenue.toLocaleString()}
						</span>
					</li>
				))}
			</ul>
		</div>
	</div>
);
