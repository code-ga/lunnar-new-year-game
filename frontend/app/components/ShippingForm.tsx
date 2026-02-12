import React, { useState } from "react";

export interface ShippingValues {
	fullName: string;
	phone: string;
	address: string;
	note: string;
}

type Props = {
	initialValues?: Partial<ShippingValues>;
	onSave: (values: ShippingValues) => void;
	onCancel: () => void;
	saveLabel?: string;
	loading?: boolean;
};

const ShippingForm: React.FC<Props> = ({
	initialValues,
	onSave,
	onCancel,
	saveLabel = "Xác nhận",
	loading = false,
}) => {
	const [values, setValues] = useState<ShippingValues>({
		fullName: initialValues?.fullName || "",
		phone: initialValues?.phone || "",
		address: initialValues?.address || "",
		note: initialValues?.note || "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(values);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
					Họ và tên người nhận
				</label>
				<input
					type="text"
					value={values.fullName}
					onChange={(e) =>
						setValues({ ...values, fullName: e.target.value })
					}
					className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm font-medium"
					placeholder="Nguyễn Văn A"
					required
				/>
			</div>
			<div>
				<label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
					Số điện thoại
				</label>
				<input
					type="tel"
					value={values.phone}
					onChange={(e) =>
						setValues({ ...values, phone: e.target.value })
					}
					className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm font-medium"
					placeholder="0901234567"
					required
				/>
			</div>
			<div>
				<label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
					Địa chỉ nhận hàng
				</label>
				<textarea
					value={values.address}
					onChange={(e) =>
						setValues({ ...values, address: e.target.value })
					}
					className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm font-medium resize-none"
					rows={2}
					placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
					required
				/>
			</div>
			<div>
				<label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
					Ghi chú <span className="text-slate-300 normal-case">(tùy chọn)</span>
				</label>
				<input
					type="text"
					value={values.note}
					onChange={(e) =>
						setValues({ ...values, note: e.target.value })
					}
					className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-sm font-medium"
					placeholder="Giao giờ hành chính, gọi trước khi giao..."
				/>
			</div>
			<div className="flex gap-3 pt-2">
				<button
					type="button"
					onClick={onCancel}
					disabled={loading}
					className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
				>
					Hủy
				</button>
				<button
					type="submit"
					disabled={loading}
					className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
				>
					{loading ? "Đang xử lý..." : saveLabel}
				</button>
			</div>
		</form>
	);
};

export default ShippingForm;
