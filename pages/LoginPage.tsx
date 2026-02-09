import React from 'react';
import { Sparkles, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
    const handleLogin = () => {
        window.location.href = '/api/auth/login';
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden">
                <div className="text-center pb-8 pt-10 px-6">
                    <div className="mx-auto bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                        <Sparkles size={44} className="text-indigo-600 fill-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">PillowWorld</h2>
                    <p className="text-slate-500 font-medium mt-2">Chào mừng bạn đến với thế giới gối ôm!</p>
                </div>
                <div className="pb-12 px-10">
                    <button 
                        onClick={handleLogin}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <LogIn size={20} />
                        Đăng nhập bằng tài khoản
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
                        Bằng cách đăng nhập, bạn đồng ý với Điều khoản <br/> và Chính sách bảo mật của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
