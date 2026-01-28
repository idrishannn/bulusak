import React, { useState } from 'react';
import { useAuth, useData, useUI } from '../context';
import { mesajEkle } from '../services/etkinlikService';
import { kullaniciAra, arkadasIstegiGonder, arkadasSil, arkadasIstegiKabulEt, arkadasIstegiReddet } from '../services/arkadasService';

const grupIkonlari = ['🎓', '💼', '⚽', '🎮', '🎵', '🍕', '☕', '🎬', '🏖️', '🎉'];
const etkinlikIkonlari = { kahve: '☕', yemek: '🍕', film: '🎬', spor: '⚽', oyun: '🎮', parti: '🎉', toplanti: '💼', gezi: '🏖️', alisveris: '🛍️', konser: '🎵', diger: '📅' };
const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const gunlerTam = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '👨‍🦲', '🧔', '🧔‍♂️', '👱‍♂️', '👨‍🎓', '👨‍💼'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👩‍🔧', '👩‍🍳', '👩‍🎨'],
  fantastik: ['🤖', '👽', '👻', '🎃', '😺', '🦊', '🐶', '🐱', '🦁', '🦄']
};

// ============================================
// HIZLI PLAN MODAL (GRUPSUZ PLAN DESTEKLİ)
// ============================================
const HizliPlanModal = () => {
  const { kullanici } = useAuth();
  const { gruplar, arkadaslar, yeniGrupOlustur, yeniEtkinlikOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  
  const [baslik, setBaslik] = useState('');
  const [secilenIkon, setSecilenIkon] = useState('kahve');
  const [seciliTarih, setSeciliTarih] = useState(new Date());
  const [seciliSaat, setSeciliSaat] = useState('15:00');
  const [mekan, setMekan] = useState('');
  const [secimModu, setSecimModu] = useState('arkadas');
  const [secilenArkadaslar, setSecilenArkadaslar] = useState([]);
  const [secilenGrupId, setSecilenGrupId] = useState(null);
  const [yeniGrupModu, setYeniGrupModu] = useState(false);
  const [yeniGrupAdi, setYeniGrupAdi] = useState('');
  const [yeniGrupEmoji, setYeniGrupEmoji] = useState('🎉');
  const [yukleniyor, setYukleniyor] = useState(false);

  if (modalAcik !== 'hizliPlan') return null;

  const arkadasToggle = (arkadasId) => {
    setSecilenArkadaslar(prev => 
      prev.includes(arkadasId) ? prev.filter(id => id !== arkadasId) : [...prev, arkadasId]
    );
  };

  const handleOlustur = async () => {
    if (!baslik.trim()) { bildirimGoster('Plan adı gerekli!', 'hata'); return; }
    if (secimModu === 'arkadas' && secilenArkadaslar.length === 0) { bildirimGoster('En az bir arkadaş seç!', 'hata'); return; }
    if (secimModu === 'grup' && !secilenGrupId && !yeniGrupModu) { bildirimGoster('Bir grup seç veya oluştur!', 'hata'); return; }

    setYukleniyor(true);
    let hedefGrup = null;

    if (secimModu === 'grup') {
      if (yeniGrupModu && yeniGrupAdi.trim()) {
        const grupResult = await yeniGrupOlustur(yeniGrupAdi, yeniGrupEmoji);
        if (!grupResult.success) { setYukleniyor(false); return; }
        hedefGrup = grupResult.grup;
      } else {
        hedefGrup = gruplar.find(g => g.id === secilenGrupId);
      }
    }

    const planData = { baslik, ikon: secilenIkon, tarih: seciliTarih, saat: seciliSaat, mekan: mekan || 'Belirtilmedi', tip: secimModu };

    if (secimModu === 'arkadas') {
      planData.davetliler = secilenArkadaslar;
      planData.davetliDetaylar = arkadaslar.filter(a => secilenArkadaslar.includes(a.odUserId)).map(a => ({
        odUserId: a.odUserId, isim: a.isim, avatar: a.avatar, kullaniciAdi: a.kullaniciAdi
      }));
    }

    if (secimModu === 'grup' && hedefGrup) { planData.grup = hedefGrup; }

    const result = await yeniEtkinlikOlustur(planData);
    setYukleniyor(false);

    if (result.success) {
      bildirimGoster(result.message);
      setModalAcik(null);
      setBaslik(''); setMekan(''); setSecilenArkadaslar([]); setSecilenGrupId(null);
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[90vh] overflow-y-auto`}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-black ${tema.text}`}>⚡ Hızlı Plan</h3>
          <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
        </div>

        <div className="mb-4">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Plan Adı</label>
          <input type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="Ne yapalım?" className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400`} />
        </div>

        <div className="mb-4">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Kategori</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(etkinlikIkonlari).slice(0, 6).map(([key, icon]) => (
              <button key={key} type="button" onClick={() => setSecilenIkon(key)} className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${secilenIkon === key ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110' : `${tema.inputBg} ${tema.bgHover}`}`}>{icon}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>📅 Tarih</label>
            <input type="date" value={seciliTarih.toISOString().split('T')[0]} onChange={(e) => setSeciliTarih(new Date(e.target.value))} className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`} />
          </div>
          <div>
            <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>⏰ Saat</label>
            <select value={seciliSaat} onChange={(e) => setSeciliSaat(e.target.value)} className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`}>
              {saatler.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>📍 Mekan (Opsiyonel)</label>
          <input type="text" value={mekan} onChange={(e) => setMekan(e.target.value)} placeholder="Nerede buluşalım?" className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`} />
        </div>

        <div className="mb-4">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Kimlerle?</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSecimModu('arkadas')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${secimModu === 'arkadas' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : `${tema.inputBg} ${tema.text}`}`}>👥 Arkadaşlar</button>
            <button type="button" onClick={() => setSecimModu('grup')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${secimModu === 'grup' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : `${tema.inputBg} ${tema.text}`}`}>🏠 Grup</button>
          </div>
        </div>

        {secimModu === 'arkadas' && (
          <div className="mb-6">
            {arkadaslar.length > 0 ? (
              <>
                <div className={`text-xs ${tema.textMuted} mb-2`}>{secilenArkadaslar.length} arkadaş seçildi</div>
                <div className={`${tema.inputBg} rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2`}>
                  {arkadaslar.map(arkadas => (
                    <button key={arkadas.odUserId} type="button" onClick={() => arkadasToggle(arkadas.odUserId)} className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${secilenArkadaslar.includes(arkadas.odUserId) ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : `${tema.bgCard} ${tema.text} hover:bg-orange-50`}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${secilenArkadaslar.includes(arkadas.odUserId) ? 'bg-white/20' : 'bg-gradient-to-br from-orange-400 to-amber-400'}`}>{arkadas.avatar || '👤'}</div>
                      <div className="flex-1 text-left">
                        <div className="font-bold">{arkadas.isim || 'Kullanıcı'}</div>
                        <div className={`text-xs ${secilenArkadaslar.includes(arkadas.odUserId) ? 'text-white/70' : tema.textSecondary}`}>{arkadas.kullaniciAdi}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${secilenArkadaslar.includes(arkadas.odUserId) ? 'bg-white text-orange-500 border-white' : 'border-gray-300'}`}>{secilenArkadaslar.includes(arkadas.odUserId) && '✓'}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={`${tema.inputBg} rounded-2xl p-6 text-center`}>
                <span className="text-4xl">👥</span>
                <p className={`${tema.text} font-bold mt-2`}>Henüz arkadaşın yok</p>
                <p className={`${tema.textSecondary} text-sm mt-1`}>Profil sayfasından arkadaş ekleyebilirsin</p>
              </div>
            )}
          </div>
        )}

        {secimModu === 'grup' && (
          <div className="mb-6">
            {!yeniGrupModu ? (
              <>
                {gruplar.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                    {gruplar.map(g => (
                      <button key={g.id} type="button" onClick={() => setSecilenGrupId(g.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${secilenGrupId === g.id ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : `${tema.inputBg} ${tema.text}`}`}>
                        <span>{g.emoji}</span><span className="font-medium">{g.isim}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => setYeniGrupModu(true)} className={`w-full p-3 rounded-xl border-2 border-dashed border-orange-300 ${tema.text} text-sm font-medium hover:bg-orange-50 transition-all`}>➕ Yeni Grup Oluştur</button>
              </>
            ) : (
              <div className={`${tema.inputBg} rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <button type="button" onClick={() => setYeniGrupModu(false)} className="text-orange-500 font-bold">←</button>
                  <span className={`font-bold ${tema.text}`}>Yeni Grup</span>
                </div>
                <input type="text" value={yeniGrupAdi} onChange={(e) => setYeniGrupAdi(e.target.value)} placeholder="Grup adı" className={`w-full ${tema.bgCard} ${tema.inputText} rounded-xl p-3 mb-3 border ${tema.border}`} />
                <div className="flex gap-2 flex-wrap">
                  {grupIkonlari.map((emoji, i) => (
                    <button key={i} type="button" onClick={() => setYeniGrupEmoji(emoji)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${yeniGrupEmoji === emoji ? 'bg-orange-200 scale-110' : tema.bgCard}`}>{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button type="button" onClick={handleOlustur} disabled={yukleniyor} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 hover:shadow-xl transition-all">
          {yukleniyor ? '⏳ Oluşturuluyor...' : 'Plan Oluştur 🚀'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// ARKADAŞLAR MODAL
// ============================================
const ArkadaslarModal = () => {
  const { kullanici } = useAuth();
  const { arkadaslar } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  const [aktifTab, setAktifTab] = useState('liste');
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaYukleniyor, setAramaYukleniyor] = useState(false);
  const [aramaSonuclari, setAramaSonuclari] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  React.useEffect(() => {
    if (!aramaMetni || aramaMetni.length < 1) { setAramaSonuclari([]); return; }
    const timeoutId = setTimeout(async () => {
      setAramaYukleniyor(true);
      const result = await kullaniciAra(aramaMetni);
      if (result.success) { setAramaSonuclari(result.kullanicilar.filter(k => k.odUserId !== kullanici?.odUserId)); }
      setAramaYukleniyor(false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [aramaMetni, kullanici]);

  if (modalAcik !== 'arkadaslar') return null;

  const handleIstekGonder = async (alici) => {
    setYukleniyor(true);
    const result = await arkadasIstegiGonder(kullanici, alici.odUserId);
    setYukleniyor(false);
    if (result.success) { bildirimGoster(result.message); setAramaSonuclari(prev => prev.map(k => k.odUserId === alici.odUserId ? { ...k, istekGonderildi: true } : k)); }
    else bildirimGoster(result.error, 'hata');
  };

  const handleArkadasSil = async (arkadasId) => {
    if (!window.confirm('Arkadaşlıktan çıkarmak istediğine emin misin?')) return;
    setYukleniyor(true);
    const result = await arkadasSil(kullanici, arkadasId);
    setYukleniyor(false);
    if (result.success) bildirimGoster(result.message);
    else bildirimGoster(result.error, 'hata');
  };

  const arkadasMi = (userId) => kullanici?.arkadaslar?.includes(userId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[85vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-black ${tema.text}`}>👥 Arkadaşlar</h3>
            <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setAktifTab('liste')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${aktifTab === 'liste' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : `${tema.inputBg} ${tema.text}`}`}>📋 Arkadaşlarım</button>
            <button type="button" onClick={() => setAktifTab('ara')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${aktifTab === 'ara' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' : `${tema.inputBg} ${tema.text}`}`}>🔍 Kişi Ara</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {aktifTab === 'ara' && (
            <>
              <div className="mb-4 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input type="text" value={aramaMetni} onChange={(e) => setAramaMetni(e.target.value.replace('@', ''))} placeholder="kullanıcı adı ara..." className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 pl-9 focus:outline-none focus:ring-2 focus:ring-orange-400`} />
                {aramaYukleniyor && <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin">⏳</span>}
              </div>
              {aramaSonuclari.length > 0 ? (
                <div className="space-y-2">
                  {aramaSonuclari.map(kisi => (
                    <div key={kisi.odUserId} className={`flex items-center gap-3 p-3 rounded-2xl ${tema.inputBg}`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-2xl">{kisi.avatar || '👤'}</div>
                      <div className="flex-1"><div className={`font-bold ${tema.text}`}>{kisi.isim || 'Kullanıcı'}</div><div className={`text-sm ${tema.textSecondary}`}>{kisi.kullaniciAdi || '@kullanici'}</div></div>
                      {arkadasMi(kisi.odUserId) ? <span className="text-green-500 text-sm font-bold">✓ Arkadaş</span>
                       : kisi.istekGonderildi ? <span className="text-orange-500 text-sm font-bold">⏳ Gönderildi</span>
                       : <button type="button" onClick={() => handleIstekGonder(kisi)} disabled={yukleniyor} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">+ Ekle</button>}
                    </div>
                  ))}
                </div>
              ) : aramaMetni.length >= 1 && !aramaYukleniyor ? (
                <div className="text-center py-8"><span className="text-4xl">🔍</span><p className={`${tema.textSecondary} mt-2`}>Kullanıcı bulunamadı</p></div>
              ) : (
                <div className="text-center py-8"><span className="text-4xl">👋</span><p className={`${tema.textSecondary} mt-2`}>Kullanıcı adı yazarak ara</p></div>
              )}
            </>
          )}
          {aktifTab === 'liste' && (
            arkadaslar.length > 0 ? (
              <div className="space-y-2">
                {arkadaslar.map(arkadas => (
                  <div key={arkadas.odUserId} className={`flex items-center gap-3 p-3 rounded-2xl ${tema.inputBg}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-2xl">{arkadas.avatar || '👤'}</div>
                    <div className="flex-1"><div className={`font-bold ${tema.text}`}>{arkadas.isim || 'Kullanıcı'}</div><div className={`text-sm ${tema.textSecondary}`}>{arkadas.kullaniciAdi || '@kullanici'}</div></div>
                    <button type="button" onClick={() => handleArkadasSil(arkadas.odUserId)} className={`${tema.textMuted} hover:text-red-500 transition-colors p-2`}>🗑️</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8"><span className="text-6xl">👥</span><p className={`${tema.text} font-bold mt-4`}>Henüz arkadaşın yok</p><button type="button" onClick={() => setAktifTab('ara')} className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl font-bold">🔍 Kişi Ara</button></div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ARKADAŞ İSTEKLERİ MODAL
// ============================================
const ArkadasIstekleriModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  const [yukleniyor, setYukleniyor] = useState(null);

  if (modalAcik !== 'arkadasIstekleri') return null;

  const bekleyenIstekler = kullanici?.arkadasIstekleri?.filter(i => i.durum === 'bekliyor') || [];

  const handleKabulEt = async (id) => { setYukleniyor(id); const r = await arkadasIstegiKabulEt(kullanici, id); setYukleniyor(null); r.success ? bildirimGoster(r.message) : bildirimGoster(r.error, 'hata'); };
  const handleReddet = async (id) => { setYukleniyor(id); const r = await arkadasIstegiReddet(kullanici, id); setYukleniyor(null); r.success ? bildirimGoster(r.message) : bildirimGoster(r.error, 'hata'); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[70vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="flex items-center justify-between">
            <div><h3 className={`text-xl font-black ${tema.text}`}>📬 İstekler</h3>{bekleyenIstekler.length > 0 && <p className={`text-sm ${tema.textSecondary}`}>{bekleyenIstekler.length} bekleyen</p>}</div>
            <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {bekleyenIstekler.length > 0 ? bekleyenIstekler.map((i, idx) => (
            <div key={i.kimden + idx} className={`${tema.inputBg} rounded-2xl p-4 mb-3`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center text-3xl">{i.kimdenAvatar || '👤'}</div>
                <div className="flex-1"><div className={`font-bold ${tema.text}`}>{i.kimdenIsim}</div><div className={`text-sm ${tema.textSecondary}`}>{i.kimdenKullaniciAdi}</div></div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleKabulEt(i.kimden)} disabled={yukleniyor === i.kimden} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50">{yukleniyor === i.kimden ? '⏳' : '✓ Kabul'}</button>
                <button type="button" onClick={() => handleReddet(i.kimden)} disabled={yukleniyor === i.kimden} className={`flex-1 ${tema.bgCard} ${tema.text} py-2 rounded-xl font-bold text-sm border ${tema.border}`}>✕ Reddet</button>
              </div>
            </div>
          )) : <div className="text-center py-12"><span className="text-6xl">📭</span><p className={`${tema.text} font-bold mt-4`}>İstek yok</p></div>}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ETKİNLİK DETAY MODAL
// ============================================
const EtkinlikDetayModal = () => {
  const { kullanici } = useAuth();
  const { katilimDurumuGuncelle } = useData();
  const { modalAcik, setModalAcik, seciliEtkinlik, setSeciliEtkinlik, bildirimGoster, tema } = useUI();
  const [yeniMesaj, setYeniMesaj] = useState('');

  if (modalAcik !== 'detay' || !seciliEtkinlik) return null;

  const tarih = new Date(seciliEtkinlik.tarih);
  const katilimcilar = seciliEtkinlik.katilimcilar || [];
  const varimSayisi = katilimcilar.filter(k => k.durum === 'varim').length;
  const kullanicininDurumu = katilimcilar.find(k => k.odUserId === kullanici?.odUserId)?.durum;
  const benimPlanim = seciliEtkinlik.olusturanId === kullanici?.odUserId;

  const mesajGonder = async (e) => {
    if (e) e.preventDefault();
    if (!yeniMesaj.trim() || !seciliEtkinlik?.id) return;
    const sonuc = await mesajEkle(seciliEtkinlik.id, { odUserId: kullanici?.odUserId, isim: kullanici?.isim, avatar: kullanici?.avatar, mesaj: yeniMesaj });
    if (sonuc.success) { setSeciliEtkinlik(prev => ({ ...prev, mesajlar: [...(prev.mesajlar || []), sonuc.mesaj] })); setYeniMesaj(''); }
  };

  const handleKatilim = (durum) => { const r = katilimDurumuGuncelle(seciliEtkinlik.id, durum); bildirimGoster(r.message); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[95vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">{etkinlikIkonlari[seciliEtkinlik.ikon]}</div>
              <div><h3 className={`text-xl font-black ${tema.text}`}>{seciliEtkinlik.baslik}</h3><p className={tema.textSecondary}>{seciliEtkinlik.grup ? `${seciliEtkinlik.grup.emoji} ${seciliEtkinlik.grup.isim}` : `👥 ${seciliEtkinlik.davetliDetaylar?.length || 0} kişi davetli`}</p></div>
            </div>
            <button type="button" onClick={() => { setModalAcik(null); setSeciliEtkinlik(null); }} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${tema.inputBg} rounded-xl p-3`}><div className={`text-xs ${tema.textMuted}`}>📅 Tarih</div><div className={`font-bold ${tema.text}`}>{gunlerTam[tarih.getDay()]}</div><div className={`text-sm ${tema.textSecondary}`}>{tarih.getDate()} {aylar[tarih.getMonth()]}</div></div>
            <div className={`${tema.inputBg} rounded-xl p-3`}><div className={`text-xs ${tema.textMuted}`}>⏰ Saat</div><div className={`font-bold ${tema.text}`}>{seciliEtkinlik.saat}</div><div className={`text-sm ${tema.textSecondary}`}>📍 {seciliEtkinlik.mekan}</div></div>
          </div>
          {!benimPlanim && (
            <div className="flex gap-2 mb-4">
              {[{ d: 'varim', l: '✓ Varım', c: 'from-green-500 to-emerald-500' }, { d: 'bakariz', l: '🤔 Bakarız', c: 'from-yellow-500 to-orange-500' }, { d: 'yokum', l: '✗ Yokum', c: 'from-red-500 to-rose-500' }].map(b => (
                <button key={b.d} type="button" onClick={() => handleKatilim(b.d)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${kullanicininDurumu === b.d ? `bg-gradient-to-r ${b.c} text-white shadow-lg scale-105` : `${tema.inputBg} ${tema.text}`}`}>{b.l}</button>
              ))}
            </div>
          )}
          {benimPlanim && <div className={`${tema.inputBg} rounded-xl p-3 mb-4 text-center`}><span className="text-orange-500 font-bold">👑 Senin planın</span></div>}
          {seciliEtkinlik.davetliDetaylar?.length > 0 && (
            <div className="mb-4"><div className={`text-sm font-bold ${tema.textSecondary} mb-2`}>Davetliler</div><div className="flex flex-wrap gap-2">{seciliEtkinlik.davetliDetaylar.map((d, i) => <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${tema.inputBg}`}><span>{d.avatar || '👤'}</span><span className={tema.text}>{d.isim}</span></div>)}</div></div>
          )}
          <div><div className={`text-sm font-bold ${tema.textSecondary} mb-2`}>Katılımcılar ({varimSayisi})</div><div className="flex flex-wrap gap-2">{katilimcilar.length > 0 ? katilimcilar.map((k, i) => <div key={i} className={`px-3 py-2 rounded-xl text-sm ${k.durum === 'varim' ? 'bg-green-100 text-green-700' : k.durum === 'bakariz' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{k.odUserId === kullanici?.odUserId ? 'Sen' : 'Katılımcı'}</div>) : <p className={tema.textSecondary}>Henüz yanıt yok</p>}</div></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(seciliEtkinlik.mesajlar || []).map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.odUserId === kullanici?.odUserId ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-sm">{m.avatar || '👤'}</div>
              <div className={`max-w-[70%] ${m.odUserId === kullanici?.odUserId ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : tema.inputBg} rounded-2xl px-4 py-2`}>
                <div className={`text-xs ${m.odUserId === kullanici?.odUserId ? 'text-white/70' : tema.textMuted}`}>{m.isim}</div>
                <div className={m.odUserId === kullanici?.odUserId ? 'text-white' : tema.text}>{m.mesaj}</div>
                <div className={`text-xs ${m.odUserId === kullanici?.odUserId ? 'text-white/50' : tema.textMuted} text-right`}>{m.zaman}</div>
              </div>
            </div>
          ))}
          {(!seciliEtkinlik.mesajlar || seciliEtkinlik.mesajlar.length === 0) && <div className="text-center py-8"><span className="text-4xl">💬</span><p className={`${tema.textSecondary} mt-2`}>Henüz mesaj yok</p></div>}
        </div>
        <div className={`p-4 border-t ${tema.border}`}>
          <div className="flex gap-2">
            <input type="text" value={yeniMesaj} onChange={(e) => setYeniMesaj(e.target.value)} placeholder="Mesaj yaz..." onKeyPress={(e) => e.key === 'Enter' && mesajGonder(e)} className={`flex-1 ${tema.inputBg} ${tema.inputText} rounded-xl px-4 py-3 focus:outline-none`} />
            <button type="button" onClick={mesajGonder} className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white">📤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DİĞER MODALLAR (Kısa versiyon)
// ============================================
const YeniGrupModal = () => {
  const { yeniGrupOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  const [grupAdi, setGrupAdi] = useState('');
  const [secilenEmoji, setSecilenEmoji] = useState('🎉');
  const [yukleniyor, setYukleniyor] = useState(false);
  if (modalAcik !== 'yeniGrup') return null;
  const handleOlustur = async () => { if (!grupAdi.trim()) return; setYukleniyor(true); const r = await yeniGrupOlustur(grupAdi, secilenEmoji); setYukleniyor(false); if (r.success) { bildirimGoster(r.message); setModalAcik(null); setGrupAdi(''); } };
  return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"><div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up`}><div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div><div className="flex items-center justify-between mb-6"><h3 className={`text-xl font-black ${tema.text}`}>👥 Yeni Grup</h3><button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button></div><input type="text" value={grupAdi} onChange={(e) => setGrupAdi(e.target.value)} placeholder="Grup adı" className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 mb-4`} /><div className="flex flex-wrap gap-2 mb-6">{grupIkonlari.map((e, i) => <button key={i} type="button" onClick={() => setSecilenEmoji(e)} className={`w-11 h-11 rounded-xl text-xl ${secilenEmoji === e ? 'bg-gradient-to-br from-orange-400 to-amber-400 scale-110' : tema.inputBg}`}>{e}</button>)}</div><button type="button" onClick={handleOlustur} disabled={yukleniyor} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold">{yukleniyor ? '⏳' : 'Oluştur 🎉'}</button></div></div>);
};

const BucketListModal = () => { const { bucketList, bucketListEkle, bucketListToggle, bucketListSil } = useData(); const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI(); const [yeniItem, setYeniItem] = useState(''); if (modalAcik !== 'bucketList') return null; const ekle = () => { if (!yeniItem.trim()) return; bucketListEkle({ baslik: yeniItem, emoji: '🎯' }); setYeniItem(''); bildirimGoster('Eklendi! ✨'); }; return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"><div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up max-h-[85vh] flex flex-col`}><div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div><div className="flex items-center justify-between mb-4"><h3 className={`text-xl font-black ${tema.text}`}>📋 Bucket List</h3><button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center`}>✕</button></div><div className="flex gap-2 mb-4"><input type="text" value={yeniItem} onChange={(e) => setYeniItem(e.target.value)} placeholder="Ekle..." onKeyPress={(e) => e.key === 'Enter' && ekle()} className={`flex-1 ${tema.inputBg} ${tema.inputText} rounded-xl px-4 py-3`} /><button type="button" onClick={ekle} className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white text-xl">+</button></div><div className="flex-1 overflow-y-auto space-y-2">{bucketList.map(i => <div key={i.id} className={`flex items-center gap-3 p-4 rounded-2xl ${i.tamamlandi ? 'bg-green-50' : tema.inputBg}`}><button type="button" onClick={() => bucketListToggle(i.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${i.tamamlandi ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{i.tamamlandi && '✓'}</button><span className={`flex-1 ${i.tamamlandi ? 'line-through text-gray-400' : tema.text}`}>{i.baslik}</span><button type="button" onClick={() => bucketListSil(i.id)} className="text-red-400">🗑️</button></div>)}</div></div></div>); };
const BildirimlerModal = () => { const { modalAcik, setModalAcik, bildirimler, tema } = useUI(); if (modalAcik !== 'bildirimler') return null; return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"><div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up max-h-[70vh]`}><div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div><div className="flex items-center justify-between mb-4"><h3 className={`text-xl font-black ${tema.text}`}>🔔 Bildirimler</h3><button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center`}>✕</button></div>{bildirimler.length > 0 ? bildirimler.map(b => <div key={b.id} className={`p-4 rounded-2xl mb-2 ${b.okundu ? tema.inputBg : 'bg-orange-50'}`}><p className={tema.text}>{b.mesaj}</p></div>) : <div className="text-center py-8"><span className="text-4xl">🔕</span><p className={tema.textSecondary}>Bildirim yok</p></div>}</div></div>); };
const GaleriModal = () => { const { galeri, galeriyeEkle } = useData(); const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI(); if (modalAcik !== 'galeri') return null; return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"><div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up max-h-[85vh] flex flex-col`}><div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div><div className="flex items-center justify-between mb-4"><h3 className={`text-xl font-black ${tema.text}`}>📸 Anılar</h3><button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center`}>✕</button></div><button type="button" onClick={() => { galeriyeEkle(); bildirimGoster('Eklendi! 📸'); }} className={`w-full ${tema.inputBg} border-2 border-dashed rounded-2xl p-6 mb-4 flex flex-col items-center`}><span className="text-4xl">📷</span><span className={tema.text}>Fotoğraf Ekle</span></button><div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3">{galeri.map(f => <div key={f.id} className="aspect-square bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl flex items-center justify-center text-6xl">📸</div>)}</div></div></div>); };
const AvatarDegistirModal = () => { const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, avatarGuncelle } = useAuth(); const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI(); if (modalAcik !== 'avatarDegistir') return null; return (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"><div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up`}><div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div><div className="flex items-center justify-between mb-4"><h3 className={`text-xl font-black ${tema.text}`}>🎨 Avatar</h3><button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center`}>✕</button></div><div className="flex justify-center gap-2 mb-4">{['erkek', 'kadin', 'fantastik'].map(k => <button key={k} type="button" onClick={() => setAvatarKategori(k)} className={`w-12 h-12 rounded-xl text-2xl ${avatarKategori === k ? 'bg-gradient-to-r from-orange-500 to-amber-500 scale-110' : tema.inputBg}`}>{k === 'erkek' ? '👨' : k === 'kadin' ? '👩' : '🦄'}</button>)}</div><div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto mb-4">{avatarlar[avatarKategori].map((a, i) => <button key={i} type="button" onClick={() => setSeciliAvatar(a)} className={`w-14 h-14 rounded-2xl text-3xl ${seciliAvatar === a ? 'bg-gradient-to-br from-orange-400 to-amber-400 scale-110 ring-4 ring-orange-300' : tema.inputBg}`}>{a}</button>)}</div><button type="button" onClick={() => { avatarGuncelle(seciliAvatar); setModalAcik(null); bildirimGoster('Avatar güncellendi! ✨'); }} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold">Kaydet</button></div></div>); };

// ============================================
// TÜM MODALLAR
// ============================================
const AppModals = () => (
  <>
    <HizliPlanModal />
    <ArkadaslarModal />
    <ArkadasIstekleriModal />
    <EtkinlikDetayModal />
    <YeniGrupModal />
    <BucketListModal />
    <BildirimlerModal />
    <GaleriModal />
    <AvatarDegistirModal />
  </>
);

export default AppModals;
