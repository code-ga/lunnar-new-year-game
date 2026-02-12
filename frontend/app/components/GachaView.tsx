import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { Gift, Sparkles } from "lucide-react";
import { GACHA_COST, RARITY_CONFIG } from "../constants";
// import type { InventoryItem } from "../types";
import { fetchApi, type SchemaType } from "../lib/api";

const GachaView: React.FC = () => {
	const { user, updateCoins, addInventoryItem } = useGameStore();
	const [pulling, setPulling] = useState(false);
	const [result, setResult] = useState<SchemaType["items"] | null>(null);

	const handlePull = async () => {
		if (!user || (user.coins ?? 0) < GACHA_COST) {
			alert("Bạn không đủ xu!");
			return;
		}

		setPulling(true);
		setResult(null);

		try {
			const response = await fetchApi(`/api/game/roll`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				// body: JSON.stringify({ userId: user.id }),
				credentials: "include",
			});
			if (response.data?.data) {
				const item = response.data.data;
				// Simulation delay for "wow" factor
				setTimeout(() => {
					setPulling(false);
					setResult(item.rolledItem);
					if (
						item.userItems &&
						item.userItems.length > 0 &&
						item.userItems[0]
					) {
						addInventoryItem(item.userItems[0]);
					}
					updateCoins(-GACHA_COST);
				}, 1200);
			} else {
				const err = response.data?.message || response.error?.message;
				alert(err || "Có lỗi xảy ra");
				setPulling(false);
			}
		} catch (e) {
			alert("Lỗi kết nối server");
			setPulling(false);
		}
	};

	if (result) {
		const config = RARITY_CONFIG[result.rarity as keyof typeof RARITY_CONFIG];
		const isEx = result.rarity === "EX";

		return (
			<div className="flex flex-col items-center justify-center min-h-full p-6 animate-pop-in">
				<div className="mb-8 relative w-48 h-72">
					<div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse"></div>

					<div
						className={`relative w-full h-full rounded-2xl shadow-2xl border-4 ${config.border} flex flex-col items-center justify-between p-4 bg-white overflow-hidden`}
					>
						<div
							className={`absolute inset-0 ${config.color} opacity-20 ${isEx ? "ex-gradient animate-spin-slow" : ""}`}
						></div>
						<div className="z-10 font-bold text-center w-full text-slate-700 text-lg px-1 leading-tight">
							{result.name}
						</div>
						<div
							className={`z-10 w-24 h-24 rounded-full shadow-inner ${config.color} flex items-center justify-center text-white font-black text-3xl ${isEx ? "ex-gradient" : ""}`}
						>
							{result.image?.startsWith("http") ? (
								<img
									src={result.image}
									alt={result.name}
									className="w-24 h-24 object-cover rounded-full"
								/>
							) : typeof result.image === "string" ? (
								<div className="text-5xl">{result.image}</div>
							) : (
								result.name
							)}
						</div>
						<div className="z-10 w-full flex flex-col items-center">
							<span
								className={`px-4 py-1.5 rounded-full text-white font-bold text-sm ${config.color} ${isEx ? "ex-gradient" : ""}`}
							>
								{result.rarity} Rank
							</span>
							{/* <span className="text-xs text-slate-400 mt-2 font-mono">
								#ID:{result.uniqueId}
							</span> */}
						</div>
						<div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-20 animate-pulse">
							MỚI
						</div>
					</div>
				</div>

				<h2 className="text-3xl font-black text-indigo-900 mb-2">
					{result.name}
				</h2>

				{isEx && (
					<div className="bg-black/90 text-white px-4 py-2 rounded-xl text-xs max-w-xs text-center mb-6 border border-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.5)]">
						<Sparkles className="inline w-4 h-4 mr-1 text-yellow-400" />
						VẬT PHẨM VŨ TRỤ: Siêu hiếm!
					</div>
				)}

				<button
					onClick={() => setResult(null)}
					type="button"
					className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl hover:bg-indigo-700 active:scale-95 transition-transform"
				>
					Tiếp Tục
				</button>
			</div>
		);
	}

	const currentCoins = user?.coins ?? 0;

	return (
		<div className="flex flex-col items-center justify-center min-h-full space-y-8 p-4">
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-black text-indigo-800">Túi Mù Gối Ôm</h2>
				<p className="text-indigo-600 font-medium">
					Lấy ngay một gối ôm ngẫu nhiên chỉ với {GACHA_COST} Xu
				</p>
			</div>

			<div className="relative group">
				<div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
				<button
					onClick={handlePull}
					type="button"
					disabled={pulling || currentCoins < GACHA_COST}
					className={`relative w-56 h-72 bg-white rounded-2xl shadow-2xl border-4 border-indigo-100 flex flex-col items-center justify-center transform transition hover:scale-105 active:scale-95 
            ${pulling ? "animate-bounce-crazy" : ""} 
            ${currentCoins < GACHA_COST ? "opacity-80 grayscale cursor-not-allowed" : ""}
          `}
				>
					<div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
						<Gift size={64} className="text-indigo-600" />
					</div>
					<span className="text-indigo-900 font-black text-2xl tracking-tighter">
						{pulling ? "ĐANG MỞ..." : "MỞ NGAY"}
					</span>
					<div className="mt-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
						Mystery Box
					</div>
				</button>
			</div>

			<div className="bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-indigo-50 flex items-center gap-2">
				<Sparkles size={16} className="text-indigo-400" />
				<span className="text-slate-500 text-sm font-medium">
					{/* Hệ thống gacha công bằng - Tỉ lệ EX 0.1% */}
					Bạn có {currentCoins.toLocaleString()} Xu
				</span>
			</div>
		</div>
	);
};

export default GachaView;
