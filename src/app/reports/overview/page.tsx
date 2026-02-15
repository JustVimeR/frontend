import Link from "next/link";
import { FileBarChart } from "lucide-react";

const REPORTS = [
	{ slug: "region-period-category", name: "Region × Period × Category" },
	{ slug: "manager-month-region", name: "Manager × Month × Region" },
	{ slug: "category-quarter-supplier", name: "Category × Quarter × Supplier" },
	{ slug: "product-region-month", name: "Product × Region × Month" },
	{ slug: "supplier-category-year", name: "Supplier × Category × Year" },
];

export default function ReportsIndex() {
	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold text-gray-800">Reports Overview</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{REPORTS.map((report) => (
					<Link key={report.slug} href={`/reports/${report.slug}`}>
						<div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-center">
							<div className="p-3 bg-indigo-100 rounded-full mr-4">
								<FileBarChart className="w-6 h-6 text-indigo-600" />
							</div>
							<span className="font-semibold text-gray-700">{report.name}</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
