import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useData, useUI, useTheme } from '../context';
import { PlusIcon, XIcon, SendIcon, ImageIcon, LockIcon, PinIcon, MoreVerticalIcon, DownloadIcon, TrashIcon, CheckIcon } from './Icons';
import {
  planHikayeleriniDinle,
  planHikayeEkle,
  planHikayeIzle,
  planHikayeyeTepkiVer,
  planHikayeSabitle,
  planHikayeSabitKaldir,
  planHikayeSil,
  planHikayeYuklemeAktifMi,
  planHikayeKalanSure,
  hikayeGorunurMu
} from '../services/planHikayeService';
import { bildirimOlustur, BILDIRIM_TIPLERI } from '../services/bildirimService';
import { arkadasIstegiGonder } from '../services/arkadasService';
import { PLAN_HIKAYE_MAX_ADET } from '../constants';

const TEPKILER = ['❤️', '🔥', '😂', '😮', '😢', '👏'];
const IZIN_VERILEN_TIPLER = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_DOSYA_BOYUTU = 5 * 1024 * 1024;

const PlanHikayeler = ({ plan, katilimcilar = [] }) => {
  const { kullanici } = useAuth();
  const { arkadaslar } = useData();
  const { bildirimGoster } = useUI();
  const { isDark, themeClasses } = useTheme();

  const [hikayeGruplari, setHikayeGruplari] = useState([]);
  const [acikHikaye, setAcikHikaye] = useState(null);
  const [aktifIndex, setAktifIndex] = useState(0);
  const [hikayeEkleAcik, setHikayeEkleAcik] = useState(false);
  const [yukluyor, setYukluyor] = useState(false);
  const [gizliProfilPopup, setGizliProfilPopup] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [etiketlemeAcik, setEtiketlemeAcik] = useState(false);
  const [secilenEtiketler, setSecilenEtiketler] = useState([]);
  const [kalanSure, setKalanSure] = useState(0);
  const [istekGonderildi, setIstekGonderildi] = useState({});
  const fileInputRef = useRef();

  const benimPlanim = plan?.olusturanId === kullanici?.odUserId;
  const katilimciMiyim = plan?.participantIds?.includes(kullanici?.odUserId) || benimPlanim;
  const hikayeYuklemeAktif = planHikayeYuklemeAktifMi(plan);
  const takipEdilenler = arkadaslar?.map(a => a.odUserId) || [];

  useEffect(() => {
    if (!plan?.id) return;
    const unsub = planHikayeleriniDinle(plan.id, setHikayeGruplari);
    return () => unsub && unsub();
  }, [plan?.id]);

  useEffect(() => {
    if (!hikayeYuklemeAktif) return;
    const interval = setInterval(() => {
      setKalanSure(planHikayeKalanSure(plan));
    }, 60000);
    setKalanSure(planHikayeKalanSure(plan));
    return () => clearInterval(interval);
  }, [plan, hikayeYuklemeAktif]);

  const formatKalanSure = (ms) => {
    const saat = Math.floor(ms / (1000 * 60 * 60));
    const dakika = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (saat > 0) return `${saat}s ${dakika}dk`;
    return `${dakika}dk`;
  };

  const handleDosyaSec = async (e) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    if (dosya.type.startsWith('video/')) {
      bildirimGoster('Video yüklenemez, sadece fotoğraf kabul edilir', 'error');
      return;
    }

    if (!IZIN_VERILEN_TIPLER.includes(dosya.type)) {
      bildirimGoster('Sadece JPEG, PNG, GIF ve WebP formatları kabul edilir', 'error');
      return;
    }

    if (dosya.size > MAX_DOSYA_BOYUTU) {
      bildirimGoster('Dosya boyutu 5MB\'dan küçük olmalı', 'error');
      return;
    }

    setYukluyor(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const result = await planHikayeEkle(kullanici, plan.id, base64, 'image', secilenEtiketler);
      if (result.success) {
        bildirimGoster('Hikaye eklendi!', 'success');
        setHikayeEkleAcik(false);
        setSecilenEtiketler([]);

        const digerKatilimcilar = (plan.participantIds || []).filter(id => id !== kullanici.odUserId);
        for (const aliciId of digerKatilimcilar) {
          await bildirimOlustur(aliciId, BILDIRIM_TIPLERI.PLAN_HIKAYE_EKLENDI, {
            kimdenId: kullanici.odUserId,
            kimdenIsim: kullanici.isim,
            planId: plan.id,
            planBaslik: plan.baslik,
            mesaj: `${kullanici.isim} "${plan.baslik}" planına hikaye ekledi`
          });
        }

        for (const etiketId of secilenEtiketler) {
          await bildirimOlustur(etiketId, BILDIRIM_TIPLERI.PLAN_HIKAYE_ETIKETLENDI, {
            kimdenId: kullanici.odUserId,
            kimdenIsim: kullanici.isim,
            planId: plan.id,
            planBaslik: plan.baslik,
            mesaj: `${kullanici.isim} seni bir plan hikayesinde etiketledi`
          });
        }
      } else {
        bildirimGoster(result.error || 'Hikaye eklenemedi', 'error');
      }
      setYukluyor(false);
    };
    reader.readAsDataURL(dosya);
    e.target.value = '';
  };

  const handleHikayeAc = async (grup, baslangicIndex = 0) => {
    const tumHikayeler = [...(grup.sabitHikayeler || []), ...(grup.hikayeler || [])];

    const gorunurHikayeler = tumHikayeler.filter(h =>
      hikayeGorunurMu(h, kullanici, takipEdilenler)
    );

    if (gorunurHikayeler.length === 0) {
      setGizliProfilPopup(grup);
      return;
    }

    setAcikHikaye({ ...grup, tumHikayeler: gorunurHikayeler });
    setAktifIndex(baslangicIndex);

    if (grup.odUserId !== kullanici?.odUserId) {
      const hikaye = gorunurHikayeler[baslangicIndex];
      if (hikaye) {
        await planHikayeIzle(hikaye.id, {
          odUserId: kullanici.odUserId,
          isim: kullanici.isim,
          avatar: kullanici.avatar
        });
      }
    }
  };

  const handleIleri = async () => {
    if (!acikHikaye) return;
    const tumHikayeler = acikHikaye.tumHikayeler;

    if (aktifIndex < tumHikayeler.length - 1) {
      const yeniIndex = aktifIndex + 1;
      setAktifIndex(yeniIndex);

      if (acikHikaye.odUserId !== kullanici?.odUserId) {
        await planHikayeIzle(tumHikayeler[yeniIndex].id, {
          odUserId: kullanici.odUserId,
          isim: kullanici.isim,
          avatar: kullanici.avatar
        });
      }
    } else {
      setAcikHikaye(null);
    }
  };

  const handleGeri = () => {
    if (aktifIndex > 0) {
      setAktifIndex(aktifIndex - 1);
    }
  };

  const handleTepki = async (emoji) => {
    if (!acikHikaye) return;
    const hikaye = acikHikaye.tumHikayeler[aktifIndex];
    await planHikayeyeTepkiVer(hikaye.id, {
      odUserId: kullanici.odUserId,
      isim: kullanici.isim,
      avatar: kullanici.avatar,
      emoji
    });
    bildirimGoster(`${emoji} gönderildi!`, 'success');
  };

  const handleSabitle = async () => {
    if (!acikHikaye) return;
    const hikaye = acikHikaye.tumHikayeler[aktifIndex];
    const result = await planHikayeSabitle(hikaye.id, kullanici.odUserId);
    if (result.success) {
      bildirimGoster('Hikaye sabitlendi!', 'success');
    } else {
      bildirimGoster(result.error, 'error');
    }
    setMenuAcik(false);
  };

  const handleSabitKaldir = async () => {
    if (!acikHikaye) return;
    const hikaye = acikHikaye.tumHikayeler[aktifIndex];
    const result = await planHikayeSabitKaldir(hikaye.id, kullanici.odUserId);
    if (result.success) {
      if (result.silindi) {
        bildirimGoster('Hikaye silindi (süresi dolmuştu)', 'success');
        setAcikHikaye(null);
      } else {
        bildirimGoster('Sabit kaldırıldı', 'success');
      }
    } else {
      bildirimGoster(result.error, 'error');
    }
    setMenuAcik(false);
  };

  const handleSil = async () => {
    if (!acikHikaye) return;
    const hikaye = acikHikaye.tumHikayeler[aktifIndex];
    const result = await planHikayeSil(hikaye.id, kullanici.odUserId);
    if (result.success) {
      bildirimGoster('Hikaye silindi', 'success');
      setAcikHikaye(null);
    } else {
      bildirimGoster(result.error, 'error');
    }
    setMenuAcik(false);
  };

  const handleIndir = () => {
    if (!acikHikaye) return;
    const hikaye = acikHikaye.tumHikayeler[aktifIndex];
    if (hikaye.tip === 'image') {
      const link = document.createElement('a');
      link.href = hikaye.icerik;
      link.download = `plan-hikaye-${Date.now()}.jpg`;
      link.click();
    }
    setMenuAcik(false);
  };

  const handleTakipIstegiGonder = async () => {
    if (!gizliProfilPopup) return;
    const result = await arkadasIstegiGonder(kullanici, gizliProfilPopup.odUserId);
    if (result.success) {
      bildirimGoster('Takip isteği gönderildi!', 'success');
      setIstekGonderildi(prev => ({ ...prev, [gizliProfilPopup.odUserId]: true }));
    } else {
      bildirimGoster(result.error || 'İstek gönderilemedi', 'error');
    }
    setGizliProfilPopup(null);
  };

  const toggleEtiket = (userId) => {
    setSecilenEtiketler(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const planBasladiMi = () => {
    const planTarihi = new Date(plan?.startAt || plan?.tarih);
    const planSaati = plan?.saat ? plan.saat.split(':') : ['12', '00'];
    planTarihi.setHours(parseInt(planSaati[0]), parseInt(planSaati[1]), 0, 0);
    return new Date() >= planTarihi;
  };

  if (!planBasladiMi() && !plan?.hikayelerBaslangic) {
    return null;
  }

  const sabitHikayeOlanlar = hikayeGruplari.filter(g => g.sabitHikayeler?.length > 0);
  const normalHikayeOlanlar = hikayeGruplari.filter(g => g.hikayeler?.length > 0);

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${themeClasses.text}`}>Hikayeler</h3>
          {katilimciMiyim && hikayeYuklemeAktif && (
            <button
              onClick={() => setHikayeEkleAcik(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/20 text-gold-500 rounded-lg text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Hikaye Ekle
            </button>
          )}
          {katilimciMiyim && !hikayeYuklemeAktif && planBasladiMi() && (
            <span className="text-xs text-dark-500">Süre Doldu</span>
          )}
        </div>

        {hikayeYuklemeAktif && kalanSure > 0 && (
          <p className="text-xs text-dark-400 mb-3">
            Kalan süre: {formatKalanSure(kalanSure)}
          </p>
        )}

        {sabitHikayeOlanlar.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gold-500 mb-2 flex items-center gap-1">
              <PinIcon className="w-3 h-3" /> Sabit Hikayeler
            </p>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {sabitHikayeOlanlar.map((grup) => {
                const gorunebilir = hikayeGorunurMu(
                  { olusturanId: grup.odUserId, olusturanProfilGizlilik: grup.profilGizlilik },
                  kullanici,
                  takipEdilenler
                );

                return (
                  <button
                    key={`sabit-${grup.odUserId}`}
                    onClick={() => handleHikayeAc(grup, 0)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  >
                    <div className={`relative w-16 h-16 rounded-2xl ${
                      gorunebilir ? 'story-ring' : 'border-2 border-dark-600'
                    }`}>
                      <div className={`w-full h-full rounded-[14px] ${isDark ? 'bg-dark-800' : 'bg-gray-100'} flex items-center justify-center overflow-hidden ${
                        !gorunebilir ? 'opacity-50 blur-[2px]' : ''
                      }`}>
                        <span className="text-2xl">{grup.avatar || '👤'}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                        <PinIcon className="w-3 h-3 text-dark-900" />
                      </div>
                      {!gorunebilir && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LockIcon className="w-5 h-5 text-dark-400" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium truncate max-w-[64px] ${
                      gorunebilir ? 'text-dark-300' : 'text-dark-500'
                    }`}>
                      {grup.isim?.split(' ')[0] || 'Kullanıcı'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {normalHikayeOlanlar.length > 0 && (
          <div>
            {sabitHikayeOlanlar.length > 0 && (
              <p className="text-xs text-dark-400 mb-2">Son 24 Saat</p>
            )}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {normalHikayeOlanlar.map((grup) => {
                const gorunebilir = hikayeGorunurMu(
                  { olusturanId: grup.odUserId, olusturanProfilGizlilik: grup.profilGizlilik },
                  kullanici,
                  takipEdilenler
                );

                const izlendi = gorunebilir && grup.hikayeler.every(h =>
                  h.izleyenler?.some(i => i.odUserId === kullanici?.odUserId)
                );

                return (
                  <button
                    key={`normal-${grup.odUserId}`}
                    onClick={() => handleHikayeAc(grup, 0)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                  >
                    <div className={`relative w-16 h-16 rounded-2xl p-[2px] ${
                      !gorunebilir ? 'border-2 border-dark-600' :
                      izlendi ? 'story-ring-seen' : 'story-ring'
                    }`}>
                      <div className={`w-full h-full rounded-[14px] ${isDark ? 'bg-dark-800' : 'bg-gray-100'} flex items-center justify-center overflow-hidden ${
                        !gorunebilir ? 'opacity-50 blur-[2px]' : ''
                      }`}>
                        <span className="text-2xl">{grup.avatar || '👤'}</span>
                      </div>
                      {!gorunebilir && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LockIcon className="w-5 h-5 text-dark-400" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium truncate max-w-[64px] ${
                      !gorunebilir ? 'text-dark-500' :
                      izlendi ? 'text-dark-500' : 'text-dark-300'
                    }`}>
                      {grup.isim?.split(' ')[0] || 'Kullanıcı'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sabitHikayeOlanlar.length === 0 && normalHikayeOlanlar.length === 0 && (
          <div className={`text-center py-6 ${isDark ? 'bg-dark-800/50' : 'bg-gray-50'} rounded-xl`}>
            <p className="text-3xl mb-2">📷</p>
            <p className={`text-sm ${themeClasses.textMuted}`}>Henüz hikaye yok</p>
            {katilimciMiyim && hikayeYuklemeAktif && (
              <p className="text-xs text-dark-500 mt-1">İlk hikayeyi sen paylaş!</p>
            )}
          </div>
        )}
      </div>

      {acikHikaye && (
        <div className="fixed inset-0 z-[110] bg-dark-950">
          <div className="absolute top-0 left-0 right-0 z-10 p-4 safe-top">
            <div className="flex gap-1 mb-4">
              {acikHikaye.tumHikayeler.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      i < aktifIndex ? 'w-full' : i === aktifIndex ? 'w-full animate-pulse' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                  <span className="text-lg">{acikHikaye.avatar || '👤'}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm flex items-center gap-1">
                    {acikHikaye.isim}
                    {acikHikaye.tumHikayeler[aktifIndex]?.sabitleme && (
                      <PinIcon className="w-3 h-3 text-gold-500" />
                    )}
                  </p>
                  <p className="text-dark-400 text-xs">
                    {acikHikaye.tumHikayeler[aktifIndex]?.olusturulma?.toLocaleTimeString?.('tr-TR', { hour: '2-digit', minute: '2-digit' }) || 'Şimdi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {acikHikaye.odUserId === kullanici?.odUserId && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuAcik(!menuAcik)}
                      className="w-10 h-10 rounded-full bg-dark-800/50 flex items-center justify-center"
                    >
                      <MoreVerticalIcon className="w-5 h-5 text-white" />
                    </button>
                    {menuAcik && (
                      <div className={`absolute right-0 top-12 w-48 ${isDark ? 'bg-dark-800' : 'bg-white'} rounded-xl shadow-xl border ${isDark ? 'border-dark-700' : 'border-gray-200'} overflow-hidden z-20`}>
                        {acikHikaye.tumHikayeler[aktifIndex]?.sabitleme ? (
                          <button
                            onClick={handleSabitKaldir}
                            className={`w-full flex items-center gap-3 p-3 text-left ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'}`}
                          >
                            <PinIcon className="w-4 h-4 text-dark-400" />
                            <span className={themeClasses.text}>Sabiti Kaldır</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleSabitle}
                            className={`w-full flex items-center gap-3 p-3 text-left ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'}`}
                          >
                            <PinIcon className="w-4 h-4 text-gold-500" />
                            <span className={themeClasses.text}>Sabitle</span>
                          </button>
                        )}
                        <button
                          onClick={handleIndir}
                          className={`w-full flex items-center gap-3 p-3 text-left ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'}`}
                        >
                          <DownloadIcon className="w-4 h-4 text-dark-400" />
                          <span className={themeClasses.text}>İndir</span>
                        </button>
                        <button
                          onClick={handleSil}
                          className={`w-full flex items-center gap-3 p-3 text-left ${isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'}`}
                        >
                          <TrashIcon className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">Sil</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => { setAcikHikaye(null); setMenuAcik(false); }}
                  className="w-10 h-10 rounded-full bg-dark-800/50 flex items-center justify-center"
                >
                  <XIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-8">
            {acikHikaye.tumHikayeler[aktifIndex]?.tip === 'image' ? (
              <img
                src={acikHikaye.tumHikayeler[aktifIndex]?.icerik}
                alt="Hikaye"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center">
                <p className="text-white text-xl font-medium">
                  {acikHikaye.tumHikayeler[aktifIndex]?.icerik}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleGeri}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-20"
            disabled={aktifIndex === 0}
          />
          <button
            onClick={handleIleri}
            className="absolute right-0 top-0 bottom-0 w-1/3 z-20"
          />

          {acikHikaye.odUserId !== kullanici?.odUserId && (
            <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom">
              <div className="flex gap-2 justify-center">
                {TEPKILER.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleTepki(emoji)}
                    className="w-10 h-10 rounded-full bg-dark-800/80 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {acikHikaye.odUserId === kullanici?.odUserId && (
            <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom">
              <div className="glass rounded-2xl p-4">
                <p className="text-dark-400 text-sm text-center">
                  {acikHikaye.tumHikayeler[aktifIndex]?.izleyenler?.length || 0} kişi gördü
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {gizliProfilPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGizliProfilPopup(null)} />
          <div className={`relative w-full max-w-sm ${isDark ? 'bg-dark-900' : 'bg-white'} rounded-2xl p-6 border ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                <span className="text-3xl">{gizliProfilPopup.avatar || '👤'}</span>
              </div>
              <h3 className={`font-semibold ${themeClasses.text} mb-1`}>{gizliProfilPopup.isim}</h3>
              <p className={`text-sm ${themeClasses.textMuted} mb-4`}>@{gizliProfilPopup.kullaniciAdi}</p>

              <div className="flex items-center gap-2 mb-4">
                <LockIcon className="w-4 h-4 text-dark-400" />
                <p className={`text-sm ${themeClasses.textMuted}`}>Bu hesap gizli</p>
              </div>

              <p className={`text-sm ${themeClasses.textMuted} mb-6`}>
                Hikayeleri görmek için takip edin.
              </p>

              {istekGonderildi[gizliProfilPopup.odUserId] ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-medium bg-dark-700 text-dark-400"
                >
                  İstek Gönderildi
                </button>
              ) : (
                <button
                  onClick={handleTakipIstegiGonder}
                  className="w-full py-3 rounded-xl font-medium btn-gold"
                >
                  Takip İsteği Gönder
                </button>
              )}

              <button
                onClick={() => setGizliProfilPopup(null)}
                className={`w-full mt-3 py-3 rounded-xl font-medium ${isDark ? 'bg-dark-800 text-dark-300' : 'bg-gray-100 text-gray-700'}`}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {hikayeEkleAcik && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setHikayeEkleAcik(false); setEtiketlemeAcik(false); }} />
          <div className={`relative w-full max-w-lg ${isDark ? 'bg-dark-900' : 'bg-white'} rounded-t-3xl p-6 animate-slide-up`}>
            <div className="w-12 h-1 bg-dark-600 rounded-full mx-auto mb-6" />
            <h3 className={`text-lg font-semibold ${themeClasses.text} text-center mb-6`}>Plan Hikayesi Ekle</h3>

            {!etiketlemeAcik ? (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-3 p-6 rounded-2xl ${isDark ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all mb-4`}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <span className={`font-medium ${themeClasses.text} block`}>Fotoğraf Seç</span>
                    <span className={`text-xs ${themeClasses.textMuted}`}>Galeriden fotoğraf yükle</span>
                  </div>
                </button>

                {katilimcilar.length > 1 && (
                  <button
                    onClick={() => setEtiketlemeAcik(true)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-dark-800' : 'bg-gray-100'} mb-4`}
                  >
                    <span className={themeClasses.text}>Katılımcı Etiketle</span>
                    <span className={themeClasses.textMuted}>
                      {secilenEtiketler.length > 0 ? `${secilenEtiketler.length} kişi` : 'Opsiyonel'}
                    </span>
                  </button>
                )}

                <p className={`text-xs ${themeClasses.textMuted} text-center`}>
                  Video yüklenemez, sadece fotoğraf kabul edilir
                </p>
              </>
            ) : (
              <>
                <p className={`text-sm ${themeClasses.textMuted} mb-4`}>Etiketlemek istediğin katılımcıları seç:</p>
                <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                  {katilimcilar.filter(k => k.odUserId !== kullanici.odUserId).map(k => (
                    <button
                      key={k.odUserId}
                      onClick={() => toggleEtiket(k.odUserId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        secilenEtiketler.includes(k.odUserId)
                          ? 'bg-gold-500/20 border border-gold-500/30'
                          : isDark ? 'bg-dark-800 hover:bg-dark-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                        <span className="text-lg">{k.avatar || '👤'}</span>
                      </div>
                      <span className={`flex-1 text-left ${themeClasses.text}`}>{k.isim}</span>
                      {secilenEtiketler.includes(k.odUserId) && (
                        <CheckIcon className="w-5 h-5 text-gold-500" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setEtiketlemeAcik(false)}
                  className="w-full py-3 rounded-xl font-medium btn-gold"
                >
                  Tamam
                </button>
              </>
            )}

            <button
              onClick={() => { setHikayeEkleAcik(false); setEtiketlemeAcik(false); setSecilenEtiketler([]); }}
              className={`w-full mt-4 py-3 rounded-xl font-medium ${isDark ? 'bg-dark-800 text-dark-300' : 'bg-gray-200 text-gray-700'}`}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDosyaSec}
        accept="image/*"
        className="hidden"
      />

      {yukluyor && (
        <div className="fixed inset-0 z-[130] bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Hikaye yükleniyor...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanHikayeler;
