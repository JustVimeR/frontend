"use client";

import React from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const LineChartComponent = ({
	data,
	xKey,
	yKey,
}: {
	data: any[];
	xKey: string;
	yKey: string;
}) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<LineChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				<Legend />
				<Line
					type="monotone"
					dataKey={yKey}
					stroke="#8884d8"
					activeDot={{ r: 8 }}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

export const BarChartComponent = ({
	data,
	xKey,
	yKey,
}: {
	data: any[];
	xKey: string;
	yKey: string;
}) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<BarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				<Legend />
				<Bar dataKey={yKey} fill="#82ca9d" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export const PieChartComponent = ({
	data,
	nameKey,
	valueKey,
}: {
	data: any[];
	nameKey: string;
	valueKey: string;
}) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<PieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					labelLine={false}
					label={({ name, percent }) =>
						`${name} ${(percent * 100).toFixed(0)}%`
					}
					outerRadius={80}
					fill="#8884d8"
					dataKey={valueKey}
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<Tooltip />
			</PieChart>
		</ResponsiveContainer>
	);
};
