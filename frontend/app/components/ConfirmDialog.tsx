import React from "react";

type Props = {
	title?: string;
	message: string;
	onConfirm: () => void;
	onClose: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
	title = "Xác nhận",
	message,
	onConfirm,
	onClose,
}) => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="bg-white rounded-2xl shadow-xl p-6 z-10 w-full max-w-md">
				<h3 className="font-black text-lg text-slate-800">{title}</h3>
				<p className="text-slate-500 mt-2">{message}</p>
				<div className="mt-6 flex justify-end gap-3">
					<button
						className="px-4 py-2 rounded-xl bg-slate-100"
						onClick={onClose}
					>
						Hủy
					</button>
					<button
						className="px-4 py-2 rounded-xl bg-red-500 text-white"
						onClick={onConfirm}
					>
						Xóa
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDialog;
