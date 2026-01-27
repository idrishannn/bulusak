import React, { useState } from 'react';
import { useAuth, useData, useUI } from '../context';
import { mesajEkle } from '../services/etkinlikService';

const grupIkonlari = ['🎓', '💼', '⚽', '🎮', '🎵', '🍕', '☕', '🎬', '🏖️', '🎉', '👨‍👩‍👧‍👦', '🏋️', '📚', '🎨', '🚗', '✈️', '🏠', '💪', '🎸', '🍺'];
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
// YENİ GRUP MODAL
// ============================================
const YeniGrupModal = () => {
  const { yeniGrupOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  const [grupAdi, setGrupAdi] = useState('');
  const [secilenEmoji, setSecilenEmoji] = useState('🎉');
  const [yukleniyor, setYukleniyor] = useState(false);

  if (modalAcik !== 'yeniGrup') return null;

  const handleOlustur = async () => {
    if (!grupAdi.trim()) {
      bildirimGoster('Grup adı gerekli!', 'hata');
      return;
    }
    setYukleniyor(true);
    const result = await yeniGrupOlustur(grupAdi, secilenEmoji);
    setYukleniyor(false);
    if (result.success) {
      bildirimGoster(result.message);
      setModalAcik(null);
      setGrupAdi('');
    } else {
      bildirimGoster(result.error, 'hata');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[85vh] overflow-y-auto`}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-black ${tema.text}`}>👥 Yeni Grup Oluştur</h3>
          <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
        </div>
        <div className="mb-4">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Grup Adı</label>
          <input type="text" value={grupAdi} onChange={(e) => setGrupAdi(e.target.value)} placeholder="Cuma Akşamı Ekibi" className={`w-full ${tema.inputBg} ${tema.inputText} rounded-2xl p-4 border-2 border-transparent focus:border-orange-400 focus:outline-none`} />
        </div>
        <div className="mb-6">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>Grup İkonu</label>
          <div className="flex flex-wrap gap-2">
            {grupIkonlari.map((emoji, i) => (
              <button key={i} type="button" onClick={() => setSecilenEmoji(emoji)} className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${secilenEmoji === emoji ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110' : `${tema.inputBg} ${tema.bgHover}`}`}>{emoji}</button>
            ))}
          </div>
        </div>
        <button type="button" onClick={handleOlustur} disabled={yukleniyor} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50">
          {yukleniyor ? '⏳ Oluşturuluyor...' : 'Grup Oluştur 🎉'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// HIZLI PLAN MODAL
// ============================================
const HizliPlanModal = () => {
  const { gruplar, yeniGrupOlustur, yeniEtkinlikOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  
  const [baslik, setBaslik] = useState('');
  const [secilenIkon, setSecilenIkon] = useState('kahve');
  const [seciliTarih, setSeciliTarih] = useState(new Date());
  const [seciliSaat, setSeciliSaat] = useState('15:00');
  const [mekan, setMekan] = useState('');
  const [secilenGrupId, setSecilenGrupId] = useState(gruplar[0]?.id);
  const [yeniGrupModu, setYeniGrupModu] = useState(false);
  const [yeniGrupAdi, setYeniGrupAdi] = useState('');
  const [yeniGrupEmoji, setYeniGrupEmoji] = useState('🎉');
  const [yukleniyor, setYukleniyor] = useState(false);

  if (modalAcik !== 'hizliPlan') return null;

  const handleOlustur = async () => {
    if (!baslik.trim()) {
      bildirimGoster('Plan adı gerekli!', 'hata');
      return;
    }
    
    setYukleniyor(true);
    let hedefGrup;
    
    if (yeniGrupModu && yeniGrupAdi.trim()) {
      const grupResult = await yeniGrupOlustur(yeniGrupAdi, yeniGrupEmoji);
      if (!grupResult.success) {
        setYukleniyor(false);
        return;
      }
      hedefGrup = grupResult.grup;
    } else {
      hedefGrup = gruplar.find(g => g.id === secilenGrupId);
    }

    if (!hedefGrup) {
      bildirimGoster('Lütfen bir grup seç veya oluştur!', 'hata');
      setYukleniyor(false);
      return;
    }

    const result = await yeniEtkinlikOlustur({ baslik, ikon: secilenIkon, tarih: seciliTarih, saat: seciliSaat, mekan: mekan || 'Belirtilmedi', grup: hedefGrup });
    setYukleniyor(false);
    
    if (result.success) {
      bildirimGoster(result.message);
      setModalAcik(null);
      setBaslik('');
      setMekan('');
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
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>👥 Grup</label>
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
              <button type="button" onClick={() => setYeniGrupModu(true)} className={`w-full p-2 rounded-xl border-2 border-dashed border-orange-300 ${tema.text} text-sm font-medium`}>➕ Yeni Grup Oluştur</button>
            </>
          ) : (
            <div className={`${tema.inputBg} rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => setYeniGrupModu(false)} className="text-orange-500">←</button>
                <span className={`font-bold ${tema.text}`}>Yeni Grup</span>
              </div>
              <input type="text" value={yeniGrupAdi} onChange={(e) => setYeniGrupAdi(e.target.value)} placeholder="Grup adı" className={`w-full ${tema.bgCard} ${tema.inputText} rounded-xl p-3 mb-3 border ${tema.border}`} />
              <div className="flex gap-2 flex-wrap">
                {grupIkonlari.slice(0, 10).map((emoji, i) => (
                  <button key={i} type="button" onClick={() => setYeniGrupEmoji(emoji)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${yeniGrupEmoji === emoji ? 'bg-orange-200' : tema.bgCard}`}>{emoji}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className={`text-sm font-bold ${tema.textSecondary} mb-2 block`}>📍 Mekan (Opsiyonel)</label>
          <input type="text" value={mekan} onChange={(e) => setMekan(e.target.value)} placeholder="Nerede buluşalım?" className={`w-full ${tema.inputBg} ${tema.inputText} rounded-xl p-3 focus:outline-none`} />
        </div>

        <button type="button" onClick={handleOlustur} disabled={yukleniyor} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50">
          {yukleniyor ? '⏳ Oluşturuluyor...' : 'Plan Oluştur 🚀'}
        </button>
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

  const mesajGonder = async (e) => {
    if (e) e.preventDefault();
    if (!yeniMesaj.trim() || !seciliEtkinlik?.id) return;
    
    try {
      const sonuc = await mesajEkle(seciliEtkinlik.id, { odUserId: kullanici?.odUserId, isim: kullanici?.isim, avatar: kullanici?.avatar, mesaj: yeniMesaj });
      if (sonuc.success) {
        setSeciliEtkinlik(prev => ({ ...prev, mesajlar: [...(prev.mesajlar || []), sonuc.mesaj] }));
        setYeniMesaj('');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  const handleKatilim = (durum) => {
    const result = katilimDurumuGuncelle(seciliEtkinlik.id, durum);
    bildirimGoster(result.message);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg animate-slide-up border-t ${tema.border} max-h-[95vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg">{etkinlikIkonlari[seciliEtkinlik.ikon]}</div>
              <div>
                <h3 className={`text-xl font-black ${tema.text}`}>{seciliEtkinlik.baslik}</h3>
                <p className={tema.textSecondary}>{seciliEtkinlik.grup?.emoji} {seciliEtkinlik.grup?.isim}</p>
              </div>
            </div>
            <button type="button" onClick={() => { setModalAcik(null); setSeciliEtkinlik(null); }} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${tema.inputBg} rounded-xl p-3`}>
              <div className={`text-xs ${tema.textMuted} mb-1`}>📅 Tarih</div>
              <div className={`font-bold ${tema.text}`}>{gunlerTam[tarih.getDay()]}</div>
              <div className={`text-sm ${tema.textSecondary}`}>{tarih.getDate()} {aylar[tarih.getMonth()]}</div>
            </div>
            <div className={`${tema.inputBg} rounded-xl p-3`}>
              <div className={`text-xs ${tema.textMuted} mb-1`}>⏰ Saat</div>
              <div className={`font-bold ${tema.text}`}>{seciliEtkinlik.saat}</div>
              <div className={`text-sm ${tema.textSecondary}`}>📍 {seciliEtkinlik.mekan}</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { durum: 'varim', label: '✓ Varım', color: 'from-green-500 to-emerald-500' },
              { durum: 'bakariz', label: '🤔 Bakarız', color: 'from-yellow-500 to-orange-500' },
              { durum: 'yokum', label: '✗ Yokum', color: 'from-red-500 to-rose-500' },
            ].map(btn => (
              <button key={btn.durum} type="button" onClick={() => handleKatilim(btn.durum)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${kullanicininDurumu === btn.durum ? `bg-gradient-to-r ${btn.color} text-white shadow-lg scale-105` : `${tema.inputBg} ${tema.text} ${tema.bgHover}`}`}>{btn.label}</button>
            ))}
          </div>

          <div>
            <div className={`text-sm font-bold ${tema.textSecondary} mb-2`}>Katılımcılar ({varimSayisi}/{katilimcilar.length})</div>
            <div className="flex flex-wrap gap-2">
              {katilimcilar.length > 0 ? katilimcilar.map((k, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${k.durum === 'varim' ? 'bg-green-100 text-green-700' : k.durum === 'bakariz' ? 'bg-yellow-100 text-yellow-700' : k.durum === 'yokum' ? 'bg-red-100 text-red-700' : `${tema.inputBg} ${tema.text}`}`}>
                  <span className="font-medium">{k.odUserId === kullanici?.odUserId ? 'Sen' : 'Katılımcı'}</span>
                </div>
              )) : <p className={tema.textSecondary}>Henüz katılımcı yok</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(seciliEtkinlik.mesajlar || []).map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.odUserId === kullanici?.odUserId ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-sm">{m.avatar || '👤'}</div>
              <div className={`max-w-[70%] ${m.odUserId === kullanici?.odUserId ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : tema.inputBg} rounded-2xl px-4 py-2`}>
                <div className={`text-xs ${m.odUserId === kullanici?.odUserId ? 'text-white/70' : tema.textMuted}`}>{m.isim || 'Kullanıcı'}</div>
                <div className={m.odUserId === kullanici?.odUserId ? 'text-white' : tema.text}>{m.mesaj}</div>
                <div className={`text-xs ${m.odUserId === kullanici?.odUserId ? 'text-white/50' : tema.textMuted} text-right`}>{m.zaman}</div>
              </div>
            </div>
          ))}
          {(!seciliEtkinlik.mesajlar || seciliEtkinlik.mesajlar.length === 0) && (
            <div className="text-center py-8"><span className="text-4xl">💬</span><p className={`${tema.textSecondary} mt-2`}>Henüz mesaj yok</p></div>
          )}
        </div>

        <div className={`p-4 border-t ${tema.border}`}>
          <div className="flex gap-2">
            <input type="text" value={yeniMesaj} onChange={(e) => setYeniMesaj(e.target.value)} placeholder="Mesaj yaz..." onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); mesajGonder(e); }}} className={`flex-1 ${tema.inputBg} ${tema.inputText} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400`} />
            <button type="button" onClick={(e) => mesajGonder(e)} className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white">📤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DİĞER MODALLAR (Kısa versiyon)
// ============================================
const BucketListModal = () => {
  const { bucketList, bucketListEkle, bucketListToggle, bucketListSil } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  const [yeniItem, setYeniItem] = useState('');
  const [yeniEmoji, setYeniEmoji] = useState('🎯');

  if (modalAcik !== 'bucketList') return null;

  const ekle = () => {
    if (!yeniItem.trim()) return;
    bucketListEkle({ baslik: yeniItem, emoji: yeniEmoji });
    setYeniItem('');
    bildirimGoster('Listeye eklendi! ✨');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[85vh] flex flex-col`}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-black ${tema.text}`}>📋 Bucket List</h3>
          <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
        </div>
        <div className="flex gap-2 mb-4">
          <select value={yeniEmoji} onChange={(e) => setYeniEmoji(e.target.value)} className={`w-14 ${tema.inputBg} ${tema.inputText} rounded-xl text-center text-xl`}>
            {['🎯', '🎈', '🎵', '⛺', '🏔️', '🎪', '🎭', '🎨', '🎬', '🍕'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input type="text" value={yeniItem} onChange={(e) => setYeniItem(e.target.value)} placeholder="Birlikte yapmak istediğiniz şey..." onKeyPress={(e) => e.key === 'Enter' && ekle()} className={`flex-1 ${tema.inputBg} ${tema.inputText} rounded-xl px-4 py-3 focus:outline-none`} />
          <button type="button" onClick={ekle} className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-xl">+</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {bucketList.length > 0 ? bucketList.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${item.tamamlandi ? 'bg-green-50' : tema.inputBg}`}>
              <button type="button" onClick={() => bucketListToggle(item.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${item.tamamlandi ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>{item.tamamlandi && '✓'}</button>
              <span className="text-2xl">{item.emoji}</span>
              <span className={`flex-1 font-medium ${item.tamamlandi ? 'line-through text-gray-400' : tema.text}`}>{item.baslik}</span>
              <button type="button" onClick={() => bucketListSil(item.id)} className={`${tema.textMuted} hover:text-red-500`}>🗑️</button>
            </div>
          )) : <div className="text-center py-8"><span className="text-4xl">📝</span><p className={`${tema.textSecondary} mt-2`}>Henüz bir şey eklenmedi</p></div>}
        </div>
      </div>
    </div>
  );
};

const BildirimlerModal = () => {
  const { modalAcik, setModalAcik, bildirimler, tema } = useUI();
  if (modalAcik !== 'bildirimler') return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[70vh]`}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-black ${tema.text}`}>🔔 Bildirimler</h3>
          <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
        </div>
        <div className="space-y-3 overflow-y-auto">
          {bildirimler.length > 0 ? bildirimler.map(b => (
            <div key={b.id} className={`flex items-center gap-3 p-4 rounded-2xl ${b.okundu ? tema.inputBg : 'bg-orange-50'}`}>
              <div className={`w-3 h-3 rounded-full ${b.okundu ? 'bg-gray-300' : 'bg-orange-500'}`}></div>
              <div className="flex-1"><p className={`font-medium ${tema.text}`}>{b.mesaj}</p><p className={`text-sm ${tema.textMuted}`}>{b.zaman}</p></div>
            </div>
          )) : <div className="text-center py-8"><span className="text-4xl">🔕</span><p className={`${tema.textSecondary} mt-2`}>Henüz bildirim yok</p></div>}
        </div>
      </div>
    </div>
  );
};

const GaleriModal = () => {
  const { galeri, galeriyeEkle } = useData();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  if (modalAcik !== 'galeri') return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border} max-h-[85vh] flex flex-col`}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-black ${tema.text}`}>📸 Anılar</h3>
          <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
        </div>
        <button type="button" onClick={() => { galeriyeEkle(); bildirimGoster('Fotoğraf eklendi! 📸'); }} className={`w-full ${tema.inputBg} border-2 border-dashed ${tema.border} rounded-2xl p-6 mb-4 flex flex-col items-center gap-2 ${tema.bgHover} transition-all`}>
          <span className="text-4xl">📷</span><span className={`font-medium ${tema.text}`}>Fotoğraf Ekle</span>
        </button>
        <div className="flex-1 overflow-y-auto">
          {galeri.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {galeri.map(foto => (
                <div key={foto.id} className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-orange-200 to-amber-200">
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-6xl">📸</span></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2"><p className="text-white text-xs">{foto.tarih}</p></div>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-8"><span className="text-6xl">📷</span><p className={`${tema.textSecondary} mt-4`}>Henüz fotoğraf yok</p></div>}
        </div>
      </div>
    </div>
  );
};

const AvatarDegistirModal = () => {
  const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, avatarGuncelle } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster, tema } = useUI();
  if (modalAcik !== 'avatarDegistir') return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className={`${tema.bgCard} rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border-t ${tema.border}`}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-black ${tema.text}`}>🎨 Avatar Seç</h3>
          <button type="button" onClick={() => setModalAcik(null)} className={`w-10 h-10 rounded-xl ${tema.inputBg} flex items-center justify-center ${tema.text}`}>✕</button>
        </div>
        <div className="flex justify-center gap-2 mb-4">
          {['erkek', 'kadin', 'fantastik'].map(kat => (
            <button key={kat} type="button" onClick={() => setAvatarKategori(kat)} className={`w-12 h-12 rounded-xl text-2xl transition-all ${avatarKategori === kat ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg scale-110' : tema.inputBg}`}>
              {kat === 'erkek' ? '👨' : kat === 'kadin' ? '👩' : '🦄'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto mb-4">
          {avatarlar[avatarKategori].map((avatar, i) => (
            <button key={i} type="button" onClick={() => setSeciliAvatar(avatar)} className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all ${seciliAvatar === avatar ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg scale-110 ring-4 ring-orange-300' : `${tema.inputBg} ${tema.bgHover}`}`}>{avatar}</button>
          ))}
        </div>
        <button type="button" onClick={() => { avatarGuncelle(seciliAvatar); setModalAcik(null); bildirimGoster('Avatar güncellendi! ✨'); }} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg">Kaydet</button>
      </div>
    </div>
  );
};

// ============================================
// TÜM MODALLAR
// ============================================
const AppModals = () => {
  return (
    <>
      <YeniGrupModal />
      <HizliPlanModal />
      <EtkinlikDetayModal />
      <BucketListModal />
      <BildirimlerModal />
      <GaleriModal />
      <AvatarDegistirModal />
    </>
  );
};

export default AppModals;
