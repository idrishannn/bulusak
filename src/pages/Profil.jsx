import React from 'react';
import { useAuth, useData, useUI } from '../context';

const Profil = () => {
  const { kullanici, cikisYapFunc } = useAuth();
  const { gruplar, etkinlikler } = useData();
  const { setAktifSayfa, setModalAcik, bildirimGoster, tema } = useUI();

  const handleCikis = async () => {
    const result = await cikisYapFunc();
    if (result.success) {
      bildirimGoster(result.message);
    }
  };

  return (
    <div className="pb-24 p-4">
      <div className={`${tema.bgCard} rounded-3xl p-6 ${tema.cardShadow} text-center mb-4 border ${tema.border}`}>
        <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl mx-auto flex items-center justify-center text-6xl shadow-xl">
          {kullanici?.avatar || '👨'}
        </div>
        <h2 className={`text-2xl font-black ${tema.text} mt-4`}>{kullanici?.isim || 'Kullanıcı'}</h2>
        <p className={tema.textSecondary}>{kullanici?.kullaniciAdi || '@kullanici'}</p>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{etkinlikler.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Plan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{gruplar.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Grup</div>
          </div>
        </div>

        <button 
          onClick={() => setModalAcik('avatarDegistir')}
          className={`mt-4 ${tema.inputBg} ${tema.text} px-4 py-2 rounded-xl text-sm font-medium border ${tema.border}`}
        >
          🎨 Avatarı Değiştir
        </button>
      </div>

      <div className={`${tema.bgCard} rounded-3xl ${tema.cardShadow} overflow-hidden border ${tema.border}`}>
        {[
          { icon: '🔔', text: 'Bildirimler', action: () => setModalAcik('bildirimler') },
          { icon: '📋', text: 'Bucket List', action: () => setModalAcik('bucketList') },
          { icon: '📸', text: 'Anılar', action: () => setModalAcik('galeri') },
          { icon: '👥', text: 'Gruplarım', action: () => setAktifSayfa('takvim') },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={item.action}
            className={`w-full p-4 flex items-center justify-between ${tema.bgHover} transition-all border-b ${tema.border} last:border-b-0`}
          >
            <span className={`flex items-center gap-3 ${tema.text}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </span>
            <span className={tema.textSecondary}>→</span>
          </button>
        ))}
        <button 
          onClick={handleCikis}
          className={`w-full p-4 flex items-center justify-between ${tema.bgHover} transition-all text-red-500`}
        >
          <span className="flex items-center gap-3">
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış Yap</span>
          </span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default Profil;
