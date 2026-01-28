import React, { useState } from 'react';
import { useAuth, useUI } from '../context';
import { arkadasIstegiKabulEt, arkadasIstegiReddet } from '../services/arkadasService';

const ArkadasIstekleriModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  
  const [yukleniyor, setYukleniyor] = useState(null); // İşlem yapılan isteğin ID'si

  if (modalAcik !== 'arkadasIstekleri') return null;

  const bekleyenIstekler = kullanici?.arkadasIstekleri?.filter(
    istek => istek.durum === 'bekliyor'
  ) || [];

  const handleKabulEt = async (istekGonderenId) => {
    setYukleniyor(istekGonderenId);
    const result = await arkadasIstegiKabulEt(kullanici, istekGonderenId);
    setYukleniyor(null);
    
    if (result.success) {
      bildirimGoster(result.message);
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  const handleReddet = async (istekGonderenId) => {
    setYukleniyor(istekGonderenId);
    const result = await arkadasIstegiReddet(kullanici, istekGonderenId);
    setYukleniyor(null);
    
    if (result.success) {
      bildirimGoster(result.message);
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  const tarihFormat = (tarihStr) => {
    try {
      const tarih = new Date(tarihStr);
      const simdi = new Date();
      const fark = simdi - tarih;
      const dakika = Math.floor(fark / 60000);
      const saat = Math.floor(fark / 3600000);
      const gun = Math.floor(fark / 86400000);
      
      if (dakika < 1) return 'Az önce';
      if (dakika < 60) return `${dakika} dk önce`;
      if (saat < 24) return `${saat} saat önce`;
      return `${gun} gün önce`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[70vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-black ${tema.text}`}>📬 Arkadaşlık İstekleri</h3>
              {bekleyenIstekler.length > 0 && (
                <p className={`text-sm ${tema.textSecondary}`}>
                  {bekleyenIstekler.length} bekleyen istek
                </p>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => setModalAcik(null)} 
              className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {bekleyenIstekler.length > 0 ? (
            <div className="space-y-3">
              {bekleyenIstekler.map((istek, index) => (
                <div 
                  key={istek.kimden + index} 
                  className={`${tema.inputBg} rounded-2xl p-4`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                      {istek.kimdenAvatar || '👤'}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${tema.text}`}>{istek.kimdenIsim || 'Kullanıcı'}</div>
                      <div className={`text-sm ${tema.textSecondary}`}>{istek.kimdenKullaniciAdi || '@kullanici'}</div>
                      <div className={`text-xs ${tema.textMuted}`}>{tarihFormat(istek.tarih)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleKabulEt(istek.kimden)}
                      disabled={yukleniyor === istek.kimden}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
                    >
                      {yukleniyor === istek.kimden ? '⏳' : '✓ Kabul Et'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReddet(istek.kimden)}
                      disabled={yukleniyor === istek.kimden}
                      className={`flex-1 ${tema.bgCard} ${tema.text} py-2 rounded-xl font-bold text-sm border ${tema.border} disabled:opacity-50`}
                    >
                      ✕ Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className={`${tema.text} font-bold mt-4`}>İstek yok</p>
              <p className={`${tema.textSecondary} text-sm mt-1`}>Yeni arkadaşlık istekleri burada görünecek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArkadasIstekleriModal;
