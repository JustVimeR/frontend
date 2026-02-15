"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import {
	Upload,
	FileSpreadsheet,
	CheckCircle,
	AlertCircle,
} from "lucide-react";

export default function UploadPage() {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [status, setStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({ type: null, message: "" });

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setStatus({ type: null, message: "" });
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		setUploading(true);
		setStatus({ type: null, message: "" });

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await api.post("/upload/sales", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			setStatus({
				type: "success",
				message: `Successfully processed ${res.data.rows_inserted} new records (from ${res.data.rows_processed} total).`,
			});
			setFile(null);
		} catch (e: any) {
			console.error(e);
			setStatus({
				type: "error",
				message:
					e.response?.data?.detail ||
					"Failed to upload file. Please check format.",
			});
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-800 mb-6">
				Upload Sales Data
			</h1>

			<div className="bg-white rounded-lg shadow-md p-8">
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
					<div className="flex flex-col items-center">
						<FileSpreadsheet className="w-16 h-16 text-green-600 mb-4" />
						<p className="text-gray-600 mb-2">
							Select an Excel file (.xlsx) containing sales data.
						</p>
						<input
							type="file"
							accept=".xlsx, .xls"
							onChange={handleFileChange}
							className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                mt-4
                            "
						/>
					</div>
				</div>

				{file && (
					<div className="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded">
						<div className="flex items-center">
							<FileSpreadsheet className="w-5 h-5 text-gray-500 mr-2" />
							<span className="text-gray-700 font-medium">{file.name}</span>
							<span className="text-gray-400 text-sm ml-2">
								({(file.size / 1024).toFixed(1)} KB)
							</span>
						</div>
						<button
							onClick={handleUpload}
							disabled={uploading}
							className={`px-4 py-2 rounded flex items-center ${
								uploading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700 text-white"
							}`}
						>
							{uploading ? (
								<>Loading...</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Upload
								</>
							)}
						</button>
					</div>
				)}

				{status.type && (
					<div
						className={`mt-6 p-4 rounded flex items-start ${
							status.type === "success"
								? "bg-green-50 text-green-800"
								: "bg-red-50 text-red-800"
						}`}
					>
						{status.type === "success" ? (
							<CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
						) : (
							<AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
						)}
						<div>
							<h3 className="font-bold">
								{status.type === "success" ? "Success" : "Error"}
							</h3>
							<p className="text-sm">{status.message}</p>
						</div>
					</div>
				)}
			</div>

			<div className="mt-8">
				<h3 className="text-lg font-semibold mb-2">Expected Columns</h3>
				<ul className="list-disc list-inside text-gray-600 space-y-1">
					<li>
						<code>sale_id</code> (Unique ID)
					</li>
					<li>
						<code>sale_datetime</code> (Date/Time)
					</li>
					<li>
						<code>region_name</code>, <code>city</code>
					</li>
					<li>
						<code>manager</code>
					</li>
					<li>
						<code>product_id</code>, <code>product_name</code>,{" "}
						<code>brand</code>, <code>category</code>
					</li>
					<li>
						<code>supplier_name</code>, <code>supplier_country</code>
					</li>
					<li>
						<code>quantity</code>, <code>unit_price</code>,{" "}
						<code>discount</code>
					</li>
					<li>
						<code>payment_type</code>, <code>sales_channel</code>
					</li>
				</ul>
			</div>
		</div>
	);
}
