
import React, { useState } from 'react';
import { Flame, Check, Copy, X, Lock } from 'lucide-react';
import { InventoryItem, Rarity } from '../types';
import { PILLOW_TEMPLATES, RARITY_CONFIG } from '../constants';

interface CollectionViewProps {
  inventory: InventoryItem[];
  burnItem: (id: string) => void;
  addToInventory: (item: InventoryItem) => void;
}

const CollectionView: React.FC<CollectionViewProps> = ({ inventory, burnItem, addToInventory }) => {
  const [subTab, setSubTab] = useState<'inventory' | 'catalog'>('inventory');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [burnedCode, setBurnedCode] = useState<{full: string, masked: string} | null>(null);

  const ownedTemplateIds = new Set(inventory.map(i => i.id));

  const handleBurn = (item: InventoryItem) => {
    if (!confirm("Bạn có chắc chắn muốn 'Đốt' vật phẩm này để lấy mã trao đổi? Vật phẩm sẽ biến mất vĩnh viễn.")) return;
    
    const fullCode = `PIL-${item.id}-${item.rarity}-${item.uniqueId}`;
    const maskedCode = `PIL-${item.id}-${item.rarity}-******`;
    
    setBurnedCode({ full: fullCode, masked: maskedCode });
    burnItem(item.uniqueId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép mã code!");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sub-tabs Header */}
      <div className="flex p-4 pb-0 gap-6 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setSubTab('inventory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${subTab === 'inventory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
        >
          Túi Đồ ({inventory.length})
        </button>
        <button 
          onClick={() => setSubTab('catalog')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${subTab === 'catalog' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
        >
          Danh Mục
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {subTab === 'inventory' ? (
          inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Lock size={24} />
              </div>
              <p className="font-medium">Túi đồ trống. Hãy đi quay gacha!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
              {inventory.map((item) => {
                const config = RARITY_CONFIG[item.rarity];
                const isEx = item.rarity === 'EX';
                return (
                  <button 
                    key={item.uniqueId} 
                    onClick={() => setSelectedItem(item)}
                    className="group cursor-pointer transform transition hover:scale-105 active:scale-95 text-left"
                  >
                    <div className={`relative w-full aspect-[2/3] rounded-xl shadow-md border ${config.border} flex flex-col items-center justify-between p-2 bg-white overflow-hidden`}>
                      <div className={`absolute inset-0 ${config.color} opacity-10 ${isEx ? 'ex-gradient opacity-20' : ''}`}></div>
                      <div className="z-10 w-full text-center text-[10px] font-bold truncate leading-tight mt-1">{item.name}</div>
                      <div className={`z-10 w-10 h-10 rounded-full ${config.color} text-white flex items-center justify-center font-black text-xs shadow-sm ${isEx ? 'ex-gradient' : ''}`}>
                        {item.rarity}
                      </div>
                      <div className="z-10 text-[9px] text-slate-400 font-mono bg-slate-50 px-1 rounded">#{item.uniqueId.slice(-4)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
            {PILLOW_TEMPLATES.map((t) => {
              const isOwned = ownedTemplateIds.has(t.id);
              const config = RARITY_CONFIG[t.rarity];
              return (
                <div key={t.id} className={`flex flex-col items-center ${!isOwned ? 'opacity-40 grayscale' : ''}`}>
                  <div className={`w-full aspect-square rounded-2xl bg-white border ${isOwned ? config.border : 'border-slate-200'} flex items-center justify-center shadow-sm relative overflow-hidden`}>
                    {isOwned && <div className={`absolute inset-0 ${config.color} opacity-10`}></div>}
                    <span className="text-3xl z-10">{isOwned ? '🧸' : '🔒'}</span>
                  </div>
                  <span className="text-[11px] font-bold text-center mt-2 leading-tight text-slate-700">{t.name}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isOwned ? config.color.replace('bg-', 'text-') : 'text-slate-400'}`}>
                    {t.rarity} Rank
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center relative overflow-hidden border border-slate-100">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black text-indigo-900 mb-1">{selectedItem.name}</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-black text-white ${RARITY_CONFIG[selectedItem.rarity].color} mb-6`}>
              RANK {selectedItem.rarity}
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl mb-8 border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unique Identifier</p>
                <p className="font-mono font-bold text-xl select-all tracking-widest text-indigo-600">{selectedItem.uniqueId}</p>
            </div>

            <button 
              onClick={() => { handleBurn(selectedItem); setSelectedItem(null); }}
              className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-3 active:scale-95"
            >
                <Flame size={20} /> CHUYỂN THÀNH MÃ CODE
            </button>
            <p className="mt-4 text-[10px] text-slate-400 px-4 italic">Đốt vật phẩm sẽ xóa gối khỏi túi đồ của bạn và tạo ra mã code để người khác có thể nhận.</p>
          </div>
        </div>
      )}

      {/* Burn Result Modal */}
      {burnedCode && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Đổi Thành Công!</h2>
            <p className="text-sm text-slate-500 mb-8 px-4">Vật phẩm đã được chuyển hóa thành mã quà tặng.</p>

            <div className="w-full p-4 bg-slate-800 text-white rounded-2xl mb-6 shadow-inner relative overflow-hidden group">
                <p className="font-mono text-center tracking-widest text-lg font-bold">{burnedCode.masked}</p>
            </div>

            <button 
              onClick={() => copyToClipboard(burnedCode.full)}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
                <Copy size={20} /> SAO CHÉP MÃ CODE
            </button>
            
            <button 
              onClick={() => setBurnedCode(null)} 
              className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              Quay lại túi đồ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionView;
