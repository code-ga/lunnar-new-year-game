import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Car, Timer, MousePointer2 } from 'lucide-react';

const TurboClickGame: React.FC = () => {
    const { updateCoins } = useGameStore();
    const [clicks, setClicks] = useState(0);
    const [timer, setTimer] = useState(10);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'result' | 'loading'>('idle');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const intervalRef = useRef<any>(null);

    const startRace = async () => {
        setGameState('loading');
        try {
            const res = await fetch('/api/game/play/skill/start', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setSessionId(data.sessionId);
                setClicks(0);
                setTimer(10);
                setGameState('playing');

                intervalRef.current = setInterval(() => {
                    setTimer(prev => {
                        if (prev <= 1) {
                            clearInterval(intervalRef.current);
                            setGameState('result');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (e) {
            setGameState('idle');
            alert("Lỗi khởi tạo game");
        }
    };

    useEffect(() => {
        const claimReward = async () => {
            if (gameState === 'result' && sessionId) {
                try {
                    const res = await fetch('/api/game/play/skill/end', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId, score: clicks })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        updateCoins(data.reward);
                    }
                } catch (e) {
                    console.error("Reward claim failed", e);
                }
            }
        };
        claimReward();
        return () => clearInterval(intervalRef.current);
    }, [gameState, clicks, sessionId, updateCoins]);

    const handleClick = () => {
        if (gameState === 'playing') setClicks(prev => prev + 1);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-8 h-full min-h-[400px]">
            {gameState === 'idle' || gameState === 'loading' ? (
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto ring-4 ring-orange-50 animate-pulse">
                        <Car size={48} className="text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Turbo Click</h3>
                        <p className="text-slate-500 font-medium">Click nhanh để nhận xu! <br/> Càng nhanh càng nhiều quà.</p>
                    </div>
                    <button 
                        onClick={startRace} 
                        disabled={gameState === 'loading'}
                        className="px-12 py-4 bg-orange-500 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-orange-600 active:scale-95 transition-all w-full"
                    >
                        {gameState === 'loading' ? 'ĐANG TẢI...' : 'BẮT ĐẦU ĐUA'}
                    </button>
                </div>
            ) : gameState === 'playing' ? (
                <div className="w-full max-w-sm space-y-10 text-center">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 text-orange-600 font-black text-xl">
                            <Timer size={24} /> {timer}s
                        </div>
                        <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">ĐANG ĐUA!</div>
                        <div className="text-2xl font-black text-slate-800">{clicks}</div>
                    </div>

                    <button 
                        onMouseDown={handleClick}
                        className="w-48 h-48 bg-white border-8 border-orange-500 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer select-none"
                    >
                        <MousePointer2 size={64} className="text-orange-500 fill-orange-500" />
                    </button>
                    
                    <p className="text-orange-400 font-bold animate-pulse">CLICK CLICK CLICK!</p>
                </div>
            ) : (
                <div className="text-center space-y-6 animate-pop-in">
                    <div className="text-6xl font-black text-orange-500">{clicks}</div>
                    <div className="text-slate-500 font-bold">Lượt click của bạn!</div>
                    <div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-xl font-bold">
                        Nhận được: {Math.floor(clicks / 5)} Xu
                    </div>
                    <button 
                        onClick={() => setGameState('idle')}
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
