import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData, useUI } from '../context';

const Profil = () => {
  const navigate = useNavigate();
  const { kullanici, cikisYapFunc } = useAuth();
  const { gruplar, etkinlikler, arkadaslar } = useData();
  const { setModalAcik, bildirimGoster, tema } = useUI();

  const handleCikis = async () => {
    const result = await cikisYapFunc();
    if (result.success) {
      bildirimGoster(result.message);
      navigate('/giris');
    }
  };

  // Bekleyen istek sayısı
  const bekleyenIstekSayisi = kullanici?.arkadasIstekleri?.filter(
    i => i.durum === 'bekliyor'
  ).length || 0;

  return (
    <div className="pb-24 p-4">
      {/* Profil Kartı */}
      <div className={`${tema.bgCard} rounded-3xl p-6 ${tema.cardShadow} text-center mb-4 border ${tema.border}`}>
        <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl mx-auto flex items-center justify-center text-6xl shadow-xl">
          {kullanici?.avatar || '👨'}
        </div>
        <h2 className={`text-2xl font-black ${tema.text} mt-4`}>{kullanici?.isim || 'Kullanıcı'}</h2>
        <p className={tema.textSecondary}>{kullanici?.kullaniciAdi || '@kullanici'}</p>
        
        {/* İstatistikler */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{etkinlikler.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Plan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{gruplar.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Grup</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">{arkadaslar.length}</div>
            <div className={`text-xs ${tema.textSecondary}`}>Arkadaş</div>
          </div>
        </div>

        <button 
          onClick={() => setModalAcik('avatarDegistir')}
          className={`mt-4 ${tema.inputBg} ${tema.text} px-4 py-2 rounded-xl text-sm font-medium border ${tema.border}`}
        >
          🎨 Avatarı Değiştir
        </button>
      </div>

      {/* Arkadaşlık Butonları */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => setModalAcik('arkadaslar')}
          className={`${tema.bgCard} rounded-2xl p-4 ${tema.cardShadow} border ${tema.border} text-center ${tema.bgHover} transition-all`}
        >
          <span className="text-3xl">👥</span>
          <div className={`font-bold ${tema.text} mt-2`}>Arkadaşlarım</div>
          <div className={`text-sm ${tema.textSecondary}`}>{arkadaslar.length} kişi</div>
        </button>
        
        <button 
          onClick={() => setModalAcik('arkadasIstekleri')}
          className={`${tema.bgCard} rounded-2xl p-4 ${tema.cardShadow} border ${tema.border} text-center ${tema.bgHover} transition-all relative`}
        >
          <span className="text-3xl">📬</span>
          <div className={`font-bold ${tema.text} mt-2`}>İstekler</div>
          <div className={`text-sm ${tema.textSecondary}`}>
            {bekleyenIstekSayisi > 0 ? `${bekleyenIstekSayisi} yeni` : 'Yok'}
          </div>
          {bekleyenIstekSayisi > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {bekleyenIstekSayisi}
            </span>
          )}
        </button>
      </div>

      {/* Menü Listesi */}
      <div className={`${tema.bgCard} rounded-3xl ${tema.cardShadow} overflow-hidden border ${tema.border}`}>
        {[
          { icon: '🔔', text: 'Bildirimler', action: () => setModalAcik('bildirimler') },
          { icon: '📋', text: 'Bucket List', action: () => setModalAcik('bucketList') },
          { icon: '📸', text: 'Anılar', action: () => setModalAcik('galeri') },
          { icon: '👥', text: 'Gruplarım', action: () => navigate('/takvim') },
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
