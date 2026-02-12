import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../constants";
import type { SchemaType } from "../lib/api";
import type { ItemGroup } from "../types";

// type Item = {
// 	id?: number;
// 	name: string;
// 	description?: string;
// 	image?: string;
// 	rarity?: string;
// 	isActive?: boolean;
// };

type Props = {
	item?: SchemaType["items"] | null;
	onClose: () => void;
	onSaved: () => void;
};

const RARITIES = ["E", "D", "C", "B", "A", "S", "SS", "SSS", "EX"];

const ItemForm: React.FC<Props> = ({ item, onClose, onSaved }) => {
	const [form, setForm] = useState<
		Pick<
			SchemaType["items"],
			| "name"
			| "description"
			| "image"
			| "rarity"
			| "groupId"
			| "quantity"
			| "manualChance"
			| "adminNote"
			| "isEx"
			| "isActive"
		>
	>({
		name: item?.name || "",
		description: item?.description || "",
		image: item?.image || "",
		rarity: item?.rarity || "E",
		groupId: item?.groupId || null,
		quantity: item?.quantity ?? -1,
		manualChance: item?.manualChance || null,
		adminNote: item?.adminNote || "",
		isEx: item?.isEx ?? false,
		isActive: item?.isActive ?? true,
	});
	const [groups, setGroups] = useState<ItemGroup[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tab, setTab] = useState<"general" | "advanced">("general");

	// Fetch groups on mount
	useEffect(() => {
		const fetchGroups = async () => {
			try {
				const res = await fetch(`${BACKEND_URL}/api/item-groups`, {
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					setGroups(data.data || []);
				}
			} catch (e) {
				console.error("Failed to fetch groups:", e);
			}
		};
		fetchGroups();
	}, []);

	const handleSave = async () => {
		if (!form.name.trim()) {
			setError("Tên là bắt buộc");
			return;
		}
		setSaving(true);
		try {
			const url = item?.id
				? `${BACKEND_URL}/api/items/${item.id}`
				: `${BACKEND_URL}/api/items`;
			const method = item?.id ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			onSaved();
			onClose();
		} catch (e) {
			console.error(e);
			setError("Lỗi khi lưu. Vui lòng thử lại.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="bg-white rounded-2xl shadow-xl p-6 z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<h3 className="font-black text-lg text-slate-800">
					{item ? "Sửa Vật Phẩm" : "Tạo Vật Phẩm Mới"}
				</h3>
				{/* Tabs */}
				<div className="mt-3 flex gap-2">
					<button
						type="button"
						onClick={() => setTab("general")}
						className={`px-3 py-1 rounded-full text-sm font-medium ${
							tab === "general"
								? "bg-indigo-600 text-white"
								: "bg-slate-100 text-slate-700"
						}`}
					>
						Chung
					</button>
					<button
						type="button"
						onClick={() => setTab("advanced")}
						className={`px-3 py-1 rounded-full text-sm font-medium ${
							tab === "advanced"
								? "bg-indigo-600 text-white"
								: "bg-slate-100 text-slate-700"
						}`}
					>
						Nâng cao
					</button>
				</div>

				<div className="mt-4">
					{tab === "general" && (
						<div className="grid grid-cols-1 gap-3">
							<label className="flex flex-col">
								<span className="text-sm font-bold">Tên</span>
								<input
									className="border p-2 rounded-md mt-1"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
								/>
							</label>
							<label className="flex flex-col">
								<span className="text-sm font-bold">Mô tả</span>
								<textarea
									className="border p-2 rounded-md mt-1"
									value={form.description || ""}
									onChange={(e) =>
										setForm({ ...form, description: e.target.value })
									}
								/>
							</label>
							<label className="flex flex-col">
								<span className="text-sm font-bold">Hình (emoji hoặc url)</span>
								<input
									className="border p-2 rounded-md mt-1"
									value={form.image || ""}
									onChange={(e) => setForm({ ...form, image: e.target.value })}
								/>
							</label>
							<label className="flex flex-col">
								<span className="text-sm font-bold">
									Rarity (Deprecated - use Group)
								</span>
								<select
									className="border p-2 rounded-md mt-1 opacity-50"
									value={form.rarity}
									onChange={(e) => setForm({ ...form, rarity: e.target.value })}
								>
									{RARITIES.map((r) => (
										<option key={r} value={r}>
											{r}
										</option>
									))}
								</select>
							</label>

							<label className="flex flex-col">
								<span className="text-sm font-bold">Nhóm</span>
								<select
									className="border p-2 rounded-md mt-1"
									value={form.groupId || ""}
									onChange={(e) =>
										setForm({
											...form,
											groupId: e.target.value ? Number(e.target.value) : null,
										})
									}
								>
									<option value="">-- Chọn nhóm --</option>
									{groups.map((g) => (
										<option key={g.id} value={g.id}>
											{g.name} ({(g.baseChance / 100).toFixed(2)}%)
										</option>
									))}
								</select>
							</label>

							<label className="flex items-center gap-3 mt-2">
								<input
									type="checkbox"
									checked={form.isEx}
									onChange={(e) => setForm({ ...form, isEx: e.target.checked })}
								/>
								<span className="text-sm font-bold">
									EX (có thể đổi gối thật)
								</span>
							</label>
							<label className="flex items-center gap-3 mt-2">
								<input
									type="checkbox"
									checked={form.isActive}
									onChange={(e) =>
										setForm({ ...form, isActive: e.target.checked })
									}
								/>
								<span className="text-sm">Kích hoạt</span>
							</label>
						</div>
					)}

					{tab === "advanced" && (
						<div className="grid grid-cols-1 gap-3">
							<label className="flex flex-col">
								<span className="text-sm font-bold">
									Số lượng (-1 = vô hạn)
								</span>
								<input
									type="number"
									className="border p-2 rounded-md mt-1"
									value={form.quantity ?? -1}
									onChange={(e) =>
										setForm({ ...form, quantity: Number(e.target.value) })
									}
									placeholder="-1"
								/>
							</label>

							{form.quantity === -1 && (
								<label className="flex flex-col">
									<span className="text-sm font-bold">
										Tỉ Lệ Thủ Công (%) - Chỉ cho vật phẩm vô hạn
									</span>
									<input
										type="number"
										className="border p-2 rounded-md mt-1"
										value={form.manualChance || ""}
										onChange={(e) =>
											setForm({
												...form,
												manualChance: e.target.value
													? Number(e.target.value)
													: null,
											})
										}
										placeholder="Basis points (1000 = 10%)"
									/>
								</label>
							)}

							<label className="flex flex-col">
								<span className="text-sm font-bold">Ghi chú Admin</span>
								<textarea
									className="border p-2 rounded-md mt-1"
									value={form.adminNote || ""}
									onChange={(e) =>
										setForm({ ...form, adminNote: e.target.value })
									}
									placeholder="Ghi chú về vấn đề hoặc thông tin đặc biệt..."
								/>
							</label>
						</div>
					)}

					{error && <div className="text-red-500 text-sm mt-2">{error}</div>}
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						className="px-4 py-2 rounded-xl bg-slate-100"
						onClick={onClose}
						disabled={saving}
					>
						Hủy
					</button>
					<button
						type="button"
						className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Đang lưu..." : "Lưu"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ItemForm;
