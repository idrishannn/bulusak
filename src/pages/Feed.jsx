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
  const { setModalAcik, setSeciliEtkinlik, tema } = useUI();

  // ✅ SADECE BAŞKALARININ PLANLARINI GÖSTER (Kendi oluşturduklarını filtreyle)
  const baskaPlanlari = etkinlikler.filter(etkinlik => 
    etkinlik.olusturanId !== kullanici?.odUserId
  );

  // Tarihi formatla
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

  // Plan detayını aç
  const handlePlanTikla = (etkinlik) => {
    setSeciliEtkinlik(etkinlik);
    setModalAcik('detay');
  };

  // Planı kim oluşturdu?
  const planSahibi = (etkinlik) => {
    // Arkadaş listesinde bul
    const arkadas = arkadaslar.find(a => a.odUserId === etkinlik.olusturanId);
    if (arkadas) return arkadas.isim;
    
    return 'Kullanıcı';
  };

  return (
    <div className="pb-24 p-4">
      {/* Hoşgeldin */}
      <div className="mb-6">
        <h2 className={`text-2xl font-black ${tema.text}`}>
          Merhaba, {kullanici?.isim?.split(' ')[0] || 'Kullanıcı'} 👋
        </h2>
        <p className={tema.textSecondary}>
          {baskaPlanlari.length > 0 
            ? `${baskaPlanlari.length} davet var` 
            : 'Henüz davet yok'
          }
        </p>
      </div>

      {/* Hızlı Plan Butonu */}
      <button
        onClick={() => setModalAcik('hizliPlan')}
        className="w-full mb-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        ⚡ Hızlı Plan Oluştur
      </button>

      {/* Plan Listesi (SADECE BAŞKALARININ PLANLARI) */}
      {baskaPlanlari.length > 0 ? (
        <div className="space-y-4">
          {baskaPlanlari.map(etkinlik => {
            const katilimci = etkinlik.katilimcilar?.find(k => k.odUserId === kullanici?.odUserId);
            
            return (
              <div
                key={etkinlik.id}
                onClick={() => handlePlanTikla(etkinlik)}
                className={`${tema.bgCard} rounded-2xl p-4 shadow-soft border-2 border-gray-200 cursor-pointer hover:border-orange-500 hover:shadow-md transition-all active:scale-[0.98]`}
              >
                {/* Üst Kısım */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                    {etkinlikIkonlari[etkinlik.ikon] || '📅'}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-black text-lg ${tema.text}`}>{etkinlik.baslik}</h3>
                    <p className={`text-sm ${tema.textSecondary} font-semibold`}>
                      {etkinlik.grup 
                        ? `${etkinlik.grup.emoji} ${etkinlik.grup.isim}` 
                        : `👤 ${planSahibi(etkinlik)} davet etti`
                      }
                    </p>
                  </div>
                  
                  {/* Bekleyen davet badge */}
                  {!katilimci && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-lg border border-orange-300">
                      ⏳ Bekliyor
                    </span>
                  )}
                </div>

                {/* Tarih ve Saat */}
                <div className="flex items-center gap-4 mb-3">
                  <div className={`flex items-center gap-2 ${tema.textSecondary} font-semibold`}>
                    <span>📅</span>
                    <span className="text-sm">{tarihFormatla(etkinlik.tarih)}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${tema.textSecondary} font-semibold`}>
                    <span>⏰</span>
                    <span className="text-sm">{etkinlik.saat}</span>
                  </div>
                  {etkinlik.mekan && etkinlik.mekan !== 'Belirtilmedi' && (
                    <div className={`flex items-center gap-2 ${tema.textSecondary} font-semibold`}>
                      <span>📍</span>
                      <span className="text-sm truncate max-w-[100px]">{etkinlik.mekan}</span>
                    </div>
                  )}
                </div>

                {/* Davetliler (Grupsuz plan için) */}
                {etkinlik.davetliDetaylar && etkinlik.davetliDetaylar.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {etkinlik.davetliDetaylar.slice(0, 5).map((d, i) => (
                        <div 
                          key={i} 
                          className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm"
                          title={d.isim}
                        >
                          {d.avatar || '👤'}
                        </div>
                      ))}
                      {etkinlik.davetliDetaylar.length > 5 && (
                        <div className={`w-8 h-8 ${tema.inputBg} rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${tema.text}`}>
                          +{etkinlik.davetliDetaylar.length - 5}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs ${tema.textMuted} font-medium`}>
                      {etkinlik.davetliDetaylar.length} kişi davetli
                    </span>
                  </div>
                )}

                {/* Katılım Durumu */}
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 ${
                    katilimci?.durum === 'varim' 
                      ? 'bg-green-50 text-green-600 border-green-300'
                      : katilimci?.durum === 'bakariz'
                      ? 'bg-yellow-50 text-yellow-600 border-yellow-300'
                      : katilimci?.durum === 'yokum'
                      ? 'bg-red-50 text-red-600 border-red-300'
                      : `${tema.inputBg} ${tema.textSecondary} border-gray-200`
                  }`}>
                    {katilimci?.durum === 'varim' 
                      ? '✓ Katılıyorsun'
                      : katilimci?.durum === 'bakariz'
                      ? '🤔 Bakarız'
                      : katilimci?.durum === 'yokum'
                      ? '✗ Katılmıyorsun'
                      : '⏳ Yanıt bekliyor'
                    }
                  </span>
                </div>

                {/* Mesaj sayısı */}
                {etkinlik.mesajlar && etkinlik.mesajlar.length > 0 && (
                  <div className={`mt-2 text-xs ${tema.textMuted} flex items-center gap-1 font-medium`}>
                    💬 {etkinlik.mesajlar.length} mesaj
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${tema.bgCard} rounded-3xl p-8 shadow-soft text-center border-2 border-gray-200`}>
          <span className="text-6xl">📅</span>
          <h3 className={`${tema.text} font-bold text-xl mt-4`}>Henüz davet yok</h3>
          <p className={`${tema.textSecondary} mt-2`}>
            Arkadaşlarından davet geldiğinde burada görünecek
          </p>
          <button
            onClick={() => setModalAcik('hizliPlan')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            ⚡ İlk Planı Oluştur
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
