import React from 'react';
import { useData, useUI, useTheme } from '../context';
import EmptyState from './EmptyState';

const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const Takvim = () => {
  const { gruplar, etkinlikler, musaitlikler, musaitlikToggle } = useData();
  const { seciliGrup, setSeciliGrup, setSeciliZaman, setSeciliEtkinlik, setModalAcik } = useUI();
  const { themeClasses, isDark } = useTheme();

  const bugun = new Date();
  const haftaninGunleri = [];
  const haftaninBaslangici = new Date(bugun);
  haftaninBaslangici.setDate(bugun.getDate() - bugun.getDay() + 1);

  for (let i = 0; i < 7; i++) {
    const gun = new Date(haftaninBaslangici);
    gun.setDate(haftaninBaslangici.getDate() + i);
    haftaninGunleri.push(gun);
  }

  // startAt (veya tarih) alanını kullanarak planı takvimde bul
  const etkinlikBul = (tarih, saat) => {
    return etkinlikler?.filter(e => {
      // startAt varsa onu kullan, yoksa tarih alanını kullan
      const planTarih = e.startAt || e.tarih;
      const eTarih = new Date(planTarih);
      return eTarih.toDateString() === tarih.toDateString() && e.saat === saat;
    }) || [];
  };

  const TakvimHucresi = ({ gun, saat }) => {
    const key = `${gun.toDateString()}-${saat}`;
    const musait = musaitlikler?.[key];
    const gecmisMi = gun < bugun && gun.toDateString() !== bugun.toDateString();
    const etkinliklerBurada = etkinlikBul(gun, saat);
    const etkinlikVar = etkinliklerBurada.length > 0;

    // Plan sahibinin avatar bilgisini bul
    const ilkEtkinlik = etkinliklerBurada[0];
    const olusturan = ilkEtkinlik?.katilimcilar?.find(k => k.odUserId === ilkEtkinlik?.olusturanId);
    const olusturanAvatar = olusturan?.avatar || ilkEtkinlik?.olusturanAvatar;

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
        className={`h-10 rounded-lg transition-all text-xs font-medium overflow-hidden ${
          gecmisMi
            ? isDark ? 'bg-dark-800/30 cursor-not-allowed' : 'bg-gray-100 cursor-not-allowed'
            : etkinlikVar
              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-dark-900 shadow-gold'
              : musait
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : isDark
                  ? 'bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/50'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
        }`}
      >
        {etkinlikVar && (
          olusturanAvatar ? (
            <img
              src={olusturanAvatar}
              alt=""
              className="w-6 h-6 rounded-full mx-auto object-cover border-2 border-white/50"
            />
          ) : (
            <div className="w-6 h-6 rounded-full mx-auto bg-dark-900/30 flex items-center justify-center text-[10px] font-bold text-dark-900">
              {olusturan?.isim?.charAt(0) || ilkEtkinlik?.baslik?.charAt(0) || 'P'}
            </div>
          )
        )}
        {!etkinlikVar && musait && '✓'}
      </button>
    );
  };

  return (
    <div className="pb-32">
      {seciliGrup && (
        <div className={`${themeClasses.glass} p-4 flex items-center justify-between`}>
          <span className={`${themeClasses.text} font-medium`}>{seciliGrup.isim}</span>
          <button onClick={() => setSeciliGrup(null)} className={`${themeClasses.textMuted} text-sm`}>Kapat</button>
        </div>
      )}

      <div className="p-4">
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-bold ${themeClasses.text}`}>{seciliGrup ? seciliGrup.isim : 'Takvimim'}</h2>
              <p className={`${themeClasses.textMuted} text-sm`}>{aylar[bugun.getMonth()]} {bugun.getFullYear()}</p>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className={`text-xs ${themeClasses.textMuted} text-center py-2`}></div>
            {haftaninGunleri.map((gun, i) => {
              const bugunMu = gun.toDateString() === bugun.toDateString();
              return (
                <div key={i} className={`text-center py-2 rounded-lg ${bugunMu ? 'bg-gold-500/20' : ''}`}>
                  <div className={`text-xs font-medium ${bugunMu ? 'text-gold-500' : themeClasses.textMuted}`}>{gunler[gun.getDay()]}</div>
                  <div className={`text-sm font-bold ${bugunMu ? 'text-gold-500' : themeClasses.text}`}>{gun.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div className="max-h-64 overflow-y-auto hide-scrollbar space-y-1">
            {saatler.map(saat => (
              <div key={saat} className="grid grid-cols-8 gap-1">
                <div className={`text-xs ${themeClasses.textMuted} text-center py-2`}>{saat}</div>
                {haftaninGunleri.map((gun, i) => (
                  <TakvimHucresi key={i} gun={gun} saat={saat} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {!seciliGrup && (
          <>
            <div className="card p-4 mb-4">
              <p className={`${themeClasses.textMuted} text-sm`}>Müsait olduğun zamanlara tıkla veya aşağıdan bir grup seç</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${themeClasses.text}`}>Gruplarım</h3>
              <button onClick={() => setModalAcik('yeniGrup')} className="text-gold-500 text-sm font-medium">+ Yeni</button>
            </div>

            {gruplar?.length > 0 ? (
              <div className="space-y-2">
                {gruplar.map(grup => (
                  <button
                    key={grup.id}
                    onClick={() => setSeciliGrup(grup)}
                    className="w-full card-hover p-4 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-100'} flex items-center justify-center text-xl`}>
                      {grup.emoji || '👥'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${themeClasses.text}`}>{grup.isim}</p>
                      <p className={`text-xs ${themeClasses.textMuted}`}>{grup.uyeler?.length || 1} kişi</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Henüz grup yok"
                description="Arkadaşlarınla gruplar oluştur"
                action={() => setModalAcik('yeniGrup')}
                actionLabel="Grup Oluştur"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Takvim;
