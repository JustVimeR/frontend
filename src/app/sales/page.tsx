"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Sale {
	id: number;
	sale_id: number;
	date: string;
	product_id: number;
	manager_id: number;
	region_id: number;
	quantity: number;
	unit_price: number;
	discount: number;
	revenue: number;
	payment_type: string;
	sales_channel: string;
	supplier_id: number;
}

export default function SalesPage() {
	const [sales, setSales] = useState<Sale[]>([]);
	const [dims, setDims] = useState<any>({
		products: [],
		managers: [],
		regions: [],
		suppliers: [],
	});
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingSale, setEditingSale] = useState<Sale | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const pageSize = 10;

	const { register, handleSubmit, reset, setValue } = useForm();

	const fetchSales = async () => {
		setLoading(true);
		try {
			const skip = (page - 1) * pageSize;
			const res = await api.get(`/sales?skip=${skip}&limit=${pageSize}`);
			setSales(res.data);

			// Fetch count
			const countRes = await api.get("/sales/count");
			setTotalPages(Math.ceil(countRes.data.count / pageSize));
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const fetchDims = async () => {
		try {
			const [p, m, r, s] = await Promise.all([
				api.get("/dims/product"),
				api.get("/dims/manager"),
				api.get("/dims/region"),
				api.get("/dims/supplier"),
			]);
			setDims({
				products: p.data,
				managers: m.data,
				regions: r.data,
				suppliers: s.data,
			});
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		fetchSales();
	}, [page]);

	useEffect(() => {
		fetchDims();
	}, []);

	const onSubmit = async (data: any) => {
		try {
			const payload = {
				...data,
				date: data.date,
				quantity: parseInt(data.quantity),
				unit_price: parseFloat(data.unit_price),
				discount: parseFloat(data.discount),
				product_id: parseInt(data.product_id),
				manager_id: parseInt(data.manager_id),
				region_id: parseInt(data.region_id),
				supplier_id: parseInt(data.supplier_id),
			};

			if (editingSale) {
				await api.put(`/sales/${editingSale.id}`, payload);
			} else {
				await api.post("/sales", payload);
			}
			setModalOpen(false);
			reset();
			setEditingSale(null);
			fetchSales();
		} catch (e) {
			console.error("Failed to save sale", e);
			alert("Failed to save. Check console.");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure?")) return;
		try {
			await api.delete(`/sales/${id}`);
			fetchSales();
		} catch (e) {
			console.error(e);
		}
	};

	const openEdit = (sale: Sale) => {
		setEditingSale(sale);
		setValue("date", sale.date);
		setValue("product_id", sale.product_id);
		setValue("manager_id", sale.manager_id);
		setValue("region_id", sale.region_id);
		setValue("supplier_id", sale.supplier_id);
		setValue("quantity", sale.quantity);
		setValue("unit_price", sale.unit_price);
		setValue("discount", sale.discount);
		setValue("payment_type", sale.payment_type);
		setValue("sales_channel", sale.sales_channel);
		setModalOpen(true);
	};

	const openAdd = () => {
		setEditingSale(null);
		reset();
		setModalOpen(true);
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
				<button
					onClick={openAdd}
					className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Sale
				</button>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Date
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Product
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Manager
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Qty
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Revenue
							</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{sales.map((sale) => (
							<tr key={sale.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{sale.date}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{dims.products.find((p: any) => p.id === sale.product_id)
										?.name || sale.product_id}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{dims.managers.find((m: any) => m.id === sale.manager_id)
										?.name || sale.manager_id}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{sale.quantity}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									${sale.revenue}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={() => openEdit(sale)}
										className="text-indigo-600 hover:text-indigo-900 mr-4"
									>
										<Edit className="w-4 h-4" />
									</button>
									<button
										onClick={() => handleDelete(sale.id)}
										className="text-red-600 hover:text-red-900"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			<div className="mt-4 flex justify-between items-center">
				<button
					disabled={page === 1}
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					className={`px-4 py-2 border rounded ${page === 1 ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
				>
					Previous
				</button>
				<span className="text-gray-600">
					Page {page} of {totalPages}
				</span>
				<button
					disabled={page >= totalPages}
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					className={`px-4 py-2 border rounded ${page >= totalPages ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
				>
					Next
				</button>
			</div>

			{modalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold">
								{editingSale ? "Edit Sale" : "New Sale"}
							</h2>
							<button onClick={() => setModalOpen(false)}>
								<X className="w-6 h-6 border rounded" />
							</button>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Date
									</label>
									<input
										type="date"
										{...register("date")}
										required
										className="mt-1 block w-full border rounded p-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Product
									</label>
									<select
										{...register("product_id")}
										required
										className="mt-1 block w-full border rounded p-2"
									>
										<option value="">Select Product...</option>
										{dims.products.map((p: any) => (
											<option key={p.id} value={p.id}>
												{p.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Manager
									</label>
									<select
										{...register("manager_id")}
										required
										className="mt-1 block w-full border rounded p-2"
									>
										<option value="">Select Manager...</option>
										{dims.managers.map((m: any) => (
											<option key={m.id} value={m.id}>
												{m.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Region
									</label>
									<select
										{...register("region_id")}
										required
										className="mt-1 block w-full border rounded p-2"
									>
										<option value="">Select Region...</option>
										{dims.regions.map((r: any) => (
											<option key={r.id} value={r.id}>
												{r.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Supplier
									</label>
									<select
										{...register("supplier_id")}
										required
										className="mt-1 block w-full border rounded p-2"
									>
										<option value="">Select Supplier...</option>
										{dims.suppliers.map((s: any) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Quantity
									</label>
									<input
										type="number"
										{...register("quantity")}
										required
										className="mt-1 block w-full border rounded p-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Unit Price
									</label>
									<input
										type="number"
										step="0.01"
										{...register("unit_price")}
										required
										className="mt-1 block w-full border rounded p-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Discount
									</label>
									<input
										type="number"
										step="0.01"
										{...register("discount")}
										defaultValue={0}
										className="mt-1 block w-full border rounded p-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Payment
									</label>
									<select
										{...register("payment_type")}
										className="mt-1 block w-full border rounded p-2"
									>
										<option value="cash">Cash</option>
										<option value="card">Card</option>
										<option value="online">Online</option>
										<option value="invoice">Invoice</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Channel
									</label>
									<select
										{...register("sales_channel")}
										className="mt-1 block w-full border rounded p-2"
									>
										<option value="store">Store</option>
										<option value="online_store">Online Store</option>
										<option value="marketplace">Marketplace</option>
										<option value="wholesale">Wholesale</option>
										<option value="phone_order">Phone Order</option>
									</select>
								</div>
							</div>

							<div className="flex justify-end pt-4">
								<button
									type="button"
									onClick={() => setModalOpen(false)}
									className="mr-2 px-4 py-2 border rounded text-gray-600"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
								>
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
