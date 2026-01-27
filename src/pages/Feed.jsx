import React from 'react';
import { useAuth, useData, useUI } from '../context';

const Feed = () => {
  const { kullanici } = useAuth();
  const { aktiviteler } = useData();
  const { canSikildiModu, setModalAcik, tema } = useUI();

  const CanSikildiModuBanner = () => (
    <div className="mx-4 mt-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-gradient-x rounded-3xl"></div>
      <div className="relative bg-black/20 backdrop-blur-sm text-white p-5 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl flex items-center gap-2">
              <span className="animate-bounce">🔥</span> Şu an müsaitsin!
            </h3>
            <p className="text-sm opacity-90 mt-1">Arkadaşların bunu görecek</p>
          </div>
        </div>
        <button 
          onClick={() => setModalAcik('hizliPlan')}
          className="w-full mt-4 bg-white text-orange-600 font-black py-3 rounded-2xl hover:bg-orange-50 transition-all shadow-lg"
        >
          Hadi Buluşalım! 🚀
        </button>
      </div>
    </div>
  );

  return (
    <div className="pb-24">
      <div className={`${tema.bgCard} border-b ${tema.border} p-4 overflow-hidden`}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
                {kullanici?.avatar || '👨'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm border-2 border-white shadow">
                +
              </div>
            </div>
            <span className={`text-xs mt-2 ${tema.text} font-semibold`}>Sen</span>
          </div>
        </div>
      </div>

      {canSikildiModu && <CanSikildiModuBanner />}

      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setModalAcik('bucketList')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.bgCard} ${tema.text} ${tema.cardShadow} whitespace-nowrap border ${tema.border}`}
        >
          📋 Bucket List
        </button>
        <button 
          onClick={() => setModalAcik('galeri')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.bgCard} ${tema.text} ${tema.cardShadow} whitespace-nowrap border ${tema.border}`}
        >
          📸 Anılar
        </button>
        <button 
          onClick={() => setModalAcik('yeniGrup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.bgCard} ${tema.text} ${tema.cardShadow} whitespace-nowrap border ${tema.border}`}
        >
          👥 Yeni Grup
        </button>
      </div>

      {aktiviteler.length === 0 && (
        <div className={`${tema.bgCard} m-4 rounded-2xl p-8 text-center border ${tema.border}`}>
          <span className="text-6xl">🎉</span>
          <p className={`${tema.text} font-bold mt-4`}>Henüz aktivite yok</p>
          <p className={`${tema.textSecondary} text-sm mt-1`}>İlk planını oluştur ve arkadaşlarını ekle!</p>
          <button 
            onClick={() => setModalAcik('hizliPlan')}
            className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl font-bold"
          >
            Plan Oluştur
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
