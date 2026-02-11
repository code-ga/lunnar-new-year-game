import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { Ghost, Trophy } from "lucide-react";
import { BACKEND_URL } from "../constants";

const FlappyGame: React.FC = () => {
	const { updateCoins } = useGameStore();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [gameState, setGameState] = useState<
		"idle" | "playing" | "result" | "loading"
	>("idle");
	const [score, setScore] = useState(0);
	const [sessionId, setSessionId] = useState<string | null>(null);

	const bird = useRef({ y: 150, velocity: 0 });
	const pipes = useRef<any[]>([]);
	const frameRef = useRef(0);
	const animRef = useRef<number>();

	const gravity = 0.25;
	const jump = -4.5;

	const startGame = async () => {
		setGameState("loading");
		try {
			const res = await fetch(`${BACKEND_URL}/api/game/play/skill/start`, {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				setSessionId(data.sessionId);
				setScore(0);
				setGameState("playing");
				setIsPlaying(true);
				resetGame();
			}
		} catch (e) {
			setGameState("idle");
			alert("Lỗi khởi tạo game");
		}
	};

	const resetGame = () => {
		bird.current = { y: 150, velocity: 0 };
		pipes.current = [];
		frameRef.current = 0;
	};

	const finishGame = async (finalScore: number) => {
		setIsPlaying(false);
		setGameState("result");
		if (!sessionId) return;
		try {
			const res = await fetch(`${BACKEND_URL}/api/game/play/skill/end`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId, score: finalScore }),
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				updateCoins(data.reward);
			}
		} catch (e) {
			console.error("Reward claim failed", e);
		}
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !isPlaying) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const loop = () => {
			if (!isPlaying) return;

			// Physics
			bird.current.velocity += gravity;
			bird.current.y += bird.current.velocity;

			// Pipes
			if (frameRef.current % 100 === 0) {
				const gap = 120;
				const topHeight = Math.random() * (canvas.height - gap - 100) + 50;
				pipes.current.push({
					x: canvas.width,
					top: topHeight,
					bottom: canvas.height - topHeight - gap,
				});
			}

			pipes.current.forEach((pipe) => (pipe.x -= 2));
			pipes.current = pipes.current.filter((p) => p.x > -50);

			// Collision
			if (bird.current.y > canvas.height || bird.current.y < 0) {
				finishGame(score);
				return;
			}

			pipes.current.forEach((p) => {
				if (p.x < 70 && p.x > 30) {
					if (
						bird.current.y < p.top ||
						bird.current.y > canvas.height - p.bottom
					) {
						finishGame(score);
					}
				}
				if (p.x === 30) setScore((s) => s + 1);
			});

			// Draw
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Bird
			ctx.fillStyle = "#6366f1";
			ctx.beginPath();
			ctx.arc(50, bird.current.y, 15, 0, Math.PI * 2);
			ctx.fill();

			// Pipes
			ctx.fillStyle = "#cbd5e1";
			pipes.current.forEach((p) => {
				ctx.fillRect(p.x, 0, 40, p.top);
				ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
			});

			frameRef.current++;
			animRef.current = requestAnimationFrame(loop);
		};

		animRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animRef.current!);
	}, [isPlaying, score]);

	const handleAction = (e: any) => {
		e.preventDefault();
		if (isPlaying) {
			bird.current.velocity = jump;
		}
	};

	return (
		<div className="flex flex-col items-center justify-center p-4 space-y-6 h-full min-h-[450px]">
			{gameState === "idle" || gameState === "loading" ? (
				<div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
					<div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto shadow-xl ring-8 ring-blue-50">
						<Ghost size={48} className="text-blue-600 animate-bounce" />
					</div>
					<div>
						<h3 className="text-2xl font-black text-slate-800">
							Flappy Pillow
						</h3>
						<p className="text-slate-500 font-medium">
							Bay qua chướng ngại vật để nhận xu!
						</p>
					</div>
					<button
						onClick={startGame}
						disabled={gameState === "loading"}
						className="px-12 py-4 bg-blue-500 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-blue-600 active:scale-95 transition-all w-full"
					>
						{gameState === "loading" ? "ĐANG TẢI..." : "BẮT ĐẦU CHƠI"}
					</button>
				</div>
			) : gameState === "playing" ? (
				<div
					className="relative group cursor-pointer select-none touch-none"
					onMouseDown={handleAction}
					onTouchStart={handleAction}
				>
					<canvas
						ref={canvasRef}
						width={320}
						height={400}
						className="bg-white rounded-3xl shadow-2xl border-4 border-slate-100"
					/>
					<div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg font-black text-2xl text-slate-800 border border-slate-100">
						{score}
					</div>
					<div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">
						Click để bay
					</div>
				</div>
			) : (
				<div className="text-center space-y-8 animate-pop-in">
					<div className="relative">
						<Trophy
							size={80}
							className="text-yellow-400 mx-auto drop-shadow-lg"
						/>
						<div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
							KẾT QUẢ
						</div>
					</div>
					<div>
						<div className="text-6xl font-black text-indigo-900 mb-1">
							{score}
						</div>
						<p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
							Điểm đạt được
						</p>
					</div>
					<div className="bg-yellow-100 text-yellow-700 px-8 py-4 rounded-2xl font-black text-lg border border-yellow-200">
						THƯỞNG: +{Math.floor(score / 5)} XU
					</div>
					<button
						onClick={() => setGameState("idle")}
						className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all"
					>
						CHƠI LẠI
					</button>
				</div>
			)}
		</div>
	);
};

export default FlappyGame;
