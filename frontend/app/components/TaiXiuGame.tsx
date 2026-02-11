import React, { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { BACKEND_URL } from "../constants";

const TaiXiuGame: React.FC = () => {
	const { user, updateCoins } = useGameStore();
	const [betAmount, setBetAmount] = useState<number>(100);
	const [choice, setChoice] = useState<"TAI" | "XIU" | null>(null);
	const [isRolling, setIsRolling] = useState(false);
	const [dice, setDice] = useState([1, 1, 1]);
	const [message, setMessage] = useState("Đặt cửa và xúc xắc!");

	const roll = async () => {
		if (!choice) return alert("Vui lòng chọn Tài hoặc Xỉu");
		if (!user || (user.coins ?? 0) < betAmount) return alert("Không đủ xu!");

		setIsRolling(true);
		setMessage("Đang lắc hũ...");

		try {
			const res = await fetch(`${BACKEND_URL}/api/game/play/probability`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameId: "taixiu",
					bets: choice === "XIU" ? [betAmount, 0] : [0, betAmount],
				}),
				credentials: "include",
			});

			if (res.ok) {
				const data = await res.json();
				setTimeout(() => {
					setDice(data.result.dice);
					setIsRolling(false);
					const win = data.winAmount > 0;
					updateCoins(data.winAmount - betAmount);
					setMessage(
						win
							? `🎉 BẠN THẮNG ${data.winAmount} XU!`
							: "😢 Chúc bạn may mắn lần sau",
					);
				}, 1000);
			} else {
				setIsRolling(false);
				setMessage("Lỗi hệ thống");
			}
		} catch (e) {
			setIsRolling(false);
			setMessage("Lỗi kết nối");
		}
	};

	return (
		<div className="flex flex-col items-center p-6 space-y-8 animate-in zoom-in duration-300">
			<div className="flex bg-slate-200 p-1 rounded-2xl w-full max-w-xs shadow-inner">
				<button
					type="button"
					onClick={() => setChoice("XIU")}
					className={`flex-1 py-4 rounded-xl font-black text-xl transition-all ${choice === "XIU" ? "bg-white text-indigo-600 shadow-md scale-105" : "text-slate-500"}`}
				>
					XIU (3-10)
				</button>
				<button
					type="button"
					onClick={() => setChoice("TAI")}
					className={`flex-1 py-4 rounded-xl font-black text-xl transition-all ${choice === "TAI" ? "bg-white text-red-600 shadow-md scale-105" : "text-slate-500"}`}
				>
					TAI (11-18)
				</button>
			</div>

			<div className="flex gap-4">
				{dice.map((d, i) => (
					<div
						key={i}
						className={`w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-black border-4 border-slate-100 ${isRolling ? "animate-bounce" : ""}`}
					>
						{d}
					</div>
				))}
			</div>

			<div className="text-center">
				<div className="text-2xl font-black text-indigo-900 mb-2">
					{message}
				</div>
				<div className="flex items-center justify-center gap-4 mt-6">
					{[10, 50, 100, 500].map((amt) => (
						<button
							type="button"
							key={amt}
							onClick={() => setBetAmount(amt)}
							className={`px-4 py-2 rounded-lg font-bold transition-all ${betAmount === amt ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-500"}`}
						>
							{amt}
						</button>
					))}
				</div>
			</div>

			<button
				type="button"
				onClick={roll}
				disabled={isRolling}
				className="w-full max-w-xs py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-2xl rounded-2xl shadow-2xl transition hover:opacity-90 active:scale-95 disabled:opacity-50"
			>
				{isRolling ? "ĐANG LẮC..." : "LẮC XÚC XẮC"}
			</button>
		</div>
	);
};

export default TaiXiuGame;
