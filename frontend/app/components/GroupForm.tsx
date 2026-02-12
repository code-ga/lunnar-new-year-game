import React, { useState } from "react";
import { BACKEND_URL } from "../constants";
import type { ItemGroup } from "../types";

type Props = {
	group?: ItemGroup | null;
	onClose: () => void;
	onSaved: () => void;
};

const GroupForm: React.FC<Props> = ({ group, onClose, onSaved }) => {
	const [form, setForm] = useState<
		Pick<ItemGroup, "name" | "baseChance" | "isEx" | "isActive">
	>({
		name: group?.name || "",
		baseChance: group?.baseChance || 1000, // Default 10%
		isEx: group?.isEx ?? false,
		isActive: group?.isActive ?? true,
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		if (!form.name.trim()) {
			setError("Tên nhóm là bắt buộc");
			return;
		}
		if (form.baseChance < 0) {
			setError("Tỉ lệ không hợp lệ");
			return;
		}
		setSaving(true);
		try {
			const url = group?.id
				? `${BACKEND_URL}/api/item-groups/${group.id}`
				: `${BACKEND_URL}/api/item-groups`;
			const method = group?.id ? "PUT" : "POST";
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
					{group ? "Sửa Nhóm" : "Tạo Nhóm Mới"}
				</h3>
				<div className="mt-4 grid grid-cols-1 gap-3">
					<label className="flex flex-col">
						<span className="text-sm font-bold">Tên Nhóm</span>
						<input
							className="border p-2 rounded-md mt-1"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							placeholder="VD: Rare (A)"
						/>
					</label>

					<label className="flex flex-col">
						<span className="text-sm font-bold">
							Tỉ Lệ Cơ Bản (%)
							<span className="text-xs text-gray-500 ml-2">
								({(form.baseChance / 100).toFixed(2)}%)
							</span>
						</span>
						<input
							type="number"
							className="border p-2 rounded-md mt-1"
							value={form.baseChance}
							onChange={(e) =>
								setForm({ ...form, baseChance: Number(e.target.value) })
							}
							placeholder="1000 = 10%"
							step="10"
						/>
						<span className="text-xs text-gray-500 mt-1">
							Lưu ý: Nhập basis points (100 = 1%, 1000 = 10%)
						</span>
					</label>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={form.isEx}
							onChange={(e) => setForm({ ...form, isEx: e.target.checked })}
						/>
						<span className="text-sm font-bold">
							Nhóm EX (có thể đổi gối thật)
						</span>
					</label>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
						/>
						<span className="text-sm font-bold">Kích hoạt</span>
					</label>
				</div>

				{error && (
					<div className="mt-3 p-2 bg-red-100 text-red-700 rounded text-sm">
						{error}
					</div>
				)}

				<div className="mt-6 flex gap-2">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold"
					>
						Hủy
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={saving}
						className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50"
					>
						{saving ? "Đang lưu..." : "Lưu"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default GroupForm;
