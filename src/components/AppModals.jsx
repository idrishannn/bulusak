import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData, useUI, useTheme } from '../context';
import { XIcon, SearchIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon, SendIcon, ClockIcon, UsersIcon, TrashIcon, EditIcon, GlobeIcon, LockIcon, BellIcon, CameraIcon, ImageIcon } from './Icons';
import { kullaniciAra, arkadasIstegiGonder, arkadasSil, arkadasIstegiKabulEt, arkadasIstegiReddet, takipEt, takiptenCik, takipDurumuGetir, takipIstegiKabulEt, takipIstegiReddet } from '../services/arkadasService';
import { kullaniciBilgisiGetir } from '../services/userService';
import { mesajEkle, etkinlikSil, etkinlikGuncelle, planiTamamla, planKatilimOnayla, planKatilimReddet } from '../services/etkinlikService';
import PlanHikayeler from './PlanHikayeler';
import { bildirimOlustur } from '../services/bildirimService';
import { bildirimOkunduIsaretle, tumBildirimleriOkunduIsaretle, BILDIRIM_TIPLERI } from '../services/bildirimService';
import { profilGuncelle } from '../services/authService';
import {
  HOUR_OPTIONS, GROUP_ICONS, AVATAR_CATEGORIES, PARTICIPANT_LIMITS,
  PLAN_VISIBILITY, KATILIM_DURUMLARI, KATILIM_LABELS, KATILIM_COLORS,
  MAX_VISIBLE_PARTICIPANTS, PLAN_CATEGORIES, PLAN_STATUS
} from '../constants';

const ModalWrapper = ({ children, onClose, onBack, title, fullScreen = false }) => {
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-dark-900 flex flex-col">
        <div className="p-4 border-b border-dark-800 flex items-center justify-between safe-top">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
                <ChevronLeftIcon className="w-5 h-5 text-dark-400" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
            <XIcon className="w-5 h-5 text-dark-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-900 rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="p-4 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
                <ChevronLeftIcon className="w-5 h-5 text-dark-400" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
            <XIcon className="w-5 h-5 text-dark-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Katılımcı Avatar Stack Bileşeni
const ParticipantAvatars = ({ participants, maxVisible = MAX_VISIBLE_PARTICIPANTS, onPress }) => {
  const varimOlanlar = participants?.filter(k => k.durum === KATILIM_DURUMLARI.VARIM) || [];
  const gosterilecek = varimOlanlar.slice(0, maxVisible);
  const fazlasi = varimOlanlar.length - maxVisible;

  if (varimOlanlar.length === 0) {
    return <p className="text-dark-500 text-sm">Henüz katılımcı yok</p>;
  }

  const renderAvatar = (avatar) => {
    if (avatar?.startsWith('http') || avatar?.startsWith('data:')) {
      return <img src={avatar} alt="" className="w-full h-full object-cover" />;
    }
    return avatar || '👤';
  };

  return (
    <button onClick={onPress} className="flex items-center">
      <div className="flex -space-x-3">
        {gosterilecek.map((k, i) => (
          <div
            key={k.odUserId || i}
            className="w-10 h-10 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-lg overflow-hidden"
            style={{ zIndex: maxVisible - i }}
          >
            {renderAvatar(k.avatar)}
          </div>
        ))}
        {fazlasi > 0 && (
          <div
            className="w-10 h-10 rounded-full bg-gold-500/20 border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-gold-500"
            style={{ zIndex: 0 }}
          >
            +{fazlasi}
          </div>
        )}
      </div>
      <ChevronRightIcon className="w-4 h-4 text-dark-500 ml-2" />
    </button>
  );
};

// Katılımcı Listesi Modal
const KatilimcilarModal = ({ isOpen, onClose, participants, currentUserId }) => {
  if (!isOpen) return null;

  const varimOlanlar = participants?.filter(k => k.durum === KATILIM_DURUMLARI.VARIM) || [];
  const yokumOlanlar = participants?.filter(k => k.durum === KATILIM_DURUMLARI.YOKUM) || [];

  const renderAvatar = (avatar) => {
    if (avatar?.startsWith('http') || avatar?.startsWith('data:')) {
      return <img src={avatar} alt="" className="w-full h-full object-cover" />;
    }
    return avatar || '👤';
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-900 rounded-t-3xl max-h-[60vh] flex flex-col animate-slide-up">
        <div className="p-4 border-b border-dark-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Katılımcılar</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center">
            <XIcon className="w-4 h-4 text-dark-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {varimOlanlar.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-emerald-400 mb-2">Katılacak ({varimOlanlar.length})</p>
              <div className="space-y-2">
                {varimOlanlar.map((k, i) => (
                  <div key={k.odUserId || i} className="flex items-center gap-3 p-2 rounded-xl bg-emerald-500/10">
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl overflow-hidden">
                      {renderAvatar(k.avatar)}
                    </div>
                    <span className="text-white font-medium">
                      {k.odUserId === currentUserId ? 'Sen' : k.isim || 'Katılımcı'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {yokumOlanlar.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-400 mb-2">Katılmayacak ({yokumOlanlar.length})</p>
              <div className="space-y-2">
                {yokumOlanlar.map((k, i) => (
                  <div key={k.odUserId || i} className="flex items-center gap-3 p-2 rounded-xl bg-red-500/10">
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl overflow-hidden">
                      {renderAvatar(k.avatar)}
                    </div>
                    <span className="text-white font-medium">
                      {k.odUserId === currentUserId ? 'Sen' : k.isim || 'Katılımcı'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HizliPlanModal = () => {
  const { kullanici } = useAuth();
  const { yeniEtkinlikOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [baslik, setBaslik] = useState('');
  const [seciliTarih, setSeciliTarih] = useState(new Date().toISOString().split('T')[0]);
  const [seciliSaat, setSeciliSaat] = useState('15:00');
  const [mekan, setMekan] = useState('');
  const [secilenArkadaslar, setSecilenArkadaslar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kategori, setKategori] = useState('tumu');

  const [visibility, setVisibility] = useState(PLAN_VISIBILITY.PRIVATE);
  const [katilimciLimit, setKatilimciLimit] = useState(0);

  // Fotoğraf state
  const [planFoto, setPlanFoto] = useState(null);
  const fotoInputRef = useRef(null);

  // Arama state
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState([]);
  const [aramaYukleniyor, setAramaYukleniyor] = useState(false);

  // Kullanıcı ara
  const handleArama = async (metin) => {
    setAramaMetni(metin);
    if (!metin || metin.length < 2) {
      setAramaSonuclari([]);
      return;
    }

    setAramaYukleniyor(true);
    const result = await kullaniciAra(metin);
    if (result.success) {
      // Sadece herkese açık hesapları göster ve kendini hariç tut
      const filtrelenmis = result.kullanicilar.filter(k =>
        k.odUserId !== kullanici?.odUserId &&
        k.profilGizlilik !== 'private'
      );
      setAramaSonuclari(filtrelenmis);
    }
    setAramaYukleniyor(false);
  };

  // Fotoğraf seç
  const handleFotoSec = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        bildirimGoster('Fotoğraf 5MB\'dan küçük olmalı', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPlanFoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (modalAcik !== 'hizliPlan') return null;

  const arkadasToggle = (id) => {
    setSecilenArkadaslar(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOlustur = async () => {
    if (!baslik.trim()) { bildirimGoster('Plan adı gerekli', 'error'); return; }

    setYukleniyor(true);
    const planData = {
      baslik: baslik.trim(),
      ikon: 'diger',
      tarih: new Date(seciliTarih),
      saat: seciliSaat,
      mekan: mekan.trim() || 'Belirtilmedi',
      tip: 'arkadas',
      visibility,
      katilimciLimit: katilimciLimit || null,
      kategori: kategori !== 'tumu' ? kategori : null,
      status: PLAN_STATUS.ACTIVE,
      foto: planFoto || null
    };

    if (secilenArkadaslar.length > 0) {
      planData.davetliler = secilenArkadaslar;
      planData.davetliDetaylar = aramaSonuclari.filter(a => secilenArkadaslar.includes(a.odUserId));
    }

    const result = await yeniEtkinlikOlustur(planData);
    setYukleniyor(false);

    if (result.success) {
      bildirimGoster('Plan oluşturuldu!', 'success');
      setModalAcik(null);
      setBaslik(''); setMekan(''); setSecilenArkadaslar([]);
      setVisibility(PLAN_VISIBILITY.PRIVATE); setKatilimciLimit(0); setKategori('tumu');
      setPlanFoto(null); setAramaMetni(''); setAramaSonuclari([]);
    } else {
      bildirimGoster(result.error || 'Bir hata oluştu', 'error');
    }
  };

  return (
    <ModalWrapper title="Yeni Plan" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Plan Adı</label>
          <input type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="Ne yapalım?" className="input-dark" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Tarih</label>
            <input type="date" value={seciliTarih} onChange={(e) => setSeciliTarih(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-dark" />
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Saat</label>
            <select value={seciliSaat} onChange={(e) => setSeciliSaat(e.target.value)} className="input-dark bg-dark-800">
              {HOUR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Mekan (Opsiyonel)</label>
          <input type="text" value={mekan} onChange={(e) => setMekan(e.target.value)} placeholder="Nerede buluşalım?" className="input-dark" />
        </div>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Kategori</label>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
            {PLAN_CATEGORIES.filter(c => c.id !== 'tumu').map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setKategori(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  kategori === cat.id ? 'btn-gold' : 'btn-ghost'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Görünürlük Ayarları */}
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Plan Görünürlüğü</label>
          <div className="flex gap-2">
            <button
              onClick={() => setVisibility(PLAN_VISIBILITY.PRIVATE)}
              className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${visibility === PLAN_VISIBILITY.PRIVATE ? 'btn-gold' : 'btn-ghost'}`}
            >
              <LockIcon className="w-4 h-4" /> Özel
            </button>
            <button
              onClick={() => setVisibility(PLAN_VISIBILITY.PUBLIC)}
              className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${visibility === PLAN_VISIBILITY.PUBLIC ? 'btn-gold' : 'btn-ghost'}`}
            >
              <GlobeIcon className="w-4 h-4" /> Açık
            </button>
          </div>
          <p className="text-xs text-dark-500 mt-1">
            {visibility === PLAN_VISIBILITY.PUBLIC ? 'Herkes keşfette görebilir ve katılım isteği gönderebilir' : 'Sadece davet ettiklerin görebilir'}
          </p>
        </div>

        {/* Katılımcı Limiti - Serbest Sayı Girişi */}
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Katılımcı Limiti (Opsiyonel)</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="999"
              value={katilimciLimit || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '0') {
                  setKatilimciLimit(0);
                } else {
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && num >= 0 && num <= 999) {
                    setKatilimciLimit(num);
                  }
                }
              }}
              placeholder="Limitsiz"
              className="input-dark flex-1"
            />
            <button
              onClick={() => setKatilimciLimit(0)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                katilimciLimit === 0
                  ? 'btn-gold'
                  : 'btn-ghost'
              }`}
            >
              ∞ Limitsiz
            </button>
          </div>
          <p className="text-xs text-dark-500 mt-1">
            {katilimciLimit > 0
              ? `Maksimum ${katilimciLimit} kişi katılabilir`
              : 'Sınırsız katılımcı kabul edilir'}
          </p>
        </div>

        {/* Plan Fotoğrafı */}
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Plan Fotoğrafı (Opsiyonel)</label>
          <input
            type="file"
            ref={fotoInputRef}
            onChange={handleFotoSec}
            accept="image/*"
            className="hidden"
          />
          {planFoto ? (
            <div className="relative">
              <img src={planFoto} alt="Plan" className="w-full h-32 object-cover rounded-xl" />
              <button
                onClick={() => setPlanFoto(null)}
                className="absolute top-2 right-2 w-8 h-8 bg-dark-900/80 rounded-full flex items-center justify-center"
              >
                <XIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fotoInputRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-dark-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gold-500/50 transition-colors"
            >
              <CameraIcon className="w-8 h-8 text-dark-500" />
              <span className="text-sm text-dark-400">Fotoğraf Ekle</span>
            </button>
          )}
        </div>

        {/* Davet Et */}
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Davet Et (Opsiyonel)</label>

          {/* Seçilen kişiler */}
          {secilenArkadaslar.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {secilenArkadaslar.map(id => {
                const kisi = aramaSonuclari.find(k => k.odUserId === id);
                if (!kisi) return null;
                return (
                  <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-gold-500/20 rounded-full border border-gold-500/30">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-dark-700">
                      {kisi.avatar?.startsWith('http') || kisi.avatar?.startsWith('data:') ? (
                        <img src={kisi.avatar} alt="" className="w-full h-full object-cover" />
                      ) : <span className="text-sm">{kisi.avatar || '👤'}</span>}
                    </div>
                    <span className="text-sm text-white">{kisi.isim}</span>
                    <button onClick={() => arkadasToggle(id)} className="text-gold-500 hover:text-white">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Arama Kutusu */}
          <div className="space-y-2">
            <div className="relative">
              <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="text"
                value={aramaMetni}
                onChange={(e) => handleArama(e.target.value)}
                placeholder="Kullanıcı adı ile ara..."
                className="input-dark pl-10"
              />
            </div>
            {aramaYukleniyor && (
              <div className="flex justify-center py-3">
                <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {aramaSonuclari.length > 0 && (
              <div className="card p-2 max-h-40 overflow-y-auto space-y-1">
                {aramaSonuclari.map(k => (
                  <button
                    key={k.odUserId}
                    onClick={() => arkadasToggle(k.odUserId)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      secilenArkadaslar.includes(k.odUserId)
                        ? 'bg-gold-500/20 border border-gold-500/30'
                        : 'hover:bg-dark-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl overflow-hidden">
                      {k.avatar?.startsWith('http') || k.avatar?.startsWith('data:') ? (
                        <img src={k.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (k.avatar || '👤')}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{k.isim}</p>
                      <p className="text-xs text-dark-400">@{(k.kullaniciAdi || '').replace(/@/g, '')}</p>
                    </div>
                    {secilenArkadaslar.includes(k.odUserId) && <CheckIcon className="w-5 h-5 text-gold-500" />}
                  </button>
                ))}
              </div>
            )}
            {aramaMetni.length >= 2 && aramaSonuclari.length === 0 && !aramaYukleniyor && (
              <p className="text-center py-2 text-dark-400 text-sm">Kullanıcı bulunamadı</p>
            )}
            {!aramaMetni && secilenArkadaslar.length === 0 && (
              <p className="text-center py-2 text-dark-400 text-xs">Sadece herkese açık hesaplar davet edilebilir</p>
            )}
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-dark-800">
        <button onClick={handleOlustur} disabled={yukleniyor} className="w-full btn-gold py-4 rounded-xl font-semibold">
          {yukleniyor ? 'Oluşturuluyor...' : 'Plan Oluştur'}
        </button>
      </div>
    </ModalWrapper>
  );
};

const ArkadaslarModal = () => {
  const { kullanici } = useAuth();
  const { arkadaslar } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [tab, setTab] = useState('liste');
  const [arama, setArama] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState([]);
  const [araniyor, setAraniyor] = useState(false);

  useEffect(() => {
    if (!arama || arama.length < 1) { setAramaSonuclari([]); return; }
    const timeout = setTimeout(async () => {
      setAraniyor(true);
      const result = await kullaniciAra(arama);
      if (result.success) { setAramaSonuclari(result.kullanicilar.filter(k => k.odUserId !== kullanici?.odUserId)); }
      setAraniyor(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [arama, kullanici]);

  if (modalAcik !== 'arkadaslar') return null;

  const handleIstekGonder = async (alici) => {
    const result = await arkadasIstegiGonder(kullanici, alici.odUserId);
    if (result.success) { bildirimGoster('İstek gönderildi!', 'success'); setAramaSonuclari(prev => prev.map(k => k.odUserId === alici.odUserId ? { ...k, istekGonderildi: true } : k)); }
    else { bildirimGoster(result.error, 'error'); }
  };

  const handleArkadasSil = async (id) => {
    if (!window.confirm('Arkadaşlıktan çıkarmak istediğine emin misin?')) return;
    const result = await arkadasSil(kullanici, id);
    if (result.success) { bildirimGoster('Arkadaş silindi', 'success'); }
  };

  const arkadasMi = (id) => kullanici?.arkadaslar?.includes(id);

  return (
    <ModalWrapper title="Arkadaşlar" onClose={() => setModalAcik(null)}>
      <div className="p-4 border-b border-dark-800">
        <div className="flex gap-2">
          <button onClick={() => setTab('liste')} className={`flex-1 py-2 rounded-xl font-medium text-sm ${tab === 'liste' ? 'btn-gold' : 'btn-ghost'}`}>Arkadaşlarım</button>
          <button onClick={() => setTab('ara')} className={`flex-1 py-2 rounded-xl font-medium text-sm ${tab === 'ara' ? 'btn-gold' : 'btn-ghost'}`}>Kişi Ara</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'ara' && (
          <>
            <div className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input type="text" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Kullanıcı adı ara..." className="input-dark pl-12" />
            </div>
            {araniyor && <p className="text-center text-dark-400">Aranıyor...</p>}
            {aramaSonuclari.length > 0 && (
              <div className="space-y-2">
                {aramaSonuclari.map(k => (
                  <div key={k.odUserId} className="flex items-center gap-3 p-3 card">
                    <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl overflow-hidden">
                      {k.avatar?.startsWith('http') || k.avatar?.startsWith('data:') ? (
                        <img src={k.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (k.avatar || '👤')}
                    </div>
                    <div className="flex-1"><p className="font-medium text-white">{k.isim}</p><p className="text-sm text-dark-400">@{k.kullaniciAdi}</p></div>
                    {arkadasMi(k.odUserId) ? <span className="text-emerald-400 text-sm">Arkadaş</span>
                      : k.istekGonderildi ? <span className="text-gold-500 text-sm">Gönderildi</span>
                      : <button onClick={() => handleIstekGonder(k)} className="btn-gold px-3 py-1.5 rounded-lg text-sm">Ekle</button>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'liste' && (
          arkadaslar?.length > 0 ? (
            <div className="space-y-2">
              {arkadaslar.map(a => (
                <div key={a.odUserId} className="flex items-center gap-3 p-3 card">
                  <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl overflow-hidden">
                    {a.avatar?.startsWith('http') || a.avatar?.startsWith('data:') ? (
                      <img src={a.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (a.avatar || '👤')}
                  </div>
                  <div className="flex-1"><p className="font-medium text-white">{a.isim}</p><p className="text-sm text-dark-400">@{a.kullaniciAdi}</p></div>
                  <button onClick={() => handleArkadasSil(a.odUserId)} className="text-dark-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8"><p className="text-dark-400">Henüz arkadaşın yok</p></div>
          )
        )}
      </div>
    </ModalWrapper>
  );
};

const ArkadasIstekleriModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [yukleniyor, setYukleniyor] = useState(null);

  if (modalAcik !== 'arkadasIstekleri') return null;

  const bekleyenler = kullanici?.arkadasIstekleri?.filter(i => i.durum === 'bekliyor') || [];

  const handleKabul = async (id) => { setYukleniyor(id); const r = await arkadasIstegiKabulEt(kullanici, id); setYukleniyor(null); r.success ? bildirimGoster('Kabul edildi!', 'success') : bildirimGoster(r.error, 'error'); };
  const handleReddet = async (id) => { setYukleniyor(id); const r = await arkadasIstegiReddet(kullanici, id); setYukleniyor(null); r.success ? bildirimGoster('Reddedildi', 'success') : bildirimGoster(r.error, 'error'); };

  return (
    <ModalWrapper title="Arkadaşlık İstekleri" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4">
        {bekleyenler.length > 0 ? bekleyenler.map(i => (
          <div key={i.kimden} className="card p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl">{i.kimdenAvatar || '👤'}</div>
              <div className="flex-1"><p className="font-medium text-white">{i.kimdenIsim}</p><p className="text-sm text-dark-400">@{i.kimdenKullaniciAdi}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleKabul(i.kimden)} disabled={yukleniyor === i.kimden} className="flex-1 btn-gold py-2 rounded-xl text-sm font-medium">Kabul Et</button>
              <button onClick={() => handleReddet(i.kimden)} disabled={yukleniyor === i.kimden} className="flex-1 btn-ghost py-2 rounded-xl text-sm font-medium">Reddet</button>
            </div>
          </div>
        )) : (
          <div className="text-center py-8"><p className="text-dark-400">Bekleyen istek yok</p></div>
        )}
      </div>
    </ModalWrapper>
  );
};

const DetayModal = () => {
  const { kullanici } = useAuth();
  const { katilimDurumuGuncelle, etkinlikler } = useData();
  const { modalAcik, setModalAcik, seciliEtkinlik, setSeciliEtkinlik, bildirimGoster } = useUI();
  const [mesaj, setMesaj] = useState('');
  const [katilimcilarModalAcik, setKatilimcilarModalAcik] = useState(false);
  const [silmeOnay, setSilmeOnay] = useState(false);
  const mesajlarRef = useRef(null);

  // DataContext'teki etkinlikler değiştiğinde seciliEtkinlik'i güncelle
  useEffect(() => {
    if (modalAcik !== 'detay' || !seciliEtkinlik?.id) return;

    const guncelEtkinlik = etkinlikler?.find(e => e.id === seciliEtkinlik.id);
    if (guncelEtkinlik) {
      setSeciliEtkinlik(prev => {
        // Sadece değişiklik varsa güncelle
        if (JSON.stringify(prev) !== JSON.stringify(guncelEtkinlik)) {
          return { ...prev, ...guncelEtkinlik };
        }
        return prev;
      });
    }
  }, [etkinlikler, modalAcik, seciliEtkinlik?.id, setSeciliEtkinlik]);

  // Mesajlar değiştiğinde en alta scroll
  useEffect(() => {
    if (mesajlarRef.current) {
      mesajlarRef.current.scrollTop = mesajlarRef.current.scrollHeight;
    }
  }, [seciliEtkinlik?.mesajlar]);

  if (modalAcik !== 'detay' || !seciliEtkinlik) return null;

  const tarih = new Date(seciliEtkinlik.startAt || seciliEtkinlik.tarih);
  const katilimcilar = seciliEtkinlik.katilimcilar || [];
  const benimDurum = katilimcilar.find(k => k.odUserId === kullanici?.odUserId)?.durum;
  const benimPlanim = seciliEtkinlik.olusturanId === kullanici?.odUserId;

  // Plan sahibi bilgisi
  const planSahibi = katilimcilar.find(k => k.odUserId === seciliEtkinlik.olusturanId);

  // Mesaj yazma yetkisi: Plan sahibi veya katılımcı (participants içinde)
  const mesajYazabilir = benimPlanim ||
    seciliEtkinlik.participantIds?.includes(kullanici?.odUserId) ||
    katilimcilar.some(k => k.odUserId === kullanici?.odUserId && k.durum === KATILIM_DURUMLARI.VARIM);

  // Katılım durumu güncelleme - Bakarız kaldırıldı, sadece Varım/Yokum
  const handleKatilim = (durum) => {
    katilimDurumuGuncelle(seciliEtkinlik.id, durum);
    bildirimGoster(durum === KATILIM_DURUMLARI.VARIM ? 'Katılıyorsun!' : 'Katılmıyorsun', 'success');
  };

  const handleMesajGonder = async () => {
    if (!mesaj.trim()) return;
    if (!mesajYazabilir) {
      bildirimGoster('Bu plana mesaj yazma yetkin yok', 'error');
      return;
    }
    const mesajMetni = mesaj.trim();
    setMesaj(''); // Hemen temizle
    await mesajEkle(seciliEtkinlik.id, { odUserId: kullanici.odUserId, isim: kullanici.isim, avatar: kullanici.avatar, mesaj: mesajMetni });
    // Real-time listener otomatik güncelleyecek
  };

  const handlePlanSil = async () => {
    const result = await etkinlikSil(seciliEtkinlik.id);
    if (result.success) {
      bildirimGoster('Plan silindi', 'success');
      setModalAcik(null);
      setSeciliEtkinlik(null);
    } else {
      bildirimGoster(result.error || 'Silme hatası', 'error');
    }
    setSilmeOnay(false);
  };

  const planBasladiMi = () => {
    if (seciliEtkinlik.hikayelerBaslangic) return true;
    const planTarihi = new Date(seciliEtkinlik.startAt || seciliEtkinlik.tarih);
    const planSaati = seciliEtkinlik.saat ? seciliEtkinlik.saat.split(':') : ['12', '00'];
    planTarihi.setHours(parseInt(planSaati[0]), parseInt(planSaati[1]), 0, 0);
    return new Date() >= planTarihi;
  };

  return (
    <>
      <ModalWrapper title={seciliEtkinlik.baslik} onClose={() => { setModalAcik(null); setSeciliEtkinlik(null); }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Plan Sahibi Bilgisi */}
          <div className="flex items-center gap-3 p-3 card">
            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl border-2 border-gold-500/30 overflow-hidden">
              {(() => {
                const avatar = planSahibi?.avatar || seciliEtkinlik.olusturanAvatar;
                if (avatar?.startsWith('http') || avatar?.startsWith('data:')) {
                  return <img src={avatar} alt="" className="w-full h-full object-cover" />;
                }
                return avatar || '👤';
              })()}
            </div>
            <div className="flex-1">
              <p className="text-xs text-dark-400">Plan Sahibi</p>
              <p className="font-medium text-white">{planSahibi?.isim || seciliEtkinlik.olusturanIsim || 'Kullanıcı'}</p>
            </div>
            {seciliEtkinlik.visibility === PLAN_VISIBILITY.PUBLIC && (
              <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded-lg flex items-center gap-1">
                <GlobeIcon className="w-3 h-3" /> Açık
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3">
              <p className="text-xs text-dark-400 mb-1">Tarih</p>
              <p className="font-medium text-white">{tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-dark-400 mb-1">Saat</p>
              <p className="font-medium text-white">{seciliEtkinlik.saat}</p>
            </div>
          </div>

          {seciliEtkinlik.mekan && seciliEtkinlik.mekan !== 'Belirtilmedi' && (
            <div className="card p-3">
              <p className="text-xs text-dark-400 mb-1">Mekan</p>
              <p className="font-medium text-white">{seciliEtkinlik.mekan}</p>
            </div>
          )}

          {/* Katılım Durumu - Sadece Varım/Yokum */}
          {!benimPlanim && (
            <div>
              <p className="text-xs text-dark-400 mb-2">Katılım Durumun</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleKatilim(KATILIM_DURUMLARI.VARIM)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all border ${
                    benimDurum === KATILIM_DURUMLARI.VARIM
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-dark-600 text-dark-300 hover:border-emerald-500/50 hover:text-emerald-400'
                  }`}
                >
                  {KATILIM_LABELS.varim}
                </button>
                <button
                  onClick={() => handleKatilim(KATILIM_DURUMLARI.YOKUM)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all border ${
                    benimDurum === KATILIM_DURUMLARI.YOKUM
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-dark-600 text-dark-300 hover:border-red-500/50 hover:text-red-400'
                  }`}
                >
                  {KATILIM_LABELS.yokum}
                </button>
              </div>
            </div>
          )}

          {/* Katılımcılar - Yuvarlak avatarlar */}
          <div>
            <p className="text-xs text-dark-400 mb-2">Katılımcılar ({katilimcilar.filter(k => k.durum === KATILIM_DURUMLARI.VARIM).length})</p>
            <ParticipantAvatars
              participants={katilimcilar}
              maxVisible={MAX_VISIBLE_PARTICIPANTS}
              onPress={() => setKatilimcilarModalAcik(true)}
            />
          </div>

          {/* Plan Hikayeleri */}
          {planBasladiMi() && (
            <PlanHikayeler
              plan={seciliEtkinlik}
              katilimcilar={katilimcilar}
            />
          )}

          {/* Mesajlar */}
          <div>
            <p className="text-xs text-dark-400 mb-2">Mesajlar</p>
            <div ref={mesajlarRef} className="card p-3 max-h-48 overflow-y-auto space-y-3">
              {(seciliEtkinlik.mesajlar || []).map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.odUserId === kullanici?.odUserId ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                    {m.avatar?.startsWith('http') || m.avatar?.startsWith('data:') ? (
                      <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (m.avatar || '👤')}
                  </div>
                  <div className={`max-w-[70%] px-3 py-2 rounded-xl ${m.odUserId === kullanici?.odUserId ? 'bg-gold-500/20 text-gold-100' : 'bg-dark-700 text-white'}`}>
                    <p className="text-xs text-dark-400 mb-0.5">{m.isim}</p>
                    <p className="text-sm">{m.mesaj}</p>
                  </div>
                </div>
              ))}
              {(!seciliEtkinlik.mesajlar || seciliEtkinlik.mesajlar.length === 0) && <p className="text-center text-dark-500 text-sm">Henüz mesaj yok</p>}
            </div>
          </div>

          {/* Plan Sil Butonu (Sadece plan sahibi için) */}
          {benimPlanim && (
            <div className="pt-2">
              {silmeOnay ? (
                <div className="flex gap-2">
                  <button onClick={handlePlanSil} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium text-sm">
                    Evet, Sil
                  </button>
                  <button onClick={() => setSilmeOnay(false)} className="flex-1 btn-ghost py-3 rounded-xl font-medium text-sm">
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button onClick={() => setSilmeOnay(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                  <TrashIcon className="w-4 h-4" /> Planı Sil
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mesaj Gönderme - Sadece yetkisi olanlar için */}
        {mesajYazabilir ? (
          <div className="p-4 border-t border-dark-800">
            <div className="flex gap-2">
              <input type="text" value={mesaj} onChange={(e) => setMesaj(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleMesajGonder()} placeholder="Mesaj yaz..." className="flex-1 input-dark" />
              <button onClick={handleMesajGonder} className="w-12 h-12 btn-gold rounded-xl flex items-center justify-center"><SendIcon className="w-5 h-5" /></button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-dark-800">
            <p className="text-center text-dark-500 text-sm">Mesaj yazmak için plana katılmalısın</p>
          </div>
        )}
      </ModalWrapper>

      {/* Katılımcılar Modal */}
      <KatilimcilarModal
        isOpen={katilimcilarModalAcik}
        onClose={() => setKatilimcilarModalAcik(false)}
        participants={katilimcilar}
        currentUserId={kullanici?.odUserId}
      />
    </>
  );
};

const YeniGrupModal = () => {
  const { arkadaslar } = useData();
  const { yeniGrupOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [isim, setIsim] = useState('');
  const [emoji, setEmoji] = useState('🎉');
  const [secilenUyeler, setSecilenUyeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  if (modalAcik !== 'yeniGrup') return null;

  const uyeToggle = (id) => {
    setSecilenUyeler(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOlustur = async () => {
    if (!isim.trim()) {
      bildirimGoster('Grup adı gerekli', 'error');
      return;
    }
    setYukleniyor(true);
    const result = await yeniGrupOlustur(isim, emoji, secilenUyeler);
    setYukleniyor(false);
    if (result.success) {
      bildirimGoster('Grup oluşturuldu!', 'success');
      setModalAcik(null);
      setIsim('');
      setSecilenUyeler([]);
    } else {
      bildirimGoster(result.error || 'Bir hata oluştu', 'error');
    }
  };

  return (
    <ModalWrapper title="Yeni Grup" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Grup Adı</label>
          <input type="text" value={isim} onChange={(e) => setIsim(e.target.value)} placeholder="Grup adı" className="input-dark" />
        </div>
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">İkon</label>
          <div className="flex flex-wrap gap-2">
            {GROUP_ICONS.map((e, i) => (
              <button key={i} onClick={() => setEmoji(e)} className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-gold-500/20 border border-gold-500/30 scale-110' : 'bg-dark-800 hover:bg-dark-700'}`}>{e}</button>
            ))}
          </div>
        </div>

        {/* Grup Üyeleri Seçimi */}
        {arkadaslar?.length > 0 && (
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Üyeler (Opsiyonel)</label>
            <div className="card p-3 max-h-40 overflow-y-auto space-y-2">
              {arkadaslar.map(a => (
                <button
                  key={a.odUserId}
                  onClick={() => uyeToggle(a.odUserId)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${secilenUyeler.includes(a.odUserId) ? 'bg-gold-500/20 border border-gold-500/30' : 'hover:bg-dark-700'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-lg overflow-hidden">
                    {a.avatar?.startsWith('http') || a.avatar?.startsWith('data:') ? (
                      <img src={a.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (a.avatar || '👤')}
                  </div>
                  <span className="flex-1 text-left text-white text-sm">{a.isim}</span>
                  {secilenUyeler.includes(a.odUserId) && <CheckIcon className="w-4 h-4 text-gold-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-dark-800">
        <button onClick={handleOlustur} disabled={yukleniyor} className="w-full btn-gold py-4 rounded-xl font-semibold">{yukleniyor ? 'Oluşturuluyor...' : 'Oluştur'}</button>
      </div>
    </ModalWrapper>
  );
};

const BildirimlerModal = () => {
  const navigate = useNavigate();
  const { kullanici } = useAuth();
  const { etkinlikler, katilimDurumuGuncelle } = useData();
  const { modalAcik, setModalAcik, bildirimler, setSeciliEtkinlik, bildirimGoster } = useUI();
  const [islemYapiliyor, setIslemYapiliyor] = useState(null);
  const [islenmisBildirimler, setIslenmisBildirimler] = useState({});

  if (modalAcik !== 'bildirimler') return null;

  const okunmamisSayisi = bildirimler?.filter(b => !b.okundu).length || 0;

  const davetBildirimleri = bildirimler?.filter(b =>
    (b.tip === BILDIRIM_TIPLERI.PLAN_DAVET ||
      b.tip === BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI ||
      b.tip === 'GRUP_DAVET') && (!b.okundu || islenmisBildirimler[b.id])
  ) || [];

  const takipIstekBildirimleri = bildirimler?.filter(b =>
    b.tip === BILDIRIM_TIPLERI.TAKIP_ISTEGI && (!b.okundu || islenmisBildirimler[b.id])
  ) || [];

  const katilimSorguBildirimleri = bildirimler?.filter(b =>
    !b.okundu && b.tip === BILDIRIM_TIPLERI.PLAN_KATILIM_SORGUSU
  ) || [];

  const digerBildirimler = bildirimler?.filter(b => {
    // İşlenmiş takip istekleri ve davetleri hariç tut
    if (b.tip === BILDIRIM_TIPLERI.TAKIP_ISTEGI && islenmisBildirimler[b.id]) {
      return false;
    }
    if ((b.tip === BILDIRIM_TIPLERI.PLAN_DAVET || b.tip === 'GRUP_DAVET') && islenmisBildirimler[b.id]) {
      return false;
    }
    return b.okundu || (
      b.tip !== BILDIRIM_TIPLERI.PLAN_DAVET &&
      b.tip !== BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI &&
      b.tip !== BILDIRIM_TIPLERI.PLAN_KATILIM_SORGUSU &&
      b.tip !== BILDIRIM_TIPLERI.TAKIP_ISTEGI &&
      b.tip !== 'GRUP_DAVET'
    );
  }) || [];

  const handleTumunuOkunduYap = async () => {
    if (kullanici?.odUserId) {
      await tumBildirimleriOkunduIsaretle(kullanici.odUserId);
    }
  };

  // Davet Kabul Et (Varım)
  const handleDavetKabul = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      if (bildirim.tip === BILDIRIM_TIPLERI.PLAN_DAVET && bildirim.planId) {
        // Plana katıl
        await katilimDurumuGuncelle(bildirim.planId, KATILIM_DURUMLARI.VARIM);
        setIslenmisBildirimler(prev => ({
          ...prev,
          [bildirim.id]: {
            durum: 'kabul',
            mesaj: `Davete katıldın · "${bildirim.planBaslik || 'Plan'}"`
          }
        }));
        bildirimGoster('Davete katıldın!', 'success');
      } else if (bildirim.tip === BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI && bildirim.planId) {
        // Katılım isteğini kabul et - plan detayına yönlendir
        const plan = etkinlikler?.find(e => e.id === bildirim.planId);
        if (plan) {
          setSeciliEtkinlik(plan);
          setModalAcik('detay');
        }
        bildirimGoster('İstek kabul edildi', 'success');
      }
      // Bildirimi okundu yap
      await bildirimOkunduIsaretle(bildirim.id);
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  // Davet Reddet (Yokum)
  const handleDavetReddet = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      if (bildirim.tip === BILDIRIM_TIPLERI.PLAN_DAVET && bildirim.planId) {
        await katilimDurumuGuncelle(bildirim.planId, KATILIM_DURUMLARI.YOKUM);
        setIslenmisBildirimler(prev => ({
          ...prev,
          [bildirim.id]: {
            durum: 'red',
            mesaj: `Daveti reddettin · "${bildirim.planBaslik || 'Plan'}"`
          }
        }));
        bildirimGoster('Daveti reddettin', 'success');
      }
      await bildirimOkunduIsaretle(bildirim.id);
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  const handleKatildim = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      if (bildirim.planId) {
        await planKatilimOnayla(bildirim.planId, kullanici.odUserId, kullanici);
        bildirimGoster('Katılım onaylandı! Plan profiline eklendi.', 'success');
      }
      await bildirimOkunduIsaretle(bildirim.id);
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  const handleKatilmadim = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      if (bildirim.planId) {
        await planKatilimReddet(bildirim.planId, kullanici.odUserId);
        bildirimGoster('Plan listenden kaldırıldı.', 'success');
      }
      await bildirimOkunduIsaretle(bildirim.id);
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  const handleBildirimTikla = async (bildirim) => {
    if (!bildirim.okundu) {
      await bildirimOkunduIsaretle(bildirim.id);
    }

    switch (bildirim.tip) {
      case BILDIRIM_TIPLERI.PLAN_DAVET:
      case BILDIRIM_TIPLERI.PLAN_GUNCELLEME:
      case BILDIRIM_TIPLERI.PLAN_YORUM:
        if (bildirim.planId) {
          const plan = etkinlikler?.find(e => e.id === bildirim.planId);
          if (plan) {
            setSeciliEtkinlik(plan);
            setModalAcik('detay');
          }
        }
        break;
      case BILDIRIM_TIPLERI.TAKIP_ISTEGI:
        setModalAcik('takipIstekleri');
        break;
      case BILDIRIM_TIPLERI.TAKIP_KABUL:
      case BILDIRIM_TIPLERI.YENI_TAKIPCI:
        setModalAcik(null);
        navigate('/profil');
        break;
      case BILDIRIM_TIPLERI.ARKADAS_ISTEGI:
      case BILDIRIM_TIPLERI.ARKADAS_KABUL:
        setModalAcik(null);
        navigate('/profil');
        break;
      default:
        setModalAcik(null);
    }
  };

  const handleTakipIstegiKabul = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      const result = await takipIstegiKabulEt(kullanici, bildirim.gonderenId);
      await bildirimOkunduIsaretle(bildirim.id);
      setIslenmisBildirimler(prev => ({
        ...prev,
        [bildirim.id]: {
          durum: 'kabul',
          mesaj: `Kabul ettin · ${bildirim.gonderenIsim || 'Kullanıcı'} seni takip ediyor`
        }
      }));
      bildirimGoster('Takip isteği kabul edildi!', 'success');
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  const handleTakipIstegiReddet = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      await takipIstegiReddet(kullanici, bildirim.gonderenId);
      await bildirimOkunduIsaretle(bildirim.id);
      setIslenmisBildirimler(prev => ({
        ...prev,
        [bildirim.id]: {
          durum: 'red',
          mesaj: `${bildirim.gonderenIsim || 'Kullanıcı'} takip isteği reddedildi`
        }
      }));
      bildirimGoster('Takip isteği reddedildi', 'success');
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  const getBildirimIkonu = (tip) => {
    switch (tip) {
      case BILDIRIM_TIPLERI.PLAN_DAVET:
        return <span className="text-lg">💌</span>;
      case BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI:
        return <span className="text-lg">🙋</span>;
      case BILDIRIM_TIPLERI.PLAN_KATILIM_SORGUSU:
        return <span className="text-lg">📅</span>;
      case BILDIRIM_TIPLERI.PLAN_GUNCELLEME:
        return <ClockIcon className="w-5 h-5 text-gold-500" />;
      case BILDIRIM_TIPLERI.YENI_MESAJ:
        return <SendIcon className="w-5 h-5 text-blue-400" />;
      case BILDIRIM_TIPLERI.ARKADAS_ISTEGI:
      case BILDIRIM_TIPLERI.ARKADAS_KABUL:
        return <UsersIcon className="w-5 h-5 text-emerald-400" />;
      case BILDIRIM_TIPLERI.TAKIP_ISTEGI:
        return <span className="text-lg">🙋</span>;
      case BILDIRIM_TIPLERI.TAKIP_KABUL:
      case BILDIRIM_TIPLERI.YENI_TAKIPCI:
        return <UsersIcon className="w-5 h-5 text-gold-500" />;
      case 'GRUP_DAVET':
        return <span className="text-lg">👥</span>;
      default:
        return <BellIcon className="w-5 h-5 text-dark-400" />;
    }
  };

  const formatZaman = (tarih) => {
    if (!tarih) return '';
    const simdi = new Date();
    const fark = simdi - tarih;
    const dakika = Math.floor(fark / 60000);
    const saat = Math.floor(dakika / 60);
    const gun = Math.floor(saat / 24);

    if (dakika < 1) return 'Az önce';
    if (dakika < 60) return `${dakika} dk önce`;
    if (saat < 24) return `${saat} saat önce`;
    if (gun < 7) return `${gun} gün önce`;
    return tarih.toLocaleDateString('tr-TR');
  };

  return (
    <ModalWrapper title="Bildirimler" onClose={() => setModalAcik(null)} fullScreen={true}>
      {okunmamisSayisi > 0 && (
        <div className="px-4 py-2 border-b border-dark-800 flex justify-end">
          <button
            onClick={handleTumunuOkunduYap}
            className="text-gold-500 text-sm font-medium"
          >
            Tümünü okundu işaretle
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto pb-safe">
        {katilimSorguBildirimleri.length > 0 && (
          <div className="p-4 border-b border-dark-700">
            <h3 className="text-xs font-semibold text-emerald-500 mb-3 flex items-center gap-2">
              <span>📅</span> Plan Zamanı Geldi
            </h3>
            <div className="space-y-3">
              {katilimSorguBildirimleri.map(b => (
                <div
                  key={b.id}
                  className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      {getBildirimIkonu(b.tip)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{b.mesaj}</p>
                      <p className="text-xs text-dark-500 mt-1">{formatZaman(b.olusturulma)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleKatildim(b)}
                      disabled={islemYapiliyor === b.id}
                      className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {islemYapiliyor === b.id ? '...' : 'Katıldım'}
                    </button>
                    <button
                      onClick={() => handleKatilmadim(b)}
                      disabled={islemYapiliyor === b.id}
                      className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Katılmadım
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {davetBildirimleri.length > 0 && (
          <div className="p-4 border-b border-dark-700">
            <h3 className="text-xs font-semibold text-gold-500 mb-3 flex items-center gap-2">
              <span>💝</span> Plan Davetleri
            </h3>
            <div className="space-y-3">
              {davetBildirimleri.map(b => {
                const islenmis = islenmisBildirimler[b.id];
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl ${islenmis ? 'bg-dark-800/50 border border-dark-700' : 'bg-gold-500/5 border border-gold-500/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl overflow-hidden ${islenmis ? 'bg-dark-700' : 'bg-gold-500/10'}`}>
                        {b.gonderenAvatar?.startsWith('http') || b.gonderenAvatar?.startsWith('data:') ? (
                          <img src={b.gonderenAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (b.gonderenAvatar || '💌')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${islenmis ? 'text-dark-400' : 'text-white'}`}>
                          {islenmis ? islenmis.mesaj : b.mesaj}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">{formatZaman(b.olusturulma)}</p>
                      </div>
                      {islenmis && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${islenmis.durum === 'kabul' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-dark-600 text-dark-400'}`}>
                          {islenmis.durum === 'kabul' ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                    {!islenmis && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleDavetKabul(b)}
                          disabled={islemYapiliyor === b.id}
                          className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {islemYapiliyor === b.id ? '...' : 'Varım ✓'}
                        </button>
                        <button
                          onClick={() => handleDavetReddet(b)}
                          disabled={islemYapiliyor === b.id}
                          className="flex-1 bg-dark-700 text-dark-300 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          Yokum ✗
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {takipIstekBildirimleri.length > 0 && (
          <div className="p-4 border-b border-dark-700">
            <h3 className="text-xs font-semibold text-purple-500 mb-3 flex items-center gap-2">
              <span>🙋</span> Takip İstekleri
            </h3>
            <div className="space-y-3">
              {takipIstekBildirimleri.map(b => {
                const islenmis = islenmisBildirimler[b.id];
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl ${islenmis ? 'bg-dark-800/50 border border-dark-700' : 'bg-purple-500/5 border border-purple-500/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl overflow-hidden ${islenmis ? 'bg-dark-700' : 'bg-purple-500/10'}`}>
                        {b.gonderenAvatar?.startsWith('http') || b.gonderenAvatar?.startsWith('data:') ? (
                          <img src={b.gonderenAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (b.gonderenAvatar || '👤')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${islenmis ? 'text-dark-400' : 'text-white'}`}>
                          {islenmis ? islenmis.mesaj : b.mesaj}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">{formatZaman(b.olusturulma)}</p>
                      </div>
                      {islenmis && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${islenmis.durum === 'kabul' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-dark-600 text-dark-400'}`}>
                          {islenmis.durum === 'kabul' ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                    {!islenmis && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleTakipIstegiKabul(b)}
                          disabled={islemYapiliyor === b.id}
                          className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {islemYapiliyor === b.id ? '...' : 'Kabul Et'}
                        </button>
                        <button
                          onClick={() => handleTakipIstegiReddet(b)}
                          disabled={islemYapiliyor === b.id}
                          className="flex-1 bg-dark-700 text-dark-300 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diğer Bildirimler */}
        {digerBildirimler?.length > 0 ? digerBildirimler.map(b => (
          <button
            key={b.id}
            onClick={() => handleBildirimTikla(b)}
            className={`w-full p-4 flex items-start gap-3 text-left border-b border-dark-800/50 transition-colors ${
              b.okundu ? 'bg-transparent' : 'bg-gold-500/5'
            } hover:bg-dark-800/50`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              b.okundu ? 'bg-dark-800' : 'bg-gold-500/10'
            }`}>
              {getBildirimIkonu(b.tip)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${b.okundu ? 'text-dark-300' : 'text-white'}`}>
                {b.mesaj}
              </p>
              <p className="text-xs text-dark-500 mt-1">
                {formatZaman(b.olusturulma)}
              </p>
            </div>
            {!b.okundu && (
              <div className="w-2 h-2 rounded-full bg-gold-500 mt-2" />
            )}
          </button>
        )) : davetBildirimleri.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">Bildirim yok</p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const AvatarDegistirModal = () => {
  const { seciliAvatar, setSeciliAvatar, avatarKategori, setAvatarKategori, avatarGuncelle } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();

  if (modalAcik !== 'avatarDegistir') return null;

  const handleKaydet = () => {
    avatarGuncelle(seciliAvatar);
    setModalAcik(null);
    bildirimGoster('Avatar güncellendi!', 'success');
  };

  return (
    <ModalWrapper title="Avatar Değiştir" onClose={() => setModalAcik(null)}>
      <div className="flex-1 p-4 space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-2 border-gold-500/30 flex items-center justify-center text-4xl">{seciliAvatar}</div>
        </div>
        <div className="flex justify-center gap-2">
          {['erkek', 'kadin', 'fantastik'].map(k => (
            <button key={k} onClick={() => setAvatarKategori(k)} className={`px-4 py-2 rounded-xl text-sm font-medium ${avatarKategori === k ? 'btn-gold' : 'btn-ghost'}`}>{k === 'erkek' ? 'Erkek' : k === 'kadin' ? 'Kadın' : 'Fantastik'}</button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_CATEGORIES[avatarKategori].map((a, i) => (
            <button key={i} onClick={() => setSeciliAvatar(a)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${seciliAvatar === a ? 'bg-gold-500/20 border-2 border-gold-500 scale-110' : 'bg-dark-700'}`}>{a}</button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-dark-800">
        <button onClick={handleKaydet} className="w-full btn-gold py-4 rounded-xl font-semibold">Kaydet</button>
      </div>
    </ModalWrapper>
  );
};

const ProfilDuzenleModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [isim, setIsim] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [bio, setBio] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [profilFoto, setProfilFoto] = useState(null);
  const fotoInputRef = useRef(null);

  useEffect(() => {
    if (modalAcik === 'profilDuzenle' && kullanici) {
      setIsim(kullanici.isim || '');
      setKullaniciAdi((kullanici.kullaniciAdi || '').replace(/@/g, ''));
      setBio(kullanici.bio || '');
      setProfilFoto(kullanici.avatar?.startsWith('data:') || kullanici.avatar?.startsWith('http') ? kullanici.avatar : null);
    }
  }, [modalAcik, kullanici]);

  if (modalAcik !== 'profilDuzenle') return null;

  const handleFotoSec = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        bildirimGoster('Fotoğraf 5MB\'dan küçük olmalı', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilFoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKaydet = async () => {
    if (!isim.trim()) {
      bildirimGoster('İsim gerekli', 'error');
      return;
    }
    if (!kullaniciAdi.trim()) {
      bildirimGoster('Kullanıcı adı gerekli', 'error');
      return;
    }
    if (kullaniciAdi.length < 3 || kullaniciAdi.length > 20) {
      bildirimGoster('Kullanıcı adı 3-20 karakter olmalı', 'error');
      return;
    }

    setYukleniyor(true);
    try {
      const temizKullaniciAdi = kullaniciAdi.toLowerCase().replace(/@/g, '').replace(/[^a-z0-9_]/g, '');
      const guncellenecekVeri = {
        isim: isim.trim(),
        kullaniciAdi: temizKullaniciAdi,
        kullaniciAdiLower: temizKullaniciAdi,
        bio: bio.trim()
      };
      // Fotoğraf seçildiyse ekle
      if (profilFoto) {
        guncellenecekVeri.avatar = profilFoto;
      }
      await profilGuncelle(kullanici.odUserId, guncellenecekVeri);
      bildirimGoster('Profil güncellendi!', 'success');
      setModalAcik(null);
    } catch (error) {
      bildirimGoster('Güncelleme başarısız', 'error');
    }
    setYukleniyor(false);
  };

  return (
    <ModalWrapper title="Profili Düzenle" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center mb-4">
          <input
            type="file"
            ref={fotoInputRef}
            onChange={handleFotoSec}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fotoInputRef.current?.click()}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/50 flex items-center justify-center overflow-hidden">
              {profilFoto ? (
                <img src={profilFoto} alt="Profil" className="w-full h-full object-cover" />
              ) : kullanici?.avatar?.startsWith('http') || kullanici?.avatar?.startsWith('data:') ? (
                <img src={kullanici.avatar} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">{kullanici?.avatar || '👤'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-dark-900" />
            </div>
          </button>
        </div>
        <p className="text-center text-xs text-dark-400">Fotoğraf eklemek için tıkla</p>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">İsim</label>
          <input
            type="text"
            value={isim}
            onChange={(e) => setIsim(e.target.value)}
            placeholder="Adınız"
            className="input-dark"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Kullanıcı Adı</label>
          <input
            type="text"
            value={kullaniciAdi}
            onChange={(e) => setKullaniciAdi(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="kullaniciadi"
            maxLength={20}
            className="input-dark"
          />
          <p className="text-xs text-dark-500 mt-1">Sadece küçük harf, rakam ve alt çizgi</p>
        </div>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Biyografi</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendinden bahset..."
            rows={3}
            maxLength={150}
            className="input-dark resize-none"
          />
          <p className="text-xs text-dark-500 mt-1">{bio.length}/150</p>
        </div>
      </div>

      <div className="p-4 border-t border-dark-800">
        <button
          onClick={handleKaydet}
          disabled={yukleniyor}
          className="w-full btn-gold py-4 rounded-xl font-semibold"
        >
          {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </ModalWrapper>
  );
};

const GizlilikAyarlariModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [gizliHesap, setGizliHesap] = useState(false);
  const [musaitlikGoster, setMusaitlikGoster] = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (modalAcik === 'gizlilikAyarlari' && kullanici) {
      setGizliHesap(kullanici.profilGizlilik === 'private');
      setMusaitlikGoster(kullanici.musaitlikGoster !== false);
    }
  }, [modalAcik, kullanici]);

  if (modalAcik !== 'gizlilikAyarlari') return null;

  const handleKaydet = async () => {
    setYukleniyor(true);
    try {
      await profilGuncelle(kullanici.odUserId, {
        profilGizlilik: gizliHesap ? 'private' : 'public',
        musaitlikGoster: musaitlikGoster
      });
      bildirimGoster('Gizlilik ayarları güncellendi', 'success');
      setModalAcik(null);
    } catch (error) {
      bildirimGoster('Güncelleme başarısız', 'error');
    }
    setYukleniyor(false);
  };

  const ToggleSwitch = ({ value, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 card">
      <div className="flex-1">
        <p className="text-white font-medium">{label}</p>
        <p className="text-xs text-dark-400 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-all ${value ? 'bg-gold-500' : 'bg-dark-600'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <ModalWrapper title="Hesap Gizliliği" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <ToggleSwitch
          value={gizliHesap}
          onChange={setGizliHesap}
          label="Gizli Hesap"
          description="Açık olduğunda sadece takipçilerin profilini görebilir"
        />

        <ToggleSwitch
          value={musaitlikGoster}
          onChange={setMusaitlikGoster}
          label="Müsaitlik Durumu"
          description="Açık olduğunda çevrimiçi durumun görünür"
        />
      </div>

      <div className="p-4 border-t border-dark-800">
        <button
          onClick={handleKaydet}
          disabled={yukleniyor}
          className="w-full btn-gold py-4 rounded-xl font-semibold"
        >
          {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </ModalWrapper>
  );
};

const BildirimAyarlariModal = () => {
  const navigate = useNavigate();
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [ayarlar, setAyarlar] = useState({
    planDavetleri: true,
    planHatirlatici: true,
    begeniler: true,
    yorumlar: true,
    takipIstekleri: true,
    mesajlar: true
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (modalAcik === 'bildirimAyarlari' && kullanici?.bildirimAyarlari) {
      setAyarlar({ ...ayarlar, ...kullanici.bildirimAyarlari });
    }
  }, [modalAcik, kullanici]);

  if (modalAcik !== 'bildirimAyarlari') return null;

  const handleGeriDon = () => {
    setModalAcik(null);
    navigate('/profil', { state: { menuAcik: true } });
  };

  const handleKaydet = async () => {
    setYukleniyor(true);
    try {
      await profilGuncelle(kullanici.odUserId, { bildirimAyarlari: ayarlar });
      bildirimGoster('Bildirim ayarları güncellendi', 'success');
      setModalAcik(null);
    } catch (error) {
      bildirimGoster('Güncelleme başarısız', 'error');
    }
    setYukleniyor(false);
  };

  const ToggleItem = ({ id, label }) => (
    <div className="flex items-center justify-between p-3 card">
      <span className="text-white">{label}</span>
      <button
        onClick={() => setAyarlar(prev => ({ ...prev, [id]: !prev[id] }))}
        className={`w-12 h-7 rounded-full transition-all ${ayarlar[id] ? 'bg-gold-500' : 'bg-dark-600'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${ayarlar[id] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <ModalWrapper title="Bildirim Ayarları" onBack={handleGeriDon} onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <ToggleItem id="planDavetleri" label="Plan Davetleri" />
        <ToggleItem id="planHatirlatici" label="Plan Hatırlatıcıları" />
        <ToggleItem id="begeniler" label="Beğeniler" />
        <ToggleItem id="yorumlar" label="Yorumlar" />
        <ToggleItem id="takipIstekleri" label="Takip İstekleri" />
        <ToggleItem id="mesajlar" label="Mesajlar" />
      </div>

      <div className="p-4 border-t border-dark-800">
        <button
          onClick={handleKaydet}
          disabled={yukleniyor}
          className="w-full btn-gold py-4 rounded-xl font-semibold"
        >
          {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </ModalWrapper>
  );
};

const KullaniciEkleModal = () => {
  const { kullanici } = useAuth();
  const { arkadaslar } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [arama, setArama] = useState('');
  const [aramaSonuclari, setAramaSonuclari] = useState([]);
  const [araniyor, setAraniyor] = useState(false);
  const [takipDurumlari, setTakipDurumlari] = useState({});
  const [islemYapiliyor, setIslemYapiliyor] = useState(null);

  useEffect(() => {
    if (!arama || arama.length < 1) {
      setAramaSonuclari([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setAraniyor(true);
      const result = await kullaniciAra(arama);
      if (result.success) {
        const filtrelenmis = result.kullanicilar.filter(k => k.odUserId !== kullanici?.odUserId);
        setAramaSonuclari(filtrelenmis);

        const durumlar = {};
        for (const k of filtrelenmis) {
          const durum = await takipDurumuGetir(kullanici?.odUserId, k.odUserId);
          durumlar[k.odUserId] = durum;
        }
        setTakipDurumlari(durumlar);
      }
      setAraniyor(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [arama, kullanici]);

  if (modalAcik !== 'kullaniciEkle') return null;

  const handleTakipEt = async (hedef) => {
    setIslemYapiliyor(hedef.odUserId);
    const result = await takipEt(kullanici, hedef.odUserId);
    if (result.success) {
      if (result.istekGonderildi) {
        setTakipDurumlari(prev => ({ ...prev, [hedef.odUserId]: { takipEdiyor: false, istekGonderildi: true } }));
        bildirimGoster('Takip isteği gönderildi!', 'success');
      } else {
        setTakipDurumlari(prev => ({ ...prev, [hedef.odUserId]: { takipEdiyor: true, istekGonderildi: false } }));
        bildirimGoster('Takip edildi!', 'success');
      }
    } else {
      bildirimGoster(result.error, 'error');
    }
    setIslemYapiliyor(null);
  };

  const handleTakiptenCik = async (hedefId) => {
    setIslemYapiliyor(hedefId);
    const result = await takiptenCik(kullanici, hedefId);
    if (result.success) {
      setTakipDurumlari(prev => ({ ...prev, [hedefId]: { takipEdiyor: false, istekGonderildi: false } }));
      bildirimGoster('Takipten çıkıldı', 'success');
    } else {
      bildirimGoster(result.error, 'error');
    }
    setIslemYapiliyor(null);
  };

  const arkadasMi = (id) => arkadaslar?.some(a => a.odUserId === id);

  const getButtonState = (userId) => {
    const durum = takipDurumlari[userId];
    if (!durum) return 'takipEt';
    if (durum.takipEdiyor || arkadasMi(userId)) return 'takipEdiliyor';
    if (durum.istekGonderildi) return 'istekGonderildi';
    return 'takipEt';
  };

  return (
    <ModalWrapper title="Kullanıcı Ekle" onClose={() => setModalAcik(null)}>
      <div className="p-4 border-b border-dark-800">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Kullanıcı adı veya isim ara..."
            className="input-dark pl-12"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {araniyor && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!araniyor && aramaSonuclari.length > 0 && (
          <div className="space-y-2">
            {aramaSonuclari.map(k => {
              const buttonState = getButtonState(k.odUserId);
              return (
                <div key={k.odUserId} className="flex items-center gap-3 p-3 card">
                  <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl overflow-hidden">
                    {k.avatar?.startsWith('http') || k.avatar?.startsWith('data:') ? (
                      <img src={k.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (k.avatar || '👤')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{k.isim}</p>
                    <p className="text-sm text-dark-400 truncate">@{(k.kullaniciAdi || '').replace(/@/g, '')}</p>
                  </div>
                  {buttonState === 'takipEdiliyor' ? (
                    <button
                      onClick={() => handleTakiptenCik(k.odUserId)}
                      disabled={islemYapiliyor === k.odUserId}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-dark-700 text-dark-300 hover:bg-dark-600 disabled:opacity-50"
                    >
                      {islemYapiliyor === k.odUserId ? '...' : 'Takip Ediliyor'}
                    </button>
                  ) : buttonState === 'istekGonderildi' ? (
                    <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-dark-700 text-gold-500">
                      İstek Gönderildi
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTakipEt(k)}
                      disabled={islemYapiliyor === k.odUserId}
                      className="btn-gold px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {islemYapiliyor === k.odUserId ? '...' : 'Takip Et'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!araniyor && arama && aramaSonuclari.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-400">Kullanıcı bulunamadı</p>
          </div>
        )}

        {!arama && (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">Kullanıcı adı veya isim yazarak ara</p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const TakipciListesiModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [tab, setTab] = useState('takipciler');
  const [takipciler, setTakipciler] = useState([]);
  const [takipEdilenler, setTakipEdilenler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (modalAcik === 'takipciListesi') {
      setTab('takipciler');
    } else if (modalAcik === 'takipListesi') {
      setTab('takipEdilenler');
    }
  }, [modalAcik]);

  useEffect(() => {
    const yukle = async () => {
      if (!kullanici?.odUserId || (modalAcik !== 'takipciListesi' && modalAcik !== 'takipListesi')) return;

      setYukleniyor(true);

      // Takipçileri yükle
      const takipciIds = kullanici.takipciler || [];
      const takipciListesi = [];
      for (const id of takipciIds.slice(0, 50)) {
        const info = await kullaniciBilgisiGetir(id);
        if (info) takipciListesi.push({ ...info, odUserId: id });
      }
      setTakipciler(takipciListesi);

      // Takip edilenleri yükle
      const takipEdilenIds = kullanici.takipEdilenler || [];
      const takipEdilenListesi = [];
      for (const id of takipEdilenIds.slice(0, 50)) {
        const info = await kullaniciBilgisiGetir(id);
        if (info) takipEdilenListesi.push({ ...info, odUserId: id });
      }
      setTakipEdilenler(takipEdilenListesi);

      setYukleniyor(false);
    };

    yukle();
  }, [modalAcik, kullanici]);

  if (modalAcik !== 'takipciListesi' && modalAcik !== 'takipListesi') return null;

  const handleTakipToggle = async (userId) => {
    const result = await takiptenCik(kullanici, userId);
    if (result.success) {
      bildirimGoster('Takipten çıkıldı', 'success');
    } else {
      bildirimGoster(result.error, 'error');
    }
  };

  const gosterilecekListe = tab === 'takipciler' ? takipciler : takipEdilenler;

  return (
    <ModalWrapper title={tab === 'takipciler' ? 'Takipçiler' : 'Takip Edilenler'} onClose={() => setModalAcik(null)}>
      <div className="border-b border-dark-800">
        <div className="flex">
          <button
            onClick={() => setTab('takipciler')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              tab === 'takipciler' ? 'text-white' : 'text-dark-400'
            }`}
          >
            Takipçiler ({takipciler.length})
            {tab === 'takipciler' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
          <button
            onClick={() => setTab('takipEdilenler')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              tab === 'takipEdilenler' ? 'text-white' : 'text-dark-400'
            }`}
          >
            Takip ({takipEdilenler.length})
            {tab === 'takipEdilenler' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {yukleniyor ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gosterilecekListe.length > 0 ? (
          gosterilecekListe.map(user => (
            <div key={user.odUserId} className="flex items-center gap-3 p-3 card">
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl overflow-hidden">
                {user.avatar?.startsWith('http') || user.avatar?.startsWith('data:') ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (user.avatar || '👤')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user.isim}</p>
                <p className="text-sm text-dark-400 truncate">@{(user.kullaniciAdi || '').replace(/@/g, '')}</p>
              </div>
              {tab === 'takipEdilenler' && (
                <button
                  onClick={() => handleTakipToggle(user.odUserId)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-dark-700 text-dark-300 hover:bg-dark-600"
                >
                  Takibi Bırak
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">
              {tab === 'takipciler' ? 'Henüz takipçin yok' : 'Henüz kimseyi takip etmiyorsun'}
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const DigerKullaniciTakipciModal = ({ hedefUserId, onClose }) => {
  const { kullanici } = useAuth();
  const { arkadaslar } = useData();
  const { bildirimGoster } = useUI();
  const [tab, setTab] = useState('takipciler');
  const [hedefKullanici, setHedefKullanici] = useState(null);
  const [takipciler, setTakipciler] = useState([]);
  const [takipEdilenler, setTakipEdilenler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [erisimYok, setErisimYok] = useState(false);

  useEffect(() => {
    const yukle = async () => {
      if (!hedefUserId) return;
      setYukleniyor(true);

      const hedefBilgi = await kullaniciBilgisiGetir(hedefUserId);
      if (!hedefBilgi) {
        setYukleniyor(false);
        return;
      }

      setHedefKullanici(hedefBilgi);

      const benimProfilim = hedefUserId === kullanici?.odUserId;
      const gizliHesap = hedefBilgi.profilGizlilik === 'private';
      const takipEdiyor = hedefBilgi.takipciler?.includes(kullanici?.odUserId) || hedefBilgi.arkadaslar?.includes(kullanici?.odUserId);

      if (!benimProfilim && gizliHesap && !takipEdiyor) {
        setErisimYok(true);
        setYukleniyor(false);
        return;
      }

      const takipciIds = hedefBilgi.takipciler || hedefBilgi.arkadaslar || [];
      const takipEdilenIds = hedefBilgi.takipEdilenler || hedefBilgi.arkadaslar || [];

      const takipciListesi = [];
      for (const id of takipciIds.slice(0, 50)) {
        const info = await kullaniciBilgisiGetir(id);
        if (info) takipciListesi.push({ ...info, odUserId: id });
      }

      const takipEdilenListesi = [];
      for (const id of takipEdilenIds.slice(0, 50)) {
        const info = await kullaniciBilgisiGetir(id);
        if (info) takipEdilenListesi.push({ ...info, odUserId: id });
      }

      setTakipciler(takipciListesi);
      setTakipEdilenler(takipEdilenListesi);
      setYukleniyor(false);
    };

    yukle();
  }, [hedefUserId, kullanici]);

  if (erisimYok) {
    return (
      <ModalWrapper title="Erişim Engellendi" onClose={onClose}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <LockIcon className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Bu hesap gizli</p>
            <p className="text-dark-400 text-sm">Takipçi ve takip listesini görmek için bu hesabı takip etmelisin.</p>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  const gosterilecekListe = tab === 'takipciler' ? takipciler : takipEdilenler;

  return (
    <ModalWrapper title={hedefKullanici?.isim || 'Kullanıcı'} onClose={onClose}>
      <div className="border-b border-dark-800">
        <div className="flex">
          <button
            onClick={() => setTab('takipciler')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              tab === 'takipciler' ? 'text-white' : 'text-dark-400'
            }`}
          >
            Takipçiler ({takipciler.length})
            {tab === 'takipciler' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
          <button
            onClick={() => setTab('takipEdilenler')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              tab === 'takipEdilenler' ? 'text-white' : 'text-dark-400'
            }`}
          >
            Takip ({takipEdilenler.length})
            {tab === 'takipEdilenler' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {yukleniyor ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : gosterilecekListe.length > 0 ? (
          gosterilecekListe.map(user => (
            <div key={user.odUserId} className="flex items-center gap-3 p-3 card">
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl overflow-hidden">
                {user.avatar?.startsWith('http') || user.avatar?.startsWith('data:') ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (user.avatar || '👤')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user.isim}</p>
                <p className="text-sm text-dark-400 truncate">@{(user.kullaniciAdi || '').replace(/@/g, '')}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">
              {tab === 'takipciler' ? 'Henüz takipçi yok' : 'Henüz kimseyi takip etmiyor'}
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const TakipIstekleriModal = () => {
  const { kullanici } = useAuth();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [yukleniyor, setYukleniyor] = useState(null);

  if (modalAcik !== 'takipIstekleri') return null;

  const bekleyenler = kullanici?.takipIstekleri?.filter(i => i.durum === 'bekliyor') || [];

  const handleKabul = async (id) => {
    setYukleniyor(id);
    const result = await takipIstegiKabulEt(kullanici, id);
    setYukleniyor(null);
    if (result.success) {
      bildirimGoster('Takip isteği kabul edildi!', 'success');
    } else {
      bildirimGoster(result.error, 'error');
    }
  };

  const handleReddet = async (id) => {
    setYukleniyor(id);
    const result = await takipIstegiReddet(kullanici, id);
    setYukleniyor(null);
    if (result.success) {
      bildirimGoster('Takip isteği reddedildi', 'success');
    } else {
      bildirimGoster(result.error, 'error');
    }
  };

  return (
    <ModalWrapper title="Takip İstekleri" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4">
        {bekleyenler.length > 0 ? bekleyenler.map(i => (
          <div key={i.kimden} className="card p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl">
                {i.kimdenAvatar || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{i.kimdenIsim}</p>
                <p className="text-sm text-dark-400 truncate">@{(i.kimdenKullaniciAdi || '').replace(/@/g, '')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleKabul(i.kimden)}
                disabled={yukleniyor === i.kimden}
                className="flex-1 btn-gold py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {yukleniyor === i.kimden ? '...' : 'Kabul Et'}
              </button>
              <button
                onClick={() => handleReddet(i.kimden)}
                disabled={yukleniyor === i.kimden}
                className="flex-1 btn-ghost py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">Bekleyen takip isteği yok</p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const HikayeEkleModal = () => {
  const { kullanici } = useAuth();
  const { hikayeEkle } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [metin, setMetin] = useState('');
  const [arkaplanRengi, setArkaplanRengi] = useState('#D4AF37');
  const [yukleniyor, setYukleniyor] = useState(false);
  const fileInputRef = useRef(null);
  const [secilenGorsel, setSecilenGorsel] = useState(null);

  const renkler = [
    '#D4AF37', // Gold
    '#3B82F6', // Blue
    '#10B981', // Green
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#EC4899', // Pink
    '#1E1E1E', // Dark
  ];

  if (modalAcik !== 'hikayeEkle') return null;

  const handleGorselSec = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        bildirimGoster('Dosya 5MB\'dan küçük olmalı', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSecilenGorsel(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaylas = async () => {
    if (!metin.trim() && !secilenGorsel) {
      bildirimGoster('Bir metin veya görsel ekle', 'error');
      return;
    }

    setYukleniyor(true);
    try {
      const hikayeData = {
        metin: metin.trim(),
        arkaplanRengi: secilenGorsel ? null : arkaplanRengi,
        gorsel: secilenGorsel || null,
        olusturanId: kullanici.odUserId,
        olusturanIsim: kullanici.isim,
        olusturanAvatar: kullanici.avatar,
        olusturulma: new Date(),
        sonGecerlilik: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 saat
      };

      if (typeof hikayeEkle === 'function') {
        await hikayeEkle(hikayeData);
      }

      bildirimGoster('Hikaye paylaşıldı!', 'success');
      setModalAcik(null);
      setMetin('');
      setSecilenGorsel(null);
    } catch (error) {
      bildirimGoster('Hikaye paylaşılamadı', 'error');
    }
    setYukleniyor(false);
  };

  return (
    <ModalWrapper title="Hikaye Oluştur" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Önizleme */}
        <div
          className="relative w-full aspect-[9/16] max-h-[300px] rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: secilenGorsel ? '#1E1E1E' : arkaplanRengi }}
        >
          {secilenGorsel ? (
            <img
              src={secilenGorsel}
              alt="Hikaye önizleme"
              className="w-full h-full object-cover"
            />
          ) : null}
          {metin && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="text-white text-xl font-bold text-center drop-shadow-lg">
                {metin}
              </p>
            </div>
          )}
          {!metin && !secilenGorsel && (
            <p className="text-white/50 text-sm">Önizleme</p>
          )}
        </div>

        {/* Görsel Seçme */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleGorselSec}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-dark-600 text-dark-400 hover:border-gold-500 hover:text-gold-500 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            {secilenGorsel ? 'Farklı Görsel Seç' : 'Görsel Ekle'}
          </button>
        </div>

        {/* Metin Girişi */}
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Metin (Opsiyonel)</label>
          <textarea
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            placeholder="Hikayene bir şeyler yaz..."
            rows={2}
            maxLength={150}
            className="input-dark resize-none"
          />
          <p className="text-xs text-dark-500 mt-1">{metin.length}/150</p>
        </div>

        {/* Arkaplan Rengi (sadece görsel yoksa) */}
        {!secilenGorsel && (
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Arkaplan Rengi</label>
            <div className="flex gap-2">
              {renkler.map((renk) => (
                <button
                  key={renk}
                  onClick={() => setArkaplanRengi(renk)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    arkaplanRengi === renk ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-dark-900' : ''
                  }`}
                  style={{ backgroundColor: renk }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-dark-800">
        <button
          onClick={handlePaylas}
          disabled={yukleniyor || (!metin.trim() && !secilenGorsel)}
          className="w-full btn-gold py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          {yukleniyor ? 'Paylaşılıyor...' : 'Hikaye Paylaş'}
        </button>
      </div>
    </ModalWrapper>
  );
};

const AppModals = () => (
  <>
    <HizliPlanModal />
    <ArkadaslarModal />
    <ArkadasIstekleriModal />
    <DetayModal />
    <YeniGrupModal />
    <BildirimlerModal />
    <AvatarDegistirModal />
    <ProfilDuzenleModal />
    <GizlilikAyarlariModal />
    <BildirimAyarlariModal />
    <TakipciListesiModal />
    <KullaniciEkleModal />
    <TakipIstekleriModal />
    <HikayeEkleModal />
  </>
);

export default AppModals;
