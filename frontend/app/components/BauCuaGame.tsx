import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { fetchApi } from "../lib/api";

const SYMBOLS = ["🦌", "🎃", "🐓", "🐟", "🦀", "🦐"];

const BauCuaGame: React.FC = () => {
	const { user, updateCoins } = useGameStore();
	const [bets, setBets] = useState<number[]>(new Array(6).fill(0));
	const [result, setResult] = useState<number[]>([0, 1, 2]);
	const [isRolling, setIsRolling] = useState(false);
	const [lastWin, setLastWin] = useState<number>(0);

	const totalBetSize = bets.reduce((a, b) => a + b, 0);

	const placeBet = (idx: number) => {
		const cost = 10;
		if (!user || (user.coins ?? 0) < totalBetSize + cost)
			return alert("Không đủ xu!");
		const newBets = [...bets];
		newBets[idx] += cost;
		setBets(newBets);
	};

	const clearBets = () => setBets(new Array(6).fill(0));

	const play = async () => {
		if (totalBetSize === 0) return;
		if (!user || (user.coins ?? 0) < totalBetSize) return;

		setIsRolling(true);
		try {
			const res = await fetchApi(`/api/game/play/probability`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: {
					gameId: "baucua",
					bets: bets,
				},
				credentials: "include",
			});

			if (res.data) {
				const data = res.data;
				setTimeout(() => {
					setResult(data.result.symbols);
					setIsRolling(false);
					setLastWin(data.winAmount);
					updateCoins(data.winAmount - totalBetSize);
					setBets(new Array(6).fill(0));
				}, 1200);
			} else {
				setIsRolling(false);
				alert("Lỗi hệ thống");
			}
		} catch (e) {
			setIsRolling(false);
			alert("Lỗi kết nối");
		}
	};

	return (
		<div className="flex flex-col items-center p-4 space-y-6">
			<div className="grid grid-cols-3 gap-3 w-full max-w-sm">
				{SYMBOLS.map((s, i) => (
					<button
						type="button"
						key={s}
						onClick={() => placeBet(i)}
						className="aspect-square bg-white border-4 border-slate-100 rounded-2xl flex flex-col items-center justify-center transition hover:border-indigo-200 active:scale-95 shadow-sm relative overflow-hidden group"
					>
						<span className="text-4xl group-hover:scale-110 transition-transform">
							{s}
						</span>
						{bets[i] > 0 && (
							<div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
								{bets[i]}
							</div>
						)}
					</button>
				))}
			</div>

			<div className="flex gap-4 bg-slate-100 p-4 rounded-3xl shadow-inner w-full max-w-xs justify-center">
				{result.map((r, i) => (
					<div
						key={i}
						className={`w-16 h-16 bg-white rounded-2xl shadow-lg border-2 border-indigo-50 flex items-center justify-center text-3xl ${isRolling ? "animate-bounce" : ""}`}
					>
						{SYMBOLS[r]}
					</div>
				))}
			</div>

			<div className="flex gap-3 w-full max-w-sm">
				<button
					type="button"
					onClick={clearBets}
					className="flex-1 py-3 bg-slate-200 text-slate-600 font-bold rounded-xl active:scale-95 transition-transform"
				>
					XÓA CƯỢC
				</button>
				<button
					type="button"
					onClick={play}
					disabled={isRolling || totalBetSize === 0}
					className="flex-3 py-3 px-8 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform disabled:opacity-50"
				>
					{isRolling ? "ĐANG LẮC..." : `VẬY LÀM (${totalBetSize} XU)`}
				</button>
			</div>

			{lastWin > 0 && (
				<div className="text-center animate-bounce">
					<div className="text-2xl font-black text-yellow-500">
						🎉 +{lastWin} XU 🎉
					</div>
				</div>
			)}
		</div>
	);
};

export default BauCuaGame;
