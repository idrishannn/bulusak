import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData, useUI } from '../context';

const Profil = () => {
  const navigate = useNavigate();
  const { kullanici, cikisYapFunc } = useAuth();
  const { gruplar, etkinlikler, arkadaslar } = useData();
  const { setModalAcik, bildirimGoster } = useUI();

  const handleCikis = async () => {
    const result = await cikisYapFunc();
    if (result.success) {
      bildirimGoster(result.message);
      navigate('/giris');
    }
  };

  const bekleyenIstekSayisi = kullanici?.arkadasIstekleri?.filter(
    i => i.durum === 'bekliyor'
  ).length || 0;

  return (
    <div className="pb-32 p-4">
      <div className="glass-panel-active rounded-3xl p-6 text-center mb-4 border border-white/20">
        <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl mx-auto flex items-center justify-center text-6xl shadow-xl shadow-orange-500/30">
          {kullanici?.avatar || '👨'}
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">{kullanici?.isim || 'Kullanıcı'}</h2>
        <p className="text-white/60">{kullanici?.kullaniciAdi || '@kullanici'}</p>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-3xl font-black text-orange-400">{etkinlikler.length}</div>
            <div className="text-xs text-white/60">Plan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-400">{gruplar.length}</div>
            <div className="text-xs text-white/60">Grup</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-400">{arkadaslar.length}</div>
            <div className="text-xs text-white/60">Arkadaş</div>
          </div>
        </div>

        <button 
          onClick={() => setModalAcik('avatarDegistir')}
          className="mt-4 glass-input text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition"
        >
          🎨 Avatarı Değiştir
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => setModalAcik('arkadaslar')}
          className="glass-card rounded-2xl p-4 text-center hover:bg-white/15 transition-all active:scale-[0.98]"
        >
          <span className="text-3xl">👥</span>
          <div className="font-bold text-white mt-2">Arkadaşlarım</div>
          <div className="text-sm text-white/60">{arkadaslar.length} kişi</div>
        </button>
        
        <button 
          onClick={() => setModalAcik('arkadasIstekleri')}
          className="glass-card rounded-2xl p-4 text-center hover:bg-white/15 transition-all active:scale-[0.98] relative"
        >
          <span className="text-3xl">📬</span>
          <div className="font-bold text-white mt-2">İstekler</div>
          <div className="text-sm text-white/60">
            {bekleyenIstekSayisi > 0 ? `${bekleyenIstekSayisi} yeni` : 'Yok'}
          </div>
          {bekleyenIstekSayisi > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {bekleyenIstekSayisi}
            </span>
          )}
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        {[
          { icon: '🔔', text: 'Bildirimler', action: () => setModalAcik('bildirimler') },
          { icon: '📋', text: 'Bucket List', action: () => setModalAcik('bucketList') },
          { icon: '📸', text: 'Anılar', action: () => setModalAcik('galeri') },
          { icon: '👥', text: 'Gruplarım', action: () => navigate('/takvim') },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={item.action}
            className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-all border-b border-white/10 last:border-b-0"
          >
            <span className="flex items-center gap-3 text-white">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </span>
            <span className="text-white/40">→</span>
          </button>
        ))}
        <button 
          onClick={handleCikis}
          className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-all text-red-400"
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
