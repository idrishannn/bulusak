import React from 'react';
import { useAuth, useData, useUI } from '../context';

const etkinlikIkonlari = { 
  kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', 
  oyun: '🎮', parti: '🎉', toplanti: '💼', gezi: '🏖️', 
  alisveris: '🛍️', konser: '🎵', diger: '📅' 
};

const gunlerTam = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const Feed = () => {
  const { kullanici } = useAuth();
  const { etkinlikler, arkadaslar } = useData();
  const { setModalAcik, setSeciliEtkinlik } = useUI();

  const baskaPlanlari = etkinlikler.filter(etkinlik => 
    etkinlik.olusturanId !== kullanici?.odUserId
  );

  const siradakiPlan = etkinlikler.find(e => {
    const tarih = new Date(e.tarih);
    return tarih >= new Date();
  });

  const tarihFormatla = (tarihStr) => {
    try {
      const tarih = new Date(tarihStr);
      const bugun = new Date();
      const yarin = new Date();
      yarin.setDate(bugun.getDate() + 1);
      
      if (tarih.toDateString() === bugun.toDateString()) {
        return 'Bugün';
      } else if (tarih.toDateString() === yarin.toDateString()) {
        return 'Yarın';
      } else {
        return `${tarih.getDate()} ${aylar[tarih.getMonth()]} ${gunlerTam[tarih.getDay()]}`;
      }
    } catch {
      return 'Tarih belirtilmedi';
    }
  };

  const handlePlanTikla = (etkinlik) => {
    setSeciliEtkinlik(etkinlik);
    setModalAcik('detay');
  };

  const planSahibi = (etkinlik) => {
    const arkadas = arkadaslar.find(a => a.odUserId === etkinlik.olusturanId);
    if (arkadas) return arkadas.isim;
    return 'Kullanıcı';
  };

  const bugunMu = (tarihStr) => {
    const tarih = new Date(tarihStr);
    const bugun = new Date();
    return tarih.toDateString() === bugun.toDateString();
  };

  return (
    <div className="pb-32 p-4 space-y-6">
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar py-2">
        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
          <button 
            onClick={() => setModalAcik('arkadaslar')}
            className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-95"
          >
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <span className="text-xs text-white/70">Ekle</span>
        </div>
        
        {arkadaslar.slice(0, 6).map((arkadas, i) => (
          <div key={arkadas.odUserId || i} className="flex flex-col items-center space-y-2 flex-shrink-0">
            <div className={`w-16 h-16 rounded-full p-[2px] ${arkadas.online ? 'bg-gradient-to-tr from-orange-500 to-yellow-400 shadow-lg shadow-orange-500/20' : 'bg-white/20'}`}>
              <div className={`w-full h-full rounded-full bg-[#1f1f1f] flex items-center justify-center text-2xl ${!arkadas.online && 'opacity-80'}`}>
                {arkadas.avatar || '👤'}
              </div>
            </div>
            <span className={`text-xs ${arkadas.online ? 'text-white/90' : 'text-white/60'}`}>
              {arkadas.isim?.split(' ')[0] || 'Arkadaş'}
            </span>
          </div>
        ))}
      </div>

      {siradakiPlan && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Sıradaki Plan</h2>
            {bugunMu(siradakiPlan.tarih) && (
              <span className="text-xs text-orange-400 font-bold tracking-wider uppercase bg-orange-500/10 px-2 py-1 rounded border border-orange-500/30">
                Bugün
              </span>
            )}
          </div>

          <button
            onClick={() => handlePlanTikla(siradakiPlan)}
            className="w-full glass-panel-active rounded-[32px] p-1 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition duration-500"></div>
            
            <div className="bg-gray-900/40 backdrop-blur-md rounded-[28px] p-5 relative z-10 border border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
                    {etkinlikIkonlari[siradakiPlan.ikon] || '📅'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{siradakiPlan.baslik}</h3>
                    <p className="text-white/60 text-xs">
                      {siradakiPlan.mekan !== 'Belirtilmedi' ? siradakiPlan.mekan : 'Mekan belirtilmedi'} • {siradakiPlan.saat}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex -space-x-3">
                  {(siradakiPlan.katilimcilar || []).slice(0, 2).map((k, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-gray-800 bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-sm">
                      {k.avatar || '👤'}
                    </div>
                  ))}
                  {(siradakiPlan.katilimcilar?.length || 0) > 2 && (
                    <div className="w-9 h-9 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      +{siradakiPlan.katilimcilar.length - 2}
                    </div>
                  )}
                </div>
                <span className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-white/10">
                  Detaylar
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Arkadaşlar</h2>
        <div className="space-y-3">
          {arkadaslar.length > 0 ? arkadaslar.slice(0, 5).map((arkadas) => (
            <div 
              key={arkadas.odUserId}
              className="glass-panel p-3 rounded-2xl flex items-center justify-between hover:bg-white/10 transition cursor-pointer border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-white/10 ${!arkadas.online && 'grayscale opacity-70'}`}>
                    {arkadas.avatar || '👤'}
                  </div>
                  {arkadas.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${arkadas.online ? 'text-white' : 'text-white/70'}`}>
                    {arkadas.isim || 'Kullanıcı'}
                  </h4>
                  <p className={`text-xs ${arkadas.online ? 'text-green-400' : 'text-white/40'}`}>
                    {arkadas.online ? 'Müsait' : 'Çevrimdışı'}
                  </p>
                </div>
              </div>
              {arkadas.online && (
                <button className="text-orange-400 bg-orange-400/10 p-2 rounded-lg hover:bg-orange-400 hover:text-white transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.45-2.125L3 19l.75-3.665A7.984 7.984 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </button>
              )}
            </div>
          )) : (
            <div className="glass-panel rounded-2xl p-6 text-center border border-white/5">
              <span className="text-4xl">👥</span>
              <p className="text-white/70 mt-2">Henüz arkadaşın yok</p>
              <button 
                onClick={() => setModalAcik('arkadaslar')}
                className="mt-3 text-orange-400 font-semibold text-sm"
              >
                Arkadaş Ekle
              </button>
            </div>
          )}
        </div>
      </div>

      {baskaPlanlari.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Davetler</h2>
          <div className="space-y-3">
            {baskaPlanlari.map(etkinlik => {
              const katilimci = etkinlik.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
              
              return (
                <button
                  key={etkinlik.id}
                  onClick={() => handlePlanTikla(etkinlik)}
                  className="w-full glass-card rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                      {etkinlikIkonlari[etkinlik.ikon] || '📅'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{etkinlik.baslik}</h3>
                      <p className="text-sm text-white/60">
                        {etkinlik.grup 
                          ? `${etkinlik.grup.emoji} ${etkinlik.grup.isim}` 
                          : `👤 ${planSahibi(etkinlik)} davet etti`
                        }
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                        <span>📅 {tarihFormatla(etkinlik.tarih)}</span>
                        <span>⏰ {etkinlik.saat}</span>
                      </div>
                    </div>
                    
                    {!katilimci ? (
                      <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-lg border border-orange-500/30">
                        ⏳ Bekliyor
                      </span>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        katilimci.durum === 'varim' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : katilimci.durum === 'bakariz'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {katilimci.durum === 'varim' ? '✔ Katılıyorsun' : katilimci.durum === 'bakariz' ? '🤔 Bakarız' : '✗ Katılmıyorsun'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {etkinlikler.length === 0 && arkadaslar.length === 0 && (
        <div className="glass-panel rounded-3xl p-8 text-center border border-white/10">
          <span className="text-6xl">🎉</span>
          <h3 className="text-white font-bold text-xl mt-4">Hoş Geldin!</h3>
          <p className="text-white/60 mt-2">Arkadaşlarını ekle ve ilk planını oluştur</p>
          <button
            onClick={() => setModalAcik('hizliPlan')}
            className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            ⚡ İlk Planı Oluştur
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
