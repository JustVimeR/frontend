"use client";

import React from "react";

export default function AuthorPage() {
	return (
		<div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center mt-10">
			<div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
				<span className="text-4xl">👨‍💻</span>
			</div>
			<h1 className="text-3xl font-bold text-gray-800 mb-2">
				Developed by Taran Vladyslav
			</h1>
			<p className="text-gray-600 mb-6">Senior Full-Stack Developer</p>

			<div className="text-left bg-gray-50 p-6 rounded-lg">
				<h3 className="font-semibold mb-2">
					Project: Sales Analytics System (OLAP)
				</h3>
				<p className="text-sm text-gray-600 mb-4">
					Built with Python (FastAPI, SQLAlchemy) and Next.js (TypeScript,
					TailwindCSS). Implements a Star Schema Data Warehouse with automated
					ETL and interactive analytics.
				</p>
				<div className="flex gap-2">
					<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
						FastAPI
					</span>
					<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
						Next.js 14
					</span>
					<span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
						PostgreSQL
					</span>
					<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
						TailwindCSS
					</span>
				</div>
			</div>
		</div>
	);
}
