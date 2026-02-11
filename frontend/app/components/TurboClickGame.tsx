import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { Car, Timer, MousePointer2 } from "lucide-react";
import { BACKEND_URL } from "../constants";
import { fetchApi } from "../lib/api";

const TurboClickGame: React.FC = () => {
	const { updateCoins, fetchUserData } = useGameStore();
	const [clicks, setClicks] = useState(0);
	const [timer, setTimer] = useState(10);
	const [gameState, setGameState] = useState<
		"idle" | "playing" | "result" | "loading"
	>("idle");
	const socketRef = useRef<WebSocket | null>(null);
	const intervalRef = useRef<any>(null);

	const startRace = async () => {
		setGameState("loading");
		const res = await fetchApi(`/api/game/play/turbo-click/ws`, {
			method: "POST",
			credentials: "include",
		});
		if (!res.data) {
			setGameState("idle");
			return alert("Lỗi khởi tạo game!");
		}
		const data = res.data;
		const token = data.token;
		// Use wss:// if https, else ws://
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${BACKEND_URL.replace(/^https?:\/\//, "")}/api/game/ws/turbo-click/${token}`;

		const socket = new WebSocket(wsUrl, []);
		socketRef.current = socket;

		socket.onopen = () => {
			setClicks(0);
			setTimer(10);
			setGameState("playing");

			intervalRef.current = setInterval(() => {
				setTimer((prev) => {
					if (prev <= 1) {
						clearInterval(intervalRef.current);
						socket.close(); // Closing triggers reward calculation on server
						setGameState("result");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "update") {
				setClicks(data.score);
				setTimer(data.timeleft); // Sync timer with server
			} else if (data.type === "end") {
				setClicks(data.score);
				setGameState("result");
				fetchUserData(); // Refresh user data to get updated coins
			}
		};

		socket.onerror = (error) => {
			console.error("WS Error:", error);
			setGameState("idle");
			alert("Lỗi kết nối game!");
		};

		socket.onclose = () => {
			console.log("WS Closed");
		};
	};

	useEffect(() => {
		// Update local coins when result is reached
		if (gameState === "result") {
			const reward = Math.floor(clicks / 5);
			if (reward > 0) {
				updateCoins(reward);
			}
		}
		return () => {
			// if (socketRef.current) socketRef.current.close();
			clearInterval(intervalRef.current);
		};
	}, [gameState, clicks, updateCoins]);

	const handleClick = () => {
		if (
			gameState === "playing" &&
			socketRef.current?.readyState === WebSocket.OPEN
		) {
			socketRef.current.send(JSON.stringify({ type: "click" }));
		}
	};

	return (
		<div className="flex flex-col items-center justify-center p-6 space-y-8 h-full min-h-[400px]">
			{gameState === "idle" || gameState === "loading" ? (
				<div className="text-center space-y-6">
					<div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto ring-4 ring-orange-50 animate-pulse">
						<Car size={48} className="text-orange-600" />
					</div>
					<div>
						<h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
							Turbo Click (Live)
						</h3>
						<p className="text-slate-500 font-medium">
							Click nhanh để nhận xu! <br /> Dữ liệu được tính toán thời gian
							thực.
						</p>
					</div>
					<button
						type="button"
						onClick={startRace}
						disabled={gameState === "loading"}
						className="px-12 py-4 bg-orange-500 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-orange-600 active:scale-95 transition-all w-full"
					>
						{gameState === "loading" ? "ĐANG TẢI..." : "BẮT ĐẦU ĐUA"}
					</button>
				</div>
			) : gameState === "playing" ? (
				<div className="w-full max-w-sm space-y-10 text-center">
					<div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
						<div className="flex items-center gap-2 text-orange-600 font-black text-xl">
							<Timer size={24} /> {timer}s
						</div>
						<div className="text-slate-400 font-bold uppercase text-xs tracking-widest">
							ĐANG ĐUA!
						</div>
						<div className="text-2xl font-black text-slate-800">{clicks}</div>
					</div>

					<button
						type="button"
						onMouseDown={handleClick}
						className="w-48 h-48 bg-white border-8 border-orange-500 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer select-none"
					>
						<MousePointer2
							size={64}
							className="text-orange-500 fill-orange-500"
						/>
					</button>

					<p className="text-orange-400 font-bold animate-pulse">
						CLICK CLICK CLICK!
					</p>
				</div>
			) : (
				<div className="text-center space-y-6 animate-pop-in">
					<div className="text-6xl font-black text-orange-500">{clicks}</div>
					<div className="text-slate-500 font-bold">Lượt click của bạn!</div>
					<div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-xl font-bold">
						Nhận được: {Math.floor(clicks / 5)} Xu
					</div>
					<button
						type="button"
						onClick={() => setGameState("idle")}
						className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl active:scale-95 transition-all"
					>
						VỀ TRANG CHỦ
					</button>
				</div>
			)}
		</div>
	);
};

export default TurboClickGame;
