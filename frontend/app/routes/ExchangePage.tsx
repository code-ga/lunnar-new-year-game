import React, { useEffect, useState } from "react";
import { Gift, AlertCircle, CheckCircle2 } from "lucide-react";
// import type { InventoryItem } from "../types";
import { useGameStore } from "../store/useGameStore";
import type { SchemaType } from "../lib/api";

const ExchangeView: React.FC = () => {
	const { addInventoryItem, templates, fetchTemplates } = useGameStore();
	const [code, setCode] = useState("");
	const [status, setStatus] = useState<{
		type: "success" | "error";
		msg: string;
	} | null>(null);

	useEffect(() => {
		if (templates.length === 0) {
			fetchTemplates();
		}
	}, [templates, fetchTemplates]);

	const handleImport = () => {
		const inputCode = code.trim().toUpperCase();
		if (!inputCode.startsWith("PIL-")) {
			setStatus({ type: "error", msg: "Mã code phải bắt đầu bằng PIL-" });
			return;
		}
		const parts = inputCode.split("-");
		if (parts.length < 4) {
			setStatus({ type: "error", msg: "Mã code không đúng định dạng." });
			return;
		}

		const templateId = parseInt(parts[1]);
		const template = templates.find((t) => t.id === templateId);

		if (template) {
			const newItem: SchemaType["userItems"] = {
				...template,
				uniqueId: Math.random().toString(36).substring(2, 9).toUpperCase(),
				obtainedAt: Date.now(),
			};
			addInventoryItem(newItem);
			setStatus({
				type: "success",
				msg: `Thành công! Bạn nhận được: ${template.name}`,
			});
			setCode("");
		} else {
			setStatus({ type: "error", msg: "Vật phẩm không tồn tại." });
		}
	};

	return (
		<div className="p-6 h-full flex flex-col items-center">
			<div className="text-center mb-10">
				<h2 className="text-3xl font-black text-slate-800 tracking-tight">
					Nhập Mã Quà Tặng
				</h2>
				<p className="text-slate-500 font-medium">
					Nhập Pillow Code để nhận thêm gối mới vào túi đồ.
				</p>
			</div>

			<div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
				<div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3 group">
					<Gift size={40} />
				</div>

				<div className="space-y-2">
					{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
						Vui lòng nhập code
					</label>
					<input
						type="text"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder="Ví dụ: PIL-1-E-XXXXXX"
						className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-mono font-bold text-center tracking-widest text-indigo-900"
					/>
				</div>

				<button
					type="button"
					onClick={handleImport}
					className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-transform uppercase tracking-widest"
				>
					NHẬN VẬT PHẨM
				</button>

				{status && (
					<div
						className={`p-4 rounded-2xl flex items-start gap-3 animate-pop-in ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}
					>
						{status.type === "success" ? (
							<CheckCircle2 size={18} className="shrink-0 mt-0.5" />
						) : (
							<AlertCircle size={18} className="shrink-0 mt-0.5" />
						)}
						<p className="text-sm font-bold leading-tight">{status.msg}</p>
					</div>
				)}
			</div>

			<div className="mt-12 p-6 bg-slate-100 rounded-3xl border border-slate-200 w-full max-w-md">
				<h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
					Thông tin mã code
				</h4>
				<ul className="text-xs text-slate-600 space-y-2 font-medium">
					<li>• Mã code có thể được nhận khi bạn "Đốt" gối ôm trong túi đồ.</li>
					<li>• Mỗi mã code có chứa thông tin về loại gối và độ hiếm.</li>
					<li>• Sau khi nhập, ID gối sẽ được tạo mới hoàn toàn.</li>
				</ul>
			</div>
		</div>
	);
};

export default ExchangeView;
