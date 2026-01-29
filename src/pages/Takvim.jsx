import React, { useState, useMemo } from 'react';
import { useData, useUI } from '../context';

const Takvim = () => {
  const { etkinlikler } = useData();
  const { setSeciliEtkinlik, setModalAcik } = useUI();
  const [aktifAy, setAktifAy] = useState(new Date());

  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const takvimGunleri = useMemo(() => {
    const yil = aktifAy.getFullYear();
    const ay = aktifAy.getMonth();
    
    const ilkGun = new Date(yil, ay, 1);
    const sonGun = new Date(yil, ay + 1, 0);
    
    const basla = ilkGun.getDay() === 0 ? 6 : ilkGun.getDay() - 1;
    const gunler = [];
    
    // Önceki ayın günleri
    for (let i = basla - 1; i >= 0; i--) {
      const gun = new Date(yil, ay, -i);
      gunler.push({ tarih: gun, aktifAy: false });
    }
    
    // Bu ayın günleri
    for (let i = 1; i <= sonGun.getDate(); i++) {
      const gun = new Date(yil, ay, i);
      gunler.push({ tarih: gun, aktifAy: true });
    }
    
    // Sonraki ayın günleri
    const kalan = 42 - gunler.length;
    for (let i = 1; i <= kalan; i++) {
      const gun = new Date(yil, ay + 1, i);
      gunler.push({ tarih: gun, aktifAy: false });
    }
    
    return gunler;
  }, [aktifAy]);

  const gunEtkinlikleri = (tarih) => {
    const tarihStr = `${String(tarih.getDate()).padStart(2, '0')}/${String(tarih.getMonth() + 1).padStart(2, '0')}/${tarih.getFullYear()}`;
    return etkinlikler.filter(e => e.tarih === tarihStr);
  };

  const oncekiAy = () => {
    setAktifAy(new Date(aktifAy.getFullYear(), aktifAy.getMonth() - 1));
  };

  const sonrakiAy = () => {
    setAktifAy(new Date(aktifAy.getFullYear(), aktifAy.getMonth() + 1));
  };

  const bugun = new Date();
  const bugunMu = (tarih) => {
    return tarih.getDate() === bugun.getDate() &&
           tarih.getMonth() === bugun.getMonth() &&
           tarih.getFullYear() === bugun.getFullYear();
  };

  const etkinlikIkonlari = {
    kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮',
    parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️',
    konser: '🎵', diger: '📅'
  };

  return (
    <div className="pb-24 p-4 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">📅 Takvim</h2>
        <button
          onClick={() => setModalAcik('hizliPlan')}
          className="glass-button px-4 py-2 text-sm font-bold"
        >
          + Yeni Plan
        </button>
      </div>

      {/* Ay Seçici */}
      <div className="glass-card mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={oncekiAy}
            className="w-10 h-10 glass-panel-hover rounded-xl flex items-center justify-center hover:bg-white/15"
          >
            <span className="text-white text-xl">←</span>
          </button>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">
              {aylar[aktifAy.getMonth()]} {aktifAy.getFullYear()}
            </h3>
          </div>
          
          <button
            onClick={sonrakiAy}
            className="w-10 h-10 glass-panel-hover rounded-xl flex items-center justify-center hover:bg-white/15"
          >
            <span className="text-white text-xl">→</span>
          </button>
        </div>
      </div>

      {/* Takvim */}
      <div className="glass-card">
        {/* Gün Başlıkları */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {gunler.map(gun => (
            <div key={gun} className="text-center text-white/60 text-xs font-bold py-2">
              {gun}
            </div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid grid-cols-7 gap-1">
          {takvimGunleri.map((gun, index) => {
            const gunEtk = gunEtkinlikleri(gun.tarih);
            const bugunMi = bugun(gun.tarih);

            return (
              <div
                key={index}
                className={`aspect-square p-1 rounded-xl transition-all ${
                  gun.aktifAy
                    ? 'glass-panel-hover hover:bg-white/15 cursor-pointer'
                    : 'opacity-30'
                } ${bugunMi ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => {
                  if (gunEtk.length === 1) {
                    setSeciliEtkinlik(gunEtk[0]);
                    setModalAcik('detay');
                  }
                }}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  bugunMi ? 'text-orange-400' : 'text-white'
                }`}>
                  {gun.tarih.getDate()}
                </div>
                
                {gunEtk.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {gunEtk.slice(0, 2).map(etk => (
                      <div
                        key={etk.id}
                        className="text-xs bg-orange-500/20 rounded px-1 flex items-center gap-1 truncate"
                      >
                        <span className="text-[10px]">{etkinlikIkonlari[etk.ikon] || '📅'}</span>
                        <span className="text-white/80 text-[10px] truncate">{etk.baslik}</span>
                      </div>
                    ))}
                    {gunEtk.length > 2 && (
                      <div className="text-[10px] text-orange-400 font-bold">
                        +{gunEtk.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Yaklaşan Etkinlikler */}
      <div className="mt-6">
        <h3 className="text-white/70 font-bold mb-3 text-sm">📌 YAKLASAN ETKİNLİKLER</h3>
        <div className="space-y-3">
          {etkinlikler
            .filter(e => {
              const [gun, ay, yil] = e.tarih.split('/');
              const [saat, dakika] = e.saat.split(':');
              const etkinlikTarihi = new Date(yil, ay - 1, gun, saat, dakika);
              return etkinlikTarihi >= new Date();
            })
            .sort((a, b) => {
              const [gunA, ayA, yilA] = a.tarih.split('/');
              const [gunB, ayB, yilB] = b.tarih.split('/');
              const tarihA = new Date(yilA, ayA - 1, gunA);
              const tarihB = new Date(yilB, ayB - 1, gunB);
              return tarihA - tarihB;
            })
            .slice(0, 5)
            .map(etk => (
              <button
                key={etk.id}
                onClick={() => {
                  setSeciliEtkinlik(etk);
                  setModalAcik('detay');
                }}
                className="w-full glass-card hover:scale-[1.02] transition-transform text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center text-2xl">
                    {etkinlikIkonlari[etk.ikon] || '📅'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{etk.baslik}</h4>
                    <p className="text-sm text-white/60">
                      {etk.tarih} • {etk.saat}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          
          {etkinlikler.length === 0 && (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <span className="text-5xl mb-4 block">📅</span>
              <p className="text-white/60">Henüz plan yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Takvim;
