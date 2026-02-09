
import React, { useEffect, useState } from 'react';
import { User, LogIn, Cloud, CloudOff, Info, CheckCircle2 } from 'lucide-react';
import { initTokenClient } from '../lib/googleDrive';

interface ProfileViewProps {
  onLogin: (token: string) => void;
  isLoggedIn: boolean;
  syncStatus: 'off' | 'syncing' | 'synced';
}

const ProfileView: React.FC<ProfileViewProps> = ({ onLogin, isLoggedIn, syncStatus }) => {
  const [tokenClient, setTokenClient] = useState<any>(null);

  useEffect(() => {
    // Initialize token client on component mount
    const client = initTokenClient(onLogin);
    setTokenClient(client);
  }, [onLogin]);

  const handleGoogleLogin = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 -z-10 opacity-60"></div>
        
        <div className="text-center mb-10">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ${isLoggedIn ? 'bg-green-100 text-green-600 ring-green-50' : 'bg-indigo-100 text-indigo-600 ring-indigo-50'}`}>
                {isLoggedIn ? <CheckCircle2 size={48} /> : <User size={48} className="fill-indigo-100" />}
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {isLoggedIn ? 'Đã Kết Nối' : 'Cloud Save'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">
              {isLoggedIn ? 'Dữ liệu được bảo vệ bởi Google' : 'Lưu trữ gối ôm lên đám mây'}
            </p>
        </div>

        <div className="space-y-6">
          {!isLoggedIn ? (
            <>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                  Đăng nhập bằng Google Drive giúp bạn lưu trữ bộ sưu tập gối ôm vĩnh viễn và có thể chơi trên nhiều thiết bị khác nhau.
                </p>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full py-5 bg-white border-2 border-slate-100 text-slate-700 font-black rounded-2xl shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="G" />
                ĐĂNG NHẬP GOOGLE
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${syncStatus === 'syncing' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                    <Cloud size={24} className={syncStatus === 'syncing' ? 'animate-bounce' : ''} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Trạng thái Cloud</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {syncStatus === 'syncing' ? 'Đang tải dữ liệu...' : 'Đã đồng bộ Drive'}
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                ĐĂNG XUẤT (Tải lại trang)
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest px-4">
              Chúng tôi không lưu mật khẩu của bạn. Dữ liệu gối ôm được lưu vào thư mục AppData ẩn trên Google Drive cá nhân.
            </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-slate-400">
        <Cloud size={14} />
        <span className="text-xs font-bold uppercase tracking-widest">Powered by Google Drive API</span>
      </div>
    </div>
  );
};

export default ProfileView;
