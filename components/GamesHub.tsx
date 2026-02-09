
import React from 'react';
import { Ghost, Car, Dice5, Gamepad2, X, Info } from 'lucide-react';
import { GameId } from '../types';
import FlappyGame from './FlappyGame';
import TurboClickGame from './TurboClickGame';
import TaiXiuGame from './TaiXiuGame';
import BauCuaGame from './BauCuaGame';

interface GamesHubProps {
  activeGame: GameId;
  setActiveGame: (id: GameId) => void;
  updateCoins: (amt: number) => void;
}

const GamesHub: React.FC<GamesHubProps> = ({ activeGame, setActiveGame, updateCoins }) => {
  if (activeGame) {
    return (
      <div className="h-full relative bg-slate-900 overflow-hidden">
        <button 
          onClick={() => setActiveGame(null)}
          className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-xl transition-colors"
        >
          <X size={24} />
        </button>

        {activeGame === 'flappy' && <FlappyGame updateCoins={updateCoins} />}
        {activeGame === 'race' && <TurboClickGame updateCoins={updateCoins} />}
        {activeGame === 'taixiu' && <TaiXiuGame updateCoins={updateCoins} />}
        {activeGame === 'baucua' && <BauCuaGame updateCoins={updateCoins} />}
      </div>
    );
  }

  const games = [
    { id: 'flappy', label: 'Flappy Pillow', icon: Ghost, color: 'bg-blue-500', desc: 'Bay qua chướng ngại vật' },
    { id: 'race', label: 'Turbo Click', icon: Car, color: 'bg-orange-500', desc: 'Bấm thật nhanh' },
    { id: 'taixiu', label: 'Tài Xỉu', icon: Dice5, color: 'bg-green-600', desc: 'Thử thách vận may' },
    { id: 'baucua', label: 'Bầu Cua', icon: Gamepad2, color: 'bg-red-600', desc: 'Dự đoán linh vật' },
  ];

  return (
    <div className="p-6 h-full flex flex-col items-center">
      <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Khu Vui Chơi</h2>
          <p className="text-slate-500 font-medium">Chơi các mini-game để kiếm thêm Xu gacha!</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl pb-20">
        {games.map((game) => (
          <button 
            key={game.id}
            onClick={() => setActiveGame(game.id as GameId)}
            className={`${game.color} text-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-2 transform transition hover:scale-105 active:scale-95 group text-center border-b-8 border-black/20`}
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform">
              <game.icon size={36} className="text-white" />
            </div>
            <span className="font-black text-lg leading-tight uppercase tracking-tighter">{game.label}</span>
            <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">{game.desc}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto mb-10 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 max-w-sm">
        <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-indigo-900 text-xs font-medium leading-relaxed">
          Mẹo: <span className="font-bold">Turbo Click</span> là cách nhanh nhất để kiếm xu nếu bạn có đôi tay linh hoạt!
        </p>
      </div>
    </div>
  );
};

export default GamesHub;
