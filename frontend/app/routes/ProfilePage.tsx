import React from "react";
import {
	User,
	LogOut,
	Cloud,
	Info,
	CheckCircle2,
	Coins,
	Calendar,
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { Link } from "react-router";

const ProfileView: React.FC = () => {
	const { user } = useGameStore();

	const handleLogout = () => {
		window.location.href = "/api/auth/sign-out"; // Better-auth endpoint
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
						// onClick={() => (window.location.href = "/login")}
						className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold"
						to="/login"
					>
						ĐẾN TRANG ĐĂNG NHẬP
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 h-full flex flex-col items-center justify-center max-w-md mx-auto">
			<div className="w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
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
