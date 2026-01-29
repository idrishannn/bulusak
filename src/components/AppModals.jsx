import React, { useState, useEffect } from 'react';
import { useAuth, useData, useUI } from '../context';
import { XIcon, SearchIcon, CheckIcon, ChevronRightIcon, SendIcon, ClockIcon, LocationIcon, UsersIcon, TrashIcon } from './Icons';
import { kullaniciAra, arkadasIstegiGonder, arkadasSil, arkadasIstegiKabulEt, arkadasIstegiReddet } from '../services/arkadasService';
import { mesajEkle } from '../services/etkinlikService';
import Logo from './Logo';

const saatler = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const grupIkonlari = ['🎓', '💼', '⚽', '🎮', '🎵', '🍕', '☕', '🎬', '🏖️', '🎉'];
const avatarlar = {
  erkek: ['👨', '👨‍🦱', '👨‍🦰', '👨‍🦳', '🧔', '👱‍♂️', '👨‍🎓', '👨‍💼', '🤵', '👲'],
  kadin: ['👩', '👩‍🦱', '👩‍🦰', '👩‍🦳', '👱‍♀️', '👩‍🎓', '👩‍💼', '👰', '🧕', '👧'],
  fantastik: ['🤖', '👽', '👻', '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐲']
};

const ModalWrapper = ({ children, onClose, title }) => (
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

const HizliPlanModal = () => {
  const { kullanici } = useAuth();
  const { gruplar, arkadaslar, yeniGrupOlustur, yeniEtkinlikOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [baslik, setBaslik] = useState('');
  const [seciliTarih, setSeciliTarih] = useState(new Date().toISOString().split('T')[0]);
  const [seciliSaat, setSeciliSaat] = useState('15:00');
  const [mekan, setMekan] = useState('');
  const [secimModu, setSecimModu] = useState('arkadas');
  const [secilenArkadaslar, setSecilenArkadaslar] = useState([]);
  const [secilenGrupId, setSecilenGrupId] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  if (modalAcik !== 'hizliPlan') return null;

  const arkadasToggle = (id) => {
    setSecilenArkadaslar(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOlustur = async () => {
    if (!baslik.trim()) { bildirimGoster('Plan adı gerekli', 'error'); return; }
    if (secimModu === 'arkadas' && secilenArkadaslar.length === 0) { bildirimGoster('En az bir arkadaş seç', 'error'); return; }
    if (secimModu === 'grup' && !secilenGrupId) { bildirimGoster('Bir grup seç', 'error'); return; }

    setYukleniyor(true);
    const planData = {
      baslik,
      ikon: 'diger',
      tarih: new Date(seciliTarih),
      saat: seciliSaat,
      mekan: mekan || 'Belirtilmedi',
      tip: secimModu
    };

    if (secimModu === 'arkadas') {
      planData.davetliler = secilenArkadaslar;
      planData.davetliDetaylar = arkadaslar.filter(a => secilenArkadaslar.includes(a.odUserId));
    } else {
      planData.grup = gruplar.find(g => g.id === secilenGrupId);
    }

    const result = await yeniEtkinlikOlustur(planData);
    setYukleniyor(false);

    if (result.success) {
      bildirimGoster('Plan oluşturuldu!', 'success');
      setModalAcik(null);
      setBaslik(''); setMekan(''); setSecilenArkadaslar([]); setSecilenGrupId(null);
    } else {
      bildirimGoster(result.error, 'error');
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
            <input type="date" value={seciliTarih} onChange={(e) => setSeciliTarih(e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="text-xs font-medium text-dark-400 mb-2 block">Saat</label>
            <select value={seciliSaat} onChange={(e) => setSeciliSaat(e.target.value)} className="input-dark bg-dark-800">
              {saatler.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Mekan (Opsiyonel)</label>
          <input type="text" value={mekan} onChange={(e) => setMekan(e.target.value)} placeholder="Nerede buluşalım?" className="input-dark" />
        </div>

        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Kimlerle?</label>
          <div className="flex gap-2">
            <button onClick={() => setSecimModu('arkadas')} className={`flex-1 py-3 rounded-xl font-medium text-sm ${secimModu === 'arkadas' ? 'btn-gold' : 'btn-ghost'}`}>Arkadaşlar</button>
            <button onClick={() => setSecimModu('grup')} className={`flex-1 py-3 rounded-xl font-medium text-sm ${secimModu === 'grup' ? 'btn-gold' : 'btn-ghost'}`}>Grup</button>
          </div>
        </div>

        {secimModu === 'arkadas' && arkadaslar?.length > 0 && (
          <div className="card p-3 max-h-48 overflow-y-auto space-y-2">
            {arkadaslar.map(a => (
              <button key={a.odUserId} onClick={() => arkadasToggle(a.odUserId)} className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${secilenArkadaslar.includes(a.odUserId) ? 'bg-gold-500/20 border border-gold-500/30' : 'hover:bg-dark-700'}`}>
                <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-xl">{a.avatar || '👤'}</div>
                <span className="flex-1 text-left text-white font-medium">{a.isim}</span>
                {secilenArkadaslar.includes(a.odUserId) && <CheckIcon className="w-5 h-5 text-gold-500" />}
              </button>
            ))}
          </div>
        )}

        {secimModu === 'grup' && gruplar?.length > 0 && (
          <div className="space-y-2">
            {gruplar.map(g => (
              <button key={g.id} onClick={() => setSecilenGrupId(g.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${secilenGrupId === g.id ? 'bg-gold-500/20 border border-gold-500/30' : 'card-hover'}`}>
                <span className="text-2xl">{g.emoji}</span>
                <span className="flex-1 text-left text-white font-medium">{g.isim}</span>
                {secilenGrupId === g.id && <CheckIcon className="w-5 h-5 text-gold-500" />}
              </button>
            ))}
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

  if (modalAcik !== 'detay' || !seciliEtkinlik) return null;

  const tarih = new Date(seciliEtkinlik.tarih);
  const katilimcilar = seciliEtkinlik.katilimcilar || [];
  const benimDurum = katilimcilar.find(k => k.odUserId === kullanici?.odUserId)?.durum;
  const benimPlanim = seciliEtkinlik.olusturanId === kullanici?.odUserId;

  const handleKatilim = (durum) => {
    katilimDurumuGuncelle(seciliEtkinlik.id, durum);
    bildirimGoster(durum === 'varim' ? 'Katılıyorsun!' : durum === 'bakariz' ? 'Bakarız olarak işaretlendi' : 'Katılmıyorsun', 'success');
  };

  const handleMesajGonder = async () => {
    if (!mesaj.trim()) return;
    await mesajEkle(seciliEtkinlik.id, { odUserId: kullanici.odUserId, isim: kullanici.isim, avatar: kullanici.avatar, mesaj: mesaj.trim() });
    setSeciliEtkinlik(prev => ({ ...prev, mesajlar: [...(prev.mesajlar || []), { odUserId: kullanici.odUserId, isim: kullanici.isim, avatar: kullanici.avatar, mesaj: mesaj.trim(), zaman: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }] }));
    setMesaj('');
  };

  return (
    <ModalWrapper title={seciliEtkinlik.baslik} onClose={() => { setModalAcik(null); setSeciliEtkinlik(null); }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3"><p className="text-xs text-dark-400 mb-1">Tarih</p><p className="font-medium text-white">{tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</p></div>
          <div className="card p-3"><p className="text-xs text-dark-400 mb-1">Saat</p><p className="font-medium text-white">{seciliEtkinlik.saat}</p></div>
        </div>
        {seciliEtkinlik.mekan && seciliEtkinlik.mekan !== 'Belirtilmedi' && (
          <div className="card p-3"><p className="text-xs text-dark-400 mb-1">Mekan</p><p className="font-medium text-white">{seciliEtkinlik.mekan}</p></div>
        )}

        {!benimPlanim && (
          <div>
            <p className="text-xs text-dark-400 mb-2">Katılım Durumun</p>
            <div className="flex gap-2">
              {[{ d: 'varim', l: 'Varım', c: 'emerald' }, { d: 'bakariz', l: 'Bakarız', c: 'amber' }, { d: 'yokum', l: 'Yokum', c: 'red' }].map(b => (
                <button key={b.d} onClick={() => handleKatilim(b.d)} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${benimDurum === b.d ? `bg-${b.c}-500/20 border border-${b.c}-500/30 text-${b.c}-400` : 'btn-ghost'}`}>{b.l}</button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-dark-400 mb-2">Katılımcılar ({katilimcilar.filter(k => k.durum === 'varim').length})</p>
          <div className="flex flex-wrap gap-2">
            {katilimcilar.map((k, i) => (
              <span key={i} className={`px-3 py-1.5 rounded-lg text-sm ${k.durum === 'varim' ? 'bg-emerald-500/10 text-emerald-400' : k.durum === 'bakariz' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                {k.odUserId === kullanici?.odUserId ? 'Sen' : k.isim?.split(' ')[0] || 'Katılımcı'}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-dark-400 mb-2">Mesajlar</p>
          <div className="card p-3 max-h-48 overflow-y-auto space-y-3">
            {(seciliEtkinlik.mesajlar || []).map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.odUserId === kullanici?.odUserId ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-sm flex-shrink-0">{m.avatar || '👤'}</div>
                <div className={`max-w-[70%] px-3 py-2 rounded-xl ${m.odUserId === kullanici?.odUserId ? 'bg-gold-500/20 text-gold-100' : 'bg-dark-700 text-white'}`}>
                  <p className="text-xs text-dark-400 mb-0.5">{m.isim}</p>
                  <p className="text-sm">{m.mesaj}</p>
                </div>
              </div>
            ))}
            {(!seciliEtkinlik.mesajlar || seciliEtkinlik.mesajlar.length === 0) && <p className="text-center text-dark-500 text-sm">Henüz mesaj yok</p>}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-dark-800">
        <div className="flex gap-2">
          <input type="text" value={mesaj} onChange={(e) => setMesaj(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleMesajGonder()} placeholder="Mesaj yaz..." className="flex-1 input-dark" />
          <button onClick={handleMesajGonder} className="w-12 h-12 btn-gold rounded-xl flex items-center justify-center"><SendIcon className="w-5 h-5" /></button>
        </div>
      </div>
    </ModalWrapper>
  );
};

const YeniGrupModal = () => {
  const { yeniGrupOlustur } = useData();
  const { modalAcik, setModalAcik, bildirimGoster } = useUI();
  const [isim, setIsim] = useState('');
  const [emoji, setEmoji] = useState('🎉');
  const [yukleniyor, setYukleniyor] = useState(false);

  if (modalAcik !== 'yeniGrup') return null;

  const handleOlustur = async () => {
    if (!isim.trim()) return;
    setYukleniyor(true);
    const result = await yeniGrupOlustur(isim, emoji);
    setYukleniyor(false);
    if (result.success) { bildirimGoster('Grup oluşturuldu!', 'success'); setModalAcik(null); setIsim(''); }
  };

  return (
    <ModalWrapper title="Yeni Grup" onClose={() => setModalAcik(null)}>
      <div className="flex-1 p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">Grup Adı</label>
          <input type="text" value={isim} onChange={(e) => setIsim(e.target.value)} placeholder="Grup adı" className="input-dark" />
        </div>
        <div>
          <label className="text-xs font-medium text-dark-400 mb-2 block">İkon</label>
          <div className="flex flex-wrap gap-2">
            {grupIkonlari.map((e, i) => (
              <button key={i} onClick={() => setEmoji(e)} className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-gold-500/20 border border-gold-500/30 scale-110' : 'bg-dark-800 hover:bg-dark-700'}`}>{e}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-dark-800">
        <button onClick={handleOlustur} disabled={yukleniyor} className="w-full btn-gold py-4 rounded-xl font-semibold">{yukleniyor ? 'Oluşturuluyor...' : 'Oluştur'}</button>
      </div>
    </ModalWrapper>
  );
};

const BildirimlerModal = () => {
  const { modalAcik, setModalAcik, bildirimler } = useUI();
  if (modalAcik !== 'bildirimler') return null;

  return (
    <ModalWrapper title="Bildirimler" onClose={() => setModalAcik(null)}>
      <div className="flex-1 overflow-y-auto p-4">
        {bildirimler?.length > 0 ? bildirimler.map(b => (
          <div key={b.id} className={`p-4 rounded-xl mb-2 ${b.okundu ? 'bg-dark-800/50' : 'bg-gold-500/10 border border-gold-500/20'}`}>
            <p className="text-white text-sm">{b.mesaj}</p>
            <p className="text-xs text-dark-500 mt-1">{b.olusturulma?.toLocaleString?.('tr-TR') || ''}</p>
          </div>
        )) : (
          <div className="text-center py-8"><p className="text-dark-400">Bildirim yok</p></div>
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
          {avatarlar[avatarKategori].map((a, i) => (
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
  </>
);

export default AppModals;
