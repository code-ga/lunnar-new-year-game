import React, { useState } from "react";
import { BACKEND_URL } from "../constants";
import type { SchemaType } from "../lib/api";

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
			"name" | "description" | "image" | "rarity" | "isActive"
		>
	>({
		name: item?.name || "",
		description: item?.description || "",
		image: item?.image || "",
		rarity: item?.rarity || "E",
		isActive: item?.isActive ?? true,
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			<div className="bg-white rounded-2xl shadow-xl p-6 z-10 w-full max-w-lg">
				<h3 className="font-black text-lg text-slate-800">
					{item ? "Sửa Vật Phẩm" : "Tạo Vật Phẩm Mới"}
				</h3>
				<div className="mt-4 grid grid-cols-1 gap-3">
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
						<span className="text-sm font-bold">Rarity</span>
						<select
							className="border p-2 rounded-md mt-1"
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
					<label className="flex items-center gap-3 mt-2">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
						/>
						<span className="text-sm">Kích hoạt</span>
					</label>
					{error && <div className="text-red-500 text-sm">{error}</div>}
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
