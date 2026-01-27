import React from 'react';
import { useData, useUI } from '../context';

const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const etkinlikIkonlari = { kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮', parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️', konser: '🎵', diger: '📅' };

const Planlar = () => {
  const { etkinlikler } = useData();
  const { katilimIstekleri, setSeciliEtkinlik, setModalAcik, tema } = useUI();

  return (
    <div className="pb-24 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-black ${tema.text}`}>📋 Planların</h2>
        <button 
          onClick={() => setModalAcik('hizliPlan')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
        >
          + Yeni Plan
        </button>
      </div>

      {katilimIstekleri.length > 0 && (
        <div className="mb-4">
          <h3 className={`font-bold ${tema.textSecondary} mb-2`}>⏳ Onay Bekleyenler</h3>
          {katilimIstekleri.map(istek => (
            <div key={istek.id} className={`${tema.bgCard} rounded-xl p-3 border ${tema.border} mb-2 flex items-center gap-3`}>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl">
                {etkinlikIkonlari[istek.plan?.ikon] || '📅'}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${tema.text}`}>{istek.plan?.baslik || 'Plan'}</div>
                <div className="text-sm text-yellow-600">⏳ Onay bekleniyor...</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {etkinlikler.length > 0 ? (
        <div className="space-y-3">
          {etkinlikler.map(etkinlik => {
            const tarih = new Date(etkinlik.tarih);
            const katilimcilar = etkinlik.katilimcilar || [];
            const varimSayisi = katilimcilar.filter(k => k.durum === 'varim').length;
            
            return (
              <button
                key={etkinlik.id}
                onClick={() => {
                  setSeciliEtkinlik(etkinlik);
                  setModalAcik('detay');
                }}
                className={`w-full ${tema.bgCard} rounded-2xl p-4 ${tema.cardShadow} border ${tema.border} text-left ${tema.bgHover} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                    {etkinlikIkonlari[etkinlik.ikon]}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${tema.text}`}>{etkinlik.baslik}</h4>
                    <p className={`text-sm ${tema.textSecondary}`}>
                      {etkinlik.grup?.emoji} {etkinlik.grup?.isim}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-500">{etkinlik.saat}</div>
                    <div className={`text-xs ${tema.textSecondary}`}>
                      {gunler[tarih.getDay()]}, {tarih.getDate()} {aylar[tarih.getMonth()]?.slice(0, 3)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className={`text-sm font-medium ${tema.textSecondary}`}>
                    <span className="text-green-500">{varimSayisi}</span>/{katilimcilar.length} katılıyor
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={`${tema.bgCard} rounded-2xl p-8 text-center border ${tema.border}`}>
          <span className="text-6xl">📅</span>
          <p className={`${tema.text} font-bold mt-4`}>Henüz plan yok</p>
          <p className={`${tema.textSecondary} text-sm mt-1`}>İlk planını oluşturmak için + butonuna tıkla!</p>
        </div>
      )}
    </div>
  );
};

export default Planlar;
