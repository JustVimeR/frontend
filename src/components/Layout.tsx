"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	ShoppingCart,
	BarChart3,
	Medal,
	User,
	FileSpreadsheet,
} from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();

	const navItems = [
		{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
		{ name: "Sales", href: "/sales", icon: ShoppingCart },
		{ name: "Reports", href: "/reports/overview", icon: BarChart3 },
		{ name: "Rankings", href: "/rankings", icon: Medal },
		{ name: "Author", href: "/author", icon: User },
		{ name: "Upload", href: "/upload", icon: FileSpreadsheet },
	];

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<aside className="w-64 bg-white shadow-md">
				<div className="p-4 border-b">
					<h1 className="text-2xl font-bold text-gray-800">Sales Analytics</h1>
				</div>
				<nav className="mt-4">
					<ul>
						{navItems.map((item) => {
							const isActive = pathname.startsWith(item.href);
							return (
								<li key={item.name}>
									<Link
										href={item.href}
										className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 transition-colors ${
											isActive ? "bg-gray-200 border-r-4 border-blue-500" : ""
										}`}
									>
										<item.icon className="w-5 h-5 mr-3" />
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			<main className="flex-1 overflow-y-auto p-8">{children}</main>
		</div>
	);
};

export default Layout;
