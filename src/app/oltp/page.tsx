"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import {
	Plus,
	Edit,
	Trash2,
	X,
	ArrowRightCircle,
	CheckSquare,
} from "lucide-react";

interface OltpSale {
	id: number;
	sale_id: number;
	sale_datetime: string;
	region_name: string;
	city: string;
	manager: string;
	product_id: number;
	product_name: string;
	brand: string;
	category: string;
	supplier_name: string;
	supplier_country: string;
	quantity: number;
	unit_price: number;
	discount: number;
	revenue: number;
	payment_type: string;
	sales_channel: string;
	transferred: number;
}

interface DimItem {
	id: number;
	name: string;
}

export default function OltpPage() {
	const [sales, setSales] = useState<OltpSale[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingSale, setEditingSale] = useState<OltpSale | null>(null);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [transferring, setTransferring] = useState(false);
	const [dims, setDims] = useState<{
		products: DimItem[];
		managers: DimItem[];
		regions: DimItem[];
		suppliers: DimItem[];
	}>({
		products: [],
		managers: [],
		regions: [],
		suppliers: [],
	});
	const pageSize = 15;

	const { register, handleSubmit, reset, setValue } = useForm();

	const fetchSales = useCallback(async () => {
		setLoading(true);
		try {
			const skip = (page - 1) * pageSize;
			const [res, countRes] = await Promise.all([
				api.get(`/oltp/sales?skip=${skip}&limit=${pageSize}`),
				api.get("/oltp/sales/count"),
			]);
			setSales(res.data);
			setTotalPages(Math.max(1, Math.ceil(countRes.data.count / pageSize)));
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [page]);

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
	}, [fetchSales]);

	useEffect(() => {
		fetchDims();
	}, []);

	const onSubmit = async (data: Record<string, string>) => {
		try {
			const payload = {
				sale_datetime: data.sale_datetime,
				region_name: data.region_name,
				city: data.city,
				manager: data.manager,
				product_name: data.product_name,
				brand: data.brand || null,
				category: data.category,
				supplier_name: data.supplier_name,
				supplier_country: data.supplier_country || null,
				quantity: parseInt(data.quantity),
				unit_price: parseFloat(data.unit_price),
				discount: parseFloat(data.discount || "0"),
				revenue: data.revenue ? parseFloat(data.revenue) : null,
				payment_type: data.payment_type,
				sales_channel: data.sales_channel,
			};

			if (editingSale) {
				await api.put(`/oltp/sales/${editingSale.id}`, payload);
			} else {
				await api.post("/oltp/sales", payload);
			}
			setModalOpen(false);
			reset();
			setEditingSale(null);
			fetchSales();
		} catch (e) {
			console.error("Failed to save", e);
			alert("Failed to save. Check console.");
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Delete this record?")) return;
		try {
			await api.delete(`/oltp/sales/${id}`);
			setSelected((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
			fetchSales();
		} catch (e) {
			console.error(e);
		}
	};

	const openEdit = (sale: OltpSale) => {
		setEditingSale(sale);
		const fields = [
			"sale_datetime",
			"region_name",
			"city",
			"manager",
			"product_id",
			"product_name",
			"brand",
			"category",
			"supplier_name",
			"supplier_country",
			"quantity",
			"unit_price",
			"discount",
			"revenue",
			"payment_type",
			"sales_channel",
		];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fields.forEach((f) => setValue(f, (sale as any)[f]));
		setModalOpen(true);
	};

	const openAdd = () => {
		setEditingSale(null);
		reset();
		setModalOpen(true);
	};

	const toggleSelect = (id: number) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleSelectAll = () => {
		const untransferred = sales.filter((s) => s.transferred === 0);
		if (untransferred.every((s) => selected.has(s.id))) {
			setSelected((prev) => {
				const next = new Set(prev);
				untransferred.forEach((s) => next.delete(s.id));
				return next;
			});
		} else {
			setSelected((prev) => {
				const next = new Set(prev);
				untransferred.forEach((s) => next.add(s.id));
				return next;
			});
		}
	};

	const handleTransfer = async () => {
		if (selected.size === 0) {
			alert("Select records to transfer.");
			return;
		}
		if (!confirm(`Transfer ${selected.size} record(s) to the warehouse?`))
			return;
		setTransferring(true);
		try {
			const res = await api.post("/oltp/transfer", {
				ids: Array.from(selected),
			});
			alert(
				`Transferred! ${res.data.rows_inserted} new records added to warehouse.`,
			);
			setSelected(new Set());
			fetchSales();
		} catch (e) {
			console.error(e);
			alert("Transfer failed. Check console.");
		} finally {
			setTransferring(false);
		}
	};

	const handleTransferAll = async () => {
		const untransferred = sales.filter((s) => s.transferred === 0);
		if (untransferred.length === 0) {
			alert("No untransferred records on this page.");
			return;
		}
		const ids = untransferred.map((s) => s.id);
		if (
			!confirm(`Transfer all ${ids.length} untransferred records on this page?`)
		)
			return;
		setTransferring(true);
		try {
			const res = await api.post("/oltp/transfer", { ids });
			alert(
				`Transferred! ${res.data.rows_inserted} new records added to warehouse.`,
			);
			setSelected(new Set());
			fetchSales();
		} catch (e) {
			console.error(e);
			alert("Transfer failed.");
		} finally {
			setTransferring(false);
		}
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">
						OLTP — Operational Data
					</h1>
					<p className="text-gray-500 text-sm mt-1">
						Raw sales data. Select records and transfer them to the analytics
						warehouse.
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleTransferAll}
						disabled={transferring}
						className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700 disabled:opacity-50"
					>
						<ArrowRightCircle className="w-4 h-4 mr-2" />
						Transfer All
					</button>
					<button
						onClick={handleTransfer}
						disabled={transferring || selected.size === 0}
						className="bg-purple-600 text-white px-4 py-2 rounded flex items-center hover:bg-purple-700 disabled:opacity-50"
					>
						<CheckSquare className="w-4 h-4 mr-2" />
						Transfer Selected ({selected.size})
					</button>
					<button
						onClick={openAdd}
						className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Record
					</button>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-3 py-3 text-left">
								<input
									type="checkbox"
									onChange={toggleSelectAll}
									checked={
										sales.filter((s) => s.transferred === 0).length > 0 &&
										sales
											.filter((s) => s.transferred === 0)
											.every((s) => selected.has(s.id))
									}
								/>
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Sale ID
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Date
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Product
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Manager
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Region
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Qty
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Revenue
							</th>
							<th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Status
							</th>
							<th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{loading ? (
							<tr>
								<td
									colSpan={10}
									className="px-6 py-8 text-center text-gray-400"
								>
									Loading...
								</td>
							</tr>
						) : sales.length === 0 ? (
							<tr>
								<td
									colSpan={10}
									className="px-6 py-8 text-center text-gray-400"
								>
									No records. Click &quot;Add Record&quot; to create one.
								</td>
							</tr>
						) : (
							sales.map((sale) => (
								<tr
									key={sale.id}
									className={
										sale.transferred
											? "bg-gray-50 text-gray-400"
											: selected.has(sale.id)
												? "bg-purple-50"
												: ""
									}
								>
									<td className="px-3 py-3">
										{sale.transferred === 0 && (
											<input
												type="checkbox"
												checked={selected.has(sale.id)}
												onChange={() => toggleSelect(sale.id)}
											/>
										)}
									</td>
									<td className="px-3 py-3">{sale.sale_id}</td>
									<td className="px-3 py-3">{sale.sale_datetime}</td>
									<td className="px-3 py-3">{sale.product_name}</td>
									<td className="px-3 py-3">{sale.manager}</td>
									<td className="px-3 py-3">
										{sale.region_name} — {sale.city}
									</td>
									<td className="px-3 py-3">{sale.quantity}</td>
									<td className="px-3 py-3">${sale.revenue ?? "—"}</td>
									<td className="px-3 py-3">
										{sale.transferred ? (
											<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
												Transferred
											</span>
										) : (
											<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
												Pending
											</span>
										)}
									</td>
									<td className="px-3 py-3 text-right">
										{sale.transferred === 0 && (
											<button
												onClick={() => openEdit(sale)}
												className="text-indigo-600 hover:text-indigo-900 mr-3"
											>
												<Edit className="w-4 h-4 inline" />
											</button>
										)}
										<button
											onClick={() => handleDelete(sale.id)}
											className="text-red-600 hover:text-red-900"
										>
											<Trash2 className="w-4 h-4 inline" />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="mt-4 flex justify-between items-center">
				<button
					disabled={page === 1}
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					className={`px-4 py-2 border rounded ${
						page === 1
							? "bg-gray-100 text-gray-400"
							: "bg-white hover:bg-gray-50"
					}`}
				>
					Previous
				</button>
				<span className="text-gray-600">
					Page {page} of {totalPages}
				</span>
				<button
					disabled={page >= totalPages}
					onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					className={`px-4 py-2 border rounded ${
						page >= totalPages
							? "bg-gray-100 text-gray-400"
							: "bg-white hover:bg-gray-50"
					}`}
				>
					Next
				</button>
			</div>

			{/* Modal */}
			{modalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-bold">
								{editingSale ? "Edit Record" : "New Record"}
							</h2>
							<button onClick={() => setModalOpen(false)}>
								<X className="w-6 h-6 border rounded" />
							</button>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								{/* Date/Time */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Date / Time
									</label>
									<input
										type="datetime-local"
										{...register("sale_datetime")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									/>
								</div>

								{/* Manager - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Manager
									</label>
									<select
										{...register("manager")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select Manager...</option>
										{dims.managers.map((m) => (
											<option key={m.id} value={m.name}>
												{m.name}
											</option>
										))}
									</select>
								</div>

								{/* Region - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Region
									</label>
									<select
										{...register("region_name")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select Region...</option>
										{dims.regions.map((r) => (
											<option key={r.id} value={r.name.split(" - ")[0]}>
												{r.name}
											</option>
										))}
									</select>
								</div>

								{/* City - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										City
									</label>
									<select
										{...register("city")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select City...</option>
										{[
											"Dnipro",
											"Ivano-Frankivsk",
											"Kharkiv",
											"Kyiv",
											"Lviv",
											"Odesa",
											"Poltava",
											"Ternopil",
											"Vinnytsia",
											"Zaporizhzhia",
										].map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								{/* Product Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Product Name
									</label>
									<input
										type="text"
										{...register("product_name")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									/>
								</div>

								{/* Brand - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Brand
									</label>
									<select
										{...register("brand")}
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select Brand...</option>
										{[
											"Acer",
											"Apple",
											"Asus",
											"Bosch",
											"Canon",
											"Dell",
											"Google",
											"HP",
											"Huawei",
											"Lenovo",
											"LG",
											"Microsoft",
											"Nikon",
											"OnePlus",
											"Panasonic",
											"Philips",
											"Samsung",
											"Seagate",
											"Sony",
											"Xiaomi",
										].map((b) => (
											<option key={b} value={b}>
												{b}
											</option>
										))}
									</select>
								</div>

								{/* Category - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Category
									</label>
									<select
										{...register("category")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select Category...</option>
										{[
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
										].map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								{/* Supplier - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Supplier
									</label>
									<select
										{...register("supplier_name")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select Supplier...</option>
										{dims.suppliers.map((s) => (
											<option key={s.id} value={s.name}>
												{s.name}
											</option>
										))}
									</select>
								</div>

								{/* Supplier Country - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Supplier Country
									</label>
									<select
										{...register("supplier_country")}
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select Country...</option>
										{[
											"China",
											"Germany",
											"Poland",
											"Romania",
											"Sweden",
											"Ukraine",
											"USA",
										].map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								{/* Quantity */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Quantity
									</label>
									<input
										type="number"
										{...register("quantity")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									/>
								</div>

								{/* Unit Price */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Unit Price
									</label>
									<input
										type="number"
										step="0.01"
										{...register("unit_price")}
										required
										className="mt-1 block w-full border rounded p-2 text-sm"
									/>
								</div>

								{/* Discount */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Discount
									</label>
									<input
										type="number"
										step="0.01"
										{...register("discount")}
										defaultValue={0}
										className="mt-1 block w-full border rounded p-2 text-sm"
									/>
								</div>

								{/* Payment Type - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Payment Type
									</label>
									<select
										{...register("payment_type")}
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select...</option>
										<option value="Cash">Cash</option>
										<option value="Card">Card</option>
										<option value="Online">Online</option>
										<option value="Installments">Installments</option>
									</select>
								</div>

								{/* Sales Channel - dropdown */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Sales Channel
									</label>
									<select
										{...register("sales_channel")}
										className="mt-1 block w-full border rounded p-2 text-sm"
									>
										<option value="">Select...</option>
										<option value="Website">Website</option>
										<option value="Store">Store</option>
										<option value="Mobile App">Mobile App</option>
										<option value="Marketplace">Marketplace</option>
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
