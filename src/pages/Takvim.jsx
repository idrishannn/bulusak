import React from 'react';
import { useData, useUI } from '../context';

const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const etkinlikIkonlari = { kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮', parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️', konser: '🎵', diger: '📅' };

const Takvim = () => {
  const { gruplar, etkinlikler, musaitlikler, musaitlikToggle } = useData();
  const { seciliGrup, setSeciliGrup, setSeciliZaman, setSeciliEtkinlik, setModalAcik, tema } = useUI();

  const bugun = new Date();
  
  const haftaninGunleri = [];
  const haftaninBaslangici = new Date(bugun);
  haftaninBaslangici.setDate(bugun.getDate() - bugun.getDay() + 1);
  
  for (let i = 0; i < 7; i++) {
    const gun = new Date(haftaninBaslangici);
    gun.setDate(haftaninBaslangici.getDate() + i);
    haftaninGunleri.push(gun);
  }

  const etkinlikBul = (tarih, saat) => {
    return etkinlikler.filter(e => {
      const eTarih = new Date(e.tarih);
      return eTarih.toDateString() === tarih.toDateString() && e.saat === saat;
    });
  };

  const TakvimHucresi = ({ gun, saat }) => {
    const key = `${gun.toDateString()}-${saat}`;
    const musait = musaitlikler[key];
    const gecmisMi = gun < bugun && gun.toDateString() !== bugun.toDateString();
    const etkinliklerBurada = etkinlikBul(gun, saat);
    const etkinlikVar = etkinliklerBurada.length > 0;

    return (
      <button
        onClick={() => {
          if (!gecmisMi) {
            if (etkinlikVar) {
              setSeciliEtkinlik(etkinliklerBurada[0]);
              setModalAcik('detay');
            } else if (seciliGrup) {
              setSeciliZaman({ tarih: gun, saat });
              setModalAcik('yeniPlan');
            } else {
              musaitlikToggle(gun, saat);
            }
          }
        }}
        disabled={gecmisMi}
        className={`relative h-12 rounded-xl transition-all duration-300 text-xs font-medium overflow-hidden ${
          gecmisMi 
            ? 'bg-gray-100 cursor-not-allowed opacity-40' 
            : etkinlikVar
              ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : musait 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105' 
                : 'bg-white hover:bg-orange-50 border border-orange-100'
        }`}
      >
        {etkinlikVar && <span className="text-lg">{etkinlikIkonlari[etkinliklerBurada[0].ikon]}</span>}
        {!etkinlikVar && musait && <span>✓</span>}
      </button>
    );
  };

  const HaftalikTakvim = () => (
    <div className={`${tema.bgCard} rounded-3xl p-4 ${tema.cardShadow} mx-4 mt-4 border ${tema.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-black text-lg ${tema.text}`}>
            {seciliGrup ? `${seciliGrup.emoji} ${seciliGrup.isim}` : '📅 Takvimin'}
          </h3>
          <p className={`text-sm ${tema.textSecondary}`}>{aylar[bugun.getMonth()]} {bugun.getFullYear()}</p>
        </div>
        {seciliGrup && (
          <button 
            onClick={() => setSeciliGrup(null)}
            className={`${tema.inputBg} ${tema.text} px-3 py-1.5 rounded-lg text-sm font-medium`}
          >
            ✕ Kapat
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-8 gap-2 mb-3">
        <div className={`text-xs ${tema.textMuted} text-center py-2 font-bold`}>⏰</div>
        {haftaninGunleri.map((gun, i) => {
          const bugunMu = gun.toDateString() === bugun.toDateString();
          return (
            <div key={i} className={`text-center py-2 rounded-xl transition-all ${bugunMu ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg scale-105' : ''}`}>
              <div className={`text-xs font-bold ${bugunMu ? 'text-white' : tema.textSecondary}`}>{gunler[gun.getDay()]}</div>
              <div className={`text-lg font-black ${bugunMu ? 'text-white' : tema.text}`}>{gun.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {saatler.map(saat => (
          <div key={saat} className="grid grid-cols-8 gap-2 mb-2">
            <div className={`text-xs ${tema.textMuted} text-center py-3 font-medium`}>{saat}</div>
            {haftaninGunleri.map((gun, i) => (
              <TakvimHucresi key={i} gun={gun} saat={saat} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-24">
      {seciliGrup && (
        <div className="bg-orange-50 p-4 flex items-center justify-between">
          <span className={`flex items-center gap-2 ${tema.text} font-bold`}>
            {seciliGrup.emoji} {seciliGrup.isim}
          </span>
          <span className={`text-sm ${tema.textSecondary}`}>Bir zaman seçerek plan oluştur</span>
        </div>
      )}
      
      <HaftalikTakvim />

      {!seciliGrup && (
        <div className="p-4 space-y-3">
          <div className={`${tema.bgCard} rounded-2xl p-4 border ${tema.border}`}>
            <h4 className={`font-bold ${tema.text} mb-2`}>💡 Nasıl Kullanılır?</h4>
            <ul className={`text-sm ${tema.textSecondary} space-y-1`}>
              <li>• Müsait olduğun zamanlara tıkla ✓</li>
              <li>• Turuncu = mevcut planlar</li>
              <li>• Aşağıdan grup seç, takvimden plan oluştur</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <h4 className={`font-bold ${tema.text}`}>👥 Gruplarını Seç</h4>
            <button onClick={() => setModalAcik('yeniGrup')} className="text-orange-500 text-sm font-bold">
              + Yeni Grup
            </button>
          </div>
          
          {gruplar.length > 0 ? (
            <div className="space-y-2">
              {gruplar.map(grup => (
                <button
                  key={grup.id}
                  onClick={() => setSeciliGrup(grup)}
                  className={`w-full ${tema.bgCard} rounded-xl p-3 ${tema.cardShadow} border ${tema.border} flex items-center gap-3 text-left ${tema.bgHover} transition-all`}
                >
                  <span className="text-2xl">{grup.emoji}</span>
                  <div className="flex-1">
                    <span className={`font-bold ${tema.text}`}>{grup.isim}</span>
                    <span className={`text-sm ${tema.textSecondary} ml-2`}>{grup.uyeler?.length || 1} kişi</span>
                  </div>
                  <span className="text-orange-500">→</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={`${tema.bgCard} rounded-xl p-6 text-center border ${tema.border}`}>
              <span className="text-4xl">👥</span>
              <p className={`${tema.textSecondary} mt-2`}>Henüz grup yok</p>
              <button 
                onClick={() => setModalAcik('yeniGrup')}
                className="mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm"
              >
                İlk Grubunu Oluştur
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Takvim;
