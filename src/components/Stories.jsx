import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useData, useUI, useTheme } from '../context';
import { PlusIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, SendIcon, CameraIcon, ImageIcon } from './Icons';
import { SkeletonStory } from './Skeleton';
import { hikayeEkle, hikayeIzle, hikayeyeTepkiVer } from '../services/hikayeService';
import { konusmaOlusturVeyaGetir, mesajGonder } from '../services/dmService';
import Logo from './Logo';

const TEPKILER = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

// İzin verilen dosya türleri - Video yasak, sadece fotoğraf
const IZIN_VERILEN_TIPLER = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_DOSYA_BOYUTU = 5 * 1024 * 1024; // 5MB

const Stories = () => {
  const { kullanici } = useAuth();
  const { hikayeler, yukleniyor, benimHikayelerim } = useData();
  const { setModalAcik, bildirimGoster } = useUI();
  const { themeClasses, isDark } = useTheme();
  const [acikHikaye, setAcikHikaye] = useState(null);
  const [aktifIndex, setAktifIndex] = useState(0);
  const [cevapMetni, setCevapMetni] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hikayeEklePaneli, setHikayeEklePaneli] = useState(false);
  const [yukluyor, setYukluyor] = useState(false);
  const fileInputRef = useRef();

  // Fotoğraf seçme ve yükleme
  const handleFotografSec = () => {
    fileInputRef.current?.click();
  };

  const handleDosyaDegisikligi = async (e) => {
    const dosya = e.target.files?.[0];
    if (!dosya) return;

    // Video kontrolü - yasak
    if (dosya.type.startsWith('video/')) {
      bildirimGoster('Video yüklenemez, sadece fotoğraf kabul edilir!', 'error');
      return;
    }

    // Dosya türü kontrolü
    if (!IZIN_VERILEN_TIPLER.includes(dosya.type)) {
      bildirimGoster('Sadece JPEG, PNG, GIF ve WebP formatları kabul edilir', 'error');
      return;
    }

    // Dosya boyutu kontrolü
    if (dosya.size > MAX_DOSYA_BOYUTU) {
      bildirimGoster('Dosya boyutu 5MB\'dan küçük olmalı', 'error');
      return;
    }

    setYukluyor(true);
    setHikayeEklePaneli(false);

    // Base64'e çevir (basit implementasyon - gerçek projede Firebase Storage kullanılmalı)
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const result = await hikayeEkle(kullanici, base64, 'image');
      if (result.success) {
        bildirimGoster('Hikaye eklendi!', 'success');
      } else {
        bildirimGoster('Hikaye eklenemedi', 'error');
      }
      setYukluyor(false);
    };
    reader.readAsDataURL(dosya);

    // Input'u temizle
    e.target.value = '';
  };

  const handleMetinHikaye = async () => {
    const metin = prompt('Hikayene ne eklemek istersin?');
    if (!metin?.trim()) return;

    setYukluyor(true);
    setHikayeEklePaneli(false);
    const result = await hikayeEkle(kullanici, metin.trim(), 'text');
    if (result.success) {
      bildirimGoster('Hikaye eklendi!', 'success');
    }
    setYukluyor(false);
  };

  const handleHikayeEkle = () => {
    setHikayeEklePaneli(true);
  };

  const handleHikayeAc = async (hikayeGrubu, baslangicIndex = 0) => {
    setAcikHikaye(hikayeGrubu);
    setAktifIndex(baslangicIndex);
    
    if (hikayeGrubu.kullaniciId !== kullanici?.odUserId) {
      const hikaye = hikayeGrubu.hikayeler[baslangicIndex];
      await hikayeIzle(hikaye.id, {
        odUserId: kullanici.odUserId,
        isim: kullanici.isim,
        avatar: kullanici.avatar
      });
    }
  };

  const handleIleri = async () => {
    if (aktifIndex < acikHikaye.hikayeler.length - 1) {
      const yeniIndex = aktifIndex + 1;
      setAktifIndex(yeniIndex);
      
      if (acikHikaye.kullaniciId !== kullanici?.odUserId) {
        await hikayeIzle(acikHikaye.hikayeler[yeniIndex].id, {
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
    const hikaye = acikHikaye.hikayeler[aktifIndex];
    await hikayeyeTepkiVer(hikaye.id, {
      odUserId: kullanici.odUserId,
      isim: kullanici.isim,
      avatar: kullanici.avatar,
      emoji
    });
    bildirimGoster(`${emoji} gönderildi!`, 'success');
  };

  const handleCevapGonder = async () => {
    if (!cevapMetni.trim() || gonderiyor) return;
    setGonderiyor(true);

    const konusma = await konusmaOlusturVeyaGetir(kullanici.odUserId, acikHikaye.kullaniciId);
    if (konusma.success) {
      const hikaye = acikHikaye.hikayeler[aktifIndex];
      await mesajGonder(konusma.konusmaId, kullanici, `📷 Hikayene cevap: ${cevapMetni}`, 'text');
      bildirimGoster('Cevap gönderildi!', 'success');
      setCevapMetni('');
    }
    setGonderiyor(false);
  };

  if (yukleniyor) {
    return (
      <div className="flex gap-4 px-4 py-4 overflow-x-auto hide-scrollbar">
        {[1, 2, 3, 4].map(i => <SkeletonStory key={i} />)}
      </div>
    );
  }

  const benimHikayem = benimHikayelerim?.length > 0;

  return (
    <>
      <div className="flex gap-3 px-4 py-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={benimHikayem ? () => handleHikayeAc({
            kullaniciId: kullanici.odUserId,
            kullaniciIsim: kullanici.isim,
            kullaniciAvatar: kullanici.avatar,
            hikayeler: benimHikayelerim
          }) : handleHikayeEkle}
          className="flex flex-col items-center gap-2 flex-shrink-0"
        >
          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${
            benimHikayem 
              ? 'story-ring' 
              : 'border-2 border-dashed border-navy-600'
          }`}>
            {benimHikayem ? (
              <div className="w-full h-full rounded-[14px] bg-navy-800 flex items-center justify-center overflow-hidden">
                {kullanici?.avatar ? (
                  <span className="text-2xl">{kullanici.avatar}</span>
                ) : (
                  <Logo size="sm" />
                )}
              </div>
            ) : (
              <PlusIcon className="w-6 h-6 text-gold-500" />
            )}
            {!benimHikayem && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                <PlusIcon className="w-3 h-3 text-navy-900" />
              </div>
            )}
          </div>
          <span className="text-xs text-navy-400 font-medium">
            {benimHikayem ? 'Hikayem' : 'Ekle'}
          </span>
        </button>

        {hikayeler?.map((hikayeGrubu) => {
          if (hikayeGrubu.kullaniciId === kullanici?.odUserId) return null;
          
          const izlendi = hikayeGrubu.hikayeler.every(h => 
            h.izleyenler?.some(i => i.odUserId === kullanici?.odUserId)
          );

          return (
            <button
              key={hikayeGrubu.kullaniciId}
              onClick={() => handleHikayeAc(hikayeGrubu)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className={`w-16 h-16 rounded-2xl p-[2px] ${
                izlendi ? 'story-ring-seen' : 'story-ring'
              }`}>
                <div className="w-full h-full rounded-[14px] bg-navy-800 flex items-center justify-center overflow-hidden">
                  {hikayeGrubu.kullaniciAvatar ? (
                    <span className="text-2xl">{hikayeGrubu.kullaniciAvatar}</span>
                  ) : (
                    <Logo size="sm" className="opacity-50" />
                  )}
                </div>
              </div>
              <span className={`text-xs font-medium truncate max-w-[64px] ${
                izlendi ? 'text-navy-500' : 'text-navy-300'
              }`}>
                {hikayeGrubu.kullaniciIsim?.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {acikHikaye && (
        <div className="fixed inset-0 z-[100] bg-navy-950">
          <div className="absolute top-0 left-0 right-0 z-10 p-4 safe-top">
            <div className="flex gap-1 mb-4">
              {acikHikaye.hikayeler.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full bg-navy-700 overflow-hidden">
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
                <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
                  {acikHikaye.kullaniciAvatar ? (
                    <span className="text-lg">{acikHikaye.kullaniciAvatar}</span>
                  ) : (
                    <Logo size="xs" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {acikHikaye.kullaniciIsim}
                  </p>
                  <p className="text-navy-400 text-xs">
                    {acikHikaye.hikayeler[aktifIndex]?.olusturulma?.toLocaleTimeString?.('tr-TR', { hour: '2-digit', minute: '2-digit' }) || 'Şimdi'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAcikHikaye(null)}
                className="w-10 h-10 rounded-full bg-navy-800/50 flex items-center justify-center"
              >
                <XIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Hikaye İçeriği - Fotoğraf veya Metin */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {acikHikaye.hikayeler[aktifIndex]?.tip === 'image' ? (
              <img
                src={acikHikaye.hikayeler[aktifIndex]?.icerik}
                alt="Hikaye"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center">
                <p className="text-white text-xl font-medium">
                  {acikHikaye.hikayeler[aktifIndex]?.icerik}
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

          {acikHikaye.kullaniciId !== kullanici?.odUserId && (
            <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom">
              <div className="flex gap-2 mb-3 justify-center">
                {TEPKILER.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleTepki(emoji)}
                    className="w-10 h-10 rounded-full bg-navy-800/80 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cevapMetni}
                  onChange={(e) => setCevapMetni(e.target.value)}
                  placeholder="Cevap yaz..."
                  className="flex-1 input-dark rounded-full px-4 py-3 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleCevapGonder()}
                />
                <button
                  onClick={handleCevapGonder}
                  disabled={!cevapMetni.trim() || gonderiyor}
                  className="w-12 h-12 btn-gold rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {acikHikaye.kullaniciId === kullanici?.odUserId && (
            <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom">
              <div className="glass rounded-2xl p-4">
                <p className="text-navy-400 text-sm text-center">
                  {acikHikaye.hikayeler[aktifIndex]?.izleyenler?.length || 0} kişi gördü
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hikaye Ekleme Paneli - Instagram Tarzı */}
      {hikayeEklePaneli && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHikayeEklePaneli(false)} />
          <div className={`relative w-full max-w-lg ${isDark ? 'bg-navy-900' : 'bg-white'} rounded-t-3xl p-6 animate-slide-up`}>
            <div className="w-12 h-1 bg-navy-600 rounded-full mx-auto mb-6" />
            <h3 className={`text-lg font-semibold ${themeClasses.text} text-center mb-6`}>Hikaye Ekle</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Fotoğraf Seç */}
              <button
                onClick={handleFotografSec}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${isDark ? 'bg-navy-800 hover:bg-navy-700' : 'bg-slate-100 hover:bg-slate-200'} transition-all`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <span className={`font-medium ${themeClasses.text}`}>Fotoğraf</span>
                <span className={`text-xs ${themeClasses.textMuted}`}>Galeri'den seç</span>
              </button>

              {/* Metin Hikaye */}
              <button
                onClick={handleMetinHikaye}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${isDark ? 'bg-navy-800 hover:bg-navy-700' : 'bg-slate-100 hover:bg-slate-200'} transition-all`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-orange-500 flex items-center justify-center">
                  <span className="text-2xl">Aa</span>
                </div>
                <span className={`font-medium ${themeClasses.text}`}>Metin</span>
                <span className={`text-xs ${themeClasses.textMuted}`}>Yazı paylaş</span>
              </button>
            </div>

            <p className={`text-xs ${themeClasses.textMuted} text-center mt-4`}>
              Video yüklenemez, sadece fotoğraf kabul edilir
            </p>

            <button
              onClick={() => setHikayeEklePaneli(false)}
              className={`w-full mt-6 py-3 rounded-xl font-medium ${isDark ? 'bg-navy-800 text-navy-300' : 'bg-slate-200 text-slate-700'}`}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Gizli dosya input'u */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDosyaDegisikligi}
        accept="image/*"
        className="hidden"
      />

      {/* Yükleniyor göstergesi */}
      {yukluyor && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Hikaye yükleniyor...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
