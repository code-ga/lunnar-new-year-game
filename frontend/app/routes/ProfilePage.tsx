import React, { useState } from "react";
import {
	User,
	LogOut,
	Cloud,
	Info,
	CheckCircle2,
	Coins,
	Calendar,
	MapPin,
	Edit2,
	Plus,
	Trash2,
	Star,
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { Link } from "react-router";
import { authClient } from "../lib/auth";
import ShippingForm, { type ShippingValues } from "../components/ShippingForm";
import { fetchApi, type SchemaType } from "../lib/api";

const ProfileView: React.FC = () => {
	const { user, shippingInfos, fetchUserData } = useGameStore();
	const [editingId, setEditingId] = useState<number | "new" | null>(null);
	const [shippingLoading, setShippingLoading] = useState(false);

	const handleLogout = async () => {
		await authClient.signOut();
	};

	const handleSaveShipping = async (values: ShippingValues) => {
		if (!user) return;
		setShippingLoading(true);
		try {
			if (editingId === "new") {
				await fetchApi("/api/shipping-info", {
					method: "POST",
					body: values,
					credentials: "include",
				});
			} else if (typeof editingId === "number") {
				await fetchApi(`/api/shipping-info/:id`, {
					method: "PUT",
					params: { id: editingId.toString() },
					body: values,
					credentials: "include",
				});
			}
			await fetchUserData();
			setEditingId(null);
		} catch (e) {
			alert("Lỗi khi lưu thông tin giao hàng");
		} finally {
			setShippingLoading(false);
		}
	};

	const handleDeleteShipping = async (id: number) => {
		if (!confirm("Xóa địa chỉ này?")) return;
		try {
			await fetchApi(`/api/shipping-info/:id`, {
				method: "DELETE",
				params: { id: id.toString() },
				credentials: "include",
			});
			await fetchUserData();
		} catch (e) {
			alert("Lỗi khi xóa địa chỉ");
		}
	};

	const handleSetDefault = async (id: number) => {
		if (!user) return;
		try {
			await fetchApi("/api/profile", {
				method: "PUT",
				body: {
					username: user.username,
					defaultShippingInfoId: id,
				},
				credentials: "include",
			});
			await fetchUserData();
		} catch (e) {
			alert("Lỗi khi đặt địa chỉ mặc định");
		}
	};

	if (!user) {
		return (
			<div className="p-6 h-full flex flex-col items-center justify-center max-w-md mx-auto">
				<div className="text-center space-y-4">
					<div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
						<User size={40} className="text-slate-300" />
					</div>
					<h2 className="text-xl font-bold">Chưa Đăng Nhập</h2>
					<Link
						className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold"
						to="/login"
					>
						ĐẾN TRANG ĐĂNG NHẬP
					</Link>
				</div>
			</div>
		);
	}

	const editingInfo = typeof editingId === "number"
		? shippingInfos.find((s) => s.id === editingId)
		: undefined;

	return (
		<div className="p-6 h-full flex flex-col items-center justify-center max-w-md mx-auto">
			<div className="w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative">
				<div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-10 opacity-60"></div>

				<div className="text-center mb-10">
					<div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-green-50">
						<CheckCircle2 size={48} />
					</div>
					<h2 className="text-3xl font-black text-slate-800 tracking-tight">
						{user.username}
					</h2>
					<p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">
						Tài khoản đã xác thực
					</p>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl border border-yellow-100 shadow-sm transition-transform hover:scale-[1.02]">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-yellow-400 rounded-xl text-white shadow-lg shadow-yellow-200">
								<Coins size={20} />
							</div>
							<div>
								<p className="text-[10px] uppercase font-black text-yellow-600 tracking-tight">
									Số dư hiện tại
								</p>
								<p className="text-lg font-black text-slate-800">
									{user.coins.toLocaleString()} Xu
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm transition-transform hover:scale-[1.02]">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-200">
								<Calendar size={20} />
							</div>
							<div>
								<p className="text-[10px] uppercase font-black text-indigo-600 tracking-tight">
									Lần cuối điểm danh
								</p>
								<p className="text-sm font-bold text-slate-700">
									{user.lastCheckIn
										? new Date(user.lastCheckIn).toLocaleDateString("vi-VN")
										: "Chưa điểm danh"}
								</p>
							</div>
						</div>
					</div>

					{/* Shipping Info Section */}
					<div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200">
									<MapPin size={20} />
								</div>
								<p className="text-[10px] uppercase font-black text-emerald-600 tracking-tight">
									Địa chỉ giao hàng
								</p>
							</div>
							{editingId === null && (
								<button
									type="button"
									onClick={() => setEditingId("new")}
									className="p-1.5 text-emerald-500 hover:bg-emerald-100 rounded-lg transition"
								>
									<Plus size={14} />
								</button>
							)}
						</div>

						{editingId !== null ? (
							<ShippingForm
								initialValues={
									editingInfo
										? {
												fullName: editingInfo.fullName,
												phone: editingInfo.phone,
												address: editingInfo.address,
												note: editingInfo.note || "",
										  }
										: undefined
								}
								onSave={handleSaveShipping}
								onCancel={() => setEditingId(null)}
								saveLabel={editingId === "new" ? "Thêm địa chỉ" : "Cập nhật"}
								loading={shippingLoading}
							/>
						) : shippingInfos.length > 0 ? (
							<div className="space-y-3">
								{shippingInfos.map((info) => {
									const isDefault = user.defaultShippingInfoId === info.id;
									return (
										<div
											key={info.id}
											className={`p-3 rounded-xl border ${isDefault ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}
										>
											<div className="flex items-start justify-between">
												<div className="space-y-0.5 text-sm flex-1">
													<div className="flex items-center gap-2">
														<p className="font-bold text-slate-800">{info.fullName}</p>
														{isDefault && (
															<span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">
																Mặc định
															</span>
														)}
													</div>
													<p className="text-slate-600">{info.phone}</p>
													<p className="text-slate-500 text-xs">{info.address}</p>
													{info.note && (
														<p className="text-slate-400 italic text-xs">{info.note}</p>
													)}
												</div>
												<div className="flex items-center gap-1 shrink-0 ml-2">
													{!isDefault && (
														<button
															type="button"
															onClick={() => handleSetDefault(info.id)}
															className="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition"
															title="Đặt làm mặc định"
														>
															<Star size={12} />
														</button>
													)}
													<button
														type="button"
														onClick={() => setEditingId(info.id)}
														className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
													>
														<Edit2 size={12} />
													</button>
													<button
														type="button"
														onClick={() => handleDeleteShipping(info.id)}
														className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
													>
														<Trash2 size={12} />
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<p className="text-sm text-slate-400 italic">
								Chưa có địa chỉ giao hàng. Nhấn + để thêm.
							</p>
						)}
					</div>

					<div className="pt-6">
						<button
							onClick={handleLogout}
							type="button"
							className="w-full py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-3 group"
						>
							<LogOut
								size={18}
								className="group-hover:-translate-x-1 transition-transform"
							/>
							ĐĂNG XUẤT
						</button>
					</div>
				</div>

				<div className="mt-10 p-4 bg-blue-50/50 rounded-2xl flex items-start gap-3 border border-blue-50">
					<Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
					<p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide leading-relaxed">
						Dữ liệu của bạn hiện đã được bảo mật trong hệ thống database mới.
					</p>
				</div>
			</div>

			<div className="mt-8 flex items-center gap-2 text-slate-300">
				<Cloud size={14} />
				<span className="text-[10px] font-black uppercase tracking-widest">
					Database Sync Active
				</span>
			</div>
		</div>
	);
};

export default ProfileView;
