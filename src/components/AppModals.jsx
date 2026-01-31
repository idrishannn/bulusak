import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData, useUI, useTheme } from '../context';
import { XIcon, SearchIcon, CheckIcon, ChevronRightIcon, SendIcon, ClockIcon, LocationIcon, UsersIcon, TrashIcon, EditIcon, GlobeIcon, LockIcon, BellIcon, CameraIcon, ImageIcon } from './Icons';
import { kullaniciAra, arkadasIstegiGonder, arkadasSil, arkadasIstegiKabulEt, arkadasIstegiReddet } from '../services/arkadasService';
import { mesajEkle, etkinlikSil, etkinlikGuncelle } from '../services/etkinlikService';
import { bildirimOkunduIsaretle, tumBildirimleriOkunduIsaretle, BILDIRIM_TIPLERI } from '../services/bildirimService';
import { profilGuncelle } from '../services/authService';
import {
  HOUR_OPTIONS, GROUP_ICONS, AVATAR_CATEGORIES, PARTICIPANT_LIMITS,
  PLAN_VISIBILITY, KATILIM_DURUMLARI, KATILIM_LABELS, KATILIM_COLORS,
  MAX_VISIBLE_PARTICIPANTS, PLAN_CATEGORIES, PLAN_STATUS
} from '../constants';

const ModalWrapper = ({ children, onClose, title, fullScreen = false }) => {
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
          <h2 className="text-lg font-semibold text-white">{title}</h2>
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
          <h2 className="text-lg font-semibold text-white">{title}</h2>
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

  return (
    <button onClick={onPress} className="flex items-center">
      <div className="flex -space-x-3">
        {gosterilecek.map((k, i) => (
          <div
            key={k.odUserId || i}
            className="w-10 h-10 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-lg"
            style={{ zIndex: maxVisible - i }}
          >
            {k.avatar || '👤'}
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
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl">
                      {k.avatar || '👤'}
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
                    <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl">
                      {k.avatar || '👤'}
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
  const { gruplar, arkadaslar, etkinlikler, musaitlikler, yeniEtkinlikOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [baslik, setBaslik] = useState('');
  const [seciliTarih, setSeciliTarih] = useState(new Date().toISOString().split('T')[0]);
  const [seciliSaat, setSeciliSaat] = useState('15:00');
  const [mekan, setMekan] = useState('');
  const [secimModu, setSecimModu] = useState('arkadas');
  const [secilenArkadaslar, setSecilenArkadaslar] = useState([]);
  const [secilenGrupId, setSecilenGrupId] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [grupAdi, setGrupAdi] = useState('');
  const [kategori, setKategori] = useState('tumu');

  const [visibility, setVisibility] = useState(PLAN_VISIBILITY.PRIVATE);
  const [katilimciLimit, setKatilimciLimit] = useState(0);

  // Müsait arkadaşları hesapla
  const musaitArkadaslar = useMemo(() => {
    if (!arkadaslar?.length) return [];

    const seciliDateTime = new Date(seciliTarih);
    const key = `${seciliDateTime.toDateString()}-${seciliSaat}`;

    return arkadaslar.filter(arkadas => {
      // Arkadaşın müsaitlik bilgisini kontrol et
      const arkadasMusait = arkadas.musaitlikler?.[key] === true;

      // Aynı zaman diliminde başka planı var mı kontrol et
      const mesgulMu = etkinlikler?.some(e => {
        const planTarih = new Date(e.startAt || e.tarih);
        return planTarih.toDateString() === seciliDateTime.toDateString() &&
               e.saat === seciliSaat &&
               (e.participantIds?.includes(arkadas.odUserId) || e.olusturanId === arkadas.odUserId);
      });

      return arkadasMusait && !mesgulMu;
    });
  }, [arkadaslar, seciliTarih, seciliSaat, etkinlikler]);

  // Müsait olmayan arkadaşlar
  const digerArkadaslar = useMemo(() => {
    if (!arkadaslar?.length) return [];
    const musaitIds = musaitArkadaslar.map(a => a.odUserId);
    return arkadaslar.filter(a => !musaitIds.includes(a.odUserId));
  }, [arkadaslar, musaitArkadaslar]);

  if (modalAcik !== 'hizliPlan') return null;

  const arkadasToggle = (id) => {
    setSecilenArkadaslar(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOlustur = async () => {
    if (!baslik.trim()) { bildirimGoster('Plan adı gerekli', 'error'); return; }

    if (secimModu === 'grup' && !grupAdi.trim()) {
      bildirimGoster('Grup planı için grup adı zorunlu', 'error');
      return;
    }

    if (visibility === PLAN_VISIBILITY.PRIVATE) {
      if (secimModu === 'arkadas' && secilenArkadaslar.length === 0) {
        bildirimGoster('En az bir arkadaş seç', 'error');
        return;
      }
      if (secimModu === 'grup' && !secilenGrupId) {
        bildirimGoster('Bir grup seç', 'error');
        return;
      }
    }

    setYukleniyor(true);
    const planData = {
      baslik: baslik.trim(),
      ikon: 'diger',
      tarih: new Date(seciliTarih),
      saat: seciliSaat,
      mekan: mekan.trim() || 'Belirtilmedi',
      tip: secimModu,
      visibility,
      katilimciLimit: katilimciLimit || null,
      kategori: kategori !== 'tumu' ? kategori : null,
      status: PLAN_STATUS.ACTIVE
    };

    if (secimModu === 'arkadas' && secilenArkadaslar.length > 0) {
      planData.davetliler = secilenArkadaslar;
      planData.davetliDetaylar = arkadaslar.filter(a => secilenArkadaslar.includes(a.odUserId));
    } else if (secimModu === 'grup' && secilenGrupId) {
      planData.grup = gruplar.find(g => g.id === secilenGrupId);
      planData.grupAdi = grupAdi.trim();
    }

    const result = await yeniEtkinlikOlustur(planData);
    setYukleniyor(false);

    if (result.success) {
      bildirimGoster('Plan oluşturuldu!', 'success');
      setModalAcik(null);
      setBaslik(''); setMekan(''); setSecilenArkadaslar([]); setSecilenGrupId(null);
      setVisibility(PLAN_VISIBILITY.PRIVATE); setKatilimciLimit(0); setGrupAdi(''); setKategori('tumu');
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

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Kimlerle?</label>
          <div className="flex gap-2">
            <button onClick={() => setSecimModu('arkadas')} className={`flex-1 py-3 rounded-xl font-medium text-sm ${secimModu === 'arkadas' ? 'btn-gold' : 'btn-ghost'}`}>Arkadaşlar</button>
            <button onClick={() => setSecimModu('grup')} className={`flex-1 py-3 rounded-xl font-medium text-sm ${secimModu === 'grup' ? 'btn-gold' : 'btn-ghost'}`}>Grup</button>
          </div>
        </div>

        {secimModu === 'arkadas' && (
          <div className="space-y-3">
            {/* Müsait Arkadaşlar */}
            {musaitArkadaslar.length > 0 && (
              <div>
                <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Müsait Arkadaşlar ({musaitArkadaslar.length})
                </p>
                <div className="card p-3 max-h-32 overflow-y-auto space-y-2 border-emerald-500/20">
                  {musaitArkadaslar.map(a => (
                    <button key={a.odUserId} onClick={() => arkadasToggle(a.odUserId)} className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${secilenArkadaslar.includes(a.odUserId) ? 'bg-gold-500/20 border border-gold-500/30' : 'hover:bg-dark-700'}`}>
                      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-xl">{a.avatar || '👤'}</div>
                      <span className="flex-1 text-left text-white font-medium">{a.isim}</span>
                      <span className="text-xs text-emerald-400">Müsait</span>
                      {secilenArkadaslar.includes(a.odUserId) && <CheckIcon className="w-5 h-5 text-gold-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Diğer Arkadaşlar */}
            {digerArkadaslar.length > 0 && (
              <div>
                <p className="text-xs font-medium text-dark-400 mb-2">
                  Diğer Arkadaşlar ({digerArkadaslar.length})
                </p>
                <div className="card p-3 max-h-32 overflow-y-auto space-y-2">
                  {digerArkadaslar.map(a => (
                    <button key={a.odUserId} onClick={() => arkadasToggle(a.odUserId)} className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${secilenArkadaslar.includes(a.odUserId) ? 'bg-gold-500/20 border border-gold-500/30' : 'hover:bg-dark-700'}`}>
                      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-xl">{a.avatar || '👤'}</div>
                      <span className="flex-1 text-left text-white font-medium">{a.isim}</span>
                      {secilenArkadaslar.includes(a.odUserId) && <CheckIcon className="w-5 h-5 text-gold-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {arkadaslar?.length === 0 && (
              <div className="text-center py-4 text-dark-400 text-sm">Henüz arkadaşın yok</div>
            )}
          </div>
        )}

        {secimModu === 'grup' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gold-400 mb-2 block">Grup Adı (Zorunlu)</label>
              <input
                type="text"
                value={grupAdi}
                onChange={(e) => setGrupAdi(e.target.value)}
                placeholder="Bu plan için grup adı gir..."
                className="input-dark"
              />
              {!grupAdi.trim() && <p className="text-xs text-dark-500 mt-1">Grup planlarında grup adı zorunludur</p>}
            </div>
            {gruplar?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-400 block">Mevcut Gruplardan Seç</label>
                {gruplar.map(g => (
                  <button key={g.id} onClick={() => { setSecilenGrupId(g.id); if (!grupAdi) setGrupAdi(g.isim); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${secilenGrupId === g.id ? 'bg-gold-500/20 border border-gold-500/30' : 'card-hover'}`}>
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="flex-1 text-left text-white font-medium">{g.isim}</span>
                    {secilenGrupId === g.id && <CheckIcon className="w-5 h-5 text-gold-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
                    <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl">{k.avatar || '👤'}</div>
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
                  <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl">{a.avatar || '👤'}</div>
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
  const { katilimDurumuGuncelle } = useData();
  const { modalAcik, setModalAcik, seciliEtkinlik, setSeciliEtkinlik, bildirimGoster } = useUI();
  const [mesaj, setMesaj] = useState('');
  const [katilimcilarModalAcik, setKatilimcilarModalAcik] = useState(false);
  const [silmeOnay, setSilmeOnay] = useState(false);

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
    await mesajEkle(seciliEtkinlik.id, { odUserId: kullanici.odUserId, isim: kullanici.isim, avatar: kullanici.avatar, mesaj: mesaj.trim() });
    setSeciliEtkinlik(prev => ({ ...prev, mesajlar: [...(prev.mesajlar || []), { odUserId: kullanici.odUserId, isim: kullanici.isim, avatar: kullanici.avatar, mesaj: mesaj.trim(), zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }] }));
    setMesaj('');
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

  return (
    <>
      <ModalWrapper title={seciliEtkinlik.baslik} onClose={() => { setModalAcik(null); setSeciliEtkinlik(null); }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Plan Sahibi Bilgisi */}
          <div className="flex items-center gap-3 p-3 card">
            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl border-2 border-gold-500/30">
              {planSahibi?.avatar || seciliEtkinlik.olusturanAvatar || '👤'}
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
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                    benimDurum === KATILIM_DURUMLARI.VARIM
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'btn-ghost'
                  }`}
                >
                  {KATILIM_LABELS.varim}
                </button>
                <button
                  onClick={() => handleKatilim(KATILIM_DURUMLARI.YOKUM)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
                    benimDurum === KATILIM_DURUMLARI.YOKUM
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                      : 'btn-ghost'
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

          {/* Mesajlar */}
          <div>
            <p className="text-xs text-dark-400 mb-2">Mesajlar</p>
            <div className="card p-3 max-h-48 overflow-y-auto space-y-3">
              {(seciliEtkinlik.mesajlar || []).map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.odUserId === kullanici?.odUserId ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-sm flex-shrink-0">{m.avatar || '👤'}</div>
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
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-lg">{a.avatar || '👤'}</div>
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

  if (modalAcik !== 'bildirimler') return null;

  const okunmamisSayisi = bildirimler?.filter(b => !b.okundu).length || 0;

  // Davet türündeki bildirimleri ayır (aksiyonlu olanlar)
  const davetBildirimleri = bildirimler?.filter(b =>
    !b.okundu && (
      b.tip === BILDIRIM_TIPLERI.PLAN_DAVET ||
      b.tip === BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI ||
      b.tip === 'GRUP_DAVET'
    )
  ) || [];

  const digerBildirimler = bildirimler?.filter(b =>
    b.okundu || (
      b.tip !== BILDIRIM_TIPLERI.PLAN_DAVET &&
      b.tip !== BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI &&
      b.tip !== 'GRUP_DAVET'
    )
  ) || [];

  const handleTumunuOkunduYap = async () => {
    if (kullanici?.odUserId) {
      await tumBildirimleriOkunduIsaretle(kullanici.odUserId);
    }
  };

  // Davet Kabul Et
  const handleDavetKabul = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      if (bildirim.tip === BILDIRIM_TIPLERI.PLAN_DAVET && bildirim.planId) {
        // Plana katıl
        await katilimDurumuGuncelle(bildirim.planId, KATILIM_DURUMLARI.VARIM);
        bildirimGoster('Daveti kabul ettin!', 'success');
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

  // Davet Reddet
  const handleDavetReddet = async (bildirim) => {
    setIslemYapiliyor(bildirim.id);
    try {
      if (bildirim.tip === BILDIRIM_TIPLERI.PLAN_DAVET && bildirim.planId) {
        // Daveti reddet
        await katilimDurumuGuncelle(bildirim.planId, KATILIM_DURUMLARI.YOKUM);
        bildirimGoster('Daveti reddettin', 'success');
      }
      // Bildirimi okundu yap
      await bildirimOkunduIsaretle(bildirim.id);
    } catch (error) {
      bildirimGoster('İşlem başarısız', 'error');
    }
    setIslemYapiliyor(null);
  };

  const handleBildirimTikla = async (bildirim) => {
    // Önce okundu olarak işaretle
    if (!bildirim.okundu) {
      await bildirimOkunduIsaretle(bildirim.id);
    }

    // Bildirim tipine göre navigasyon
    switch (bildirim.tip) {
      case BILDIRIM_TIPLERI.PLAN_DAVET:
      case BILDIRIM_TIPLERI.PLAN_GUNCELLEME:
      case BILDIRIM_TIPLERI.PLAN_YORUM:
        // Plan detayına git
        if (bildirim.planId) {
          const plan = etkinlikler?.find(e => e.id === bildirim.planId);
          if (plan) {
            setSeciliEtkinlik(plan);
            setModalAcik('detay');
          }
        }
        break;
      case BILDIRIM_TIPLERI.YENI_MESAJ:
        // Mesajlar sayfasına git
        setModalAcik(null);
        navigate('/mesajlar');
        break;
      case BILDIRIM_TIPLERI.ARKADAS_ISTEGI:
      case BILDIRIM_TIPLERI.ARKADAS_KABUL:
        // Profil sayfasına git
        setModalAcik(null);
        navigate('/profil');
        break;
      default:
        // Sadece modal'ı kapat
        setModalAcik(null);
    }
  };

  const getBildirimIkonu = (tip) => {
    switch (tip) {
      case BILDIRIM_TIPLERI.PLAN_DAVET:
        return <span className="text-lg">💌</span>;
      case BILDIRIM_TIPLERI.PLAN_KATILIM_ISTEGI:
        return <span className="text-lg">🙋</span>;
      case BILDIRIM_TIPLERI.PLAN_GUNCELLEME:
        return <ClockIcon className="w-5 h-5 text-gold-500" />;
      case BILDIRIM_TIPLERI.YENI_MESAJ:
        return <SendIcon className="w-5 h-5 text-blue-400" />;
      case BILDIRIM_TIPLERI.ARKADAS_ISTEGI:
      case BILDIRIM_TIPLERI.ARKADAS_KABUL:
        return <UsersIcon className="w-5 h-5 text-emerald-400" />;
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
        {/* Davet Merkezi - Aksiyonlu Bildirimler */}
        {davetBildirimleri.length > 0 && (
          <div className="p-4 border-b border-dark-700">
            <h3 className="text-xs font-semibold text-gold-500 mb-3 flex items-center gap-2">
              <span>💝</span> Davet Merkezi
            </h3>
            <div className="space-y-3">
              {davetBildirimleri.map(b => (
                <div
                  key={b.id}
                  className="p-3 bg-gold-500/5 border border-gold-500/20 rounded-xl"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                      {getBildirimIkonu(b.tip)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{b.mesaj}</p>
                      <p className="text-xs text-dark-500 mt-1">{formatZaman(b.olusturulma)}</p>
                    </div>
                  </div>
                  {/* Kabul/Reddet Aksiyonları */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDavetKabul(b)}
                      disabled={islemYapiliyor === b.id}
                      className="flex-1 btn-gold py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {islemYapiliyor === b.id ? '...' : 'Kabul Et'}
                    </button>
                    <button
                      onClick={() => handleDavetReddet(b)}
                      disabled={islemYapiliyor === b.id}
                      className="flex-1 btn-ghost py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
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

const BucketListModal = () => {
  const { bucketList, bucketListEkle, bucketListToggle, bucketListSil } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [yeniItem, setYeniItem] = useState('');

  if (modalAcik !== 'bucketList') return null;

  const handleEkle = () => {
    if (!yeniItem.trim()) return;
    bucketListEkle({ baslik: yeniItem });
    setYeniItem('');
    bildirimGoster('Eklendi!', 'success');
  };

  return (
    <ModalWrapper title="Bucket List" onClose={() => setModalAcik(null)}>
      <div className="p-4 border-b border-dark-800">
        <div className="flex gap-2">
          <input type="text" value={yeniItem} onChange={(e) => setYeniItem(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleEkle()} placeholder="Yapmak istediğin bir şey..." className="flex-1 input-dark" />
          <button onClick={handleEkle} className="btn-gold px-4 rounded-xl">Ekle</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {bucketList?.map(item => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${item.tamamlandi ? 'bg-emerald-500/10' : 'card'}`}>
            <button onClick={() => bucketListToggle(item.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.tamamlandi ? 'bg-emerald-500 border-emerald-500' : 'border-dark-600'}`}>
              {item.tamamlandi && <CheckIcon className="w-3 h-3 text-white" />}
            </button>
            <span className={`flex-1 ${item.tamamlandi ? 'line-through text-dark-500' : 'text-white'}`}>{item.baslik}</span>
            <button onClick={() => bucketListSil(item.id)} className="text-dark-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
          </div>
        ))}
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

  useEffect(() => {
    if (modalAcik === 'profilDuzenle' && kullanici) {
      setIsim(kullanici.isim || '');
      setKullaniciAdi((kullanici.kullaniciAdi || '').replace(/@/g, ''));
      setBio(kullanici.bio || '');
    }
  }, [modalAcik, kullanici]);

  if (modalAcik !== 'profilDuzenle') return null;

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
      await profilGuncelle(kullanici.odUserId, {
        isim: isim.trim(),
        kullaniciAdi: temizKullaniciAdi,
        kullaniciAdiLower: temizKullaniciAdi,
        bio: bio.trim()
      });
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
          <button
            onClick={() => setModalAcik('avatarDegistir')}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-500/50 flex items-center justify-center">
              <span className="text-5xl">{kullanici?.avatar || '👤'}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-dark-900" />
            </div>
          </button>
        </div>

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
    <ModalWrapper title="Bildirim Ayarları" onClose={() => setModalAcik(null)}>
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

const TakipciListesiModal = () => {
  const { kullanici } = useAuth();
  const { arkadaslar } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [tab, setTab] = useState('takipciler');

  if (modalAcik !== 'takipciListesi') return null;

  const takipciler = arkadaslar || [];
  const takipEdilenler = arkadaslar || [];

  const handleTakipToggle = async (userId, takipEdiyorMu) => {
    if (takipEdiyorMu) {
      const result = await arkadasSil(kullanici, userId);
      if (result.success) {
        bildirimGoster('Takipten çıkıldı', 'success');
      }
    } else {
      const result = await arkadasIstegiGonder(kullanici, userId);
      if (result.success) {
        bildirimGoster('Takip isteği gönderildi', 'success');
      }
    }
  };

  return (
    <ModalWrapper title="Takipçiler" onClose={() => setModalAcik(null)}>
      <div className="border-b border-dark-800">
        <div className="flex">
          <button
            onClick={() => setTab('takipciler')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              tab === 'takipciler' ? 'text-white' : 'text-dark-400'
            }`}
          >
            Takipçiler
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
            Takip Edilenler
            {tab === 'takipEdilenler' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {(tab === 'takipciler' ? takipciler : takipEdilenler).map(user => (
          <div key={user.odUserId} className="flex items-center gap-3 p-3 card">
            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-2xl">
              {user.avatar || '👤'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{user.isim}</p>
              <p className="text-sm text-dark-400">{user.kullaniciAdi?.replace(/@/g, '')}</p>
            </div>
            <button
              onClick={() => handleTakipToggle(user.odUserId, true)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-dark-700 text-dark-300 hover:bg-dark-600"
            >
              Takipten Çık
            </button>
          </div>
        ))}
        {(tab === 'takipciler' ? takipciler : takipEdilenler).length === 0 && (
          <div className="text-center py-8">
            <p className="text-dark-400">
              {tab === 'takipciler' ? 'Henüz takipçin yok' : 'Henüz kimseyi takip etmiyorsun'}
            </p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const KonumAyarlariModal = () => {
  const { modalAcik, setModalAcik } = useUI();

  if (modalAcik !== 'konumAyarlari') return null;

  return (
    <ModalWrapper title="Konum Ayarları" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-dark-400 text-center py-8">
          Konum ayarları Keşfet sayfasından yapılabilir.
        </p>
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
    <BucketListModal />
    <AvatarDegistirModal />
    <ProfilDuzenleModal />
    <GizlilikAyarlariModal />
    <BildirimAyarlariModal />
    <TakipciListesiModal />
    <KonumAyarlariModal />
    <HikayeEkleModal />
  </>
);

export default AppModals;
