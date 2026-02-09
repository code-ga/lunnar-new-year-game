import React from 'react';
import GamesHub from '../components/GamesHub';
import GachaView from '../components/GachaView';
import { useGameStore } from '../store/useGameStore';
import { Calendar, Sparkles, Gamepad2, Cloud } from 'lucide-react';

const HomePage: React.FC = () => {
    const { user, fetchUserData } = useGameStore();

    const handleCheckIn = async () => {
        const res = await fetch('/api/game/check-in', { method: 'POST' });
        if (res.ok) {
            await fetchUserData();
            alert('Điểm danh thành công!');
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black">Xin chào, {user?.username || 'Bạn'}! 👋</h2>
                        <p className="mt-2 text-indigo-100 font-medium">Hôm nay bạn muốn thử vận may hay khoe tài năng?</p>
                    </div>
                    <button 
                        onClick={handleCheckIn}
                        disabled={!!user?.lastCheckIn && new Date(user.lastCheckIn).toDateString() === new Date().toDateString()}
                        className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        <Calendar size={20} />
                        {user?.lastCheckIn && new Date(user.lastCheckIn).toDateString() === new Date().toDateString() 
                            ? 'Đã điểm danh' 
                            : 'Điểm danh nhận quà'}
                    </button>
                </div>
                <Cloud className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Sparkles className="text-yellow-500 fill-yellow-500" /> Gacha Gối Ôm
                    </h3>
                    <GachaView />
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Gamepad2 className="text-indigo-500 fill-indigo-500" /> Trò Chơi
                    </h3>
                    <GamesHub />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
