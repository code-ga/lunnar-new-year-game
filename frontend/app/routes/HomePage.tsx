import React from "react";
import GachaView from "../components/GachaView";
import { useGameStore } from "../store/useGameStore";
import { Calendar, Sparkles, Package, Cloud } from "lucide-react";
import type { Route } from "./+types/HomePage";
import { fetchApi } from "../lib/api";
import { RARITY_CONFIG } from "../constants";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Thế Giới Gacha Gối Ôm" },
		{
			name: "description",
			content:
				"Một ứng dụng gacha gối ôm đầy màu sắc với hệ thống vật phẩm hiếm, mini-games kiếm xu và tính năng trao đổi mã vật phẩm.",
		},
	];
}

const HomePage: React.FC = () => {
	const { user, fetchUserData, templates, fetchTemplates } = useGameStore();
	const [featuredItems, setFeaturedItems] = React.useState<typeof templates>(
		[],
	);

	React.useEffect(() => {
		if (templates.length === 0) {
			fetchTemplates();
		}
	}, [templates, fetchTemplates]);

	React.useEffect(() => {
		// Show featured items: prioritize high rarity items
		if (templates.length > 0) {
			const highRarity = templates.filter((t) =>
				["A", "S", "SS", "SSS", "EX"].includes(t.rarity),
			);
			const others = templates.filter(
				(t) => !["A", "S", "SS", "SSS", "EX"].includes(t.rarity),
			);

			// Take up to 8 high rarity + 4 others, shuffled, max 10 total
			const featured = [
				...highRarity.slice(0, 8),
				...others.slice(0, 4),
			]
				.sort(() => Math.random() - 0.5)
				.slice(0, 10);

			setFeaturedItems(featured);
		}
	}, [templates]);

	const handleCheckIn = async () => {
		const res = await fetchApi(`/api/game/check-in`, {
			method: "POST",
			credentials: "include",
		});
		if (res.data?.success) {
			await fetchUserData();
			alert("Điểm danh thành công!");
		}
	};

	return (
		<div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
			<section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden group">
				<div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="text-center md:text-left">
						<h2 className="text-3xl font-black">
							Xin chào, {user?.username || "Bạn"}! 👋
						</h2>
						<p className="mt-2 text-indigo-100 font-medium">
							Hôm nay bạn muốn thử vận may hay khoe tài năng?
						</p>
					</div>
					<button
						onClick={handleCheckIn}
						disabled={
							!!user?.lastCheckIn &&
							new Date(user.lastCheckIn).toDateString() ===
								new Date().toDateString()
						}
						type="button"
						className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
					>
						<Calendar size={20} />
						{user?.lastCheckIn &&
						new Date(user.lastCheckIn).toDateString() ===
							new Date().toDateString()
							? "Đã điểm danh"
							: "Điểm danh nhận quà"}
					</button>
				</div>
				<Cloud className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
			</section>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
					<h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
						<Sparkles className="text-yellow-500 fill-yellow-500" /> Gacha Gối
						Ôm
					</h3>
					<GachaView />
				</div>
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
							<Package className="text-emerald-500 fill-emerald-500" /> Danh Mục
							Vật Phẩm
						</h3>
						<Link
							to="/collection?tab=catalog"
							className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
						>
							Xem tất cả →
						</Link>
					</div>

					{featuredItems.length === 0 ? (
						<div className="text-center py-12 text-slate-400">
							<p className="font-medium">Đang tải danh mục...</p>
						</div>
					) : (
						<div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
							{featuredItems.map((item) => {
								const config =
									RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG] ||
									RARITY_CONFIG["E"];
								const isEx = item.rarity === "EX";

								return (
									<Link
										key={item.id}
										to="/collection?tab=catalog"
										className="group cursor-pointer transform transition hover:scale-105 active:scale-95"
									>
										<div
											className={`relative w-full aspect-square rounded-2xl bg-white border ${config.border} flex items-center justify-center shadow-sm overflow-hidden`}
										>
											<div
												className={`absolute inset-0 ${config.color} opacity-10 ${isEx ? "ex-gradient opacity-20" : ""}`}
											></div>
											<span className="text-3xl z-10">{item.image || "🧸"}</span>
											<div
												className={`absolute bottom-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded ${config.color} text-white`}
											>
												{item.rarity}
											</div>
										</div>
										<span className="text-[10px] font-bold text-center mt-1.5 leading-tight text-slate-700 block truncate">
											{item.name}
										</span>
									</Link>
								);
							})}
						</div>
					)}

					<div className="mt-6 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2">
						<Package size={16} className="text-emerald-500 shrink-0 mt-0.5" />
						<p className="text-emerald-900 text-xs font-medium leading-relaxed">
							Khám phá <span className="font-bold">{templates.length} vật phẩm</span>{" "}
							với các độ hiếm khác nhau. Quay gacha để sưu tập!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
