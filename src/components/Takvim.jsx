import React from 'react';
import { useData, useUI } from '../context';
import EmptyState from './EmptyState';
import Logo from './Logo';

const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const Takvim = () => {
  const { gruplar, etkinlikler, musaitlikler, musaitlikToggle } = useData();
  const { seciliGrup, setSeciliGrup, setSeciliZaman, setSeciliEtkinlik, setModalAcik } = useUI();

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
    return etkinlikler?.filter(e => {
      const eTarih = new Date(e.tarih);
      return eTarih.toDateString() === tarih.toDateString() && e.saat === saat;
    }) || [];
  };

  const TakvimHucresi = ({ gun, saat }) => {
    const key = `${gun.toDateString()}-${saat}`;
    const musait = musaitlikler?.[key];
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
        className={`h-10 rounded-lg transition-all text-xs font-medium ${
          gecmisMi
            ? 'bg-dark-800/30 cursor-not-allowed'
            : etkinlikVar
              ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-dark-900 shadow-gold'
              : musait
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/50'
        }`}
      >
        {etkinlikVar && <Logo size="xs" className="mx-auto" />}
        {!etkinlikVar && musait && '✓'}
      </button>
    );
  };

  return (
    <div className="pb-32">
      {seciliGrup && (
        <div className="glass p-4 flex items-center justify-between">
          <span className="text-white font-medium">{seciliGrup.isim}</span>
          <button onClick={() => setSeciliGrup(null)} className="text-dark-400 text-sm">Kapat</button>
        </div>
      )}

      <div className="p-4">
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white">{seciliGrup ? seciliGrup.isim : 'Takvimim'}</h2>
              <p className="text-dark-400 text-sm">{aylar[bugun.getMonth()]} {bugun.getFullYear()}</p>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-xs text-dark-500 text-center py-2"></div>
            {haftaninGunleri.map((gun, i) => {
              const bugunMu = gun.toDateString() === bugun.toDateString();
              return (
                <div key={i} className={`text-center py-2 rounded-lg ${bugunMu ? 'bg-gold-500/20' : ''}`}>
                  <div className={`text-xs font-medium ${bugunMu ? 'text-gold-500' : 'text-dark-500'}`}>{gunler[gun.getDay()]}</div>
                  <div className={`text-sm font-bold ${bugunMu ? 'text-gold-500' : 'text-white'}`}>{gun.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div className="max-h-64 overflow-y-auto hide-scrollbar space-y-1">
            {saatler.map(saat => (
              <div key={saat} className="grid grid-cols-8 gap-1">
                <div className="text-xs text-dark-500 text-center py-2">{saat}</div>
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
              <p className="text-dark-400 text-sm">Müsait olduğun zamanlara tıkla veya aşağıdan bir grup seç</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Gruplarım</h3>
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
                    <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-xl">
                      {grup.emoji || '👥'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{grup.isim}</p>
                      <p className="text-xs text-dark-400">{grup.uyeler?.length || 1} kişi</p>
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
